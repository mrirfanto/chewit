import { NextRequest, NextResponse } from 'next/server';
import { listDecks, SortOption } from '@/lib/db';

const VALID_SORTS: SortOption[] = ['recent', 'score_asc', 'name_asc'];

/**
 * GET /api/decks
 * List all decks
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortParam = searchParams.get('sort') ?? 'recent';
    const sort: SortOption = VALID_SORTS.includes(sortParam as SortOption)
      ? (sortParam as SortOption)
      : 'recent';

    const decks = await listDecks(sort);

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
