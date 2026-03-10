/**
 * Seeded pseudo-random for reproducible, realistic fluctuation
 */
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

/**
 * Generate 365 days of water quality data (mild to moderate eutrophication).
 * Dates: 2024-04-01 through 2025-03-31
 */
function generateEutrophicationData() {
  const data = []
  const startDate = new Date('2024-04-01')

  for (let i = 0; i < 365; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().slice(0, 10)
    const dayOfYear = i
    const t = (dayOfYear / 365) * Math.PI * 2 // annual cycle
    const tShort = (dayOfYear / 30) * Math.PI * 2 // ~monthly variation

    const r1 = seededRandom(i * 1.1)
    const r2 = seededRandom(i * 2.3 + 7)
    const r3 = seededRandom(i * 3.7 + 13)
    const r4 = seededRandom(i * 5.9 + 21)
    const r5 = seededRandom(i * 0.7 + 31)

    // DO: 1.0–8.5 mg/L. Lower in summer (high algal activity, decay). Seasonal + noise.
    const doSeasonal = 5.2 - 2.2 * Math.sin(t - 0.6) // trough ~summer
    const doNoise = (r1 - 0.5) * 1.8
    const doVal = Math.max(1.0, Math.min(8.5, doSeasonal + doNoise))

    // Nitrate: 1–15 mg/L. Spikes from runoff, slightly higher in spring/fall.
    const nitrateBase = 6 + 2.5 * Math.sin(t) + 1.5 * Math.sin(tShort * 0.7)
    const nitrateSpike = r2 > 0.92 ? (r2 - 0.92) * 80 : 0 // occasional runoff
    const nitrateVal = Math.max(1, Math.min(15, nitrateBase + nitrateSpike + (r3 - 0.5) * 2))

    // Chlorophyll-a: 5–60 µg/L. Higher in summer (algae). Mild–moderate range.
    const chloroBase = 22 + 18 * Math.sin(t - 0.5) + 4 * Math.sin(tShort)
    const chloroVal = Math.max(5, Math.min(60, chloroBase + (r4 - 0.5) * 6))

    // Phosphate: 0.01–0.12 mg/L. Seasonal + small spikes.
    const phosphateBase = 0.055 + 0.025 * Math.sin(t) + 0.01 * Math.sin(tShort * 1.3)
    const phosphateSpike = r5 > 0.94 ? (r5 - 0.94) * 0.4 : 0
    const phosphateVal = Math.max(0.01, Math.min(0.12, phosphateBase + phosphateSpike + (r1 - 0.5) * 0.015))

    data.push({
      date: dateStr,
      do: Math.round(doVal * 10) / 10,
      nitrate: Math.round(nitrateVal * 100) / 100,
      chlorophyll: Math.round(chloroVal * 10) / 10,
      phosphate: Math.round(phosphateVal * 1000) / 1000,
    })
  }

  return data
}

export const eutrophicationData = generateEutrophicationData()
