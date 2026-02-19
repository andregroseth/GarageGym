import { countsToPlateList, formatKg } from '../solver/plates.js'

export default function PlateChips({ counts }) {
  const plates = countsToPlateList(counts)

  return (
    <ul className="aksel-chips aksel-chips--readonly aksel-chips--small plate-chips">
      {plates.length === 0 ? (
        <li>
          <span className="aksel-chips__chip plate-chip plate-chip--muted">
            No plates
          </span>
        </li>
      ) : (
        plates.map((plateKg, idx) => (
          <li key={`${plateKg}-${idx}`}>
            <span
              className="aksel-chips__chip plate-chip"
              data-plate={String(plateKg)}
            >
              {formatKg(plateKg)} kg
            </span>
          </li>
        ))
      )}
    </ul>
  )
}
