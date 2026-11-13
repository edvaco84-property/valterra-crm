"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

export async function loginAction(_: { error: string }, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email y contraseña son obligatorios." };
  }

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "No encontré ese usuario." };
  }

  if (!user.active) {
    return { error: "Este usuario está desactivado." };
  }

  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    return { error: "Contraseña incorrecta." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(user.id), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect("/crm");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
