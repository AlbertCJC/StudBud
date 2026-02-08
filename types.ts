
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

export interface GroundingUrl {
  title: string;
  uri: string;
}

export interface StudyMaterialResponse {
  items: any[];
  groundingUrls: GroundingUrl[];
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
  ERROR = 'ERROR',
  INSUFFICIENT_CONTENT = 'INSUFFICIENT_CONTENT'
}

export type InputTab = 'text' | 'file' | 'topic';
