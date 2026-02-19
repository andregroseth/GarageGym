export const BAR_KG = 20

// Available plates (per side), kg.
export const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1, 0.5]

// Default inventory is TOTAL plates in the gym (both sides combined).
// The solver uses PAIRS available (total/2) because loading is mirrored.
export const DEFAULT_INVENTORY_TOTAL = {
  25: 2,
  20: 4,
  15: 4,
  10: 8,
  5: 8,
  2.5: 8,
  1: 8,
  0.5: 8,
}

// Convert kg -> half-kg units (0.5kg = 1 unit) to avoid float errors.
const toUnits = (kg) => Math.round(kg * 2)

export function formatKg(kg) {
  return Number.isInteger(kg) ? `${kg}` : `${kg.toFixed(1)}`
}

export function parseKgInput(value) {
  if (value == null) return null
  const trimmed = String(value).trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

export function validateTotalKg(totalKg) {
  if (totalKg < BAR_KG) {
    return `Total weight must be at least ${BAR_KG} kg (bar weight).`
  }
  const totalUnits = toUnits(totalKg)
  const barUnits = toUnits(BAR_KG)
  const deltaUnits = totalUnits - barUnits
  if (deltaUnits < 0) {
    return `Total weight must be at least ${BAR_KG} kg.`
  }
  if (deltaUnits % 2 !== 0) {
    return `That total weight can’t be loaded symmetrically with a ${formatKg(
      BAR_KG,
    )} kg bar (it would require a quarter-kilo per side).`
  }
  return null
}

export function perSideTargetUnits(totalKg) {
  const totalUnits = toUnits(totalKg)
  const barUnits = toUnits(BAR_KG)
  return (totalUnits - barUnits) / 2
}

function parseNonNegativeInt(value) {
  const n = Number(String(value).trim())
  if (!Number.isFinite(n)) return null
  if (!Number.isInteger(n)) return null
  if (n < 0) return null
  return n
}

export function readInventoryPairsFromTotals(totalsByPlateKg) {
  const pairs = []
  for (const plateKg of PLATES_KG) {
    const raw =
      totalsByPlateKg?.[String(plateKg)] ?? DEFAULT_INVENTORY_TOTAL[plateKg]
    const totalCount = parseNonNegativeInt(raw)
    if (totalCount == null) {
      return {
        error: `Inventory for ${formatKg(
          plateKg,
        )} kg must be a non-negative whole number.`,
      }
    }
    if (totalCount % 2 !== 0) {
      return {
        error: `Inventory for ${formatKg(
          plateKg,
        )} kg must be even (so you have matching pairs for both sides).`,
      }
    }
    pairs.push(totalCount / 2)
  }
  return { pairs }
}

const PLATES_UNITS = PLATES_KG.map(toUnits)

function computeDpSuffixMinPlates(targetUnits, availPairs) {
  const n = PLATES_UNITS.length
  const INF = 1_000_000

  // dp[i][a] = min plates to make amount a using plates i..n-1.
  const dp = Array.from({ length: n + 1 }, () =>
    Array(targetUnits + 1).fill(INF),
  )
  dp[n][0] = 0

  for (let i = n - 1; i >= 0; i--) {
    const w = PLATES_UNITS[i]
    for (let amt = 0; amt <= targetUnits; amt++) {
      let best = INF
      const maxCount = Math.min(Math.floor(amt / w), availPairs[i])
      for (let c = 0; c <= maxCount; c++) {
        const rem = amt - c * w
        const candidate = c + dp[i + 1][rem]
        if (candidate < best) best = candidate
      }
      dp[i][amt] = best
    }
  }

  return dp
}

function generateAllOptimalCombos(targetUnits, availPairs, comboLimit = 800) {
  const dp = computeDpSuffixMinPlates(targetUnits, availPairs)
  const n = PLATES_UNITS.length
  const INF = 1_000_000

  const minPlates = dp[0][targetUnits]
  if (minPlates >= INF) {
    return { minPlates: null, combos: [] }
  }

  const combos = []

  function rec(i, amt, counts) {
    if (combos.length >= comboLimit) return
    if (i === n) {
      if (amt === 0) combos.push(counts.slice())
      return
    }

    const w = PLATES_UNITS[i]
    const need = dp[i][amt]
    if (need >= INF) return

    const maxCount = Math.min(Math.floor(amt / w), availPairs[i])
    for (let c = 0; c <= maxCount; c++) {
      const rem = amt - c * w
      if (c + dp[i + 1][rem] === need) {
        counts[i] = c
        rec(i + 1, rem, counts)
        if (combos.length >= comboLimit) return
      }
    }
    counts[i] = 0
  }

  rec(0, targetUnits, Array(n).fill(0))
  return { minPlates, combos }
}

function countPairOperations(countsA, countsB) {
  let ops = 0
  for (let i = 0; i < countsA.length; i++) {
    ops += Math.abs(countsA[i] - countsB[i])
  }
  return ops
}

export function sumPlates(counts) {
  return counts.reduce((a, b) => a + b, 0)
}

export function chooseBestTransition(
  currentTargetUnits,
  desiredTargetUnits,
  availPairs,
) {
  const current = generateAllOptimalCombos(currentTargetUnits, availPairs, 800)
  const desired = generateAllOptimalCombos(desiredTargetUnits, availPairs, 800)

  if (current.minPlates == null) {
    return { error: 'Current weight can’t be made with the available plates.' }
  }
  if (desired.minPlates == null) {
    return { error: 'Desired weight can’t be made with the available plates.' }
  }

  // If combo lists get huge, cap them further to keep things snappy.
  const currentCombos = current.combos.slice(0, 500)
  const desiredCombos = desired.combos.slice(0, 500)

  let best = null

  for (const c of currentCombos) {
    for (const d of desiredCombos) {
      const ops = countPairOperations(c, d)
      if (
        best == null ||
        ops < best.ops ||
        (ops === best.ops && sumPlates(d) < sumPlates(best.desiredCounts))
      ) {
        best = { ops, currentCounts: c, desiredCounts: d }
        if (best.ops === 0) return best
      }
    }
  }

  return best
}

export function countsToPlateList(counts) {
  const plates = []
  for (let i = 0; i < counts.length; i++) {
    const count = counts[i]
    for (let k = 0; k < count; k++) {
      plates.push(PLATES_KG[i])
    }
  }
  return plates
}
