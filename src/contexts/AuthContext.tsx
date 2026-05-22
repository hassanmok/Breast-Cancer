import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export const AUTH_ERROR = {
  CONFIG_MISSING: 'CONFIG_MISSING',
  NETWORK: 'NETWORK_ERROR',
} as const

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  configured: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isNetworkError(message: string): boolean {
  const lower = message.toLowerCase()
  return (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed')
  )
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: AUTH_ERROR.CONFIG_MISSING }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        return {
          error: isNetworkError(error.message) ? AUTH_ERROR.NETWORK : error.message,
        }
      }
      return { error: null }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch'
      return { error: isNetworkError(message) ? AUTH_ERROR.NETWORK : message }
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      signIn,
      signOut,
    }),
    [session, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
