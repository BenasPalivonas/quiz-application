import type { HTMLAttributes } from "react";

export function ErrorText({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-red-600 ${className ?? ""}`} {...props} />;
}
