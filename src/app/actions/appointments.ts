"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-log";
import { buildAppointmentAccessWhere, buildLeadAccessWhere } from "@/lib/access";
import { hasPermission, permissions } from "@/lib/permissions";

const appointmentSchema = z.object({
  title: z.string().min(3, "Ponle título a la cita."),
  type: z.enum(["CALL", "MEETING", "VISIT"]),
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELED"]).default("SCHEDULED"),
  scheduledAt: z.string().min(1, "Ponle fecha y hora."),
  location: z.string().optional(),
  result: z.string().optional(),
  leadId: z.string().optional(),
  advisorId: z.string().min(1, "Selecciona asesor."),
});

const initialState = { error: "", success: "" };

export async function createAppointmentAction(_: typeof initialState, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.createAppointment)) {
    return { error: "No tienes permiso para crear citas.", success: "" };
  }

  const parsed = appointmentSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    type: String(formData.get("type") ?? "CALL"),
    status: String(formData.get("status") ?? "SCHEDULED"),
    scheduledAt: String(formData.get("scheduledAt") ?? ""),
    location: String(formData.get("location") ?? ""),
    result: String(formData.get("result") ?? ""),
    leadId: String(formData.get("leadId") ?? ""),
    advisorId: String(formData.get("advisorId") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude crear la cita.", success: "" };
  }

  if (user.role === "ADVISOR") {
    return { error: "No puedes crear citas para otros usuarios.", success: "" };
  }

  if (parsed.data.leadId) {
    const allowedLead = await db.lead.findFirst({ where: { id: parsed.data.leadId, ...buildLeadAccessWhere(user) }, select: { id: true } });
    if (!allowedLead) {
      return { error: "Ese lead no está dentro de tu alcance.", success: "" };
    }
  }

  const appointment = await db.appointment.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      status: parsed.data.status,
      scheduledAt: new Date(parsed.data.scheduledAt),
      location: parsed.data.location || null,
      result: parsed.data.result || null,
      leadId: parsed.data.leadId || null,
      advisorId: parsed.data.advisorId,
    },
  });

  await logActivity({
    userId: user.id,
    action: "created",
    entityType: "appointment",
    entityId: appointment.id,
    entityLabel: appointment.title,
    details: `${appointment.type} agendada con estatus ${appointment.status}.`,
  });

  revalidatePath("/crm");
  revalidatePath("/agenda");

  return { error: "", success: "Cita creada." };
}

export async function updateAppointmentStatusAction(appointmentId: string, _: typeof initialState, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.updateAppointmentStatus)) {
    return { error: "No tienes permiso para actualizar citas.", success: "" };
  }

  const status = String(formData.get("status") ?? "SCHEDULED");

  if (!["SCHEDULED", "COMPLETED", "CANCELED"].includes(status)) {
    return { error: "Estatus inválido.", success: "" };
  }

  const allowedAppointment = await db.appointment.findFirst({ where: { id: appointmentId, ...buildAppointmentAccessWhere(user) }, select: { id: true } });
  if (!allowedAppointment) {
    return { error: "Esa cita no te pertenece o no la puedes actualizar.", success: "" };
  }

  const appointment = await db.appointment.update({
    where: { id: appointmentId },
    data: {
      status: status as "SCHEDULED" | "COMPLETED" | "CANCELED",
    },
  });

  await logActivity({
    userId: user.id,
    action: "status_updated",
    entityType: "appointment",
    entityId: appointment.id,
    entityLabel: appointment.title,
    details: `Cita movida a ${appointment.status}.`,
  });

  revalidatePath("/crm");
  revalidatePath("/agenda");

  return { error: "", success: "Cita actualizada." };
}
