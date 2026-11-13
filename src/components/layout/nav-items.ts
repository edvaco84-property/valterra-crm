import type { UserRole } from "@prisma/client";
import { permissions } from "@/lib/permissions";

export type NavIconName =
  | "dashboard"
  | "users"
  | "inbox"
  | "building"
  | "pipeline"
  | "tasks"
  | "agenda"
  | "reports"
  | "activity";

export type NavItem = {
  badgeCount?: number;
  href: string;
  label: string;
  iconName: NavIconName;
  roles?: readonly UserRole[];
};

export const navItems: NavItem[] = [
  { href: "/crm", label: "Dashboard", iconName: "dashboard" },
  { href: "/leads", label: "Leads", iconName: "users" },
  { href: "/leads/new", label: "Nuevo lead", iconName: "users" },
  { href: "/inquiries", label: "Inbox web", iconName: "inbox" },
  { href: "/properties", label: "Propiedades", iconName: "building" },
  { href: "/properties/new", label: "Nueva propiedad", iconName: "building", roles: permissions.manageProperties },
  { href: "/pipeline", label: "Pipeline", iconName: "pipeline", roles: permissions.managePipeline },
  { href: "/tasks", label: "Tareas", iconName: "tasks" },
  { href: "/agenda", label: "Agenda", iconName: "agenda" },
  { href: "/reports", label: "Reportes", iconName: "reports", roles: permissions.viewReports },
  { href: "/activity", label: "Actividad", iconName: "activity", roles: permissions.viewActivity },
  { href: "/team", label: "Equipo", iconName: "users", roles: permissions.manageTeam },
] as const;
