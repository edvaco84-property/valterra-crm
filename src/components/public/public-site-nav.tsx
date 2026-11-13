"use client";

import { useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";

type PublicNavItem = {
  href: string;
  label: string;
};

export function PublicSiteNav({ items, whatsappHref }: { items: PublicNavItem[]; whatsappHref: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed right-4 top-[calc(0.85rem+env(safe-area-inset-top))] z-50 sm:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-[rgba(20,16,13,0.92)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f3e7d6] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          />
          <div className="fixed inset-x-4 top-[calc(4.5rem+env(safe-area-inset-top))] z-50 rounded-[1.75rem] border border-white/10 bg-[rgba(20,16,13,0.96)] p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:hidden">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#c5a57c]">Valterra</p>
            <p className="mt-2 text-sm leading-6 text-[#dccdb8]/82">Navegación rápida para no obligar al pulgar a recorrer media ciudad.</p>
            <div className="mt-4 grid gap-2">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#5f503d] bg-[#1b1612] px-4 py-3 text-sm font-medium uppercase tracking-[0.16em] text-[#f3e7d6] transition hover:border-[#8b7354] hover:bg-[#221b16]"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-4 right-4 z-40 inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#25d366]/50 bg-[#163323] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#d8ffe5] shadow-[0_16px_40px_rgba(0,0,0,0.35)] transition hover:border-[#25d366] hover:text-white sm:hidden"
      >
        <MessageCircle className="h-5 w-5" />
        WhatsApp directo
      </a>
    </>
  );
}
