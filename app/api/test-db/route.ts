import { NextResponse } from 'next/server';
import { testConnection, listDecks } from '@/lib/db';

/**
 * Test API endpoint to verify Supabase connection
 * GET /api/test-db
 */
export async function GET() {
  try {
    // Test connection
    const isConnected = await testConnection();

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to connect to Supabase',
          details: 'Check your environment variables'
        },
        { status: 500 }
      );
    }

    // Try to list decks
    const decks = await listDecks();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        deckCount: decks.length,
        decks: decks.map(deck => ({
          id: deck.id,
          title: deck.title,
          createdAt: deck.created_at,
        })),
      },
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
