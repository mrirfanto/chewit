import { NextRequest, NextResponse } from 'next/server';
import { saveQuizScore } from '@/lib/db';

/**
 * POST /api/quiz-scores
 * Save a quiz result for a deck
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deck_id, score, total, incorrect_answers, time_taken } = body;

    if (!deck_id || typeof deck_id !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_DECK_ID', message: 'deck_id is required' } },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || typeof total !== 'number') {
      return NextResponse.json(
        { error: { code: 'INVALID_SCORE', message: 'score and total are required numbers' } },
        { status: 400 }
      );
    }

    const result = await saveQuizScore({
      deck_id,
      score,
      total,
      incorrect_answers: Array.isArray(incorrect_answers) ? incorrect_answers : [],
      time_taken: typeof time_taken === 'number' ? time_taken : 0,
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error('Error saving quiz score:', error);
    return NextResponse.json(
      {
        error: {
          code: 'SAVE_SCORE_ERROR',
          message: error instanceof Error ? error.message : 'Failed to save quiz score',
        },
      },
      { status: 500 }
    );
  }
}
