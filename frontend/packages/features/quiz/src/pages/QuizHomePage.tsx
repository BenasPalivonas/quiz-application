import { QuizLayout } from "../layouts/QuizLayout";
import { QuizPage } from "../components/QuizPage";

export function QuizHomePage({
  userName,
  page,
}: {
  userName: string;
  page?: string;
}) {
  return (
    <QuizLayout>
      <QuizPage userName={userName} page={page} />
    </QuizLayout>
  );
}
