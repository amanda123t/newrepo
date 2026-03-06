import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-slate-100 text-slate-800",
        variant === "secondary" && "bg-slate-200 text-slate-900",
        variant === "outline" && "border border-slate-200 text-slate-700",
        className
      )}
    >
      {children}
    </span>
  );
}
