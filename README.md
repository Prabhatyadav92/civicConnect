# CivicConnect: first 30 days

This is the build for Phases 1 and 2 of the 90-day plan: a citizen can report an
issue with photos, video and a map location, and a department official can see it,
review it and move it through to resolution. Issue categories are chosen by the
citizen for now. AI classification starts in Phase 3 (day 31).

## What works

Citizens
- Create an account, sign in, sign out
- Report an issue with 1 to 4 photos or videos, a category, a title, details and a location
  (GPS button, tap the map, or drag the pin)
- See all of their reports and follow each one on a status line:
  Submitted, Assigned, In progress, Resolved (or Rejected, with the reason)

Officials and admins
- Department queue with filters by status and category, and summary figures
- Open a report to review the evidence and location, then move it to its next status with a note
- Officials only see reports routed to their own department. Admins see everything.

Platform
- Each category is routed to a department when the report is created
- Status changes follow fixed rules (for example, a report cannot jump from Submitted to Resolved)
- Every status change is kept in the report's history

## Run it locally

You need Node 18.18 or newer and MongoDB. `docker compose up -d` starts MongoDB for you.

```bash
# 1. Database (skip if you already run MongoDB)
docker compose up -d

# 2. API
cd server

npm install
npm run seed                # creates departments and demo accounts
npm run dev                

# 3. Web app (new terminal)
cd client
npm install
npm run dev                 
```

Demo accounts created by `npm run seed` (password `ChangeMe123!`, change it with `SEED_PASSWORD`):

| Role | Email |
|---|---|
| Citizen | citizen@civicconnect.local |
| Admin | admin@civicconnect.local |
| Roads and Works officer | roads@civicconnect.local |
| Sanitation officer | sanitation@civicconnect.local |
| Water Supply officer | water@civicconnect.local |
| Electricity and Lighting officer | lighting@civicconnect.local |
| General Administration officer | general@civicconnect.local |

Try it: sign in as the citizen, report a pothole, then sign in as `roads@civicconnect.local`
and move it along.

Run the tests with `cd server && npm test`.

## API

| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | /api/meta | anyone | Categories, statuses, allowed status moves, departments |
| POST | /api/auth/register | anyone | Create a citizen account |
| POST | /api/auth/login | anyone | Sign in |
| GET | /api/auth/me | signed in | Current user |
| POST | /api/reports | citizen | Create a report (multipart, field `media` up to 4 files) |
| GET | /api/reports/mine | signed in | Your reports |
| GET | /api/reports | official, admin | Queue (`status`, `category`, `page`, `limit`) |
| GET | /api/reports/stats | official, admin | Dashboard figures |
| GET | /api/reports/:id | owner, department, admin | One report |
| PATCH | /api/reports/:id/status | official, admin | Move to the next status |

## Project layout

```
server/src
  models/        User, Report (2dsphere location index), Department
  routes/        auth, reports, meta
  middleware/    auth + roles, upload (type and size checks), error handler
  lib/constants  categories, statuses, allowed transitions, routing table
  seed.js        departments and demo accounts
client/src
  pages/         AuthPage, NewReport, MyReports, ReportDetail, Dashboard
  components/    Layout, StatusTrack, StatusBadge, LocationMap
  lib/           api client, shared metadata helpers
```

## Decisions to know about

- Uploads are stored on local disk (`server/uploads`) behind one small module, so the
  plan's move to Cloudinary only touches `middleware/upload.js` and the media URLs.
- Only JPG, PNG, WebP, MP4 and WebM are accepted, 20 MB each. File extensions come from
  the verified type, not the uploaded filename.
- Public sign-up only creates citizens. Officials and admins are created by the seed
  script for now. An admin screen for this is a good Phase 5 item.
- Maps use OpenStreetMap tiles. Set `VITE_DEFAULT_CENTER` to your city (`lat,lng`) so the
  map opens in the right place before a location is chosen.

## Not built yet (later phases)

- Phase 3: AI image classification, severity scoring, FastAPI service
- Phase 4: duplicate detection, priority ranking, notifications, analytics, public view
- Phase 5: broader automated tests, security review, production deployment
