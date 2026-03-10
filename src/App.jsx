import { useState } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import SummaryCards from './components/SummaryCards'
import EutrophicationAssessmentCard from './components/EutrophicationAssessmentCard'
import EutrophicationChart from './components/EutrophicationChart'
import RiskDistributionDonut from './components/RiskDistributionDonut'
import AISummary from './components/AISummary'
import ParameterGrid from './components/ParameterGrid'
import Footer from './components/Footer'

function App() {
  const [selectedRiskPeriodId, setSelectedRiskPeriodId] = useState('30')
  const [selectedTrendParam, setSelectedTrendParam] = useState('do')

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/80">
      <Header />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col">
        <Hero />
        <div className="flex flex-col py-8 sm:py-12 space-y-8 sm:space-y-10">
          <ParameterGrid />
          <SummaryCards />
          <EutrophicationAssessmentCard
            selectedPeriodId={selectedRiskPeriodId}
            onChangePeriod={setSelectedRiskPeriodId}
          />
          <EutrophicationChart
            selectedParamKey={selectedTrendParam}
            onChangeParam={setSelectedTrendParam}
          />
          <RiskDistributionDonut />
          <AISummary
            selectedPeriodId={selectedRiskPeriodId}
            selectedParamKey={selectedTrendParam}
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App
