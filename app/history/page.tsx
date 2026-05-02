import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { formatDuration } from '@/lib/utils'
import { LocalDate } from '@/components/TimeDisplay'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, drinks(id), food_entries(id)')
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: false })

  return (
    <div className="min-h-dvh bg-white">
      <div className="px-5 pt-14 pb-4 border-b border-gray-100">
        <Link href="/" className="text-gray-400 text-sm">← Back</Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">History</h1>
      </div>

      <div className="divide-y divide-gray-100">
        {!sessions?.length && (
          <p className="text-gray-400 text-sm text-center py-16">No sessions yet.</p>
        )}
        {sessions?.map(session => {
          const drinkCount = (session.drinks as { id: string }[])?.length ?? 0
          const reviewed = session.drunk_score !== null
          return (
            <Link
              key={session.id}
              href={`/session/${session.id}`}
              className="flex items-center justify-between px-5 py-4"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm"><LocalDate iso={session.started_at} /></p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {drinkCount} {drinkCount === 1 ? 'drink' : 'drinks'} · {formatDuration(session.started_at, session.ended_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {reviewed ? (
                  <ScoreBadge score={session.drunk_score!} />
                ) : (
                  <span className="text-gray-400 text-xs">Rate →</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const bg =
    score >= 8 ? 'bg-red-50 text-red-600 border-red-100' :
    score >= 5 ? 'bg-amber-50 text-amber-600 border-amber-100' :
    'bg-green-50 text-green-600 border-green-100'
  return (
    <span className={`${bg} border text-xs font-semibold px-2 py-0.5 rounded-full`}>
      {score}/10
    </span>
  )
}
