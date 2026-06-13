import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  padding?: "none" | "sm" | "md";
}

export function Card({
  children,
  className,
  title,
  description,
  action,
  padding = "md",
}: CardProps) {
  const paddingClass =
    padding === "none" ? "" : padding === "sm" ? "p-4" : "p-5";

  return (
    <div
      className={cn(
        "surface-card overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={paddingClass}>{children}</div>
    </div>
  );
}
