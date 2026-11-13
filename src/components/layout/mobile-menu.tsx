"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { NavItem } from "@/components/layout/nav-items";
import { NavLink } from "@/components/layout/nav-link";

export function MobileMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed right-4 top-[calc(0.75rem+env(safe-area-inset-top))] z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-h-11 items-center gap-2 rounded-2xl border border-white/15 bg-[rgba(16,15,14,0.92)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          />
          <div className="fixed inset-x-3 top-[calc(4.5rem+env(safe-area-inset-top))] z-40 mx-auto w-auto max-w-[430px] rounded-[28px] border border-white/10 bg-[rgba(18,16,15,0.95)] p-3 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:hidden">
            <div className="mb-3 px-2 pt-1">
              <p className="text-xs uppercase tracking-[0.28em] text-amber-200/80">Valterra CRM</p>
              <p className="mt-2 text-sm text-zinc-300">Navegación rápida para no andar cazando secciones con el pulgar.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} iconName={item.iconName} badgeCount={item.badgeCount} mobile onClick={() => setOpen(false)} />
              ))}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
