import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('decks')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({ count: count ?? 0 });
  } catch (error) {
    console.error('Error counting decks:', error);
    return NextResponse.json({ error: 'Failed to count decks' }, { status: 500 });
  }
}
