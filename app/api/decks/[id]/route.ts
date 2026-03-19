import { NextRequest, NextResponse } from 'next/server';
import { getDeck, deleteDeck, updateDeckTitle, updateLastStudiedAt, togglePin, setDeckTags } from '@/lib/db';

function titleCase(str: string): string {
  return str.trim().replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1));
}

/**
 * GET /api/decks/[id]
 * Get a specific deck with flashcards and quiz questions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params;

    if (!deckId) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID',
            message: 'Deck ID is required',
          }
        },
        { status: 400 }
      );
    }

    const deck = await getDeck(deckId);

    return NextResponse.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json(
      {
        error: {
          code: 'GET_DECK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to fetch deck',
        }
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/decks/[id]
 * Update a deck's title
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params;

    if (!deckId) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID',
            message: 'Deck ID is required',
          }
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, last_studied_at, pinned } = body;

    if (typeof body.tags !== 'undefined') {
      if (!Array.isArray(body.tags)) {
        return NextResponse.json({ error: 'tags must be an array' }, { status: 400 });
      }
      if (!body.tags.every((t: unknown) => typeof t === 'string')) {
        return NextResponse.json({ error: 'Each tag must be a string' }, { status: 400 });
      }
      if (body.tags.length > 3) {
        return NextResponse.json({ error: 'Maximum 3 tags allowed' }, { status: 400 });
      }
      const saved = (body.tags as string[]).map(titleCase).slice(0, 3);
      await setDeckTags(deckId, saved);
      return NextResponse.json({ tags: saved });
    }

    if (typeof pinned === 'boolean') {
      await togglePin(deckId, pinned);
      return NextResponse.json({ success: true, message: 'Pin status updated' });
    }

    if (last_studied_at === true) {
      await updateLastStudiedAt(deckId);
      return NextResponse.json({ success: true, message: 'Last studied date updated' });
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_TITLE',
            message: 'Deck title is required',
          }
        },
        { status: 400 }
      );
    }

    await updateDeckTitle(deckId, title);

    return NextResponse.json({
      success: true,
      message: 'Deck title updated successfully',
    });
  } catch (error) {
    console.error('Error updating deck title:', error);
    return NextResponse.json(
      {
        error: {
          code: 'UPDATE_DECK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to update deck title',
        }
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/decks/[id]
 * Delete a specific deck
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: deckId } = await params;

    if (!deckId) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_ID',
            message: 'Deck ID is required',
          }
        },
        { status: 400 }
      );
    }

    await deleteDeck(deckId);

    return NextResponse.json({
      success: true,
      message: 'Deck deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json(
      {
        error: {
          code: 'DELETE_DECK_ERROR',
          message: error instanceof Error ? error.message : 'Failed to delete deck',
        }
      },
      { status: 500 }
    );
  }
}
