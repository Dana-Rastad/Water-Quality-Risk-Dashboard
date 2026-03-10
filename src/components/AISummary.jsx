import { useMemo } from 'react'
import { eutrophicationData } from '../data/eutrophicationData'

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

function getRiskCategoryLabel(score) {
  if (score <= 1) return 'Low Risk'
  if (score === 2) return 'Moderate Risk'
  return 'High Risk'
}

const PARAM_META = {
  do: {
    label: 'Dissolved Oxygen (DO)',
    unit: 'mg/L',
    range: [0, 8.5],
    direction: 'lower-is-risk',
  },
  nitrate: {
    label: 'Nitrate',
    unit: 'mg/L',
    range: [0, 15],
    direction: 'higher-is-risk',
  },
  chlorophyll: {
    label: 'Chlorophyll-a',
    unit: 'µg/L',
    range: [0, 50],
    direction: 'higher-is-risk',
  },
  phosphate: {
    label: 'Phosphate',
    unit: 'mg/L',
    range: [0, 0.15],
    direction: 'higher-is-risk',
  },
}

function describeLatest(latest) {
  if (!latest) return null

  const parts = []

  if (latest.do < 4) {
    parts.push('dissolved oxygen is low and could stress fish and other aquatic life')
  } else if (latest.do < 6) {
    parts.push('dissolved oxygen is moderate but should be watched for further declines')
  } else {
    parts.push('dissolved oxygen is in a comfortable range for most aquatic life')
  }

  if (latest.nitrate > 10) {
    parts.push('nitrate is high and strongly supports eutrophication')
  } else if (latest.nitrate > 5) {
    parts.push('nitrate is in a moderate range that can contribute to nutrient loading')
  } else {
    parts.push('nitrate is relatively low at the moment')
  }

  if (latest.phosphate > 0.05) {
    parts.push('phosphate is elevated and can fuel algal blooms')
  } else if (latest.phosphate > 0.03) {
    parts.push('phosphate is moderate and may contribute to eutrophication under the right conditions')
  } else {
    parts.push('phosphate is fairly low')
  }

  if (latest.chlorophyll > 30) {
    parts.push('chlorophyll-a is high, indicating strong algal growth')
  } else if (latest.chlorophyll > 10) {
    parts.push('chlorophyll-a suggests a moderate level of algal biomass')
  } else {
    parts.push('chlorophyll-a is relatively low')
  }

  return parts.join('. ') + '.'
}

function groupMonthsAndCounts(data) {
  const byMonth = new Map()
  data.forEach((row) => {
    const [year, month] = row.date.split('-')
    const key = `${year}-${month}`
    const existing = byMonth.get(key)
    if (!existing) {
      byMonth.set(key, {
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

  const monthly = Array.from(byMonth.values()).map((m) => ({
    do: m.do / m.count,
    nitrate: m.nitrate / m.count,
    chlorophyll: m.chlorophyll / m.count,
    phosphate: m.phosphate / m.count,
  }))

  const counts = { Low: 0, Moderate: 0, High: 0 }
  monthly.forEach((m) => {
    const score = computeScore(m)
    const label = getRiskCategoryLabel(score)
    const key = label.split(' ')[0] // "Low", "Moderate", "High"
    counts[key] += 1
  })

  const total = monthly.length || 1
  const pct = {
    Low: Math.round((counts.Low / total) * 100),
    Moderate: Math.round((counts.Moderate / total) * 100),
    High: Math.round((counts.High / total) * 100),
  }

  let dominant = 'Low'
  if (pct.Moderate >= pct.Low && pct.Moderate >= pct.High) dominant = 'Moderate'
  if (pct.High >= pct.Low && pct.High >= pct.Moderate) dominant = 'High'

  return { counts, pct, dominant, totalMonths: monthly.length }
}

function describeTrend(lastWindow, paramKey) {
  const meta = PARAM_META[paramKey]
  if (!lastWindow || !meta) return null

  const { range } = meta
  const [minRange, maxRange] = range
  const windowRows = lastWindow

  // lastWindowRows already covers the last 30 days in AISummary hook
  const values = windowRows.map((r) => r[paramKey]).filter((v) => v != null)
  if (values.length < 2) return 'not enough data to see a clear trend'

  const mid = Math.floor(values.length / 2)
  const firstAvg = values.slice(0, mid).reduce((a, b) => a + b, 0) / mid
  const secondAvg = values.slice(mid).reduce((a, b) => a + b, 0) / (values.length - mid)

  const diff = secondAvg - firstAvg
  const span = Math.max(0.0001, maxRange - minRange)
  const threshold = span * 0.08 // 8% of full range

  if (Math.abs(diff) < threshold) {
    return 'has been relatively stable over the last month'
  }

  const directionWord =
    meta.direction === 'lower-is-risk'
      ? diff < 0
        ? 'has been trending downward (more stressful conditions)'
        : 'has been trending upward (less stressful conditions)'
      : diff > 0
        ? 'has been trending upward (stronger eutrophication pressure)'
        : 'has been trending downward (reduced eutrophication pressure)'

  return directionWord
}

export default function AISummary({ selectedPeriodId = '30', selectedParamKey = 'do' }) {
  const period = PERIOD_OPTIONS.find((p) => p.id === selectedPeriodId) ?? PERIOD_OPTIONS[2]

  const latest = useMemo(
    () =>
      eutrophicationData.length
        ? eutrophicationData[eutrophicationData.length - 1]
        : null,
    [],
  )

  const latestDescription = useMemo(
    () => describeLatest(latest),
    [latest],
  )

  const riskWindow = useMemo(
    () => getWindowAverages(eutrophicationData, period.days),
    [period.days],
  )

  const riskSummary = useMemo(() => {
    if (!riskWindow) return null
    const score = computeScore(riskWindow)
    const label = getRiskCategoryLabel(score)
    return { score, label }
  }, [riskWindow])

  const last30Rows = useMemo(() => {
    if (!eutrophicationData.length) return []
    const last = eutrophicationData[eutrophicationData.length - 1]
    const end = new Date(last.date + 'T00:00:00')
    const start = new Date(end)
    start.setDate(start.getDate() - 29)
    const startIso = start.toISOString().slice(0, 10)
    return eutrophicationData.filter((d) => d.date >= startIso && d.date <= last.date)
  }, [])

  const trendDescription = useMemo(
    () => describeTrend(last30Rows, selectedParamKey),
    [last30Rows, selectedParamKey],
  )

  const riskDist = useMemo(
    () => groupMonthsAndCounts(eutrophicationData),
    [],
  )

  return (
    <section className="w-full">
      <h2 className="font-display font-semibold text-display-sm text-slate-800 mb-1">
        Summary
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Plain-language interpretation of the data
      </p>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-card space-y-3">
        <p className="text-slate-600 leading-relaxed text-[15px] sm:text-base">
          The <strong className="text-slate-700">Latest readings</strong> section shows the most recent
          values for dissolved oxygen, nitrate, chlorophyll-a, and phosphate. At the moment,{' '}
          {latestDescription || 'there is not enough data loaded to describe current conditions'}.
        </p>
        <p className="text-slate-600 leading-relaxed text-[15px] sm:text-base">
          The <strong className="text-slate-700">Risk assessment</strong> card summarizes overall
          eutrophication risk for the selected time period (such as{' '}
          <strong className="text-slate-700">{period.label}</strong>). It averages the nutrient and
          oxygen values over that window, then applies a scoring system. Right now this period is
          classified as{' '}
          <strong className="text-slate-700">
            {riskSummary ? riskSummary.label : 'N/A'}
          </strong>{' '}
          based on the balance of nutrients, algae, and dissolved oxygen.
        </p>
        <p className="text-slate-600 leading-relaxed text-[15px] sm:text-base">
          The <strong className="text-slate-700">Trends over time</strong> chart lets you explore how
          each parameter has changed across the year. With{' '}
          <strong className="text-slate-700">
            {PARAM_META[selectedParamKey]?.label ?? 'the selected parameter'}
          </strong>{' '}
          selected, the last month has {trendDescription || 'shown mixed behavior'}. When points turn
          red relative to the threshold line, it means values are in a range where eutrophication
          impacts are more likely.
        </p>
        <p className="text-slate-600 leading-relaxed text-[15px] sm:text-base">
          Finally, the <strong className="text-slate-700">Risk distribution</strong> donut chart shows
          how many months in the dataset fall into Low, Moderate, or High Risk. Out of{' '}
          <strong className="text-slate-700">{riskDist.totalMonths}</strong> months,{' '}
          <strong className="text-slate-700">{riskDist.counts.Low}</strong> are classified as Low,{' '}
          <strong className="text-slate-700">{riskDist.counts.Moderate}</strong> as Moderate, and{' '}
          <strong className="text-slate-700">{riskDist.counts.High}</strong> as High Risk. Overall, the
          distribution is dominated by{' '}
          <strong className="text-slate-700">
            {riskDist.dominant} Risk
          </strong>{' '}
          months, indicating how often the lake has experienced meaningful eutrophication pressure over
          the year.
        </p>
      </div>
    </section>
  )
}
