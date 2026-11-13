"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobilePanel({
  title,
  description,
  buttonLabel,
  children,
  defaultOpen = false,
}: {
  title: string;
  description?: string;
  buttonLabel?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-zinc-300">{title}</h3>
          {description ? <p className="mt-1 text-sm text-zinc-400">{description}</p> : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm"
        >
          {buttonLabel ?? title}
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <div className={cn("hidden md:block", open && "block md:block", !open && "md:block")}>{children}</div>
    </div>
  );
}
