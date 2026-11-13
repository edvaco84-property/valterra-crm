import type { UserRole } from "@prisma/client";
import type { AppMarket } from "@/lib/markets";

export type SessionActor = {
  id: string;
  role: UserRole;
  market: AppMarket;
};

export function canViewAllRecords(role: UserRole) {
  return role === "ADMIN";
}

export function canViewMarketRecords(role: UserRole) {
  return role === "COORDINATOR";
}

export function buildLeadAccessWhere(actor: SessionActor) {
  if (canViewAllRecords(actor.role)) return {};
  if (canViewMarketRecords(actor.role)) {
    return { market: actor.market };
  }
  return { assignedToId: actor.id };
}

export function buildTaskAccessWhere(actor: SessionActor) {
  if (canViewAllRecords(actor.role)) return {};
  if (canViewMarketRecords(actor.role)) {
    return {
      OR: [
        { assignee: { market: actor.market } },
        { lead: { market: actor.market } },
      ],
    };
  }
  return {
    OR: [
      { assigneeId: actor.id },
      { lead: { assignedToId: actor.id } },
    ],
  };
}

export function buildAppointmentAccessWhere(actor: SessionActor) {
  if (canViewAllRecords(actor.role)) return {};
  if (canViewMarketRecords(actor.role)) {
    return {
      OR: [
        { advisor: { market: actor.market } },
        { lead: { market: actor.market } },
      ],
    };
  }
  return {
    OR: [
      { advisorId: actor.id },
      { lead: { assignedToId: actor.id } },
    ],
  };
}
