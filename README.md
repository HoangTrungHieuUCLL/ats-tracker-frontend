# ATS Keyword Tracker — Frontend

Vite + React + TypeScript frontend for the ATS Keyword Tracker.

**Status:** not yet built. The frontend is built in phases 5–6 of the build
plan (auth + Jobs/Job detail pages, then the Dashboard page). This repo is
scaffolded now so both services exist as sibling repos from the start.

## Local setup (once the app exists)

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to the backend's
   URL (e.g. `http://localhost:8000`).
2. `npm install`
3. `npm run dev`

## Railway deployment

`VITE_API_BASE_URL` is embedded at build time. On Railway, set it as a
service variable *before* the first build; changing it later requires a
redeploy.
