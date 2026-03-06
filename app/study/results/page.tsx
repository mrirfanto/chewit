"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RotateCcw, Home, ArrowLeft } from "lucide-react";
import { Question } from "@/types";
import { loadMockDataFromSession } from "@/mocks/data";

interface QuizResults {
  score: number;
  total: number;
  incorrectAnswers: number[];
  elapsedTime: number;
}

export default function ResultsPage() {
  const router = useRouter();

  // State
  const [results, setResults] = useState<QuizResults | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [deckTitle, setDeckTitle] = useState<string>("");

  // Load results and questions on mount
  useEffect(() => {
    const resultsData = sessionStorage.getItem("chewit_quiz_results");
    const studyData = loadMockDataFromSession();

    if (resultsData) {
      setResults(JSON.parse(resultsData));
    } else {
      router.push("/");
    }

    if (studyData?.quiz) {
      setQuestions(studyData.quiz);
    }

    // Load deck title if available
    if (studyData?.deckTitle) {
      setDeckTitle(studyData.deckTitle);
    }
  }, [router]);

  // Handlers
  const handleRetryWrong = async () => {
    if (!results || !questions.length) return;

    // Check if we have a deckId to reload from Supabase
    const studyData = loadMockDataFromSession();

    if (studyData?.deckId) {
      try {
        // Reload full deck from Supabase
        const response = await fetch(`/api/decks/${studyData.deckId}`);
        if (response.ok) {
          const deck = await response.json();

          // Filter to only wrong questions from the full deck
          const wrongQuestions = results.incorrectAnswers.map(
            (index) => deck.quiz_questions[index]
          );

          // Save retry data with deck info
          const retryData = {
            deckId: studyData.deckId,
            deckTitle: studyData.deckTitle,
            flashcards: deck.flashcards,
            quiz: wrongQuestions,
          };
          sessionStorage.setItem("chewit_study_data", JSON.stringify(retryData));

          // Clear previous results and navigate to quiz
          sessionStorage.removeItem("chewit_quiz_results");
          router.push("/study/quiz");
          return;
        }
      } catch (error) {
        console.error('Failed to reload deck from Supabase:', error);
        // Fall through to session-based retry
      }
    }

    // Fallback: Use session storage data (original behavior)
    const wrongQuestions = results.incorrectAnswers.map(
      (index) => questions[index]
    );

    const retryData = {
      flashcards: studyData?.flashcards || [],
      quiz: wrongQuestions,
    };
    sessionStorage.setItem(
      "chewit_study_data",
      JSON.stringify(retryData)
    );

    // Clear previous results and navigate to quiz
    sessionStorage.removeItem("chewit_quiz_results");
    router.push("/study/quiz");
  };

  const handleBackToFlashcards = () => {
    router.push("/study/flashcards");
  };

  const handleNewContent = () => {
    // Clear all session data
    sessionStorage.removeItem("chewit_study_data");
    sessionStorage.removeItem("chewit_quiz_results");
    router.push("/");
  };

  const handleBackToDecks = () => {
    // Keep session data, go back to home
    router.push("/");
  };

  // Loading state
  if (!results || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading results...</p>
      </div>
    );
  }

  // Computed values
  const percentage = Math.round((results.score / results.total) * 100);
  const scoreBand = getScoreBand(percentage);
  const incorrectQuestions = results.incorrectAnswers.map(
    (index) => questions[index]
  );
  const hasIncorrectAnswers = incorrectQuestions.length > 0;

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{scoreBand.emoji}</div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Quiz Complete!
          </h1>
          {deckTitle && (
            <p className="text-sm text-slate-500 mb-2">
              Deck: {deckTitle}
            </p>
          )}
          <p className="text-lg text-slate-600">{scoreBand.message}</p>
        </div>

        {/* Score Card */}
        <Card className="bg-white border-slate-200 p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 mb-2">Your Score</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-slate-900">
                {results.score}
              </span>
              <span className="text-2xl text-slate-400">/</span>
              <span className="text-2xl text-slate-400">
                {results.total}
              </span>
              <span className="text-2xl text-slate-600 ml-2">
                ({percentage}%)
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <Progress
              value={percentage}
              className="h-3"
              aria-label={`Score: ${percentage}%`}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="text-center">
              <p className="text-2xl font-semibold text-slate-900">
                {formatTime(results.elapsedTime)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Time Taken</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-slate-900">
                {results.total - results.score}
              </p>
              <p className="text-xs text-slate-500 mt-1">Incorrect</p>
            </div>
          </div>
        </Card>

        {/* Incorrect Answers */}
        {hasIncorrectAnswers && (
          <Card className="bg-white border-slate-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Review: Questions to Review
            </h2>
            <div className="space-y-4">
              {incorrectQuestions.map((question, idx) => (
                <div
                  key={question.id}
                  className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <p className="font-medium text-slate-800 mb-2">
                    {question.question}
                  </p>
                  <p className="text-sm text-green-700">
                    ✓ Correct: {question.options[question.answer]}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {hasIncorrectAnswers && (
            <Button
              onClick={handleRetryWrong}
              className="w-full min-h-[44px] bg-slate-900 text-white hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Wrong Answers ({incorrectQuestions.length})
            </Button>
          )}

          <Button
            onClick={handleBackToFlashcards}
            variant="outline"
            className="w-full min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Flashcards
          </Button>

          <Button
            onClick={handleBackToDecks}
            variant="ghost"
            className="w-full min-h-[44px]"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to My Decks
          </Button>

          <Button
            onClick={handleNewContent}
            variant="ghost"
            className="w-full min-h-[44px] text-slate-400"
          >
            New Content
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============ Helper Functions ============

function getScoreBand(percentage: number): {
  emoji: string;
  message: string;
  variant: "default" | "secondary" | "destructive";
} {
  if (percentage >= 80) {
    return {
      emoji: "🏆",
      message: "Excellent work! You've mastered this material.",
      variant: "default",
    };
  }
  if (percentage >= 50) {
    return {
      emoji: "👍",
      message: "Good effort! Keep reviewing to improve.",
      variant: "secondary",
    };
  }
  return {
    emoji: "🔄",
    message: "Keep practicing! Review the flashcards and try again.",
    variant: "destructive",
  };
}
