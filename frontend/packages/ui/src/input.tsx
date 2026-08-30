import type { InputHTMLAttributes, ReactElement } from "react";
import { ErrorText } from "./error-text";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errors?: string[];
}

export function Input({
  label,
  errors,
  id,
  className,
  maxLength = 200,
  ...props
}: InputProps): ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        maxLength={maxLength}
        className={`rounded-md border bg-black text-white border-white px-3 py-2 text-sm outline-none focus:border-white/40 ${className ?? ""}`}
        {...props}
      />
      {errors?.map((msg) => (
        <ErrorText key={msg}>{msg}</ErrorText>
      ))}
    </div>
  );
}
