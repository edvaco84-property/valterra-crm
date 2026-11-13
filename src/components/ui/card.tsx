import { cn } from "@/lib/utils";

type CardProps = {
  className?: string;
  children: React.ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/60 bg-white/82 p-5 shadow-[0_18px_60px_rgba(24,24,27,0.12)] backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
