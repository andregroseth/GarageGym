import { useEffect, useMemo, useRef, useState } from 'react'
import InventoryCard from './components/InventoryCard.jsx'
import ResultCard from './components/ResultCard.jsx'
import TopBar from './components/TopBar.jsx'
import {
  BAR_KG,
  chooseBestTransition,
  DEFAULT_INVENTORY_TOTAL,
  formatKg,
  parseKgInput,
  perSideTargetUnits,
  readInventoryPairsFromTotals,
  sumPlates,
  validateTotalKg,
} from './solver/plates.js'

export default function App() {
  const [isDark, setIsDark] = useState(false)

  const [currentWeight, setCurrentWeight] = useState('20')
  const [desiredWeight, setDesiredWeight] = useState('')

  const [inventoryTotals, setInventoryTotals] = useState(() => {
    const initial = {}
    for (const [k, v] of Object.entries(DEFAULT_INVENTORY_TOTAL)) {
      initial[k] = String(v)
    }
    return initial
  })

  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const resultRef = useRef(null)

  useEffect(() => {
    const prefersDark = Boolean(
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches,
    )
    setIsDark(prefersDark)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    if (!result) return
    const el = resultRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [result])

  const onSwap = () => {
    setCurrentWeight(desiredWeight)
    setDesiredWeight(currentWeight)
    setError('')
    setResult(null)
  }

  const onReset = () => {
    setCurrentWeight('')
    setDesiredWeight('')
    setError('')
    setResult(null)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    const inventory = readInventoryPairsFromTotals(inventoryTotals)
    if (inventory.error) {
      setError(inventory.error)
      return
    }

    const currentKg = parseKgInput(currentWeight)
    const desiredKg = parseKgInput(desiredWeight)

    if (currentKg == null || desiredKg == null) {
      setError('Please enter both current and desired total weight.')
      return
    }

    const currentErr = validateTotalKg(currentKg)
    if (currentErr) {
      setError(`Current: ${currentErr}`)
      return
    }

    const desiredErr = validateTotalKg(desiredKg)
    if (desiredErr) {
      setError(`Desired: ${desiredErr}`)
      return
    }

    const best = chooseBestTransition(
      perSideTargetUnits(currentKg),
      perSideTargetUnits(desiredKg),
      inventory.pairs,
    )

    if (!best || best.error) {
      setError(best?.error || 'No solution found.')
      return
    }

    setResult({
      currentKg,
      desiredKg,
      ops: best.ops,
      currentCounts: best.currentCounts,
      desiredCounts: best.desiredCounts,
      curPlatesCount: sumPlates(best.currentCounts),
      desPlatesCount: sumPlates(best.desiredCounts),
    })
  }

  const hintText = useMemo(() => {
    return (
      <>
        Assumes a <strong>{formatKg(BAR_KG)} kg</strong> Olympic bar. Available
        plates (per side): 25, 20, 15, 10, 5, 2.5, 1, 0.5 kg.
      </>
    )
  }, [])

  return (
    <div className="aksel-page">
      <TopBar isDark={isDark} onToggleDark={setIsDark} />

      <main className="aksel-pageblock aksel-pageblock--md aksel-pageblock--gutters gg-main">
        <header className="gg-header">
          <h1 className="aksel-heading aksel-heading--large">
            Plate Change Minimizer
          </h1>
          <p className="aksel-body-long aksel-body-long--small aksel-typo--color-subtle">
            Finds a minimal-operation way to change an Olympic bar from one
            weight to another using mirrored plates.
          </p>
        </header>

        <section className="gg-card">
          <form className="gg-form" onSubmit={onSubmit} noValidate>
            <div className="gg-row">
              <div className="aksel-form-field">
                <label
                  className="aksel-label aksel-label--small"
                  htmlFor="currentWeight"
                >
                  Current total weight (kg)
                </label>
                <input
                  className="aksel-text-field__input"
                  id="currentWeight"
                  name="currentWeight"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  placeholder="e.g. 100"
                  required
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                />
              </div>

              <div className="aksel-form-field">
                <label
                  className="aksel-label aksel-label--small"
                  htmlFor="desiredWeight"
                >
                  Desired total weight (kg)
                </label>
                <input
                  className="aksel-text-field__input"
                  id="desiredWeight"
                  name="desiredWeight"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  required
                  value={desiredWeight}
                  onChange={(e) => setDesiredWeight(e.target.value)}
                />
              </div>
            </div>

            <p className="aksel-body-short aksel-body-short--small aksel-typo--color-subtle gg-hint">
              {hintText}
            </p>

            <InventoryCard
              totals={inventoryTotals}
              onChangeTotals={setInventoryTotals}
            />

            <div className="gg-actions">
              <button
                type="submit"
                className="aksel-button"
                data-variant="primary"
                data-color="accent"
              >
                Compute best change
              </button>
              <button
                type="button"
                className="aksel-button"
                data-variant="secondary"
                data-color="neutral"
                onClick={onSwap}
              >
                Swap
              </button>
              <button
                type="button"
                className="aksel-button"
                data-variant="secondary"
                data-color="neutral"
                onClick={onReset}
              >
                Reset
              </button>
            </div>

            <div
              className="aksel-error-message aksel-body-short aksel-body-short--small gg-error"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          </form>
        </section>

        <div ref={resultRef}>
          {result ? <ResultCard result={result} /> : null}
        </div>

        <footer className="aksel-detail aksel-detail--small aksel-typo--color-subtle gg-footer">
          Built for quick garage-gym math.
        </footer>
      </main>
    </div>
  )
}
