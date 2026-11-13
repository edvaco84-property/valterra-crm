"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarRange, ClipboardList, Building2, History, Inbox, KanbanSquare, LayoutDashboard, Users } from "lucide-react";
import type { NavIconName } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

const icons = {
  dashboard: LayoutDashboard,
  users: Users,
  inbox: Inbox,
  building: Building2,
  pipeline: KanbanSquare,
  tasks: ClipboardList,
  agenda: CalendarRange,
  reports: BarChart3,
  activity: History,
} as const;

export function NavLink({
  href,
  label,
  iconName,
  badgeCount,
  description,
  mobile = false,
  onClick,
}: {
  href: string;
  label: string;
  iconName: NavIconName;
  badgeCount?: number;
  description?: string;
  mobile?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/crm" && pathname.startsWith(`${href}/`));
  const Icon = icons[iconName];

  if (mobile) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "inline-flex min-h-12 shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-sm shadow-sm transition",
          active
            ? "border-amber-300/70 bg-amber-100/20 text-white"
            : "border-white/15 bg-white/12 text-zinc-100",
        )}
        >
          <Icon className={cn("h-4 w-4 shrink-0", active ? "text-amber-200" : "text-zinc-300")} />
          {label}
          {badgeCount ? (
            <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          ) : null}
        </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
        active
          ? "border-amber-300/25 bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          : "border-transparent text-zinc-200 hover:border-white/10 hover:bg-white/8 hover:text-white",
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-2xl border transition",
          active
            ? "border-amber-300/30 bg-amber-100/15 text-amber-200"
            : "border-white/8 bg-white/8 text-amber-200 group-hover:bg-white/12",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="flex items-center gap-2 font-medium text-white">
          <span>{label}</span>
          {badgeCount ? (
            <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          ) : null}
        </div>
        {description ? <div className={cn("text-xs", active ? "text-zinc-300" : "text-zinc-400")}>{description}</div> : null}
      </div>
    </Link>
  );
}
