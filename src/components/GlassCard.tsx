import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
  interactive?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  id,
  interactive = false,
}: GlassCardProps) {
  return (
    <div
      id={id}
      className={`wooden-frame pointer-events-auto p-6 sm:p-8 ${
        interactive ? "wooden-interactive" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
