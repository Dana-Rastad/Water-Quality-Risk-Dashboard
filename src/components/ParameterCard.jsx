const colorMap = {
  water: {
    bar: 'bg-water-500',
    text: 'text-water-700',
    bg: 'bg-water-50',
    border: 'border-water-200',
  },
  teal: {
    bar: 'bg-teal-500',
    text: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
  },
  sage: {
    bar: 'bg-sage-500',
    text: 'text-sage-700',
    bg: 'bg-sage-50',
    border: 'border-sage-200',
  },
}

const statusLabels = {
  good: 'Low risk',
  moderate: 'Moderate',
  high: 'High risk',
}

export default function ParameterCard({ name, unit, description, value, status, riskLevel, color }) {
  const theme = colorMap[color] || colorMap.teal

  return (
    <article
      className={`rounded-2xl border ${theme.border} ${theme.bg} p-6 shadow-card hover:shadow-card-hover transition-shadow duration-200`}
    >
      <h3 className={`font-display font-semibold text-sm mb-2 ${theme.text}`}>
        {name}
      </h3>
      <p className="text-xs text-slate-600 leading-relaxed mb-3">
        {description}
      </p>
      <p className="text-[11px] text-slate-500">
        Unit: <span className="font-medium text-slate-600">{unit}</span>
      </p>
    </article>
  )
}
