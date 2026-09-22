# ATS Keyword Tracker — Frontend

Vite + React + TypeScript frontend for the ATS Keyword Tracker: single-user
login, a Jobs list with batch URL intake and live processing status, a job
detail page (editable fields, notes, keywords), and a keyword dashboard
(top keywords chart, share/importance stats, rename/merge).

Talks to the backend only through `VITE_API_BASE_URL` — no hardcoded
hostnames anywhere.

## Local setup

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the
   backend's URL (e.g. `http://localhost:8000`, or its Railway domain).
2. `npm install`
3. `npm run dev`

## Linting and type checking

```bash
npm run lint
npm run typecheck
```

## Production build

```bash
npm run build
```

Outputs to `dist/`, served by the Dockerfile's static-server stage in
production (with SPA fallback — all routes resolve to `index.html`).

## Railway deployment

1. Create a service in the same Railway project as the backend, from this
   GitHub repo (Railway detects the `Dockerfile` automatically).
2. **Before the first build**, set the service variable
   `VITE_API_BASE_URL` to the backend service's Railway domain (generate
   that domain first if you haven't — see the backend README). This is
   baked into the JS bundle at build time; changing it later requires a
   redeploy, not just a restart.
3. Settings → Networking → Generate Domain.
4. Go back to the backend service and set its `CORS_ORIGINS` variable to
   this frontend domain, so the browser can call the API.
