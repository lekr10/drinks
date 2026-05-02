export type DrinkType = 'Beer' | 'Wine' | 'Cocktail' | 'Shot'

export interface Session {
  id: string
  started_at: string
  ended_at: string | null
  drunk_score: number | null
  hangover_score: number | null
  created_at: string
}

export interface Drink {
  id: string
  session_id: string
  type: DrinkType
  logged_at: string
}

export interface FoodEntry {
  id: string
  session_id: string
  notes: string
  logged_at: string
}

export interface SessionWithDetails extends Session {
  drinks: Drink[]
  food_entries: FoodEntry[]
}
