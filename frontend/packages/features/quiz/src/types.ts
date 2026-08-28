export type Choice = {
  id: number;
  text: string;
};

export type Question = {
  id: number;
  text: string;
  choices: Choice[];
};

export type Quiz = {
  id: number;
  title: string;
  user_id: number;
  is_owner: boolean;
  user_name?: string;
  questions_count?: number;
  questions?: Question[];
  created_at: string;
  updated_at: string;
};

export type ChoiceInput = {
  text: string;
};

export type QuestionInput = {
  text: string;
  choices: ChoiceInput[];
};

export type CreateQuizPayload = {
  title: string;
  questions: QuestionInput[];
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type PaginatedQuizzes = {
  data: Quiz[];
  meta: PaginationMeta;
};

export type SubmitAnswerPayload = {
  question_id: number;
  choice_id: number;
  time_spent_ms: number;
};

export type AttemptAnswer = {
  id: number;
  question_id: number;
  question_text: string;
  choice_id: number;
  choice_text: string;
  time_spent_ms: number;
};

export type QuizAttempt = {
  id: number;
  quiz_id: number;
  quiz_title?: string;
  quiz_questions_count?: number;
  answered_questions_count?: number;
  started_at: string;
  completed_at: string | null;
  ai_feedback: string | null;
  answers: AttemptAnswer[];
};

export type PaginatedAttempts = {
  data: QuizAttempt[];
  meta: PaginationMeta;
};
