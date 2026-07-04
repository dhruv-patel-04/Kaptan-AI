import { LayoutDashboard, Settings, Table2, X, CalendarClock } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Reservations', path: '/reservations', icon: CalendarClock },
  { label: 'Tables', path: '/tables', icon: Table2 },
  { label: 'Settings', path: '/settings', icon: Settings },
]

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/40 transition lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white px-5 py-6 shadow-xl transition-transform lg:static lg:z-0 lg:w-72 lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">
              Restaurant Admin
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Kaptan-AI
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage reservations, table flow, and restaurant availablity from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:text-blue-600 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600'
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Tonight&apos;s service</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            High reservation volume between 8:00 PM and 10:00 PM.
          </p>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
