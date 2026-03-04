"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ArrowRight } from "lucide-react";
import { Question } from "@/types";
import { loadMockDataFromSession } from "@/mocks/data";

// ============ Quiz Option Component ============

interface QuizOptionProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  isRevealed: boolean;
  onSelect: () => void;
}

function QuizOption({ option, index, isSelected, isCorrect, isRevealed, onSelect }: QuizOptionProps) {
  const getOptionStyles = () => {
    if (!isRevealed) {
      return isSelected
        ? "bg-slate-100 border-slate-400 text-slate-900"
        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300";
    }

    // After reveal
    if (isCorrect) {
      return "bg-green-50 border-green-500 text-green-700";
    }
    if (isSelected) {
      return "bg-red-50 border-red-500 text-red-700";
    }
    return "bg-white border-slate-200 text-slate-700 opacity-60";
  };

  return (
    <button
      onClick={onSelect}
      disabled={isRevealed}
      className={`
        w-full text-left px-6 py-4 rounded-lg border-2 font-medium
        transition-all duration-150
        ${getOptionStyles()}
        disabled:cursor-not-allowed
      `}
      aria-label={`Option ${index + 1}: ${option}`}
      aria-pressed={isSelected}
    >
      <span className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-current opacity-10 flex items-center justify-center text-xs font-semibold">
          {String.fromCharCode(65 + index)}
        </span>
        <span className="flex-1">{option}</span>
        {isRevealed && isCorrect && (
          <span className="text-green-600">✓</span>
        )}
        {isRevealed && isSelected && !isCorrect && (
          <span className="text-red-600">✗</span>
        )}
      </span>
    </button>
  );
}

// ============ Main Quiz Page Component ============

export default function QuizPage() {
  const router = useRouter();
  const startTimeRef = useRef<number>(Date.now());

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number[]>([]);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load questions on mount
  useEffect(() => {
    const data = loadMockDataFromSession();
    if (data && data.quiz) {
      setQuestions(data.quiz);
    } else {
      router.push("/");
    }
  }, [router]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Number keys 1-4 to select options
      if (e.key >= "1" && e.key <= "4" && !isRevealed) {
        const index = parseInt(e.key) - 1;
        if (index < questions[currentIndex]?.options.length) {
          handleSelectAnswer(index);
        }
      }
      // Enter to proceed after reveal
      if (e.key === "Enter" && isRevealed) {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRevealed, questions, currentIndex]);

  // Handlers
  const handleSelectAnswer = useCallback(
    (index: number) => {
      if (isRevealed) return;
      setSelectedAnswer(index);
      setIsRevealed(true);

      // Track incorrect answers
      const currentQuestion = questions[currentIndex];
      if (index !== currentQuestion.answer) {
        setIncorrectAnswers((prev) => [...prev, currentIndex]);
      }
    },
    [isRevealed, questions, currentIndex]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsRevealed(false);
    } else {
      // Save results to sessionStorage and go to results page
      const results = {
        score: questions.length - incorrectAnswers.length,
        total: questions.length,
        incorrectAnswers,
        elapsedTime,
      };
      sessionStorage.setItem("chewit_quiz_results", JSON.stringify(results));
      router.push("/study/results");
    }
  }, [currentIndex, questions, incorrectAnswers, elapsedTime, router]);

  // Computed values
  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + (isRevealed ? 1 : 0)) / questions.length) * 100;
  const isCorrect = selectedAnswer === currentQuestion?.answer;
  const isLastQuestion = currentIndex === questions.length - 1;

  // Loading state
  if (!questions.length || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading quiz...</p>
      </div>
    );
  }

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
        <div className="text-center mb-6">
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Quiz</h1>
          <p className="text-sm text-slate-500">
            Test your understanding of the material
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="font-normal">
              Question {currentIndex + 1} of {questions.length}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {formatTime(elapsedTime)}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" aria-label="Quiz progress" />
        </div>

        {/* Question Card */}
        <Card className="bg-white border-slate-200 p-6 mb-6">
          <p className="text-xl font-semibold text-slate-800 mb-6">
            {currentQuestion.question}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <QuizOption
                key={index}
                option={option}
                index={index}
                isSelected={selectedAnswer === index}
                isCorrect={index === currentQuestion.answer}
                isRevealed={isRevealed}
                onSelect={() => handleSelectAnswer(index)}
              />
            ))}
          </div>
        </Card>

        {/* Feedback & Next Button */}
        {isRevealed && (
          <div className="space-y-4">
            {/* Feedback Message */}
            <div
              className={`p-4 rounded-lg border-2 ${
                isCorrect
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <p className="font-medium text-center">
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                {!isCorrect && (
                  <span className="block mt-1 text-sm font-normal">
                    The correct answer is{" "}
                    <strong>
                      {String.fromCharCode(65 + currentQuestion.answer)}
                    </strong>
                  </span>
                )}
              </p>
            </div>

            {/* Next/Results Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleNext}
                className="min-h-[44px] px-6 bg-slate-900 text-white hover:bg-slate-800"
              >
                {isLastQuestion ? (
                  <>
                    See Results
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        {!isRevealed && (
          <p className="text-xs text-slate-400 text-center mt-6">
            Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono">1-4</kbd> to select
          </p>
        )}
      </div>
    </div>
  );
}
