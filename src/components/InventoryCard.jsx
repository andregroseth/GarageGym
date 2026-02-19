import { useState } from 'react'
import { PLATES_KG } from '../solver/plates.js'

export default function InventoryCard({ totals, onChangeTotals }) {
  const [open, setOpen] = useState(false)

  const setPlate = (plateKg, value) => {
    onChangeTotals((prev) => ({ ...prev, [String(plateKg)]: value }))
  }

  return (
    <div
      className="aksel-expansioncard aksel-expansioncard--small gg-inventory"
      data-color="neutral"
      id="inventoryCard"
    >
      <div
        className="aksel-expansioncard__header"
        data-open={open ? 'true' : 'false'}
        onClick={(e) => {
          if (e.target.closest('button')) return
          setOpen((v) => !v)
        }}
      >
        <h2 className="aksel-heading aksel-heading--xsmall aksel-expansioncard__title--small gg-inventory-title">
          Available plates (total in your gym)
        </h2>
        <button
          type="button"
          className="aksel-expansioncard__header-button"
          aria-label="Toggle available plates"
          aria-expanded={open ? 'true' : 'false'}
          aria-controls="inventoryCardContent"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            className="aksel-expansioncard__header-chevron"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M6 9l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        className="aksel-expansioncard__content"
        data-open={open ? 'true' : 'false'}
        id="inventoryCardContent"
      >
        <div className="aksel-expansioncard__content-inner">
          <div className="gg-inventory-grid">
            {PLATES_KG.map((plateKg) => (
              <div className="aksel-form-field gg-inv-field" key={plateKg}>
                <label
                  className="aksel-label aksel-label--small"
                  htmlFor={`inv-${plateKg}`}
                >
                  {plateKg} kg
                </label>
                <input
                  className="aksel-text-field__input gg-inv-input"
                  id={`inv-${plateKg}`}
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  value={totals[String(plateKg)] ?? ''}
                  onChange={(e) => setPlate(plateKg, e.target.value)}
                />
              </div>
            ))}
          </div>
          <p className="aksel-body-short aksel-body-short--small aksel-typo--color-subtle gg-hint">
            These are <strong>total plates</strong>. For symmetric loading, each
            side uses one plate from a matching pair (so totals should be even).
          </p>
        </div>
      </div>
    </div>
  )
}
