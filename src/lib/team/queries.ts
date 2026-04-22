import { db } from "@/lib/db";

export async function getTeamMembers() {
  try {
    return await db.user.findMany({
      orderBy: [
        { active: "desc" },
        { role: "asc" },
        { createdAt: "asc" },
      ],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        market: true,
        active: true,
        createdAt: true,
      },
    });
  } catch {
    return [];
  }
}
