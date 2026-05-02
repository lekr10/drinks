import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MorningReview from '@/components/MorningReview'
import { formatDuration, getDrinkEmoji } from '@/lib/utils'
import { LocalTime, LocalDate } from '@/components/TimeDisplay'
import type { SessionWithDetails, DrinkType } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*, drinks(*), food_entries(*)')
    .eq('id', id)
    .single()

  if (error || !session) notFound()

  const s = session as SessionWithDetails

  type FeedItem =
    | { kind: 'drink'; id: string; type: DrinkType; logged_at: string }
    | { kind: 'food'; id: string; notes: string; logged_at: string }

  const feed: FeedItem[] = [
    ...s.drinks.map(d => ({ kind: 'drink' as const, id: d.id, type: d.type, logged_at: d.logged_at })),
    ...s.food_entries.map(f => ({ kind: 'food' as const, id: f.id, notes: f.notes, logged_at: f.logged_at })),
  ].sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime())

  const drinksByType = s.drinks.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="min-h-dvh bg-white pb-12">
      <div className="px-5 pt-14 pb-4 border-b border-gray-100">
        <Link href="/history" className="text-gray-400 text-sm">← History</Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2"><LocalDate iso={s.started_at} /></h1>
        <p className="text-gray-400 text-xs mt-0.5">
          <LocalTime iso={s.started_at} />{s.ended_at ? <> – <LocalTime iso={s.ended_at} /></> : ''} · {formatDuration(s.started_at, s.ended_at)}
        </p>
      </div>

      {/* Stats */}
      <div className="px-5 py-4 flex gap-6 border-b border-gray-100">
        <Stat label="Drinks" value={s.drinks.length.toString()} />
        {Object.entries(drinksByType).map(([type, count]) => (
          <Stat key={type} label={type} value={`${getDrinkEmoji(type as DrinkType)} ${count}`} />
        ))}
      </div>

      {/* Morning review */}
      {s.ended_at && (
        <div className="px-5 py-5 border-b border-gray-100">
          <MorningReview
            sessionId={s.id}
            drunkScore={s.drunk_score}
            hangoverScore={s.hangover_score}
          />
        </div>
      )}

      {/* Feed */}
      <div className="px-5 pt-4">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Session Log</p>
        <div className="divide-y divide-gray-100">
          {feed.map(item => (
            <div key={item.id} className="py-3 flex items-center justify-between">
              {item.kind === 'drink' ? (
                <>
                  <span className="text-gray-900 font-medium text-sm">
                    {getDrinkEmoji(item.type)} {item.type}
                  </span>
                  <span className="text-gray-400 text-xs"><LocalTime iso={item.logged_at} /></span>
                </>
              ) : (
                <>
                  <span className="text-gray-600 text-sm flex-1 mr-4">🍽 {item.notes}</span>
                  <span className="text-gray-400 text-xs shrink-0"><LocalTime iso={item.logged_at} /></span>
                </>
              )}
            </div>
          ))}
          {feed.length === 0 && (
            <p className="text-gray-400 text-sm py-6 text-center">Nothing logged.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}
