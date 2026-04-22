"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-log";
import { buildLeadAccessWhere } from "@/lib/access";
import { hasPermission, permissions } from "@/lib/permissions";

const noteSchema = z.object({
  leadId: z.string().min(1, "Falta el lead."),
  body: z.string().min(3, "Escribe una nota útil, no una obra abstracta."),
});

const initialState = { error: "", success: "" };

export async function createLeadNoteAction(_: typeof initialState, formData: FormData) {
  const user = await requireSessionUser();
  if (!hasPermission(user.role, permissions.addLeadNote)) {
    return { error: "No tienes permiso para agregar notas.", success: "" };
  }

  const parsed = noteSchema.safeParse({
    leadId: String(formData.get("leadId") ?? ""),
    body: String(formData.get("body") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude guardar la nota.", success: "" };
  }

  const allowedLead = await db.lead.findFirst({ where: { id: parsed.data.leadId, ...buildLeadAccessWhere(user) }, select: { id: true } });
  if (!allowedLead) {
    return { error: "Ese lead no te pertenece o no lo puedes comentar.", success: "" };
  }

  await db.note.create({
    data: {
      leadId: parsed.data.leadId,
      body: parsed.data.body,
      authorId: user.id,
    },
  });

  await logActivity({
    userId: user.id,
    action: "note_added",
    entityType: "lead",
    entityId: parsed.data.leadId,
    details: `Se agregó una nota al lead.`,
  });

  revalidatePath(`/leads/${parsed.data.leadId}`);
  revalidatePath("/leads");

  return { error: "", success: "Nota guardada." };
}
