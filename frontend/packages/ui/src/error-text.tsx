import type { HTMLAttributes, ReactElement } from "react";

export function ErrorText({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>): ReactElement {
  return <p className={`text-sm text-red-600 ${className ?? ""}`} {...props} />;
}
