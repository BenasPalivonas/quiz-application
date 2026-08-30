import "./globals.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import type { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Quiz App",
  description: "Create and take personality quizzes with AI-generated results",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <html lang="en">
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
