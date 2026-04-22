import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { requireSessionUser } from "@/lib/auth/session";

export const permissions = {
  manageTeam: ["ADMIN"] as UserRole[],
  viewReports: ["ADMIN", "COORDINATOR"] as UserRole[],
  viewActivity: ["ADMIN", "COORDINATOR"] as UserRole[],
  manageProperties: ["ADMIN", "COORDINATOR"] as UserRole[],
  managePipeline: ["ADMIN", "COORDINATOR"] as UserRole[],
  createLead: ["ADMIN", "COORDINATOR", "ADVISOR"] as UserRole[],
  updateLead: ["ADMIN", "COORDINATOR", "ADVISOR"] as UserRole[],
  createTask: ["ADMIN", "COORDINATOR"] as UserRole[],
  updateTaskStatus: ["ADMIN", "COORDINATOR", "ADVISOR"] as UserRole[],
  createAppointment: ["ADMIN", "COORDINATOR"] as UserRole[],
  updateAppointmentStatus: ["ADMIN", "COORDINATOR", "ADVISOR"] as UserRole[],
  addLeadNote: ["ADMIN", "COORDINATOR", "ADVISOR"] as UserRole[],
} as const;

export function hasPermission(role: UserRole, allowedRoles: readonly UserRole[]) {
  return allowedRoles.includes(role);
}

export async function requireRole(allowedRoles: readonly UserRole[], fallbackPath = "/crm") {
  const user = await requireSessionUser();

  if (!hasPermission(user.role, allowedRoles)) {
    redirect(fallbackPath);
  }

  return user;
}
