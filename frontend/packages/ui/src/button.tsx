import type { ButtonHTMLAttributes, ReactElement } from "react";

type ButtonVariant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white",
  secondary: "bg-gray-500 text-gray-100",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      className={`rounded-md border-black border px-4 py-2 text-sm font-medium transition-opacity hover:cursor-pointer  disabled:opacity-50 ${variantClasses[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
