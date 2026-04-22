"use server";

import bcrypt from "bcryptjs";
import { Market, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSessionUser } from "@/lib/auth/session";
import { logActivity } from "@/lib/activity-log";
import { hasPermission, permissions } from "@/lib/permissions";

const createUserSchema = z.object({
  name: z.string().min(2, "Escribe el nombre del broker."),
  email: z.string().email("Pon un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  role: z.nativeEnum(UserRole),
  market: z.nativeEnum(Market),
});

const updateUserSchema = z.object({
  role: z.nativeEnum(UserRole),
  market: z.nativeEnum(Market),
  active: z.string().optional(),
  password: z.string().optional(),
});

const initialState = { error: "" };

async function requireAdmin() {
  const user = await requireSessionUser();

  if (!hasPermission(user.role, permissions.manageTeam)) {
    throw new Error("Solo un administrador puede gestionar el equipo.");
  }

  return user;
}

export async function createTeamMemberAction(_: typeof initialState, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
    role: String(formData.get("role") ?? "ADVISOR"),
    market: String(formData.get("market") ?? "CDMX"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude crear el usuario." };
  }

  const exists = await db.user.findUnique({ where: { email: parsed.data.email } });

  if (exists) {
    return { error: "Ya existe un usuario con ese email." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      market: parsed.data.market,
      active: true,
    },
  });

  await logActivity({
    userId: admin.id,
    action: "created",
    entityType: "user",
    entityId: user.id,
    entityLabel: user.name,
    details: `Usuario creado con rol ${user.role}.`,
  });

  revalidatePath("/team");
  return { error: "" };
}

export async function updateTeamMemberAction(userId: string, _: typeof initialState, formData: FormData) {
  const admin = await requireAdmin();

  const parsed = updateUserSchema.safeParse({
    role: String(formData.get("role") ?? "ADVISOR"),
    market: String(formData.get("market") ?? "CDMX"),
    active: String(formData.get("active") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "No pude actualizar el usuario." };
  }

  if (admin.id === userId && parsed.data.active !== "on") {
    return { error: "No te puedes desactivar a ti mismo desde aquí." };
  }

  const nextPassword = parsed.data.password?.trim();

  if (nextPassword && nextPassword.length < 8) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      role: parsed.data.role,
      market: parsed.data.market,
      active: parsed.data.active === "on",
      passwordHash: nextPassword ? await bcrypt.hash(nextPassword, 10) : undefined,
    },
  });

  await logActivity({
    userId: admin.id,
    action: "updated",
    entityType: "user",
    entityId: updatedUser.id,
    entityLabel: updatedUser.name,
    details: `Usuario actualizado. Rol ${updatedUser.role}. ${updatedUser.active ? "Activo" : "Inactivo"}.`,
  });

  revalidatePath("/team");
  return { error: "" };
}
