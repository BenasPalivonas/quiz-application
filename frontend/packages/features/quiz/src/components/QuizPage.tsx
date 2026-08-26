export function QuizPage({ userName }: { userName: string }) {
  return (
    <p className="text-lg">
      Welcome, <span className="font-semibold">{userName}</span>
    </p>
  );
}
