'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertCircle, Loader2, Trash2, BookOpen, Clock, Check, X, Edit2 } from 'lucide-react';

// ============ Types ============

interface ValidationState {
  isValid: boolean;
  error: string | null;
}

interface Deck {
  id: string;
  title: string;
  created_at: string;
}
// ============ Constants ============

const MIN_WORDS = 200;

// Sample content for "Try an example" feature (~400 words)
const SAMPLE_CONTENT = `# React Hooks: A Comprehensive Introduction

React Hooks are functions that let you "hook into" React state and lifecycle features from function components. They were introduced in React 16.8 to solve several problems with class components.

## The Problem with Class Components

Before Hooks, if you wanted to add state to a function component, you had to convert it to a class. Classes could be confusing for both developers and tools. They also made it hard to reuse stateful logic between components.

## useState Hook

The useState hook lets you add state to function components. It takes an initial value and returns an array with two elements: the current state value and a function to update it.

Example:
\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

The count variable holds the current state, and setCount is the function you call to update it. Unlike this.setState in classes, useState doesn't merge objects—it replaces them.

## useEffect Hook

The useEffect hook lets you perform side effects in function components. Side effects include data fetching, subscriptions, or manually changing the DOM. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount in React classes.

useEffect takes two arguments: a function and an optional dependency array. The function runs after the render is committed to the screen.

By default, effects run after every render. However, you can control when effects run by providing a dependency array. If any value in the array changes between renders, the effect runs again.

## Rules of Hooks

Hooks have two important rules: only call them at the top level (don't call inside loops, conditions, or nested functions), and only call them from React function components or custom hooks.

## Custom Hooks

You can create your own hooks to reuse stateful logic between components. Custom hooks start with "use" and can call other hooks if they follow the rules of Hooks.

## Conclusion

Hooks simplify React code by making function components more powerful and eliminating the need for classes in most cases. They provide a more direct API to React concepts you already know: props, state, context, refs, and lifecycle.`;
const MAX_WORDS = 10000;
const RECOMMENDED_MIN_WORDS = 500;
const RECOMMENDED_MAX_WORDS = 5000;

// ============ Helpers ============

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

function validateInput(text: string): ValidationState {
  const wordCount = countWords(text);

  if (wordCount === 0) {
    return { isValid: false, error: null };
  }

  if (wordCount < MIN_WORDS) {
    return {
      isValid: false,
      error: `Content is too short. Please provide at least ${MIN_WORDS} words (currently: ${wordCount} words).`,
    };
  }

  if (wordCount > MAX_WORDS) {
    return {
      isValid: false,
      error: `Content is too long. Please keep it under ${MAX_WORDS} words (currently: ${wordCount} words).`,
    };
  }

  return { isValid: true, error: null };
}

function getWordCountColor(wordCount: number): string {
  if (wordCount < MIN_WORDS) return 'text-red-500';
  if (wordCount < RECOMMENDED_MIN_WORDS) return 'text-amber-500';
  if (wordCount > MAX_WORDS) return 'text-red-500';
  if (wordCount > RECOMMENDED_MAX_WORDS) return 'text-amber-500';
  return 'text-green-600';
}

function getWordCountMessage(wordCount: number): string {
  if (wordCount === 0) return 'Start typing to see word count';
  if (wordCount < MIN_WORDS) return `${MIN_WORDS - wordCount} more words needed`;
  if (wordCount < RECOMMENDED_MIN_WORDS) return 'Getting there...';
  if (wordCount > MAX_WORDS) return `${wordCount - MAX_WORDS} words over limit`;
  if (wordCount > RECOMMENDED_MAX_WORDS) return 'Still usable, but getting long';
  return 'Perfect length';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function getWordCountProgress(wordCount: number): number {
  if (wordCount === 0) return 0;
  // Scale progress from 0 to 100 based on RECOMMENDED range
  const min = RECOMMENDED_MIN_WORDS;
  const max = RECOMMENDED_MAX_WORDS;
  if (wordCount <= min) return (wordCount / min) * 50;
  if (wordCount >= max) return 100;
  return 50 + ((wordCount - min) / (max - min)) * 50;
}

// ============ Main Component ============

export default function HomePage() {
  // State
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [decksLoading, setDecksLoading] = useState<boolean>(true);
  const [loadingDeckId, setLoadingDeckId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Computed values
  const wordCount = countWords(content);
  const validation = validateInput(content);
  const wordCountColor = getWordCountColor(wordCount);
  const wordCountMessage = getWordCountMessage(wordCount);
  const isGenerateDisabled = !validation.isValid || isLoading;

  // Handlers
  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleClear = () => {
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const loadDecks = useCallback(async () => {
    try {
      setDecksLoading(true);
      const response = await fetch('/api/decks');
      if (!response.ok) throw new Error('Failed to load decks');
      const data = await response.json();
      setDecks(data.decks);
    } catch (error) {
      console.error('Error loading decks:', error);
    } finally {
      setDecksLoading(false);
    }
  }, []);

  const handleDeleteDeck = async (deckId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setLoadingDeckId(deckId);

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete deck');

      setDecks(decks.filter((d) => d.id !== deckId));
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Failed to delete deck. Please try again.');
    } finally {
      setLoadingDeckId(null);
    }
  };

  const handleLoadDeck = async (deckId: string) => {
    setLoadingDeckId(deckId);

    try {
      const response = await fetch(`/api/decks/${deckId}`);
      if (!response.ok) throw new Error('Failed to load deck');
      const data = await response.json();

      const sessionData = {
        deckId: data.id,
        deckTitle: data.title,
        flashcards: data.flashcards,
        quiz: data.quiz_questions,
      };
      sessionStorage.setItem('chewit_study_data', JSON.stringify(sessionData));

      router.push('/study/flashcards');
    } catch (error) {
      console.error('Error loading deck:', error);
      alert('Failed to load deck. Please try again.');
      setLoadingDeckId(null);
    }
  };

  const handleStartEdit = (deckId: string, currentTitle: string) => {
    setEditingId(deckId);
    setEditTitle(currentTitle);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleSaveEdit = async (deckId: string) => {
    if (!editTitle.trim()) {
      alert('Deck title cannot be empty');
      return;
    }

    setEditLoading(true);

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update deck title');
      }

      // Update local state
      setDecks(decks.map((deck) =>
        deck.id === deckId ? { ...deck, title: editTitle.trim() } : deck
      ));

      setEditingId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Error updating deck title:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to update deck title. Please try again.'
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleKeyDownEdit = (e: React.KeyboardEvent<HTMLInputElement>, deckId: string) => {
    if (e.key === 'Enter') {
      handleSaveEdit(deckId);
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!validation.isValid || isLoading) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceText: content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to generate flashcards');
      }

      const data = await response.json();

      const sessionData = {
        deckId: data.deckId,
        deckTitle: data.deckTitle,
        flashcards: data.flashcards,
        quiz: data.quiz,
      };
      sessionStorage.setItem('chewit_study_data', JSON.stringify(sessionData));

      await loadDecks();
      router.push('/study/flashcards');
    } catch (error) {
      console.error('Generation error:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to generate flashcards. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [content, validation.isValid, isLoading, router, loadDecks]);

  const handleTryExample = () => {
    setContent(SAMPLE_CONTENT);
  };

  // Load decks on mount
  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isGenerateDisabled && handleGenerate) {
          handleGenerate();
        }
      }
      // Escape to clear (if not empty)
      if (e.key === 'Escape' && content.length > 0) {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, isGenerateDisabled, handleGenerate]);

  // ============ Render ============

  return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-3xl">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold text-slate-900 mb-3 tracking-tight">
              Turn Reading into Remembering
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Paste articles, notes, or transcripts and get AI-generated flashcards and quizzes in
              seconds. Study smarter, not harder.
            </p>
            <button
              onClick={handleTryExample}
              className="mt-4 text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors"
            >
              Try an example
            </button>
          </div>

          {/* Input Card */}
          <Card className="bg-white border-slate-200 p-6">
            <div className="space-y-4">
              {/* Textarea */}
              <div className="space-y-2">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Paste your content here...

Articles • Notes • Transcripts • Docs • Anything you want to learn

Best with {RECOMMENDED_MIN_WORDS}-{RECOMMENDED_MAX_WORDS} words. Min: {MIN_WORDS} words."
                  className={`
                  w-full min-h-[400px] px-6 py-4
                  bg-white border-slate-200 rounded-xl
                  text-slate-900 text-base leading-relaxed
                  placeholder:text-slate-400
                  focus:ring-2 focus:ring-slate-400 focus:border-transparent
                  resize-none
                  transition-all duration-150
                  ${validation.error ? 'border-red-300 focus:ring-red-400' : ''}
                `}
                  disabled={isLoading}
                  aria-label="Content input for flashcard generation"
                  aria-describedby={validation.error ? 'input-error' : 'word-count'}
                />

                {/* Validation Error */}
                <div className="min-h-[72px]">
                  {validation.error && (
                    <Alert variant="destructive" id="input-error" role="alert">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{validation.error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Word Count & Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                {/* Word Count */}
                <div className="flex items-center gap-3 flex-1">
                  <div
                    id="word-count"
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1"
                    aria-live="polite"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Words:</span>
                      <Badge
                        variant={validation.isValid ? 'default' : 'secondary'}
                        className="font-semibold"
                      >
                        {wordCount.toLocaleString()}
                      </Badge>
                    </div>
                    {wordCount > 0 && (
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Progress
                          value={getWordCountProgress(wordCount)}
                          className="h-2 flex-1"
                          aria-label="Word count progress"
                        />
                        <span className={`text-xs font-medium whitespace-nowrap ${wordCountColor}`}>
                          {wordCountMessage}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  {/* Clear Button */}
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleClear}
                    disabled={content.length === 0 || isLoading}
                    className="
                    px-6 py-3
                    bg-transparent border-slate-200
                    text-slate-700 text-sm font-medium
                    hover:bg-slate-50 hover:border-slate-300
                    active:bg-slate-100
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-150
                  "
                    aria-label="Clear content"
                  >
                    Clear
                  </Button>

                  {/* Generate Button */}
                  <Button
                    variant="default"
                    size="default"
                    onClick={handleGenerate}
                    disabled={isGenerateDisabled}
                    className="
                    px-6 py-3
                    bg-slate-900 border-slate-900
                    text-white text-sm font-medium
                    hover:bg-slate-800
                    active:bg-slate-900
                    focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-900
                    transition-colors duration-150
                    min-h-[44px]
                  "
                    aria-label="Generate flashcards"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate Flashcards
                      </>
                    )}
                  </Button>
                </div>

                {/* Helper Text */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500 text-center">
                    Ideal: {RECOMMENDED_MIN_WORDS.toLocaleString()}-
                    {RECOMMENDED_MAX_WORDS.toLocaleString()} words • Limits: {MIN_WORDS}-
                    {MAX_WORDS.toLocaleString()} words • Press{' '}
                    <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono">
                      Ctrl+Enter
                    </kbd>{' '}
                    to generate
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 text-center" aria-live="polite">
              <p className="text-sm text-slate-600">
                Creating your flashcards... This usually takes 10-20 seconds.
              </p>
            </div>
          )}

          {/* Recent Decks Section */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-slate-900">Your Decks</h2>
              {decks.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {decks.length} {decks.length === 1 ? 'Deck' : 'Decks'}
                </Badge>
              )}
            </div>

            {/* Loading Skeleton */}
            {decksLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-white border-slate-200 p-6">
                    <div className="space-y-3">
                      <div className="h-6 bg-slate-100 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-1/2"></div>
                      <div className="h-9 bg-slate-100 rounded animate-pulse w-32 mt-4"></div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!decksLoading && decks.length === 0 && (
              <Card className="bg-white border-slate-200 p-12 text-center">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No decks yet</h3>
                <p className="text-slate-500 mb-4">
                  Generate your first deck to get started! Paste your content above and click Generate.
                </p>
              </Card>
            )}

            {/* Deck List */}
            {!decksLoading && decks.length > 0 && (
              <div className="space-y-3">
                {decks.map((deck) => (
                  <Card
                    key={deck.id}
                    className="bg-white border-slate-200 p-6 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {editingId === deck.id ? (
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => handleKeyDownEdit(e, deck.id)}
                              className="flex-1 px-3 py-1.5 text-lg font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
                              autoFocus
                              disabled={editLoading}
                              aria-label="Edit deck title"
                            />
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSaveEdit(deck.id)}
                                disabled={editLoading}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                aria-label="Save edit"
                              >
                                {editLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Check className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancelEdit}
                                disabled={editLoading}
                                className="h-8 w-8 p-0 text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                                aria-label="Cancel edit"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <h3 className="text-lg font-semibold text-slate-900 mb-1 truncate">
                            {deck.title}
                          </h3>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(deck.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleLoadDeck(deck.id)}
                          disabled={loadingDeckId === deck.id || editingId === deck.id}
                          className="bg-slate-900 hover:bg-slate-800 text-white"
                        >
                          {loadingDeckId === deck.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Study'
                          )}
                        </Button>
                        {editingId !== deck.id && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEdit(deck.id, deck.title)}
                              disabled={loadingDeckId !== null}
                              className="border-slate-200 text-slate-700 hover:bg-slate-50"
                              aria-label="Edit deck title"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteDeck(deck.id, deck.title)}
                              disabled={loadingDeckId !== null}
                              className="border-slate-200 text-slate-700 hover:bg-slate-50"
                              aria-label="Delete deck"
                            >
                              {loadingDeckId === deck.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
}
