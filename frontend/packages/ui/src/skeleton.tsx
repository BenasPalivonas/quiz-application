import type { HTMLAttributes } from "react";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-[pulse_1s_ease-in-out_infinite] rounded-md bg-white/20 ${className ?? ""}`}
      {...props}
    />
  );
}
