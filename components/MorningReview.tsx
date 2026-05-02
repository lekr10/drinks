'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function MorningReview({
  sessionId,
  drunkScore: initialDrunk,
  hangoverScore: initialHangover,
}: {
  sessionId: string
  drunkScore: number | null
  hangoverScore: number | null
}) {
  const router = useRouter()
  const [drunkScore, setDrunkScore] = useState<number | null>(initialDrunk)
  const [hangoverScore, setHangoverScore] = useState<number | null>(initialHangover)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(initialDrunk !== null)

  async function save() {
    if (!drunkScore || !hangoverScore) return
    setSaving(true)
    await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drunk_score: drunkScore, hangover_score: hangoverScore }),
    })
    setSaved(true)
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
      <h2 className="font-semibold text-gray-900 mb-5">Morning Review</h2>

      <div className="mb-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
          How drunk did you get?{' '}
          {drunkScore && <span className="text-gray-900 normal-case">{drunkScore}/10</span>}
        </p>
        <ScoreRow value={drunkScore} onChange={setDrunkScore} disabled={saved} />
      </div>

      <div className="mb-5">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
          How bad was the hangover?{' '}
          {hangoverScore && <span className="text-gray-900 normal-case">{hangoverScore}/10</span>}
        </p>
        <ScoreRow value={hangoverScore} onChange={setHangoverScore} disabled={saved} />
      </div>

      {!saved ? (
        <button
          onClick={save}
          disabled={!drunkScore || !hangoverScore || saving}
          className="w-full bg-gray-900 text-white font-medium py-3 rounded-xl text-sm disabled:opacity-30"
        >
          {saving ? 'Saving...' : 'Save Review'}
        </button>
      ) : (
        <p className="text-green-600 text-sm text-center font-medium">Review saved</p>
      )}
    </div>
  )
}

function ScoreRow({
  value,
  onChange,
  disabled,
}: {
  value: number | null
  onChange: (n: number) => void
  disabled: boolean
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
        <button
          key={n}
          onClick={() => !disabled && onChange(n)}
          disabled={disabled}
          className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
            value === n
              ? 'bg-gray-900 text-white'
              : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
          } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
