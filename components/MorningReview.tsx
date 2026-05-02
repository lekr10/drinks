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
  const alreadyReviewed = initialDrunk !== null
  const [drunkScore, setDrunkScore] = useState<number | null>(initialDrunk)
  const [hangoverScore, setHangoverScore] = useState<number | null>(initialHangover)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(alreadyReviewed)

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
    <div className="bg-gray-900 rounded-2xl p-5">
      <h2 className="font-bold text-lg mb-5">Morning Review</h2>

      <div className="mb-5">
        <p className="text-gray-400 text-sm mb-2">
          How drunk did you get?{' '}
          {drunkScore && <span className="text-white font-bold">{drunkScore}/10</span>}
        </p>
        <ScoreRow value={drunkScore} onChange={setDrunkScore} disabled={saved} />
      </div>

      <div className="mb-5">
        <p className="text-gray-400 text-sm mb-2">
          How bad was the hangover?{' '}
          {hangoverScore && <span className="text-white font-bold">{hangoverScore}/10</span>}
        </p>
        <ScoreRow value={hangoverScore} onChange={setHangoverScore} disabled={saved} />
      </div>

      {!saved ? (
        <button
          onClick={save}
          disabled={!drunkScore || !hangoverScore || saving}
          className="w-full bg-white text-black font-bold py-3.5 rounded-xl disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Save Review'}
        </button>
      ) : (
        <p className="text-green-400 text-sm text-center font-medium">✓ Review saved</p>
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
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-colors ${
            value === n
              ? 'bg-white text-black'
              : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
          } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
