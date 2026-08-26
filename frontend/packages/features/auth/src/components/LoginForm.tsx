"use client";

import { Button } from "@repo/ui/button";
import { ErrorText } from "@repo/ui/error-text";
import { Input } from "@repo/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { clientLogin } from "../client-api";
import { ApiError } from "../http";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await clientLogin({ email, password });
      router.push("/");
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(error.errors ?? {});
        if (!error.errors) {
          setFormError(error.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <Input
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="Please enter your email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        errors={fieldErrors.email}
      />

      <Input
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="Please enter your password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        errors={fieldErrors.password}
      />

      {formError && <ErrorText>{formError}</ErrorText>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Log in"}
      </Button>

      <p className="text-center text-sm text-white">
        Don't have an account?{" "}
        <Link href="/register" className="underline">
          Register
        </Link>
      </p>
    </form>
  );
}
