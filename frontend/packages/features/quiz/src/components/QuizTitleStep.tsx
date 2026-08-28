"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { useState, type ReactElement } from "react";
import { useQuizStore } from "../stores/quiz-store";

type QuizTitleStepProps = {
  setEditQuestionsStep: () => void;
};

export function QuizTitleStep({
  setEditQuestionsStep,
}: QuizTitleStepProps): ReactElement {
  const title = useQuizStore((state) => state.title);
  const setTitle = useQuizStore((state) => state.setTitle);
  const [errors, setErrors] = useState<string[] | undefined>();

  function handleContinue(): void {
    if (!title.trim()) {
      setErrors(["Title is required"]);
      return;
    }
    setErrors(undefined);
    setEditQuestionsStep();
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
        onChange={(e) => setTitle(e.target.value)}
        errors={errors}
      />

      <Button type="button" onClick={handleContinue}>
        Continue
      </Button>
    </div>
  );
}
