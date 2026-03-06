"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Shuffle, ArrowRight } from "lucide-react";
import { Flashcard } from "@/types";
import { loadMockDataFromSession } from "@/mocks/data";

// ============ Fisher-Yates Shuffle ============

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============ Flashcard Component ============

interface FlashcardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}

function FlashcardCard({ card, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div
      className="flashcard-container w-full max-w-lg mx-auto"
      style={{ perspective: "1000px" }}
    >
      <div
        className={`relative w-full min-h-[320px] cursor-pointer transition-transform duration-600 preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onFlip();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Flashcard. Press Space or Enter to flip."
      >
        {/* Front of card */}
        <div
          className={`absolute w-full min-h-[320px] bg-white border-2 border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 backface-hidden ${
            isFlipped ? "opacity-0" : "opacity-100 hover:shadow-sm hover:border-slate-300"
          }`}
        >
          <Badge variant="secondary" className="mb-4 text-xs">
            Question
          </Badge>
          <p className="text-xl font-semibold text-slate-800 leading-relaxed">
            {card.front}
          </p>
          {!isFlipped && (
            <p className="absolute bottom-6 text-sm text-slate-400">
              Click or press Space to reveal
            </p>
          )}
        </div>

        {/* Back of card */}
        <div
          className={`absolute w-full min-h-[320px] bg-white border-2 border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 backface-hidden ${
            isFlipped ? "opacity-100 rotate-y-180 hover:shadow-sm hover:border-slate-300" : "opacity-0 rotate-y-180"
          }`}
        >
          <Badge variant="outline" className="mb-4 text-xs">
            Answer
          </Badge>
          <p className="text-lg text-slate-700 leading-relaxed">
            {card.back}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============ Main Page Component ============

export default function FlashcardsPage() {
  const router = useRouter();

  // State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [visitedCards, setVisitedCards] = useState<Set<number>>(new Set([0]));
  const [hasShuffled, setHasShuffled] = useState(false);

  // Load flashcards on mount
  useEffect(() => {
    const data = loadMockDataFromSession();
    if (data && data.flashcards) {
      setFlashcards(data.flashcards);
    } else {
      // If no data, redirect to home
      router.push("/");
    }
  }, [router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
      if (e.key === "ArrowRight" && currentIndex < flashcards.length - 1) {
        handleNext();
      }
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, flashcards.length]);

  // Handlers
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < flashcards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setIsFlipped(false);
      setVisitedCards((prev) => new Set([...prev, nextIndex]));
    }
  }, [currentIndex, flashcards.length]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, []);

  const handleShuffle = useCallback(() => {
    setFlashcards((prev) => shuffleArray(prev));
    setCurrentIndex(0);
    setIsFlipped(false);
    setVisitedCards(new Set([0]));
    setHasShuffled(true);
  }, []);

  const handleTakeQuiz = useCallback(() => {
    router.push("/study/quiz");
  }, [router]);

  // Computed values
  const currentCard = flashcards[currentIndex];
  const progress = (visitedCards.size / flashcards.length) * 100;
  const isLastCard = currentIndex === flashcards.length - 1;
  const showQuizButton = isLastCard && isFlipped;

  // Loading state
  if (!flashcards.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading flashcards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Flashcards
          </h1>
          <p className="text-sm text-slate-500">
            Review the key concepts from your content
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="font-normal">
              Card {currentIndex + 1} of {flashcards.length}
            </Badge>
            <button
              onClick={handleShuffle}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
              aria-label="Shuffle flashcards"
            >
              <Shuffle className="w-3 h-3" />
              Shuffle
            </button>
          </div>
          <Progress value={progress} className="h-2 transition-all duration-500 ease-out" aria-label="Flashcard progress" />
        </div>

        {/* Flashcard */}
        <div className="mb-6">
          <FlashcardCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="default"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="min-h-[44px] px-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {showQuizButton ? (
            <Button
              onClick={handleTakeQuiz}
              className="min-h-[44px] px-6 bg-slate-900 text-white hover:bg-slate-800"
            >
              Take the Quiz
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant={isLastCard ? "outline" : "default"}
              onClick={handleNext}
              disabled={isLastCard}
              className={`min-h-[44px] px-6 ${isLastCard ? "opacity-50" : "bg-slate-900 text-white hover:bg-slate-800"}`}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Keyboard shortcuts hint */}
        <p className="text-xs text-slate-400 text-center mt-6">
          Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono">Space</kbd> to flip •
          Use <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono">←</kbd>
          <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono">→</kbd> to navigate
        </p>
      </div>
    </div>
  );
}
