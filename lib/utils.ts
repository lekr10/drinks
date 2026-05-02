import type { DrinkType } from './types'

const DRINK_EMOJI: Record<DrinkType, string> = {
  Beer: '🍺',
  Wine: '🍷',
  Cocktail: '🍸',
  Shot: '🥃',
}

export function getDrinkEmoji(type: DrinkType) {
  return DRINK_EMOJI[type] ?? '🍹'
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function formatDuration(startIso: string, endIso: string | null) {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : new Date()
  const mins = Math.round((end.getTime() - start.getTime()) / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  const remaining = mins % 60
  return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}
