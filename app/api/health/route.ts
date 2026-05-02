import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    return NextResponse.json({
      ok: false,
      error: 'Missing env vars',
      SUPABASE_URL: url ? 'set' : 'MISSING',
      SUPABASE_PUBLISHABLE_KEY: key ? 'set' : 'MISSING',
    }, { status: 500 })
  }

  try {
    const { error } = await supabase.from('sessions').select('id').limit(1)
    if (error) {
      return NextResponse.json({ ok: false, error: error.message, code: error.code }, { status: 500 })
    }
    return NextResponse.json({ ok: true, SUPABASE_URL: url })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
