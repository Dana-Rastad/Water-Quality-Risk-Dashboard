import ParameterCard from './ParameterCard'

const parameters = [
  {
    id: 'do',
    name: 'Dissolved Oxygen (DO)',
    unit: 'mg/L',
    description: 'Low DO indicates stress from algal decay and nutrient overload.',
    value: 7.2,
    status: 'good',
    riskLevel: 18,
    color: 'water',
  },
  {
    id: 'nitrate',
    name: 'Nitrate',
    unit: 'mg/L',
    description: 'Elevated nitrate often comes from runoff and wastewater.',
    value: 0.8,
    status: 'moderate',
    riskLevel: 35,
    color: 'teal',
  },
  {
    id: 'chlorophyll',
    name: 'Chlorophyll-a',
    unit: 'µg/L',
    description: 'Proxy for algal biomass; high values suggest eutrophication.',
    value: 12,
    status: 'moderate',
    riskLevel: 48,
    color: 'sage',
  },
  {
    id: 'phosphate',
    name: 'Phosphate',
    unit: 'mg/L',
    description: 'Key limiting nutrient; excess drives algal blooms.',
    value: 0.05,
    status: 'good',
    riskLevel: 22,
    color: 'teal',
  },
]

export default function ParameterGrid() {
  return (
    <section className="w-full">
      <h2 className="font-display font-semibold text-display-sm text-slate-800 mb-1">
        Parameter details
      </h2>
      <p className="text-sm text-slate-500 mb-5">
        More detail on each indicator and how it relates to eutrophication.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {parameters.map((param) => (
          <ParameterCard key={param.id} {...param} />
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Units: mg/L = milligrams per liter · µg/L = micrograms per liter
      </p>
    </section>
  )
}
