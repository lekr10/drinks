import { supabase } from '@/lib/supabase'
import StartScreen from '@/components/StartScreen'
import ActiveSession from '@/components/ActiveSession'
import type { SessionWithDetails } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { data: activeSession } = await supabase
    .from('sessions')
    .select('*, drinks(*), food_entries(*)')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (activeSession) {
    return <ActiveSession initialSession={activeSession as SessionWithDetails} />
  }

  const { data: unreviewedSession } = await supabase
    .from('sessions')
    .select('id')
    .not('ended_at', 'is', null)
    .is('drunk_score', null)
    .order('ended_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <StartScreen
      hasUnreviewed={!!unreviewedSession}
      unreviewedId={unreviewedSession?.id}
    />
  )
}
