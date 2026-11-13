import { getSessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { navItems } from "@/components/layout/nav-items";
import { NavLink } from "@/components/layout/nav-link";
import { getUnreadWebsiteInquiryCount } from "@/lib/inquiries/queries";

export async function Sidebar() {
  const user = await getSessionUser();
  const unreadInboxCount = user ? await getUnreadWebsiteInquiryCount(user) : 0;
  const visibleNav = navItems
    .map((item) => (item.href === "/inquiries" ? { ...item, badgeCount: unreadInboxCount } : item))
    .filter((item) => !item.roles || (user?.role ? hasPermission(user.role, item.roles) : false));

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(33,27,23,0.98)_0%,rgba(20,17,16,0.96)_100%)] text-white lg:flex">
      <div className="px-6 pb-6 pt-5">
        <div className="rounded-[28px] border border-white/10 bg-white/6 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.34em] text-amber-300/90">Valterra CRM</p>
          <h1 className="mt-3 text-[26px] font-semibold leading-tight text-white">Operación comercial premium</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-300">Una experiencia más limpia, más rápida y bastante menos torpe para el equipo comercial.</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2 px-4 pb-6">
        {visibleNav.map(({ href, label, iconName, badgeCount }) => (
          <NavLink key={href} href={href} label={label} iconName={iconName} badgeCount={badgeCount} description={navMeta[label] ?? "Acceso rápido"} />
        ))}
      </nav>
      <div className="mx-4 mb-4 rounded-[24px] border border-white/10 bg-white/7 px-5 py-4 text-sm text-zinc-300">
        {user ? `${user.name ?? user.email} · ${user.role}` : "Modo demo activo"}
      </div>
    </aside>
  );
}

const navMeta: Record<string, string> = {
  Dashboard: "Resumen ejecutivo",
  Leads: "Seguimiento comercial",
  "Nuevo lead": "Alta rápida",
  "Inbox web": "Captación del sitio",
  Propiedades: "Inventario activo",
  "Nueva propiedad": "Alta de inventario",
  Pipeline: "Etapas y avance",
  Tareas: "Pendientes del día",
  Agenda: "Citas y visitas",
  Reportes: "Métricas clave",
  Actividad: "Movimiento reciente",
  Equipo: "Usuarios y roles",
};
