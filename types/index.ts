/**
 * Core data types for Chewit application
 */

// ============ Flashcard Types ============

export interface Flashcard {
  id: string;
  front: string;  // Concept or question (max ~15 words)
  back: string;   // Explanation (max ~50 words)
}

// ============ Quiz Types ============

export interface Question {
  id: string;
  question: string;
  options: string[];  // Always length 4
  answer: number;     // Index 0-3 of correct option
}

// ============ Deck Types ============

export interface Deck {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  pinned: boolean;
  last_studied_at: string | null;
  best_score: number | null;      // Percentage 0–100, derived from quiz_scores
  flashcard_count: number | null;
  tags: string[];
}

// ============ Generation Types ============

export interface GenerateRequest {
  sourceText: string;
  topicName?: string;
}

export interface GenerateResponse {
  flashcards: Flashcard[];
  quiz: Question[];
}

// ============ Quiz Session Types ============

export interface QuizSession {
  deckId: string;
  currentQuestionIndex: number;
  answers: Map<number, number>;  // questionIndex -> answerIndex
  incorrectAnswers: number[];    // Indices of wrong answers
  startTime: number;
}
