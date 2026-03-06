/**
 * Database utility functions for Supabase
 * Handles all CRUD operations for decks, flashcards, and quiz questions
 */

import { supabase } from './supabase';
import { Flashcard, Question } from '@/types';

// ============ Types ============

export interface Deck {
  id: string;
  title: string;
  source_text: string;
  topic_name: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface DeckWithRelations extends Deck {
  flashcards: Flashcard[];
  quiz_questions: Question[];
}


export interface SaveDeckParams {
  title: string;
  source_text: string;
  topic_name?: string;
  flashcards: Omit<Flashcard, 'id'>[];
  quiz_questions: Omit<Question, 'id'>[];
}

// ============ CRUD Operations ============

/**
 * Save a new deck with flashcards and quiz questions to the database
 * @param params - Deck data including flashcards and questions
 * @returns The created deck with its ID
 * @throws Error if database operation fails
 */
export async function saveDeck(params: SaveDeckParams): Promise<Deck> {
  try {
    // 1. Create deck
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .insert({
        title: params.title,
        source_text: params.source_text,
        topic_name: params.topic_name || null,
      })
      .select()
      .single();

    if (deckError) throw deckError;

    // 2. Create flashcards
    if (params.flashcards.length > 0) {
      const flashcardsWithDeckId = params.flashcards.map((fc, index) => ({
        deck_id: deck.id,
        front: fc.front,
        back: fc.back,
        position: index,
      }));

      const { error: flashcardsError } = await supabase
        .from('flashcards')
        .insert(flashcardsWithDeckId);

      if (flashcardsError) throw flashcardsError;
    }

    // 3. Create quiz questions
    if (params.quiz_questions.length > 0) {
      const questionsWithDeckId = params.quiz_questions.map((q, index) => ({
        deck_id: deck.id,
        question: q.question,
        options: q.options,
        answer: q.answer,
        position: index,
      }));

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsWithDeckId);

      if (questionsError) throw questionsError;
    }

    return deck;
  } catch (error) {
    console.error('Error saving deck:', error);
    throw error;
  }
}

/**
 * Get a deck with all its flashcards and quiz questions
 * @param deckId - The UUID of the deck
 * @returns The deck with related data
 * @throws Error if deck not found or database operation fails
 */
export async function getDeck(deckId: string): Promise<DeckWithRelations> {
  try {
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select(`
        *,
        flashcards (*),
        quiz_questions (*)
      `)
      .eq('id', deckId)
      .single();

    if (deckError) throw deckError;

    if (!deck) {
      throw new Error(`Deck with ID ${deckId} not found`);
    }

    return deck as DeckWithRelations;
  } catch (error) {
    console.error('Error fetching deck:', error);
    throw error;
  }
}


/**
 * Delete a deck and all its related data (cascade)
 * @param deckId - The UUID of the deck to delete
 * @throws Error if database operation fails
 */
export async function deleteDeck(deckId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting deck:', error);
    throw error;
  }
}

/**
 * Test the database connection
 * @returns true if connection is successful, false otherwise
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('decks')
      .select('id')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * List all decks (basic info only)
 * @returns Array of decks ordered by creation date (newest first)
 * @throws Error if database operation fails
 */
export async function listDecks() {
  try {
    const { data, error } = await supabase
      .from('decks')
      .select('id, title, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error listing decks:', error);
    throw error;
  }
}
