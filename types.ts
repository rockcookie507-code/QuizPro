export interface Quiz {
  id: number;
  title: string;
  description: string;
  created_at: string;
  questions: Question[];
}

export interface Question {
  id: number;
  quiz_id: number;
  text: string;
  type: 'single' | 'multi';
  position: number;
  options: Option[];
}

export interface Option {
  id: number;
  question_id: number;
  text: string;
  score: number;
}

export interface Submission {
  id: number;
  quiz_id: number;
  total_score: number;
  submitted_at: string;
  answers: Answer[];
}

export interface Answer {
  question_id: number;
  option_id: number;
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export type ImageSize = '1K' | '2K' | '4K';