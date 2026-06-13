import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  showIcon?: boolean;
  showTagline?: boolean;
  tagline?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  className?: string;
}

const sizeClasses = {
  sm: { text: "text-sm tracking-[0.2em]", icon: "h-8 w-8", iconInner: "h-4 w-4" },
  md: { text: "text-base tracking-[0.25em]", icon: "h-10 w-10", iconInner: "h-5 w-5" },
  lg: { text: "text-2xl tracking-[0.3em]", icon: "h-12 w-12", iconInner: "h-6 w-6" },
};

export function Logo({
  showIcon = true,
  showTagline = false,
  tagline,
  size = "md",
  variant = "dark",
  className,
}: LogoProps) {
  const s = sizeClasses[size];
  const isLight = variant === "light";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showIcon && (
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl bg-amber-500 shadow-lg shadow-amber-500/20",
            s.icon
          )}
        >
          <Wrench className={cn("text-slate-900", s.iconInner)} />
        </div>
      )}
      <div className="min-w-0">
        <p
          className={cn(
            "font-bold leading-none",
            s.text,
            isLight ? "text-white" : "text-slate-900"
          )}
        >
          DRY TOUCH
        </p>
        {showTagline && tagline && (
          <p
            className={cn(
              "mt-1 truncate text-xs",
              isLight ? "text-slate-400" : "text-slate-500"
            )}
          >
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}
