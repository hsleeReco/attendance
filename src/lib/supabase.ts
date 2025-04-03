import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type Attendance = {
  id: string
  user_id: string
  check_in: string
  check_out: string | null
  created_at: string
}

export type RemoteWork = {
  id: string
  user_id: string
  approver_id: string
  date: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
}

export type Leave = {
  id: string
  user_id: string
  start_datetime: string
  end_datetime: string
  type: 'ANNUAL' | 'SICK' | 'OTHER'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  created_at: string
}

export type User = {
  id: string
  email: string
  name: string
  avatar_url: string | null
  created_at: string
} 