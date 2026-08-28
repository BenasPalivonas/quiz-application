"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import type { ReactElement } from "react";

type QuizTitleStepProps = {
  title: string;
  onTitleChange: (title: string) => void;
  errors?: string[];
  onContinue: () => void;
};

export function QuizTitleStep({
  title,
  onTitleChange,
  errors,
  onContinue,
}: QuizTitleStepProps): ReactElement {
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

      <Button type="button" onClick={onContinue}>
        Continue
      </Button>
    </div>
  );
}
