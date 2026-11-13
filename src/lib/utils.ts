import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function normalizePhone(phone?: string | null) {
  if (!phone) return "";
  return phone.replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
}

export function toWhatsAppHref(phone?: string | null, message?: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return null;
  const digits = normalized.startsWith("+") ? normalized.slice(1) : normalized;
  const url = new URL(`https://wa.me/${digits}`);
  if (message) {
    url.searchParams.set("text", message);
  }
  return url.toString();
}

export function toTelHref(phone?: string | null) {
  const normalized = normalizePhone(phone);
  return normalized ? `tel:${normalized}` : null;
}

export const inputClassName =
  "w-full rounded-2xl border border-zinc-200/90 bg-white/88 px-4 py-3 text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition placeholder:text-zinc-400 focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100/80";

export const selectClassName =
  "w-full rounded-2xl border border-zinc-200/90 bg-white/88 px-4 py-3 text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100/80";

export const textareaClassName =
  "w-full rounded-2xl border border-zinc-200/90 bg-white/88 px-4 py-3 text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition placeholder:text-zinc-400 focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100/80";

export const primaryButtonClassName =
  "rounded-2xl bg-[#1a1817] px-5 py-3 font-medium text-white shadow-[0_12px_30px_rgba(26,24,23,0.22)] transition hover:bg-[#26211f] disabled:opacity-60";

export const secondaryButtonClassName =
  "rounded-2xl border border-zinc-300 bg-white/88 px-4 py-3 text-sm font-medium text-zinc-800 shadow-sm transition hover:border-zinc-400 hover:bg-white";
