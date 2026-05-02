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
    <div className="flex flex-col min-h-dvh bg-white">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Drink Tracker</h1>
        <p className="text-gray-400 text-sm mb-12">Log smarter. Learn your limits.</p>

        {hasUnreviewed && unreviewedId && (
          <Link
            href={`/session/${unreviewedId}`}
            className="w-full border border-gray-200 bg-gray-50 text-gray-700 font-medium py-3.5 rounded-2xl text-sm text-center mb-3 block"
          >
            Rate last night →
          </Link>
        )}

        <button
          onClick={startSession}
          disabled={starting}
          className="w-full bg-gray-900 text-white font-semibold py-4 rounded-2xl text-base disabled:opacity-50"
        >
          {starting ? 'Starting...' : 'Start Session'}
        </button>
      </div>

      <div className="flex border-t border-gray-100">
        <Link href="/history" className="flex-1 py-5 text-center text-gray-400 text-sm">
          History
        </Link>
        <Link href="/insights" className="flex-1 py-5 text-center text-gray-400 text-sm">
          Insights
        </Link>
      </div>
    </div>
  )
}
