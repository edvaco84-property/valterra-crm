import { cn } from "@/lib/utils";

type CardProps = {
  className?: string;
  children: React.ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn("rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm", className)}>
      {children}
    </div>
  );
}
