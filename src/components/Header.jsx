export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <h1 className="font-display font-semibold text-display-sm sm:text-display-md text-slate-800 tracking-tight">
          Eutrophication Risk Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-medium">
          Water quality indicators · Environmental monitoring
        </p>
      </div>
    </header>
  )
}
