import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const { session_id, notes } = await request.json()

  const { data, error } = await supabase
    .from('food_entries')
    .insert({ session_id, notes, logged_at: new Date().toISOString() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
