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
