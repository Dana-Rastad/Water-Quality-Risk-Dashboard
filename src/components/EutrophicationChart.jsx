import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import { eutrophicationData } from '../data/eutrophicationData'

const THRESHOLD_CONFIG = {
  do: { min: 2, max: 6, default: 4, riskBelow: true },
  nitrate: { min: 5, max: 10, default: 7.5, riskBelow: false },
  chlorophyll: { min: 10, max: 40, default: 25, riskBelow: false },
  phosphate: { min: 0.02, max: 0.05, default: 0.035, riskBelow: false },
}

const PARAMETERS = [
  { key: 'do', label: 'Dissolved Oxygen (DO)', unit: 'mg/L', color: '#0284c7' },
  { key: 'nitrate', label: 'Nitrate', unit: 'mg/L', color: '#0d9488' },
  { key: 'chlorophyll', label: 'Chlorophyll-a', unit: 'µg/L', color: '#059669' },
  { key: 'phosphate', label: 'Phosphate', unit: 'mg/L', color: '#5f704a' },
]

function formatMonth(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short' })
}

function formatTooltipDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** One tick per month (first of month) so all months including Feb show */
function getMonthTicks(data) {
  if (!data?.length) return []
  const first = data[0].date
  const last = data[data.length - 1].date
  const ticks = []
  const start = new Date(first + 'T00:00:00')
  const end = new Date(last + 'T00:00:00')
  const d = new Date(start.getFullYear(), start.getMonth(), 1)
  while (d <= end) {
    const iso = d.toISOString().slice(0, 10)
    if (data.some((row) => row.date >= iso)) ticks.push(iso)
    d.setMonth(d.getMonth() + 1)
  }
  return ticks
}

export default function EutrophicationChart({ selectedParamKey = 'do', onChangeParam }) {
  const [thresholds, setThresholds] = useState(() =>
    Object.fromEntries(
      Object.entries(THRESHOLD_CONFIG).map(([k, v]) => [k, v.default])
    )
  )
  const param = PARAMETERS.find((p) => p.key === selectedParamKey)
  const cfg = THRESHOLD_CONFIG[param.key]
  const threshold = thresholds[param.key] ?? cfg.default

  const setThreshold = (val) =>
    setThresholds((t) => ({ ...t, [param.key]: val }))

  const chartData = eutrophicationData

  const monthTicks = useMemo(() => getMonthTicks(eutrophicationData), [])

  const yDomain = useMemo(() => {
    switch (param.key) {
      case 'do':
        return [0, 8.5]
      case 'nitrate':
        return [0, 15]
      case 'chlorophyll':
        return [0, 50]
      case 'phosphate':
        return [0, 0.15]
      default:
        return ['auto', 'auto']
    }
  }, [param.key])

  const formatY = (value) => {
    if (value == null) return ''
    if (Number.isInteger(value)) return value
    if (value < 0.1) return value.toFixed(3)
    if (value < 1) return value.toFixed(2)
    return value.toFixed(1)
  }

  return (
    <section className="w-full">
      <h2 className="font-display font-semibold text-display-sm text-slate-800 mb-1">
        Trends over time
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Select a parameter and adjust the threshold. Values above (or below) the line are highlighted in red.
      </p>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-card hover:shadow-card-hover transition-shadow duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div />
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-wrap">
            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
              <span className="text-sm font-medium text-slate-600">View parameter</span>
              <div className="relative">
                <select
                  value={param.key}
                  onChange={(e) =>
                    onChangeParam ? onChangeParam(e.target.value) : undefined
                  }
                  className="appearance-none w-full min-w-[200px] rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {PARAMETERS.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </label>
            <label className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
              <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
                Risk threshold
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={cfg.min}
                  max={cfg.max}
                  step={param.key === 'phosphate' ? 0.001 : 0.1}
                  value={threshold}
                  onChange={(e) =>
                    setThreshold(
                      param.key === 'phosphate'
                        ? parseFloat(e.target.value)
                        : parseFloat(e.target.value)
                    )
                  }
                  className="w-28 sm:w-36 h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 bg-slate-100"
                />
                <span className="text-sm font-medium text-slate-700 tabular-nums min-w-[3rem]">
                  {param.key === 'phosphate' ? threshold.toFixed(3) : threshold.toFixed(1)}
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="w-full h-[340px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={eutrophicationData}
              margin={{ top: 8, right: 16, left: 64, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                ticks={monthTicks}
                tickFormatter={formatMonth}
                tick={{ fontSize: 12, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#e2e8f0' }}
                interval={0}
                label={{ value: 'Month', position: 'insideBottom', offset: -5, style: { fontSize: 12, fill: '#64748b' } }}
              />
              <YAxis
                domain={yDomain}
                tickFormatter={formatY}
                tick={{ fontSize: 12, fill: '#475569' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#e2e8f0' }}
                width={72}
                tickMargin={20}
                label={{
                  value: `${param.label} — ${param.unit}`,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: '#64748b', textAnchor: 'middle' },
                  offset: -18,
                }}
              />
              <ReferenceLine
                y={threshold}
                stroke="#64748b"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: `Risk line: ${param.key === 'phosphate' ? threshold.toFixed(3) : threshold.toFixed(1)} ${param.unit}`,
                  position: 'right',
                  fill: '#64748b',
                  fontSize: 11,
                }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length || !label) return null
                  const point = payload[0]?.payload
                  const value = point?.[param.key]
                  if (value == null) return null
                  const display =
                    typeof value === 'number' && value < 0.1 && value > 0
                      ? value.toFixed(4)
                      : formatY(value)
                  const inRisk =
                    cfg.riskBelow ? value < threshold : value > threshold
                  const riskText = cfg.riskBelow ? 'Below threshold' : 'Above threshold'
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                      <p className="text-xs text-slate-500 mb-1">
                        {formatTooltipDate(label)}
                      </p>
                      <p
                        className={`text-sm font-semibold ${inRisk ? 'text-red-600' : 'text-slate-800'}`}
                      >
                        {param.label}: {display} {param.unit}
                        {inRisk ? ` · ${riskText}` : ' · Within range'}
                      </p>
                    </div>
                  )
                }}
                cursor={{ stroke: '#0d9488', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Line
                type="monotone"
                dataKey={param.key}
                stroke={param.color}
                strokeWidth={2}
                dot={({ cx, cy, payload }) => {
                  const v = payload[param.key]
                  if (v == null) return null
                  const inRisk = cfg.riskBelow ? v < threshold : v > threshold
                  const fill = inRisk ? '#dc2626' : param.color
                  return (
                    <circle
                      key={payload.date}
                      cx={cx}
                      cy={cy}
                      r={2.5}
                      fill={fill}
                      stroke="white"
                      strokeWidth={1.5}
                    />
                  )
                }}
                activeDot={({ cx, cy, payload }) => {
                  const v = payload[param.key]
                  if (v == null) return null
                  const inRisk = cfg.riskBelow ? v < threshold : v > threshold
                  const fill = inRisk ? '#dc2626' : param.color
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={fill}
                      stroke="white"
                      strokeWidth={2}
                    />
                  )
                }}
                name={param.label}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  )
}
