import Link from "next/link";
import { BarChart3, CalendarRange, ClipboardList, Building2, History, Inbox, KanbanSquare, LayoutDashboard, Users } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { hasPermission, permissions } from "@/lib/permissions";

const nav = [
  { href: "/crm", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/leads/new", label: "Nuevo lead", icon: Users },
  { href: "/inquiries", label: "Inbox web", icon: Inbox },
  { href: "/properties", label: "Propiedades", icon: Building2 },
  { href: "/properties/new", label: "Nueva propiedad", icon: Building2, roles: permissions.manageProperties },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare, roles: permissions.managePipeline },
  { href: "/tasks", label: "Tareas", icon: ClipboardList },
  { href: "/agenda", label: "Agenda", icon: CalendarRange },
  { href: "/reports", label: "Reportes", icon: BarChart3, roles: permissions.viewReports },
  { href: "/activity", label: "Actividad", icon: History, roles: permissions.viewActivity },
  { href: "/team", label: "Equipo", icon: Users, roles: permissions.manageTeam },
];

export async function Sidebar() {
  const user = await getSessionUser();
  const visibleNav = nav.filter((item) => !item.roles || (user?.role ? hasPermission(user.role, item.roles) : false));

  return (
    <aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-[#1a1817] text-white lg:flex lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Valterra CRM</p>
        <h1 className="mt-3 text-2xl font-semibold">Operación comercial premium</h1>
        <p className="mt-2 text-sm text-zinc-300">CDMX + Riviera Maya, sin hojas sueltas ni caos artesanal.</p>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {visibleNav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/8 hover:text-white"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 px-6 py-5 text-sm text-zinc-300">
        MVP shell listo para conectar auth, DB y Fly.io.
      </div>
    </aside>
  );
}
