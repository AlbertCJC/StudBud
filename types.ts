
export interface FlashcardData {
  id: string;
  question: string;
  answer: string;
}

export interface QuizData {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export enum GenerationMode {
  FLASHCARDS = 'FLASHCARDS',
  QUIZ = 'QUIZ'
}

export enum AppState {
  IDLE = 'IDLE',
  SELECTING_MODE = 'SELECTING_MODE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  VIEWING = 'VIEWING',
  ERROR = 'ERROR'
}
