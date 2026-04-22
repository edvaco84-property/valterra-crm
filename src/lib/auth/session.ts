import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const SESSION_COOKIE = "valterra_session";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!userId) return null;

  return db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      market: true,
      active: true,
    },
  });
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user || !user.active) {
    redirect("/login");
  }

  return user;
}

export { SESSION_COOKIE };
