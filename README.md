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

This is a Vite + React app using NAV Aksel styling via `@navikt/ds-css`.

```bash
cd GarageGym
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

This repo includes a GitHub Actions workflow that builds and deploys to GitHub Pages.

1. In GitHub, go to **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. Push to `main`

For project pages (published under `/<repo>/`), the build sets Vite's base path automatically using the repo name.
