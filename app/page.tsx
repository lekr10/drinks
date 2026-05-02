import { supabase } from '@/lib/supabase'
import StartScreen from '@/components/StartScreen'
import ActiveSession from '@/components/ActiveSession'
import type { SessionWithDetails } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  try {
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
  } catch (e) {
    return (
      <div className="min-h-dvh bg-gray-950 text-white flex items-center justify-center p-8">
        <div className="bg-gray-900 rounded-2xl p-6 max-w-sm w-full">
          <p className="font-bold text-red-400 mb-2">Connection error</p>
          <p className="text-gray-400 text-sm mb-4">
            Could not reach the database. Check that your Supabase environment variables are set in Vercel.
          </p>
          <p className="text-gray-600 text-xs font-mono break-all">{String(e)}</p>
        </div>
      </div>
    )
  }
}
