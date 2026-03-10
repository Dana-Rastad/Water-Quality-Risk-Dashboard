import { eutrophicationData } from '../data/eutrophicationData'

const latest = eutrophicationData[eutrophicationData.length - 1]

const IconDO = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" />
  </svg>
)
const IconNitrate = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
)
const IconChlorophyll = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)
const IconPhosphate = () => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const cards = [
  {
    key: 'do',
    name: 'Dissolved Oxygen (DO)',
    value: latest.do,
    unit: 'mg/L',
    bg: 'bg-water-50',
    border: 'border-water-200',
    accent: 'text-water-700',
    Icon: IconDO,
  },
  {
    key: 'nitrate',
    name: 'Nitrate',
    value: latest.nitrate,
    unit: 'mg/L',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    accent: 'text-teal-700',
    Icon: IconNitrate,
  },
  {
    key: 'chlorophyll',
    name: 'Chlorophyll-a',
    value: latest.chlorophyll,
    unit: 'µg/L',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    accent: 'text-emerald-700',
    Icon: IconChlorophyll,
  },
  {
    key: 'phosphate',
    name: 'Phosphate',
    value: latest.phosphate,
    unit: 'mg/L',
    bg: 'bg-sage-50',
    border: 'border-sage-200',
    accent: 'text-sage-700',
    Icon: IconPhosphate,
  },
]

export default function SummaryCards() {
  return (
    <section className="w-full -mt-6 sm:-mt-8">
      <h2 className="font-display font-semibold text-display-sm text-slate-800 mb-4">
        Latest readings
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Most recent values from the dataset. Use this panel to quickly check current conditions.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl border ${card.border} ${card.bg} p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200`}
          >
            <div className={`flex items-center gap-2 mb-2 ${card.accent}`}>
              <card.Icon />
              <p className="font-display font-medium text-sm">
                {card.name}
              </p>
            </div>
            <p className="text-2xl sm:text-[1.75rem] font-semibold text-slate-800 tabular-nums">
              {typeof card.value === 'number' && card.value % 1 !== 0
                ? card.value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 3 })
                : card.value}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {card.unit}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
