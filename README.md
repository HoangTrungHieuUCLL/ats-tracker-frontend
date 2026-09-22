# ATS Keyword Tracker — Frontend

Vite + React + TypeScript frontend for the ATS Keyword Tracker.

## Local setup

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the backend's
   URL (e.g. `http://localhost:8000`).
2. `npm install`
3. `npm run dev`

## Linting and type checking

```bash
npm run lint
npm run typecheck
```

## Railway deployment

`VITE_API_BASE_URL` is embedded at build time. On Railway, set it as a
service variable *before* the first build; changing it later requires a
redeploy.
