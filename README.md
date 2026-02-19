# GarageGym

Simple plate-change calculator for an Olympic bar.

Given a **current total weight** and a **desired total weight**, it finds a solution that changes the plates with the **fewest operations**, while keeping plates mirrored on both sides.

**Assumptions**

- Bar weight: **20 kg** (included in the total)
- Plates available (per side): **0.5, 1, 2.5, 5, 10, 15, 20, 25 kg**
- One “operation” = adding or removing a **matching plate pair** (one on each side)

## Inventory limits

The calculator can respect your available plates.

- Edit the **Available plates** inputs on the page.
- Counts are **total plates in your gym** (both sides combined), so they should be **even** (because loading is mirrored).

## Run

Open [index.html](index.html) in your browser.

This project uses NAV Aksel styling via `@navikt/ds-css`.

If your browser blocks local scripts, run a local server.

### Option A: npm

```bash
cd GarageGym
npm install
npm start
```

Then open `http://localhost:3000`.

### Option B: Python

```bash
cd GarageGym
python3 -m http.server 5173
```

Then open `http://localhost:5173`.
