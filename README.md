# Mezon Documentation

Official Docusaurus 3.9 documentation site for Mezon (English default at `/docs/`, Vietnamese mirror at `/docs/vi/`).

## Requirements

- Node.js >= 20
- npm (`package-lock.json` is the lockfile — do not use `yarn`)

## Commands

```bash
npm ci                 # Install dependencies
npm start              # Local dev server (English)
npm start -- --locale vi  # Local dev server (Vietnamese)
npm run typecheck      # TypeScript check
npm run build          # Production build for both en and vi
npm run serve          # Preview production build (including local search)
npm run verify         # Full check: typecheck + health check + build + link check
```

## Structure

- `docs/user/` — English User Guide
- `docs/developer/` — English Developer Documentation
- `i18n/vi/docusaurus-plugin-content-docs/current/` — Vietnamese mirror (keep in sync with `docs/`)
- `redirects.ts` — Locale-agnostic URL redirects (`@docusaurus/plugin-client-redirects`)
- `plugins/` — Locale persistence (`localeStorage.ts`) and Vietnamese search normalization (`vietnameseSearch.ts`)
- `scripts/` — Build link verification (`check-build-links.mjs`) and EN/VI health checks (`check-docs-health.mjs`)
