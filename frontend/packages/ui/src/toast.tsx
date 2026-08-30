"use client";

import { useEffect, type ReactElement } from "react";

export interface ToastProps {
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  message,
  onDismiss,
  duration = 10000,
}: ToastProps): ReactElement {
  useEffect((): (() => void) => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-md border border-danger/40 bg-black px-4 py-3 text-sm text-danger-lighter shadow-lg">
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button
          type="button"
          onClick={onDismiss}
          className="text-danger-light hover:text-danger-lighter"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
