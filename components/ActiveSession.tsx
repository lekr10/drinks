'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDrinkEmoji, formatTime } from '@/lib/utils'
import type { SessionWithDetails, Drink, FoodEntry, DrinkType } from '@/lib/types'

const DRINK_TYPES: { type: DrinkType; color: string }[] = [
  { type: 'Beer', color: 'bg-amber-500 active:bg-amber-400' },
  { type: 'Wine', color: 'bg-rose-500 active:bg-rose-400' },
  { type: 'Cocktail', color: 'bg-purple-500 active:bg-purple-400' },
  { type: 'Shot', color: 'bg-orange-500 active:bg-orange-400' },
]

type FeedItem =
  | { kind: 'drink'; data: Drink }
  | { kind: 'food'; data: FoodEntry }

function buildFeed(drinks: Drink[], food: FoodEntry[]): FeedItem[] {
  return [
    ...drinks.map(d => ({ kind: 'drink' as const, data: d })),
    ...food.map(f => ({ kind: 'food' as const, data: f })),
  ].sort((a, b) => new Date(b.data.logged_at).getTime() - new Date(a.data.logged_at).getTime())
}

export default function ActiveSession({
  initialSession,
}: {
  initialSession: SessionWithDetails
}) {
  const router = useRouter()
  const [session, setSession] = useState(initialSession)
  const [foodInput, setFoodInput] = useState('')
  const [loggingDrink, setLoggingDrink] = useState<DrinkType | null>(null)
  const [loggingFood, setLoggingFood] = useState(false)
  const [ending, setEnding] = useState(false)

  const feed = buildFeed(session.drinks, session.food_entries)

  async function logDrink(type: DrinkType) {
    setLoggingDrink(type)
    const res = await fetch('/api/drinks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, type }),
    })
    const drink: Drink = await res.json()
    setSession(prev => ({ ...prev, drinks: [...prev.drinks, drink] }))
    setLoggingDrink(null)
  }

  async function logFood() {
    if (!foodInput.trim()) return
    setLoggingFood(true)
    const res = await fetch('/api/food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: session.id, notes: foodInput.trim() }),
    })
    const entry: FoodEntry = await res.json()
    setSession(prev => ({ ...prev, food_entries: [...prev.food_entries, entry] }))
    setFoodInput('')
    setLoggingFood(false)
  }

  async function endSession() {
    setEnding(true)
    await fetch(`/api/sessions/${session.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ended_at: new Date().toISOString() }),
    })
    router.refresh()
  }

  return (
    <div className="flex flex-col min-h-dvh bg-gray-950 text-white">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <p className="text-gray-400 text-sm">Started at {formatTime(session.started_at)}</p>
        <p className="text-2xl font-bold mt-1">
          {session.drinks.length} {session.drinks.length === 1 ? 'drink' : 'drinks'}
        </p>
      </div>

      {/* Drink buttons */}
      <div className="px-4 grid grid-cols-2 gap-3">
        {DRINK_TYPES.map(({ type, color }) => (
          <button
            key={type}
            onClick={() => logDrink(type)}
            disabled={!!loggingDrink}
            className={`${color} text-white font-semibold py-5 rounded-2xl text-lg disabled:opacity-60`}
          >
            {getDrinkEmoji(type)} {type}
          </button>
        ))}
      </div>

      {/* Food input */}
      <div className="px-4 mt-4 flex gap-2">
        <input
          type="text"
          value={foodInput}
          onChange={e => setFoodInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && logFood()}
          placeholder="What did you eat?"
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-600"
        />
        <button
          onClick={logFood}
          disabled={loggingFood || !foodInput.trim()}
          className="bg-gray-800 text-white px-4 py-3 rounded-xl font-medium disabled:opacity-40"
        >
          Log
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 px-4 mt-4 overflow-y-auto">
        {feed.length === 0 ? (
          <p className="text-gray-600 text-center py-8 text-sm">
            Tap a drink above to start logging.
          </p>
        ) : (
          <div className="space-y-2">
            {feed.map(item => (
              <div
                key={item.data.id}
                className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between"
              >
                {item.kind === 'drink' ? (
                  <>
                    <span className="font-medium">
                      {getDrinkEmoji(item.data.type)} {item.data.type}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {formatTime(item.data.logged_at)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-300 flex-1 mr-4">🍽 {item.data.notes}</span>
                    <span className="text-gray-400 text-sm shrink-0">
                      {formatTime(item.data.logged_at)}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* End session */}
      <div className="px-4 pb-10 pt-4">
        <button
          onClick={endSession}
          disabled={ending}
          className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-60"
        >
          {ending ? 'Ending...' : 'End Session'}
        </button>
      </div>
    </div>
  )
}
