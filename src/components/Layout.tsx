import { NavLink, Outlet } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Balance', end: true },
  { to: '/historial', label: 'Historial' },
  { to: '/miembros', label: 'Miembros' },
  { to: '/resumen', label: 'Resumen del mes' },
]

export function Layout() {
  return (
    <div className="min-h-screen bg-(--color-bg)">
      <header className="border-b border-(--color-border) bg-(--color-card)">
        <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-(--color-text)">Cuentas Claras</h1>
          <nav className="mt-4 flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-(--color-primary) text-white'
                      : 'text-(--color-text-secondary) hover:bg-(--color-bg)'
                  }`
                }
              >
                {tab.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
