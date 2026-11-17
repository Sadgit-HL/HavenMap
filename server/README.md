# HavenTracker API

Server of the shared campaign record and the map turns. Design: `docs/ai/design/server-and-commit.md` and `docs/ai/design/map-integration.md`.

## Setup (2026-11-17)

| Part | Where | Notes |
|---|---|---|
| API code | Cloudflare Worker `haventracker-api` | code: `worker.js`, pasted into the dashboard editor and deployed there (no Wrangler, no Git connection) |
| Storage | Cloudflare KV namespace, bound as `DB` | eventually consistent (up to about a minute between locations) |
| Admin secret | Worker secret `ADMIN_TOKEN` | set in the dashboard only, never in the repo |
| Relay | Netlify project `tiny-profiterole-70fb6c` | uploaded by hand from `relay/` (`_redirects` forwards every request to the Worker); visitor protection off |
| Address | `https://api.penultimate.de/` | CNAME at goneo to `tiny-profiterole-70fb6c.netlify.app`; the domain's nameservers and mail stay at goneo |

Why the relay: web filters on the players' networks (work networks, a mobile carrier) block the new `*.workers.dev` address. They pass an established domain. Cloudflare can serve its own custom domain only when it runs the domain's DNS, and the owner keeps DNS and mail at goneo.

## Updating

- API: paste `worker.js` into the Worker's code editor in the Cloudflare dashboard and deploy.
- Relay: only when the Worker address changes. Edit `relay/_redirects` and upload the `relay` folder to the Netlify project again (Deploys, drag and drop).
- Allowed page addresses (CORS): `ORIGINS` at the top of `worker.js`.

## Check

`https://api.penultimate.de/` answers `{"app":"HavenTracker API","ok":true}`.
