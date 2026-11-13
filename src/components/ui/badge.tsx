type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "brand";
};

const styles = {
  neutral: "border border-white/70 bg-white/75 text-zinc-700 backdrop-blur-md",
  success: "border border-emerald-200/80 bg-emerald-50/85 text-emerald-700",
  warning: "border border-amber-200/80 bg-amber-50/85 text-amber-700",
  danger: "border border-rose-200/80 bg-rose-50/85 text-rose-700",
  brand: "border border-amber-200/80 bg-amber-100/85 text-amber-900",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
