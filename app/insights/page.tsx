import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { formatDate, getDrinkEmoji } from '@/lib/utils'
import type { DrinkType } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function InsightsPage() {
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, drinks(id, type)')
    .not('ended_at', 'is', null)
    .not('drunk_score', 'is', null)
    .order('drunk_score', { ascending: false })

  if (!sessions?.length) {
    return (
      <div className="min-h-dvh bg-white">
        <div className="px-5 pt-14 pb-4 border-b border-gray-100">
          <Link href="/" className="text-gray-400 text-sm">← Back</Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">Insights</h1>
        </div>
        <p className="text-gray-400 text-sm text-center py-16">
          Rate at least one session to see patterns.
        </p>
      </div>
    )
  }

  const withCounts = sessions.map(s => ({
    ...s,
    drinkCount: (s.drinks as { id: string; type: string }[])?.length ?? 0,
  }))

  const avgDrinks = withCounts.reduce((sum, s) => sum + s.drinkCount, 0) / withCounts.length
  const avgDrunk = sessions.reduce((sum, s) => sum + (s.drunk_score ?? 0), 0) / sessions.length
  const highNights = withCounts.filter(s => (s.drunk_score ?? 0) >= 7)

  const typesOnHighNights: Record<string, number> = {}
  highNights.forEach(s => {
    ;(s.drinks as { type: string }[])?.forEach(d => {
      typesOnHighNights[d.type] = (typesOnHighNights[d.type] ?? 0) + 1
    })
  })

  return (
    <div className="min-h-dvh bg-white pb-12">
      <div className="px-5 pt-14 pb-4 border-b border-gray-100">
        <Link href="/" className="text-gray-400 text-sm">← Back</Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Insights</h1>
        <p className="text-gray-400 text-xs mt-0.5">{sessions.length} reviewed sessions</p>
      </div>

      {/* Stats */}
      <div className="px-5 py-5 grid grid-cols-2 gap-px bg-gray-100 border-b border-gray-100">
        <StatCard label="Avg drinks / session" value={avgDrinks.toFixed(1)} />
        <StatCard label="Avg drunk score" value={`${avgDrunk.toFixed(1)}/10`} />
        <StatCard label="High nights (≥7)" value={highNights.length.toString()} />
        <StatCard label="Sessions reviewed" value={sessions.length.toString()} />
      </div>

      {/* Drinks vs score */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-4">
          Drinks → Drunk Score
        </p>
        <div className="space-y-3">
          {withCounts
            .sort((a, b) => (b.drunk_score ?? 0) - (a.drunk_score ?? 0))
            .slice(0, 10)
            .map(s => (
              <Link key={s.id} href={`/session/${s.id}`} className="flex items-center gap-3">
                <span className="text-gray-400 text-xs w-20 shrink-0">{formatDate(s.started_at)}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div
                    className="bg-gray-900 rounded-full h-1.5"
                    style={{ width: `${Math.min((s.drinkCount / 15) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-14 text-right shrink-0">
                  {s.drinkCount} drinks
                </span>
                <ScorePill score={s.drunk_score ?? 0} />
              </Link>
            ))}
        </div>
      </div>

      {/* Types on high nights */}
      {Object.keys(typesOnHighNights).length > 0 && (
        <div className="px-5 pt-5">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-4">
            What you drank on high nights
          </p>
          <div className="divide-y divide-gray-100">
            {Object.entries(typesOnHighNights)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="py-3 flex items-center gap-3">
                  <span>{getDrinkEmoji(type as DrinkType)}</span>
                  <span className="flex-1 text-sm text-gray-700">{type}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-4">
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  )
}

function ScorePill({ score }: { score: number }) {
  const style =
    score >= 8 ? 'bg-red-50 text-red-600 border-red-100' :
    score >= 5 ? 'bg-amber-50 text-amber-600 border-amber-100' :
    'bg-green-50 text-green-600 border-green-100'
  return (
    <span className={`${style} border text-xs font-semibold px-2 py-0.5 rounded-full shrink-0`}>
      {score}
    </span>
  )
}
