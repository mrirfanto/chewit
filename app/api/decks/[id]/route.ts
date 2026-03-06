import { NextRequest, NextResponse } from 'next/server';
import { getDeck, deleteDeck } from '@/lib/db';

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
