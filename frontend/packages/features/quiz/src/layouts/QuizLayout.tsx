import type { ReactElement, ReactNode } from "react";
import { QuizNavbar } from "../components/QuizNavbar";

export function QuizLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <QuizNavbar />
      {children}
    </div>
  );
}
