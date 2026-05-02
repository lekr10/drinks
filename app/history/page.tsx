import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { formatDate, formatDuration } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, drinks(id), food_entries(id)')
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: false })

  return (
    <div className="min-h-dvh bg-gray-950 text-white">
      <div className="px-4 pt-12 pb-4">
        <Link href="/" className="text-gray-400 text-sm">← Back</Link>
        <h1 className="text-2xl font-bold mt-2">History</h1>
      </div>

      <div className="px-4 space-y-3 pb-12">
        {!sessions?.length && (
          <p className="text-gray-500 text-center py-16">No sessions yet.</p>
        )}
        {sessions?.map(session => {
          const drinkCount = (session.drinks as { id: string }[])?.length ?? 0
          const reviewed = session.drunk_score !== null
          return (
            <Link
              key={session.id}
              href={`/session/${session.id}`}
              className="block bg-gray-900 rounded-2xl px-4 py-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{formatDate(session.started_at)}</p>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {drinkCount} {drinkCount === 1 ? 'drink' : 'drinks'} · {formatDuration(session.started_at, session.ended_at)}
                  </p>
                </div>
                <div className="text-right">
                  {reviewed ? (
                    <ScoreBadge score={session.drunk_score!} />
                  ) : (
                    <span className="text-amber-400 text-sm font-medium">Rate this →</span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? 'bg-red-500' : score >= 5 ? 'bg-amber-500' : 'bg-green-500'
  return (
    <span className={`${color} text-black font-bold text-sm px-2.5 py-1 rounded-full`}>
      {score}/10
    </span>
  )
}
