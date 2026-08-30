import type { HTMLAttributes, ReactElement } from "react";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div
      className={`animate-[pulse_1s_ease-in-out_infinite] rounded-md bg-border/20 ${className ?? ""}`}
      {...props}
    />
  );
}
