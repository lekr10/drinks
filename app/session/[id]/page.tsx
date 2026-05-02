import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import MorningReview from '@/components/MorningReview'
import { formatDate, formatTime, formatDuration, getDrinkEmoji } from '@/lib/utils'
import type { SessionWithDetails, DrinkType } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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
    <div className="min-h-dvh bg-gray-950 text-white pb-12">
      <div className="px-4 pt-12 pb-4">
        <Link href="/history" className="text-gray-400 text-sm">← History</Link>
        <h1 className="text-2xl font-bold mt-2">{formatDate(s.started_at)}</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {formatTime(s.started_at)}
          {s.ended_at ? ` – ${formatTime(s.ended_at)}` : ' – ongoing'} · {formatDuration(s.started_at, s.ended_at)}
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 flex gap-3 mb-6 overflow-x-auto pb-1">
        <StatChip label="drinks" value={s.drinks.length.toString()} />
        {Object.entries(drinksByType).map(([type, count]) => (
          <StatChip key={type} label={type} value={`${getDrinkEmoji(type as DrinkType)} ${count}`} />
        ))}
      </div>

      {/* Morning review */}
      {s.ended_at && (
        <div className="px-4 mb-6">
          <MorningReview
            sessionId={s.id}
            drunkScore={s.drunk_score}
            hangoverScore={s.hangover_score}
          />
        </div>
      )}

      {/* Feed */}
      <div className="px-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Session Log</p>
        <div className="space-y-2">
          {feed.map(item => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between"
            >
              {item.kind === 'drink' ? (
                <>
                  <span className="font-medium">{getDrinkEmoji(item.type)} {item.type}</span>
                  <span className="text-gray-400 text-sm">{formatTime(item.logged_at)}</span>
                </>
              ) : (
                <>
                  <span className="text-gray-300 flex-1 mr-4">🍽 {item.notes}</span>
                  <span className="text-gray-400 text-sm shrink-0">{formatTime(item.logged_at)}</span>
                </>
              )}
            </div>
          ))}
          {feed.length === 0 && (
            <p className="text-gray-600 text-center py-6">Nothing logged.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 rounded-xl px-4 py-3 text-center shrink-0">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-gray-400 text-xs mt-0.5">{label}</p>
    </div>
  )
}
