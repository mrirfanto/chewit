/**
 * Mock data for Phase 2 development
 * Used to build UI/UX before API integration
 */

import { Flashcard, Question } from "@/types";

// ============ Flashcards ============

export const mockFlashcards: Flashcard[] = [
  {
    id: "fc-1",
    front: "What are React Hooks?",
    back: "Functions that let you 'hook into' React state and lifecycle features from function components, introduced in React 16.8.",
  },
  {
    id: "fc-2",
    front: "What does useState do?",
    back: "Adds state to function components. Returns an array with the current state value and a function to update it.",
  },
  {
    id: "fc-3",
    front: "What is the purpose of useEffect?",
    back: "Lets you perform side effects in function components, serving the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount.",
  },
  {
    id: "fc-4",
    front: "What are the two rules of Hooks?",
    back: "1) Only call Hooks at the top level (not inside loops, conditions, or nested functions). 2) Only call Hooks from React function components.",
  },
  {
    id: "fc-5",
    front: "What happens if you call useState multiple times?",
    back: "Each call creates an independent state variable. Unlike this.setState, useState doesn't merge objects—it replaces them.",
  },
  {
    id: "fc-6",
    front: "How do you control when effects run?",
    back: "By providing a dependency array to useEffect. If any value in the array changes between renders, the effect runs again.",
  },
  {
    id: "fc-7",
    front: "What is a custom Hook?",
    back: "A function that starts with 'use' and can call other Hooks, allowing you to reuse stateful logic between components.",
  },
  {
    id: "fc-8",
    front: "Why were Hooks introduced?",
    back: "To solve problems with class components: confusion around 'this', difficulty reusing stateful logic, and complex lifecycle methods.",
  },
  {
    id: "fc-9",
    front: "Can you use Hooks in class components?",
    back: "No. Hooks only work with function components. You can't use them inside regular JavaScript functions or class components.",
  },
  {
    id: "fc-10",
    front: "What does the dependency array contain?",
    back: "Values from the component scope (props, state, functions) that the effect depends on. When these values change, the effect re-runs.",
  },
];

// ============ Quiz Questions ============

export const mockQuizQuestions: Question[] = [
  {
    id: "q-1",
    question: "What happens if you omit the dependency array in useEffect?",
    options: [
      "The effect runs only once on mount",
      "The effect runs after every render",
      "The effect never runs",
      "The effect runs only when unmounted",
    ],
    answer: 1,
  },
  {
    id: "q-2",
    question: "Which Hook is used to manage component state?",
    options: ["useEffect", "useContext", "useState", "useReducer"],
    answer: 2,
  },
  {
    id: "q-3",
    question: "What is the return value of useState?",
    options: [
      "An object with state and setState",
      "A string representing the state",
      "An array with the state value and updater function",
      "A promise that resolves to the state",
    ],
    answer: 2,
  },
  {
    id: "q-4",
    question: "Why should Hooks be called at the top level?",
    options: [
      "For better performance",
      "To ensure they're called in the same order each render",
      "Because they don't work inside if statements",
      "To make code more readable",
    ],
    answer: 1,
  },
  {
    id: "q-5",
    question: "What problem did Hooks solve regarding 'this'?",
    options: [
      "Made 'this' always refer to the component",
      "Eliminated the need to understand 'this' in function components",
      "Made 'this' easier to bind",
      "Allowed 'this' to be used in Hooks",
    ],
    answer: 1,
  },
];

// ============ Combined Mock Data ============

export interface MockStudyData {
  deckId?: string;
  deckTitle?: string;
  flashcards: Flashcard[];
  quiz: Question[];
}

export const mockStudyData: MockStudyData = {
  flashcards: mockFlashcards,
  quiz: mockQuizQuestions,
};

// ============ Helper for sessionStorage ============

const SESSION_STORAGE_KEY = "chewit_study_data";

export function saveMockDataToSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(mockStudyData));
  }
}

/**
 * Load study data from sessionStorage
 * Returns data with optional deckId and deckTitle if loaded from Supabase
 */
export function loadMockDataFromSession(): MockStudyData | null {
  if (typeof window !== "undefined") {
    const data = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

/**
 * Alias for loadMockDataFromSession with more semantic name
 */
export function loadStudyDataFromSession(): MockStudyData | null {
  return loadMockDataFromSession();
}

export function clearSessionData(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}
