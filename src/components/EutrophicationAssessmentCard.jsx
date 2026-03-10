import { useMemo } from 'react'
import { eutrophicationData } from '../data/eutrophicationData'

const RISK_CONFIG = {
  low: { label: 'Low Risk', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  moderate: { label: 'Moderate Risk', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  high: { label: 'High Risk', className: 'bg-rose-100 text-rose-800 border-rose-200' },
}

const PERIOD_OPTIONS = [
  { id: '1', label: 'Last day', days: 1 },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
]

function getWindowAverages(data, days) {
  if (!data?.length) return null
  const last = data[data.length - 1]
  const endDate = new Date(last.date + 'T00:00:00')

  if (days === 1) {
    return {
      periodLabel: 'Last day',
      startDate: last.date,
      endDate: last.date,
      do: last.do,
      nitrate: last.nitrate,
      chlorophyll: last.chlorophyll,
      phosphate: last.phosphate,
    }
  }

  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - (days - 1))
  const startIso = startDate.toISOString().slice(0, 10)

  const windowRows = data.filter((d) => d.date >= startIso && d.date <= last.date)
  if (!windowRows.length) {
    return {
      periodLabel: 'Last day',
      startDate: last.date,
      endDate: last.date,
      do: last.do,
      nitrate: last.nitrate,
      chlorophyll: last.chlorophyll,
      phosphate: last.phosphate,
    }
  }

  const n = windowRows.length
  const sum = windowRows.reduce(
    (acc, row) => ({
      do: acc.do + row.do,
      nitrate: acc.nitrate + row.nitrate,
      chlorophyll: acc.chlorophyll + row.chlorophyll,
      phosphate: acc.phosphate + row.phosphate,
    }),
    { do: 0, nitrate: 0, chlorophyll: 0, phosphate: 0 },
  )

  return {
    periodLabel: `Last ${days} days`,
    startDate: windowRows[0].date,
    endDate: last.date,
    do: sum.do / n,
    nitrate: sum.nitrate / n,
    chlorophyll: sum.chlorophyll / n,
    phosphate: sum.phosphate / n,
  }
}

function computeScore(row) {
  let score = 0
  if (row.nitrate > 10.0) score += 1
  if (row.phosphate > 0.05) score += 1
  if (row.chlorophyll > 10) score += 1
  if (row.do < 4) score += 1
  return score
}

function getRiskCategory(score) {
  if (score <= 1) return 'low'
  if (score === 2) return 'moderate'
  return 'high'
}

export default function EutrophicationAssessmentCard({
  selectedPeriodId = '30',
  onChangePeriod,
}) {
  const period = PERIOD_OPTIONS.find((p) => p.id === selectedPeriodId) ?? PERIOD_OPTIONS[2]

  const windowData = useMemo(
    () => getWindowAverages(eutrophicationData, period.days),
    [period.days],
  )

  if (!windowData) return null

  const score = computeScore(windowData)
  const category = getRiskCategory(score)
  const config = RISK_CONFIG[category]
  const endDatePretty = new Date(windowData.endDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <section className="w-full">
      <h2 className="font-display font-semibold text-display-sm text-slate-800 mb-1">
        Risk assessment
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Overall eutrophication risk based on a selected time period
      </p>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <p className="text-sm text-slate-500">
            Showing risk for: <strong className="text-slate-600">{period.label}</strong>{' '}
            <span className="text-slate-400">·</span>{' '}
            <span className="text-slate-500">ending {endDatePretty}</span>
          </p>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Time period</span>
            <select
              value={selectedPeriodId}
              onChange={(e) =>
                onChangePeriod ? onChangePeriod(e.target.value) : undefined
              }
              className="rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-card focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">
              Total score
            </p>
            <p className="text-2xl font-semibold text-slate-800 tabular-nums">
              {score} <span className="text-sm font-normal text-slate-500">/ 4</span>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Risk category
            </p>
            <span
              className={`inline-flex items-center rounded-xl border px-4 py-1.5 text-sm font-medium ${config.className}`}
            >
              {config.label}
            </span>
          </div>
        </div>
        <ul className="mt-4 text-xs text-slate-600 space-y-1">
          <li>Nitrate &gt; 10.0 mg/L → {windowData.nitrate > 10.0 ? '+1' : '0'} pt (average)</li>
          <li>Phosphate &gt; 0.05 mg/L → {windowData.phosphate > 0.05 ? '+1' : '0'} pt (average)</li>
          <li>Chlorophyll-a &gt; 10 µg/L → {windowData.chlorophyll > 10 ? '+1' : '0'} pt (average)</li>
          <li>DO &lt; 4 mg/L → {windowData.do < 4 ? '+1' : '0'} pt (average)</li>
        </ul>
      </div>
    </section>
  )
}
