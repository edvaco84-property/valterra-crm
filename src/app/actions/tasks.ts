"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-log";
import { ensureNextFollowUpTask } from "@/lib/automation";
import { buildLeadAccessWhere, buildTaskAccessWhere } from "@/lib/access";
import { hasPermission, permissions } from "@/lib/permissions";

const taskSchema = z.object({
  title: z.string().min(3, "Ponle título a la tarea."),
  description: z.string().optional(),
  dueAt: z.string().min(1, "Ponle fecha a la tarea."),
  status: z.enum(["PENDING", "IN_PROGRESS", "DONE", "OVERDUE"]).default("PENDING"),
  leadId: z.string().optional(),
  assigneeId: z.string().min(1, "Selecciona responsable."),
});

type TaskActionState = { error: string; success: string };

export async function createTaskAction(_: TaskActionState, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.createTask)) {
    return { error: "No tienes permiso para crear tareas.", success: "" };
  }

  const parsed = taskSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    dueAt: String(formData.get("dueAt") ?? ""),
    status: String(formData.get("status") ?? "PENDING"),
    leadId: String(formData.get("leadId") ?? ""),
    assigneeId: String(formData.get("assigneeId") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude crear la tarea.", success: "" };
  }

  if (user.role === "ADVISOR") {
    return { error: "No puedes crear tareas para otros usuarios.", success: "" };
  }

  if (parsed.data.leadId) {
    const allowedLead = await db.lead.findFirst({ where: { id: parsed.data.leadId, ...buildLeadAccessWhere(user) }, select: { id: true } });
    if (!allowedLead) {
      return { error: "Ese lead no está dentro de tu alcance.", success: "" };
    }
  }

  const task = await db.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      dueAt: new Date(parsed.data.dueAt),
      status: parsed.data.status,
      leadId: parsed.data.leadId || null,
      assigneeId: parsed.data.assigneeId,
    },
  });

  await logActivity({
    userId: user.id,
    action: "created",
    entityType: "task",
    entityId: task.id,
    entityLabel: task.title,
    details: `Tarea creada con estatus ${task.status}.`,
  });

  revalidatePath("/crm");
  revalidatePath("/tasks");

  return { error: "", success: "Tarea creada." };
}

export async function updateTaskStatusAction(taskId: string, _: TaskActionState, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.updateTaskStatus)) {
    return { error: "No tienes permiso para actualizar tareas.", success: "" };
  }

  const status = String(formData.get("status") ?? "PENDING");

  if (!["PENDING", "IN_PROGRESS", "DONE", "OVERDUE"].includes(status)) {
    return { error: "Estatus inválido.", success: "" };
  }

  const allowedTask = await db.task.findFirst({ where: { id: taskId, ...buildTaskAccessWhere(user) }, select: { id: true } });
  if (!allowedTask) {
    return { error: "Esa tarea no te pertenece o no la puedes actualizar.", success: "" };
  }

  const task = await db.task.update({
    where: { id: taskId },
    data: {
      status: status as "PENDING" | "IN_PROGRESS" | "DONE" | "OVERDUE",
    },
  });

  await logActivity({
    userId: user.id,
    action: "status_updated",
    entityType: "task",
    entityId: task.id,
    entityLabel: task.title,
    details: `Tarea movida a ${task.status}.`,
  });

  if (task.status === "DONE") {
    await ensureNextFollowUpTask(task.id);
  }

  revalidatePath("/crm");
  revalidatePath("/tasks");

  return { error: "", success: "Tarea actualizada." };
}
