import { cn } from "@/lib/cn";

export interface AvatarProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function Avatar({ name, className, size = "md" }: AvatarProps) {
  const label = initials(name);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-800 ring-2 ring-white",
        sizes[size],
        className
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}
