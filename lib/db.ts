/**
 * Database utility functions for Supabase
 * Handles all CRUD operations for decks, flashcards, and quiz questions
 */

import { supabase } from './supabase';
import { Deck, Flashcard, Question } from '@/types';
import { DatabaseError, ValidationError } from './errors';

// ============ Types ============

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

export interface SaveQuizScoreParams {
  deck_id: string;
  score: number;
  total: number;
  incorrect_answers: number[];
  time_taken: number;
}

export type SortOption = 'recent' | 'score_asc' | 'name_asc';

// ============ CRUD Operations ============

export async function saveDeckTags(deckId: string, tagNames: string[]): Promise<void> {
  try {
    for (const name of tagNames) {
      await supabase.from('tags').upsert({ name }, { onConflict: 'name' });
      const { data: tag } = await supabase.from('tags').select('id').eq('name', name).single();
      if (!tag) continue;
      await supabase.from('deck_tags').upsert({ deck_id: deckId, tag_id: tag.id }, { onConflict: 'deck_id,tag_id' });
    }
  } catch (error) {
    console.error('Error saving deck tags:', error);
  }
}

export async function setDeckTags(deckId: string, tagNames: string[]): Promise<void> {
  await supabase.from('deck_tags').delete().eq('deck_id', deckId);
  if (tagNames.length === 0) return;
  await saveDeckTags(deckId, tagNames);
}

export async function getDeckTags(deckIds: string[]): Promise<Map<string, string[]>> {
  if (deckIds.length === 0) return new Map();
  const { data } = await supabase
    .from('deck_tags')
    .select('deck_id, tags(name)')
    .in('deck_id', deckIds);
  const map = new Map<string, string[]>();
  for (const row of data || []) {
    const tagData = row.tags as unknown as { name: string } | null;
    if (!tagData) continue;
    const existing = map.get(row.deck_id) ?? [];
    existing.push(tagData.name);
    map.set(row.deck_id, existing);
  }
  return map;
}

export async function saveDeck(params: SaveDeckParams, tags: string[] = []): Promise<Deck> {
  if (!params.title || params.title.trim().length === 0) {
    throw new ValidationError('Deck title is required', 'title');
  }
  if (!params.source_text || params.source_text.trim().length === 0) {
    throw new ValidationError('Source text is required', 'source_text');
  }
  if (params.flashcards.length === 0 && params.quiz_questions.length === 0) {
    throw new ValidationError('Deck must have at least one flashcard or quiz question');
  }

  try {
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .insert({
        title: params.title.trim(),
        source_text: params.source_text.trim(),
        topic_name: params.topic_name?.trim() || null,
      })
      .select()
      .single();

    if (deckError) {
      throw new DatabaseError('Failed to save deck', deckError.code || 'DB_ERROR', deckError);
    }

    if (!deck || !deck.id) {
      throw new DatabaseError('Failed to save deck: No ID returned', 'NO_ID');
    }

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

      if (flashcardsError) {
        throw new DatabaseError('Failed to save flashcards', flashcardsError.code || 'DB_ERROR', flashcardsError);
      }
    }

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

      if (questionsError) {
        throw new DatabaseError('Failed to save quiz questions', questionsError.code || 'DB_ERROR', questionsError);
      }
    }

    await saveDeckTags(deck.id, tags);

    return {
      id: deck.id,
      title: deck.title,
      created_at: deck.created_at,
      updated_at: deck.updated_at,
      pinned: false,
      last_studied_at: null,
      best_score: null,
      flashcard_count: null,
      tags,
    };
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof ValidationError) {
      throw error;
    }
    console.error('Error saving deck:', error);
    throw new DatabaseError('Failed to save deck', 'UNKNOWN_ERROR', error);
  }
}

export async function getDeck(deckId: string): Promise<DeckWithRelations> {
  if (!deckId || deckId.trim().length === 0) {
    throw new ValidationError('Deck ID is required', 'deckId');
  }

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

    if (deckError) {
      throw new DatabaseError(
        `Deck with ID ${deckId} not found`,
        deckError.code || 'NOT_FOUND',
        deckError
      );
    }

    if (!deck) {
      throw new DatabaseError(`Deck with ID ${deckId} not found`, 'PGRST116');
    }

    return {
      id: deck.id,
      title: deck.title,
      created_at: deck.created_at,
      updated_at: deck.updated_at,
      pinned: false,
      last_studied_at: deck.last_studied_at ?? null,
      best_score: null,
      flashcard_count: null,
      tags: [],
      flashcards: deck.flashcards as Flashcard[],
      quiz_questions: deck.quiz_questions as Question[],
    };
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof ValidationError) {
      throw error;
    }
    console.error('Error fetching deck:', error);
    throw new DatabaseError('Failed to fetch deck', 'UNKNOWN_ERROR', error);
  }
}

export async function deleteDeck(deckId: string): Promise<void> {
  if (!deckId || deckId.trim().length === 0) {
    throw new ValidationError('Deck ID is required', 'deckId');
  }

  try {
    const { error } = await supabase
      .from('decks')
      .delete()
      .eq('id', deckId);

    if (error) {
      throw new DatabaseError('Failed to delete deck', error.code || 'DB_ERROR', error);
    }
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof ValidationError) {
      throw error;
    }
    console.error('Error deleting deck:', error);
    throw new DatabaseError('Failed to delete deck', 'UNKNOWN_ERROR', error);
  }
}

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

export async function listDecks(sortBy: SortOption = 'recent', search?: string, tagFilter?: string[]): Promise<Deck[]> {
  try {
    let decksQuery = supabase
      .from('decks')
      .select('id, title, created_at, updated_at, last_studied_at, pinned');

    if (search) {
      decksQuery = decksQuery.ilike('title', `%${search}%`);
    }

    if (sortBy === 'recent') {
      decksQuery = decksQuery
        .order('last_studied_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
    } else if (sortBy === 'name_asc') {
      decksQuery = decksQuery.order('title', { ascending: true });
    }

    const [decksResult, scoresResult] = await Promise.all([
      decksQuery,
      supabase.from('quiz_scores').select('deck_id, score, total'),
    ]);

    if (decksResult.error) throw decksResult.error;
    if (scoresResult.error) throw scoresResult.error;

    const deckIds = (decksResult.data || []).map(d => d.id);
    const tagsMap = await getDeckTags(deckIds);

    const bestScores = new Map<string, number>();
    for (const s of scoresResult.data || []) {
      if (s.total > 0) {
        const pct = (s.score / s.total) * 100;
        const current = bestScores.get(s.deck_id);
        if (current === undefined || pct > current) {
          bestScores.set(s.deck_id, pct);
        }
      }
    }

    let decks = (decksResult.data || []).map(d => ({
      id: d.id,
      title: d.title,
      created_at: d.created_at,
      updated_at: d.updated_at,
      pinned: d.pinned as boolean,
      last_studied_at: d.last_studied_at ?? null,
      best_score: bestScores.get(d.id) ?? null,
      flashcard_count: null,
      tags: tagsMap.get(d.id) ?? [],
    }));

    if (tagFilter && tagFilter.length > 0) {
      const normalizedFilter = tagFilter.map(t => t.toLowerCase());
      decks = decks.filter(d => d.tags.some(tag => normalizedFilter.includes(tag.toLowerCase())));
    }

    if (sortBy === 'score_asc') {
      decks.sort((a, b) => {
        if (a.best_score === null && b.best_score === null) return 0;
        if (a.best_score === null) return -1;
        if (b.best_score === null) return 1;
        return a.best_score - b.best_score;
      });
    }

    const pinned = decks.filter(d => d.pinned);
    const unpinned = decks.filter(d => !d.pinned);
    return [...pinned, ...unpinned];
  } catch (error) {
    console.error('Error listing decks:', error);
    throw error;
  }
}

export async function updateDeckTitle(deckId: string, newTitle: string): Promise<void> {
  if (!deckId || deckId.trim().length === 0) {
    throw new ValidationError('Deck ID is required', 'deckId');
  }
  if (!newTitle || newTitle.trim().length === 0) {
    throw new ValidationError('Deck title is required', 'title');
  }

  try {
    const { error } = await supabase
      .from('decks')
      .update({ title: newTitle.trim() })
      .eq('id', deckId);

    if (error) {
      throw new DatabaseError('Failed to update deck title', error.code || 'DB_ERROR', error);
    }
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof ValidationError) throw error;
    console.error('Error updating deck title:', error);
    throw new DatabaseError('Failed to update deck title', 'UNKNOWN_ERROR', error);
  }
}

export async function updateLastStudiedAt(deckId: string): Promise<void> {
  if (!deckId || deckId.trim().length === 0) {
    throw new ValidationError('Deck ID is required', 'deckId');
  }

  try {
    const { error } = await supabase
      .from('decks')
      .update({ last_studied_at: new Date().toISOString() })
      .eq('id', deckId);

    if (error) {
      throw new DatabaseError('Failed to update last studied date', error.code || 'DB_ERROR', error);
    }
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof ValidationError) throw error;
    console.error('Error updating last studied date:', error);
    throw new DatabaseError('Failed to update last studied date', 'UNKNOWN_ERROR', error);
  }
}

export async function togglePin(deckId: string, pinned: boolean): Promise<void> {
  if (!deckId || deckId.trim().length === 0) {
    throw new ValidationError('Deck ID is required', 'deckId');
  }

  try {
    const { error } = await supabase
      .from('decks')
      .update({ pinned })
      .eq('id', deckId);

    if (error) {
      throw new DatabaseError('Failed to update pin status', error.code || 'DB_ERROR', error);
    }
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof ValidationError) throw error;
    console.error('Error toggling pin:', error);
    throw new DatabaseError('Failed to update pin status', 'UNKNOWN_ERROR', error);
  }
}

export async function saveQuizScore(params: SaveQuizScoreParams): Promise<{ id: string }> {
  if (!params.deck_id) {
    throw new ValidationError('Deck ID is required', 'deck_id');
  }

  try {
    const { data, error } = await supabase
      .from('quiz_scores')
      .insert({
        deck_id: params.deck_id,
        score: params.score,
        total: params.total,
        incorrect_answers: params.incorrect_answers,
        time_taken: params.time_taken,
      })
      .select('id')
      .single();

    if (error) {
      throw new DatabaseError('Failed to save quiz score', error.code || 'DB_ERROR', error);
    }

    return { id: data.id };
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof ValidationError) throw error;
    console.error('Error saving quiz score:', error);
    throw new DatabaseError('Failed to save quiz score', 'UNKNOWN_ERROR', error);
  }
}
