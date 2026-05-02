'use client'

export function LocalTime({ iso }: { iso: string }) {
  return (
    <time suppressHydrationWarning dateTime={iso}>
      {new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </time>
  )
}

export function LocalDate({ iso }: { iso: string }) {
  return (
    <time suppressHydrationWarning dateTime={iso}>
      {new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
    </time>
  )
}
