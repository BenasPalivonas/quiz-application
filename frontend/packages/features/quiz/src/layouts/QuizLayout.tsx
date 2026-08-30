import type { ReactElement, ReactNode } from "react";

export function QuizLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <div className="flex min-h-screen flex-col">{children}</div>;
}
