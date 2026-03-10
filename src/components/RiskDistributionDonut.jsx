import { useMemo } from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import { eutrophicationData } from '../data/eutrophicationData'

const RISK_COLORS = {
  Low: '#22c55e',
  Moderate: '#eab308',
  High: '#ef4444',
}

function computeScore(row) {
  let score = 0
  if (row.nitrate > 10.0) score += 1
  if (row.phosphate > 0.05) score += 1
  if (row.chlorophyll > 10) score += 1
  if (row.do < 4) score += 1
  return score
}

function getCategory(score) {
  if (score <= 1) return 'Low'
  if (score === 2) return 'Moderate'
  return 'High'
}

function groupByMonth(data) {
  const map = new Map()
  data.forEach((row) => {
    const [year, month] = row.date.split('-')
    const key = `${year}-${month}`
    const existing = map.get(key)
    if (!existing) {
      map.set(key, {
        year,
        month,
        count: 1,
        do: row.do,
        nitrate: row.nitrate,
        chlorophyll: row.chlorophyll,
        phosphate: row.phosphate,
      })
    } else {
      existing.count += 1
      existing.do += row.do
      existing.nitrate += row.nitrate
      existing.chlorophyll += row.chlorophyll
      existing.phosphate += row.phosphate
    }
  })
  return Array.from(map.values()).map((m) => ({
    dateKey: `${m.year}-${m.month}`,
    do: m.do / m.count,
    nitrate: m.nitrate / m.count,
    chlorophyll: m.chlorophyll / m.count,
    phosphate: m.phosphate / m.count,
  }))
}

export default function RiskDistributionDonut() {
  const data = useMemo(() => {
    const months = groupByMonth(eutrophicationData)
    if (!months.length) return []

    const counts = { Low: 0, Moderate: 0, High: 0 }
    months.forEach((m) => {
      const score = computeScore(m)
      const cat = getCategory(score)
      counts[cat] += 1
    })

    const total = months.length
    return ['Low', 'Moderate', 'High']
      .map((name) => ({
        name,
        value: counts[name],
        pct: total ? Math.round((counts[name] / total) * 100) : 0,
      }))
      .filter((d) => d.value > 0)
  }, [])

  if (!data.length) return null

  return (
    <section className="w-full">
      <h2 className="font-display font-semibold text-display-sm text-slate-800 mb-1">
        Risk distribution by month
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Each month is scored using the same rules as the risk assessment. The chart shows what
        percentage of months are low, moderate, or high eutrophication risk.
      </p>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="h-64 w-full md:h-72 md:w-2/3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="85%"
                  paddingAngle={2}
                  cornerRadius={8}
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => {
                    const pct = props?.payload?.pct ?? 0
                    return [`${value} months (${pct}%)`, name]
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={32}
                  formatter={(value) => (
                    <span className="text-xs sm:text-sm text-slate-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="md:w-1/3 space-y-1 text-sm text-slate-600">
            {data.map((d) => (
              <p key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: RISK_COLORS[d.name] }}
                  />
                  <span>{d.name} Risk</span>
                </span>
                <span className="font-semibold text-slate-800 tabular-nums">{d.pct}%</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

