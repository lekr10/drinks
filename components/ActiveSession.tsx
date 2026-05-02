'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getDrinkEmoji, formatTime } from '@/lib/utils'
import type { SessionWithDetails, Drink, FoodEntry, DrinkType } from '@/lib/types'

const DRINK_TYPES: DrinkType[] = ['Beer', 'Wine', 'Cocktail', 'Shot']

type FeedItem =
  | { kind: 'drink'; data: Drink }
  | { kind: 'food'; data: FoodEntry }

function buildFeed(drinks: Drink[], food: FoodEntry[]): FeedItem[] {
  return [
    ...drinks.map(d => ({ kind: 'drink' as const, data: d })),
    ...food.map(f => ({ kind: 'food' as const, data: f })),
  ].sort((a, b) => new Date(b.data.logged_at).getTime() - new Date(a.data.logged_at).getTime())
}

function getReminder(drinks: Drink[]): { text: string; kind: 'water' | 'break' } | null {
  const count = drinks.length
  if (count === 0) return null
  if (count % 5 === 0) {
    const last = drinks[drinks.length - 1]
    const resume = new Date(new Date(last.logged_at).getTime() + 60 * 60 * 1000)
    const time = resume.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return { text: `Take a 1-hour break. Resume at ${time}.`, kind: 'break' }
  }
  if (count % 2 === 0) {
    return { text: 'Time for water.', kind: 'water' }
  }
  return null
}

export default function ActiveSession({ initialSession }: { initialSession: SessionWithDetails }) {
  const router = useRouter()
  const [session, setSession] = useState(initialSession)
  const [foodInput, setFoodInput] = useState('')
  const [loggingDrink, setLoggingDrink] = useState<DrinkType | null>(null)
  const [loggingFood, setLoggingFood] = useState(false)
  const [ending, setEnding] = useState(false)

  const feed = buildFeed(session.drinks, session.food_entries)
  const reminder = getReminder(session.drinks)

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
    <div className="flex flex-col min-h-dvh bg-white">
      {/* Header */}
      <div className="px-5 pt-14 pb-5 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">
          Started {formatTime(session.started_at)}
        </p>
        <p className="text-3xl font-semibold text-gray-900 mt-1">
          {session.drinks.length} {session.drinks.length === 1 ? 'drink' : 'drinks'}
        </p>
      </div>

      {/* Drink buttons */}
      <div className="px-5 pt-5 grid grid-cols-2 gap-2.5">
        {DRINK_TYPES.map(type => (
          <button
            key={type}
            onClick={() => logDrink(type)}
            disabled={!!loggingDrink}
            className="bg-gray-50 border border-gray-200 rounded-2xl py-4 text-gray-900 font-medium text-base disabled:opacity-50 active:bg-gray-100 transition-colors"
          >
            {getDrinkEmoji(type)} {type}
          </button>
        ))}
      </div>

      {/* Reminder */}
      {reminder && (
        <div className={`mx-5 mt-3 px-4 py-3 rounded-xl text-sm font-medium ${
          reminder.kind === 'break'
            ? 'bg-amber-50 text-amber-800 border border-amber-100'
            : 'bg-sky-50 text-sky-800 border border-sky-100'
        }`}>
          {reminder.kind === 'water' ? '💧 ' : '⏳ '}{reminder.text}
        </div>
      )}

      {/* Food input */}
      <div className="px-5 mt-3 flex gap-2">
        <input
          type="text"
          value={foodInput}
          onChange={e => setFoodInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && logFood()}
          placeholder="What did you eat?"
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-gray-400"
        />
        <button
          onClick={logFood}
          disabled={loggingFood || !foodInput.trim()}
          className="bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-medium disabled:opacity-30"
        >
          Log
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 px-5 mt-5 overflow-y-auto">
        {feed.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Tap a drink above to start logging.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {feed.map(item => (
              <div key={item.data.id} className="py-3 flex items-center justify-between">
                {item.kind === 'drink' ? (
                  <>
                    <span className="text-gray-900 font-medium text-sm">
                      {getDrinkEmoji(item.data.type)} {item.data.type}
                    </span>
                    <span className="text-gray-400 text-xs">{formatTime(item.data.logged_at)}</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600 text-sm flex-1 mr-4">🍽 {item.data.notes}</span>
                    <span className="text-gray-400 text-xs shrink-0">{formatTime(item.data.logged_at)}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* End session */}
      <div className="px-5 pb-10 pt-4 border-t border-gray-100">
        <button
          onClick={endSession}
          disabled={ending}
          className="w-full border border-red-200 text-red-500 font-medium py-3.5 rounded-2xl text-sm disabled:opacity-40 active:bg-red-50 transition-colors"
        >
          {ending ? 'Ending session...' : 'End Session'}
        </button>
      </div>
    </div>
  )
}
