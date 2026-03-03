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

// ============ Score Types ============

export interface ScoreRecord {
  date: string;
  score: number;
  total: number;
}

// ============ Deck Types ============

export interface Deck {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  flashcards: Flashcard[];
  quiz: Question[];
  scores: ScoreRecord[];
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

// ============ Storage Types ============

export interface StorageDeck extends Deck {
  version: string;  // For future migrations
}

// ============ Quiz Session Types ============

export interface QuizSession {
  deckId: string;
  currentQuestionIndex: number;
  answers: Map<number, number>;  // questionIndex -> answerIndex
  incorrectAnswers: number[];    // Indices of wrong answers
  startTime: number;
}
