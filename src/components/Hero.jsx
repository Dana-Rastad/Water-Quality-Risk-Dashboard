export default function Hero() {
  return (
    <section className="relative overflow-hidden w-full bg-gradient-to-br from-teal-50/90 via-slate-50 to-water-50/70 rounded-2xl border border-slate-200/60 shadow-soft -mb-px">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(94_234_212_/0.08)_0%,transparent_60%)] rounded-2xl pointer-events-none" aria-hidden="true" />
      <div className="relative w-full py-14 sm:py-20 px-6 sm:px-8 lg:px-10">
        <h2 className="font-display font-semibold text-display-md sm:text-display-lg text-slate-800 mb-5">
          What is eutrophication?
        </h2>
        <p className="max-w-3xl text-slate-600 leading-relaxed text-base sm:text-lg">
          Eutrophication is the process by which water bodies receive excess nutrients—especially nitrogen and phosphorus—leading to dense plant and algal growth, reduced dissolved oxygen, and degraded aquatic ecosystems. This dashboard evaluates eutrophication risk using four key parameters: <strong className="text-teal-700 font-medium">Dissolved Oxygen (DO)</strong>, <strong className="text-teal-700 font-medium">Nitrate</strong>, <strong className="text-teal-700 font-medium">Chlorophyll-a</strong>, and <strong className="text-teal-700 font-medium">Phosphate</strong>.
        </p>
      </div>
    </section>
  )
}
