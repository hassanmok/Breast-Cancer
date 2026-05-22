import { NavLink } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

export function MobileBottomNav() {
  const { t } = useLanguage()

  const items = [
    { to: '/dashboard', label: t('navDashboard'), icon: '📊' },
    { to: '/data-entry', label: t('navDataEntry'), icon: '📝' },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#3d2430] bg-[#0f0a0c]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition ${
                isActive ? 'text-pink-400' : 'text-pink-300/50'
              }`
            }
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="max-w-[90px] truncate px-1">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
