import { Button } from "@repo/ui/button";

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[1fr_auto] items-center justify-items-center p-8">
      <main className="flex flex-col items-center gap-4">
        <Button appName="Quizz app">
          <span>Click me</span>
        </Button>
      </main>
      <footer></footer>
    </div>
  );
}
