import { NextResponse } from 'next/server';
import { listDecks } from '@/lib/db';

/**
 * GET /api/decks
 * List all decks
 */
export async function GET() {
  try {
    const decks = await listDecks();

    return NextResponse.json({
      decks,
      count: decks.length,
    });
  } catch (error) {
    console.error('Error listing decks:', error);
    return NextResponse.json(
      {
        error: {
          code: 'LIST_DECKS_ERROR',
          message: error instanceof Error ? error.message : 'Failed to list decks',
        }
      },
      { status: 500 }
    );
  }
}
