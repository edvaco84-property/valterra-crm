"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-log";
import { ensureStageCadenceTask, ensureStaleLeadFollowUpTask } from "@/lib/automation";
import { buildLeadAccessWhere, buildTaskAccessWhere, buildAppointmentAccessWhere } from "@/lib/access";
import { hasPermission, permissions } from "@/lib/permissions";

const leadSchema = z.object({
  fullName: z.string().min(3, "Ponle nombre completo."),
  email: z.string().email("Email inválido.").optional().or(z.literal("")),
  phone: z.string().min(8, "Teléfono muy corto.").optional().or(z.literal("")),
  source: z.string().min(2, "Indica la fuente."),
  market: z.enum(["CDMX", "RIVIERA_MAYA"]),
  zone: z.string().min(2, "Indica la zona."),
  stage: z.string().min(2, "Indica la etapa."),
  status: z.enum(["ACTIVE", "REACTIVATED", "WON", "LOST"]),
  nextAction: z.string().min(3, "Define la próxima acción."),
  nextActionAt: z.string().optional(),
  assignedToId: z.string().min(1, "Selecciona asesor."),
  propertyInterest: z.string().optional(),
  profile: z.string().optional(),
  budgetMin: z.string().optional(),
  budgetMax: z.string().optional(),
});

function parseLeadForm(formData: FormData) {
  return leadSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    source: String(formData.get("source") ?? ""),
    market: String(formData.get("market") ?? ""),
    zone: String(formData.get("zone") ?? ""),
    stage: String(formData.get("stage") ?? ""),
    status: String(formData.get("status") ?? "ACTIVE"),
    nextAction: String(formData.get("nextAction") ?? ""),
    nextActionAt: String(formData.get("nextActionAt") ?? ""),
    assignedToId: String(formData.get("assignedToId") ?? ""),
    propertyInterest: String(formData.get("propertyInterest") ?? ""),
    profile: String(formData.get("profile") ?? ""),
    budgetMin: String(formData.get("budgetMin") ?? ""),
    budgetMax: String(formData.get("budgetMax") ?? ""),
  });
}

function mapLeadData(data: z.infer<typeof leadSchema>, forcedAssignedToId?: string) {
  return {
    fullName: data.fullName,
    email: data.email || null,
    phone: data.phone || null,
    source: data.source,
    market: data.market,
    zone: data.zone,
    stage: data.stage,
    status: data.status,
    nextAction: data.nextAction,
    nextActionAt: data.nextActionAt ? new Date(data.nextActionAt) : null,
    assignedToId: forcedAssignedToId ?? data.assignedToId,
    propertyInterest: data.propertyInterest || null,
    profile: data.profile || null,
    budgetMin: data.budgetMin ? Number(data.budgetMin) : null,
    budgetMax: data.budgetMax ? Number(data.budgetMax) : null,
  };
}

export async function createLeadAction(_: { error: string }, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.createLead)) {
    return { error: "No tienes permiso para crear leads." };
  }
  const parsed = parseLeadForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude crear el lead." };
  }

  const forcedAssignedToId = user.role === "ADVISOR" ? user.id : undefined;

  const lead = await db.lead.create({
    data: mapLeadData(parsed.data, forcedAssignedToId),
  });

  await logActivity({
    userId: user.id,
    action: "created",
    entityType: "lead",
    entityId: lead.id,
    entityLabel: lead.fullName,
    details: `Lead creado en etapa ${lead.stage}.`,
  });

  await ensureStageCadenceTask(lead.id);

  revalidatePath("/");
  revalidatePath("/leads");
  redirect(`/leads/${lead.id}`);
}

export async function updateLeadAction(id: string, _: { error: string }, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.updateLead)) {
    return { error: "No tienes permiso para editar leads." };
  }
  const allowedLead = await db.lead.findFirst({ where: { id, ...buildLeadAccessWhere(user) }, select: { id: true } });
  if (!allowedLead) {
    return { error: "Ese lead no te pertenece o no lo puedes editar." };
  }
  const parsed = parseLeadForm(formData);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude actualizar el lead." };
  }

  const forcedAssignedToId = user.role === "ADVISOR" ? user.id : undefined;

  const lead = await db.lead.update({
    where: { id },
    data: mapLeadData(parsed.data, forcedAssignedToId),
  });

  await logActivity({
    userId: user.id,
    action: "updated",
    entityType: "lead",
    entityId: lead.id,
    entityLabel: lead.fullName,
    details: `Lead actualizado. Estatus ${lead.status}, etapa ${lead.stage}.`,
  });

  await ensureStaleLeadFollowUpTask(lead.id);
  await ensureStageCadenceTask(lead.id);

  revalidatePath("/");
  revalidatePath("/leads");
  revalidatePath("/pipeline");
  revalidatePath(`/leads/${id}`);
  redirect(`/leads/${id}`);
}

export async function updateLeadPipelineAction(leadId: string, _: { error: string; success: string }, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.managePipeline)) {
    return { error: "No tienes permiso para mover leads en pipeline.", success: "" };
  }
  const allowedLead = await db.lead.findFirst({ where: { id: leadId, ...buildLeadAccessWhere(user) }, select: { id: true } });
  if (!allowedLead) {
    return { error: "Ese lead no te pertenece o no lo puedes mover.", success: "" };
  }

  const stage = String(formData.get("stage") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!stage) {
    return { error: "Selecciona una etapa válida.", success: "" };
  }

  if (!status || !["ACTIVE", "REACTIVATED", "WON", "LOST"].includes(status)) {
    return { error: "Selecciona un estatus válido.", success: "" };
  }

  const lead = await db.lead.update({
    where: { id: leadId },
    data: {
      stage,
      status: status as "ACTIVE" | "REACTIVATED" | "WON" | "LOST",
    },
  });

  await logActivity({
    userId: user.id,
    action: "pipeline_updated",
    entityType: "lead",
    entityId: lead.id,
    entityLabel: lead.fullName,
    details: `Pipeline movido a ${lead.stage} con estatus ${lead.status}.`,
  });

  await ensureStaleLeadFollowUpTask(lead.id);
  await ensureStageCadenceTask(lead.id);

  revalidatePath("/leads");
  revalidatePath("/pipeline");
  revalidatePath(`/leads/${leadId}`);

  return { error: "", success: "Lead actualizado en pipeline." };
}
