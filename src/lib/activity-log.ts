import { db } from "@/lib/db";

export type ActivityFilters = {
  userId?: string;
  entityType?: string;
  action?: string;
};

type LogActivityInput = {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  entityLabel?: string | null;
  details?: string | null;
};

export async function logActivity(input: LogActivityInput) {
  await db.activityLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      entityLabel: input.entityLabel ?? null,
      details: input.details ?? null,
    },
  });
}

export async function getRecentActivity(limit = 40, filters?: ActivityFilters) {
  return db.activityLog.findMany({
    where: {
      ...(filters?.userId ? { userId: filters.userId } : {}),
      ...(filters?.entityType ? { entityType: filters.entityType } : {}),
      ...(filters?.action ? { action: filters.action } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}
