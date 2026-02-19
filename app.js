/*
  Plate Change Minimizer

  Assumptions:
  - Total weight includes the bar.
  - Bar weight is fixed to BAR_KG.
  - Plates must be mirrored (same plates on both sides).
  - We choose plate configurations that use the minimum number of plates per side,
    then among those, choose the pair (current vs desired) with the fewest plate-pair moves.
*/

const BAR_KG = 20

// Available plates (per side), kg.
const PLATES_KG = [25, 20, 15, 10, 5, 2.5, 1, 0.5]

// Convert kg -> half-kg units (0.5kg = 1 unit) to avoid float errors.
const toUnits = (kg) => Math.round(kg * 2)
const fromUnits = (units) => units / 2

const PLATES_UNITS = PLATES_KG.map(toUnits)

function formatKg(kg) {
  // Show .5 if needed; otherwise integer.
  return Number.isInteger(kg) ? `${kg}` : `${kg.toFixed(1)}`
}

function parseKgInput(value) {
  if (value == null) return null
  const trimmed = String(value).trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

function validateTotalKg(totalKg) {
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

function perSideTargetUnits(totalKg) {
  const totalUnits = toUnits(totalKg)
  const barUnits = toUnits(BAR_KG)
  return (totalUnits - barUnits) / 2
}

function computeDpSuffixMinPlates(targetUnits) {
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
      const maxCount = Math.floor(amt / w)
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

function generateAllOptimalCombos(targetUnits, comboLimit = 800) {
  const dp = computeDpSuffixMinPlates(targetUnits)
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

    const maxCount = Math.floor(amt / w)
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

function sumPlates(counts) {
  return counts.reduce((a, b) => a + b, 0)
}

function chooseBestTransition(currentTargetUnits, desiredTargetUnits) {
  const current = generateAllOptimalCombos(currentTargetUnits, 800)
  const desired = generateAllOptimalCombos(desiredTargetUnits, 800)

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

function countsToPlateList(counts) {
  const plates = []
  for (let i = 0; i < counts.length; i++) {
    const count = counts[i]
    for (let k = 0; k < count; k++) {
      plates.push(PLATES_KG[i])
    }
  }
  return plates
}

function renderPlatePills(container, counts) {
  container.textContent = ''
  const plates = countsToPlateList(counts)
  if (plates.length === 0) {
    const pill = document.createElement('span')
    pill.className = 'pill muted'
    pill.textContent = 'No plates'
    container.appendChild(pill)
    return
  }

  for (const p of plates) {
    const pill = document.createElement('span')
    pill.className = 'pill'
    pill.dataset.plate = String(p)
    pill.textContent = `${formatKg(p)} kg`
    container.appendChild(pill)
  }
}

function renderChanges(container, currentCounts, desiredCounts) {
  container.textContent = ''

  const removes = []
  const adds = []

  for (let i = 0; i < PLATES_KG.length; i++) {
    const diff = desiredCounts[i] - currentCounts[i]
    if (diff > 0) {
      adds.push({ plate: PLATES_KG[i], count: diff })
    } else if (diff < 0) {
      removes.push({ plate: PLATES_KG[i], count: -diff })
    }
  }

  const lines = []
  if (removes.length === 0 && adds.length === 0) {
    lines.push('No changes needed.')
  } else {
    if (removes.length) {
      lines.push(
        `Remove: ${removes
          .map((r) => `${r.count} × ${formatKg(r.plate)} kg pair`)
          .join(', ')}`,
      )
    }
    if (adds.length) {
      lines.push(
        `Add: ${adds
          .map((a) => `${a.count} × ${formatKg(a.plate)} kg pair`)
          .join(', ')}`,
      )
    }
  }

  for (const line of lines) {
    const div = document.createElement('div')
    div.textContent = line
    container.appendChild(div)
  }
}

function setError(message) {
  const error = document.getElementById('error')
  error.textContent = message || ''
}

function setResultHidden(hidden) {
  const result = document.getElementById('result')
  result.hidden = hidden
}

function renderSummary(
  summaryEl,
  currentKg,
  desiredKg,
  ops,
  curPlatesCount,
  desPlatesCount,
) {
  summaryEl.textContent = ''

  const items = [
    { label: 'Bar', value: `${formatKg(BAR_KG)} kg` },
    { label: 'Current', value: `${formatKg(currentKg)} kg` },
    { label: 'Desired', value: `${formatKg(desiredKg)} kg` },
    { label: 'Operations', value: `${ops} pair move${ops === 1 ? '' : 's'}` },
    { label: 'Plates/side', value: `${curPlatesCount} → ${desPlatesCount}` },
  ]

  for (const it of items) {
    const pill = document.createElement('span')
    pill.className = 'pill muted'
    pill.textContent = `${it.label}: ${it.value}`
    summaryEl.appendChild(pill)
  }
}

function onSubmit(e) {
  e.preventDefault()
  setError('')
  setResultHidden(true)

  const currentKg = parseKgInput(document.getElementById('currentWeight').value)
  const desiredKg = parseKgInput(document.getElementById('desiredWeight').value)

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

  const currentTarget = perSideTargetUnits(currentKg)
  const desiredTarget = perSideTargetUnits(desiredKg)

  const best = chooseBestTransition(currentTarget, desiredTarget)
  if (!best || best.error) {
    setError(best?.error || 'No solution found.')
    return
  }

  const currentPlates = document.getElementById('currentPlates')
  const desiredPlates = document.getElementById('desiredPlates')
  const changes = document.getElementById('changes')
  const summary = document.getElementById('summary')

  renderSummary(
    summary,
    currentKg,
    desiredKg,
    best.ops,
    sumPlates(best.currentCounts),
    sumPlates(best.desiredCounts),
  )

  renderPlatePills(currentPlates, best.currentCounts)
  renderPlatePills(desiredPlates, best.desiredCounts)
  renderChanges(changes, best.currentCounts, best.desiredCounts)

  setResultHidden(false)
}

function swapValues() {
  const cur = document.getElementById('currentWeight')
  const des = document.getElementById('desiredWeight')
  const tmp = cur.value
  cur.value = des.value
  des.value = tmp
}

function resetForm() {
  document.getElementById('currentWeight').value = ''
  document.getElementById('desiredWeight').value = ''
  setError('')
  setResultHidden(true)
}

function main() {
  const form = document.getElementById('plate-form')
  form.addEventListener('submit', onSubmit)

  document.getElementById('swap').addEventListener('click', () => {
    swapValues()
  })

  document.getElementById('reset').addEventListener('click', () => {
    resetForm()
  })

  // Nice default examples.
  document.getElementById('currentWeight').value = '100'
  document.getElementById('desiredWeight').value = '140'
}

main()
