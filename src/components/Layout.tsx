import { NavLink, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileBottomNav } from './MobileBottomNav'

export function Layout() {
  const { user, signOut } = useAuth()
  const { t } = useLanguage()

  const navItems = [
    { to: '/dashboard', label: t('navDashboard'), icon: '📊' },
    { to: '/data-entry', label: t('navDataEntry'), icon: '📝' },
  ]

  return (
    <div className="bg-grid min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
      <header className="glass sticky top-0 z-50 border-b border-[#3d2430]">
        <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <motion.div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-600 to-rose-400 text-base shadow-lg shadow-pink-900/40 sm:h-10 sm:w-10 sm:text-lg"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎗️
              </motion.div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-pink-100 sm:text-sm">{t('appTitle')}</p>
                <p className="hidden truncate text-xs text-pink-300/70 xs:block sm:block">
                  {t('appSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => signOut()}
                className="rounded-lg border border-pink-800/60 px-2.5 py-1.5 text-[11px] text-pink-200 transition hover:border-pink-500 hover:bg-pink-950/40 sm:px-3 sm:text-xs"
              >
                {t('signOut')}
              </button>
            </div>
          </div>

          <nav className="mt-2 hidden items-center gap-1 rounded-xl bg-black/30 p-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'text-pink-200/80 hover:bg-pink-950/50 hover:text-pink-50'
                  }`
                }
              >
                {item.icon} {item.label}
              </NavLink>
            ))}
            <span className="ms-auto max-w-[180px] truncate px-2 text-xs text-pink-300/60">
              {user?.email}
            </span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <MobileBottomNav />
    </div>
  )
}
