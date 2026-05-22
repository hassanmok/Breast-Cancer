import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AUTH_ERROR, useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { LanguageSwitcher } from '../components/LanguageSwitcher'

export function Login() {
  const { session, signIn, loading, configured } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (err === AUTH_ERROR.CONFIG_MISSING) {
      setError(t('configMissing'))
      return
    }
    if (err === AUTH_ERROR.NETWORK) {
      setError(t('networkError'))
      return
    }
    if (err) {
      setError(err)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="bg-grid relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute top-4 end-4 z-10">
        <LanguageSwitcher />
      </div>

      <motion.div
        className="pointer-events-none absolute -top-32 end-1/4 h-96 w-96 rounded-full bg-pink-600/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-0 start-1/4 h-80 w-80 rounded-full bg-rose-500/15 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass relative w-full max-w-md rounded-2xl p-5 shadow-2xl shadow-pink-950/50 sm:rounded-3xl sm:p-8"
      >
        <div className="mb-8 text-center">
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-600 to-rose-400 text-3xl"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🎗️
          </motion.div>
          <h1 className="text-2xl font-bold text-white">{t('loginTitle')}</h1>
          <p className="mt-2 text-sm text-pink-300/70">{t('loginSubtitle')}</p>
        </div>

        {!configured && (
          <div className="mb-4 rounded-lg border border-amber-800/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
            {t('configMissing')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm text-pink-200">{t('email')}</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#3d2430] bg-black/40 px-4 py-3 text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-pink-200">{t('password')}</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#3d2430] bg-black/40 px-4 py-3 text-white outline-none transition focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg bg-red-950/50 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-l from-pink-600 to-rose-500 py-3 font-semibold text-white shadow-lg shadow-pink-900/40 transition hover:brightness-110 disabled:opacity-60"
          >
            {submitting ? t('signingIn') : t('signIn')}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-pink-400/50">{t('loginHint')}</p>
      </motion.div>
    </div>
  )
}
