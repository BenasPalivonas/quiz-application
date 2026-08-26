import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-black text-white dark:bg-white dark:text-black",
  secondary: "border border-black/15 dark:border-white/20",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50 ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
