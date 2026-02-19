import { BAR_KG, formatKg } from '../solver/plates.js'
import PlateChips from './PlateChips.jsx'

function Changes({ currentCounts, desiredCounts }) {
  const removes = []
  const adds = []

  for (let i = 0; i < desiredCounts.length; i++) {
    const diff = desiredCounts[i] - currentCounts[i]
    if (diff > 0) adds.push({ idx: i, count: diff })
    else if (diff < 0) removes.push({ idx: i, count: -diff })
  }

  const toLine = (label, items) => {
    return (
      label +
      ': ' +
      items
        .map((it) => {
          // plate list is fixed order; idx aligns with solver PLATES_KG
          return `${it.count} × ${formatKg(PLATE_KG_BY_INDEX[it.idx])} kg pair`
        })
        .join(', ')
    )
  }

  return (
    <div>
      {removes.length === 0 && adds.length === 0 ? (
        <div>No changes needed.</div>
      ) : (
        <>
          {removes.length ? <div>{toLine('Remove', removes)}</div> : null}
          {adds.length ? <div>{toLine('Add', adds)}</div> : null}
        </>
      )}
    </div>
  )
}

const PLATE_KG_BY_INDEX = [25, 20, 15, 10, 5, 2.5, 1, 0.5]

export default function ResultCard({ result }) {
  const {
    currentKg,
    desiredKg,
    ops,
    currentCounts,
    desiredCounts,
    curPlatesCount,
    desPlatesCount,
  } = result

  const summaryItems = [
    { label: 'Bar', value: `${formatKg(BAR_KG)} kg` },
    { label: 'Current', value: `${formatKg(currentKg)} kg` },
    { label: 'Desired', value: `${formatKg(desiredKg)} kg` },
    { label: 'Operations', value: `${ops} pair move${ops === 1 ? '' : 's'}` },
    { label: 'Plates/side', value: `${curPlatesCount} → ${desPlatesCount}` },
  ]

  return (
    <section className="gg-card" aria-label="Result">
      <h2 className="aksel-heading aksel-heading--medium">Result</h2>

      <div className="gg-summary">
        {summaryItems.map((it) => (
          <span
            key={it.label}
            className="aksel-tag"
            data-variant="moderate"
            data-color="neutral"
          >
            {it.label}: {it.value}
          </span>
        ))}
      </div>

      <div className="gg-grid">
        <div>
          <h3 className="aksel-heading aksel-heading--xsmall">
            Current plates (per side)
          </h3>
          <div className="gg-plates">
            <PlateChips counts={currentCounts} />
          </div>
        </div>

        <div>
          <h3 className="aksel-heading aksel-heading--xsmall">
            Desired plates (per side)
          </h3>
          <div className="gg-plates">
            <PlateChips counts={desiredCounts} />
          </div>
        </div>
      </div>

      <h3 className="aksel-heading aksel-heading--xsmall">Changes</h3>
      <div className="gg-changes">
        <Changes currentCounts={currentCounts} desiredCounts={desiredCounts} />
      </div>

      <p className="aksel-body-short aksel-body-short--small aksel-typo--color-subtle">
        Operations are counted as <strong>plate-pair moves</strong> (add/remove
        a matching plate on both sides counts as 1).
      </p>

      <img
        className="gg-result-image"
        src="/Images/GarageGym.png"
        alt="GarageGym"
        loading="lazy"
      />
    </section>
  )
}
