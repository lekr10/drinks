'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StartScreen({
  hasUnreviewed,
  unreviewedId,
}: {
  hasUnreviewed: boolean
  unreviewedId?: string
}) {
  const router = useRouter()
  const [starting, setStarting] = useState(false)

  async function startSession() {
    setStarting(true)
    await fetch('/api/sessions', { method: 'POST' })
    router.refresh()
  }

  return (
    <div className="flex flex-col min-h-dvh bg-gray-950 text-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl font-bold mb-2">Drink Tracker</h1>
        <p className="text-gray-400 mb-12 text-center">Log smarter. Learn your limits.</p>

        {hasUnreviewed && unreviewedId && (
          <Link
            href={`/session/${unreviewedId}`}
            className="w-full bg-amber-500 text-black font-bold py-4 rounded-2xl text-lg text-center mb-4 block"
          >
            ⭐ Rate last night →
          </Link>
        )}

        <button
          onClick={startSession}
          disabled={starting}
          className="w-full bg-white text-black font-bold py-4 rounded-2xl text-xl disabled:opacity-60"
        >
          {starting ? 'Starting...' : 'Start Session'}
        </button>
      </div>

      <div className="flex border-t border-gray-800">
        <Link
          href="/history"
          className="flex-1 py-5 text-center text-gray-400 text-sm font-medium"
        >
          History
        </Link>
        <Link
          href="/insights"
          className="flex-1 py-5 text-center text-gray-400 text-sm font-medium"
        >
          Insights
        </Link>
      </div>
    </div>
  )
}
