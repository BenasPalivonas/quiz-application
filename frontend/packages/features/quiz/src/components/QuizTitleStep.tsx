"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { useState, type ReactElement } from "react";

type QuizTitleStepProps = {
  title: string;
  onTitleChange: (title: string) => void;
  onContinue: () => void;
};

export function QuizTitleStep({
  title,
  onTitleChange,
  onContinue,
}: QuizTitleStepProps): ReactElement {
  const [errors, setErrors] = useState<string[] | undefined>();

  function handleContinue(): void {
    if (!title.trim()) {
      setErrors(["Title is required"]);
      return;
    }
    setErrors(undefined);
    onContinue();
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <Input
        id="title"
        name="title"
        label="Quiz title"
        placeholder="What Animal Are You?"
        required
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        errors={errors}
      />

      <Button type="button" onClick={handleContinue}>
        Continue
      </Button>
    </div>
  );
}
