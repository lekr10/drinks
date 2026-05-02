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
      <div className="min-h-dvh bg-gray-950 text-white">
        <div className="px-4 pt-12">
          <Link href="/" className="text-gray-400 text-sm">← Back</Link>
          <h1 className="text-2xl font-bold mt-2">Insights</h1>
          <p className="text-gray-500 text-center py-16">
            Rate at least one session to see patterns.
          </p>
        </div>
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
    <div className="min-h-dvh bg-gray-950 text-white pb-12">
      <div className="px-4 pt-12 pb-4">
        <Link href="/" className="text-gray-400 text-sm">← Back</Link>
        <h1 className="text-2xl font-bold mt-2">Insights</h1>
        <p className="text-gray-400 text-sm mt-0.5">{sessions.length} reviewed sessions</p>
      </div>

      {/* Summary stats */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Avg drinks / session" value={avgDrinks.toFixed(1)} />
        <StatCard label="Avg drunk score" value={`${avgDrunk.toFixed(1)}/10`} />
        <StatCard label="High nights (≥7)" value={highNights.length.toString()} />
        <StatCard label="Sessions reviewed" value={sessions.length.toString()} />
      </div>

      {/* Drink count vs drunk score */}
      <div className="px-4 mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Drinks → Drunk Score
        </p>
        <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
          {withCounts
            .sort((a, b) => (b.drunk_score ?? 0) - (a.drunk_score ?? 0))
            .slice(0, 10)
            .map(s => (
              <Link
                key={s.id}
                href={`/session/${s.id}`}
                className="flex items-center gap-3"
              >
                <span className="text-gray-400 text-xs w-20 shrink-0">{formatDate(s.started_at)}</span>
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all"
                    style={{ width: `${Math.min((s.drinkCount / 15) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-14 text-right shrink-0">
                  {s.drinkCount} drinks
                </span>
                <DrunkDot score={s.drunk_score ?? 0} />
              </Link>
            ))}
        </div>
      </div>

      {/* Drink types on high nights */}
      {Object.keys(typesOnHighNights).length > 0 && (
        <div className="px-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            What you drank on high nights
          </p>
          <div className="bg-gray-900 rounded-2xl p-4 space-y-3">
            {Object.entries(typesOnHighNights)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xl">{getDrinkEmoji(type as DrinkType)}</span>
                  <span className="flex-1">{type}</span>
                  <span className="font-bold text-gray-300">{count}</span>
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
    <div className="bg-gray-900 rounded-2xl p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-gray-400 text-xs mt-1">{label}</p>
    </div>
  )
}

function DrunkDot({ score }: { score: number }) {
  const color = score >= 8 ? 'bg-red-400' : score >= 5 ? 'bg-amber-400' : 'bg-green-400'
  return (
    <span
      className={`${color} text-black text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0`}
    >
      {score}
    </span>
  )
}
