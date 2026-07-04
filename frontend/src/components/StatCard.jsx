import { Activity, CalendarRange, CircleCheckBig, UtensilsCrossed } from 'lucide-react'

const iconMap = {
  'Restaurant Status': CircleCheckBig,
  "Today's Reservations": CalendarRange,
  'Occupied Tables': UtensilsCrossed,
  'Available Tables': Activity,
}

const toneMap = {
  success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  primary: 'bg-blue-50 text-blue-600 border-blue-100',
  warning: 'bg-amber-50 text-amber-600 border-amber-100',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
}

function StatCard({ title, value, helper, trend, tone }) {
  const Icon = iconMap[title] || Activity

  return (
    <article className="panel p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${toneMap[tone] || toneMap.neutral}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">{helper}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {trend}
      </p>
    </article>
  )
}

export default StatCard
