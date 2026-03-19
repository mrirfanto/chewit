import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('tags')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }

  return NextResponse.json({ tags: (data || []).map(r => r.name) });
}
