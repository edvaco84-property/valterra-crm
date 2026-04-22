import { db } from "@/lib/db";
import type { SessionActor } from "@/lib/access";
import { buildLeadAccessWhere } from "@/lib/access";

export async function getLeadList(filters?: {
  query?: string;
  market?: string;
  status?: string;
  assignedToId?: string;
  actor?: SessionActor;
}) {
  const query = filters?.query?.trim();
  const market = filters?.market?.trim();
  const status = filters?.status?.trim();
  const assignedToId = filters?.assignedToId?.trim();

  return db.lead.findMany({
    where: {
      ...(filters?.actor ? buildLeadAccessWhere(filters.actor) : {}),
      ...(query
        ? {
            OR: [
              { fullName: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { source: { contains: query, mode: "insensitive" } },
              { zone: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(market ? { market: market as "CDMX" | "RIVIERA_MAYA" } : {}),
      ...(status ? { status: status as "ACTIVE" | "REACTIVATED" | "LOST" | "WON" } : {}),
      ...(assignedToId ? { assignedToId } : {}),
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: [
      { nextActionAt: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function getLeadById(id: string, actor?: SessionActor) {
  const lead = await db.lead.findFirst({
    where: { 
      id,
      ...(actor ? buildLeadAccessWhere(actor) : {}),
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
        },
      },
      notes: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      tasks: {
        orderBy: {
          dueAt: "asc",
        },
      },
      appointments: {
        orderBy: {
          scheduledAt: "asc",
        },
      },
    },
  });

  if (!lead) return null;

  const activityLogs = await db.activityLog.findMany({
    where: {
      entityType: "lead",
      entityId: id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    ...lead,
    activityLogs,
  };
}

export async function getAdvisors(actor?: SessionActor) {
  return db.user.findMany({
    where: actor?.role === "COORDINATOR" ? { market: actor.market } : actor?.role === "ADVISOR" ? { id: actor.id } : undefined,
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      role: true,
      market: true,
    },
  });
}

export async function getLeadOptions(actor?: SessionActor) {
  return db.lead.findMany({
    where: actor ? buildLeadAccessWhere(actor) : undefined,
    orderBy: {
      fullName: "asc",
    },
    select: {
      id: true,
      fullName: true,
    },
  });
}
