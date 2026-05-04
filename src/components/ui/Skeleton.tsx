import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div
      className={cn("animate-shimmer rounded-md bg-border", className)}
      style={style}
      aria-hidden="true"
    />
  );
}
