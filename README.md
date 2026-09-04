# Ultraboyz Run Crew 🏃

An ultramarathon crew site with accounts and roles: register/log in, an admin
dashboard for managing the roster and race calendar, a member dashboard for
editing your own profile, member trading cards, and an events board (upcoming
+ recent, with photo galleries). Built with **Chakra UI** — light/dark mode
toggle, responsive Drawer nav on mobile, all included out of the box.

**Stack:** PostgreSQL · Express (JWT auth) · React (Vite + React Router + Chakra UI) · Node

## Project layout
```
ultraboyz/
  server/
    db/
      schema.sql        table structure
      seed-events.sql   sample events + photos (plain SQL)
      seed-users.js     admin + 8 crew accounts, run with Node (hashes passwords)
    src/
      middleware/auth.js   JWT verification, requireAuth, requireAdmin
      routes/  auth.js, members.js, events.js
  client/
    src/
      pages/   Home, About, Events, EventDetail, Members, Login, Register,
               Dashboard (routes to AdminDashboard or UserDashboard by role)
      context/ AuthContext (JWT + user), ThemeContext (light/dark)
```

## Roles & permissions

| Action | Anyone (logged out) | Member (`user`) | Admin |
|---|---|---|---|
| View crew, view events | ✅ | ✅ | ✅ |
| Register / log in | ✅ | — | — |
| Edit **own** profile | — | ✅ | ✅ |
| Edit **another** member's profile | — | ❌ | ✅ |
| Edit an **admin's** profile | — | ❌ (blocked even if somehow attempted) | ✅ |
| Add a crew member (with login) | — | ❌ | ✅ |
| Delete a member | — | ❌ | ✅ |
| Add a photo to an **upcoming** event | — | ❌ | ✅ |
| Add a photo to a **recent** event | — | ✅ | ✅ |
| Create / edit / delete events | — | ❌ | ✅ (full CRUD) |

All of this is enforced **server-side** in `members.js` / `events.js`, not just hidden in the UI.

## 1. Database

```bash
createdb ultraboyz
psql -d ultraboyz -f server/db/schema.sql
psql -d ultraboyz -f server/db/seed-events.sql
```

## 2. API server

```bash
cd server
cp .env.example .env        # set your Postgres credentials + a real JWT_SECRET
npm install
npm run seed:users          # creates the admin + 8 crew logins (hashed passwords)
npm run dev                 # http://localhost:4000
```

**Default logins after seeding** (change these from the dashboard once you're in):
- Admin: `admin@ultraboyz.club` / `Ultraboyz2026!`
- Any crew member, e.g. `jerwin.maguyon@ultraboyz.club` / `Welcome123!`

### Step-by-step: logging in / registering

1. **Both servers must be running.** The API (`npm run dev` in `server/`, on
   `:4000`) *and* the frontend (`npm run dev` in `client/`, on `:5173`). If the
   API isn't running, the Login/Register pages will show an error when you
   submit — they need a real backend, they don't fall back to sample data
   like the public pages do.
2. **Did you run `npm run seed:users`?** If you skip this step, the `users`
   table is empty and *no* email/password will work — including the admin
   ones above. This is the #1 reason "I can't log in."
3. Open `http://localhost:5173` in your browser.
4. To log in as an existing account: click **Log in** in the nav (or the
   hamburger menu on mobile) → enter one of the seeded emails/passwords above
   → you'll land on `/dashboard`, which shows the Admin or Member view
   depending on that account's role.
5. To create a brand-new member account instead: click **Register** → fill in
   name, optional nickname, email, and a password (8+ characters) → this
   calls `POST /api/auth/register`, logs you in immediately, and takes you to
   your (member-role) dashboard. Self-registered accounts are always regular
   members — only an existing admin can promote someone to admin, from the
   Members tab of the Admin Dashboard.
6. If login still fails, open your browser's dev tools → Network tab → find
   the failed `/api/auth/login` request → its response body will say exactly
   why (wrong password, no account with that email, etc.) rather than a
   generic error.

Endpoints:
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/members`, `GET /api/members/:id`, `POST /api/members` (admin), `PUT /api/members/:id` (self/admin), `DELETE /api/members/:id` (admin)
- `GET /api/events`, `GET /api/events/:id`, `POST /api/events` (admin), `PUT /api/events/:id` (admin), `DELETE /api/events/:id` (admin)
- `POST /api/events/:id/photos` (any logged-in user, recent events only — admin can add to any), `DELETE /api/events/:id/photos/:photoId` (admin)
- `POST /api/uploads` (any logged-in user) — upload an image file (JPG/PNG/WEBP/GIF, 5MB max), returns `{ url: "/uploads/xxxx.jpg" }`. Every photo field in the app (profile photo, event cover, gallery photos) has an "Upload from device" button that calls this and fills the URL in automatically — pasting a link still works too.

Uploaded files land in `server/uploads/` and are served back out at `http://localhost:4000/uploads/...`. That folder isn't committed to git (see `.gitignore`) — **if you deploy to a host with an ephemeral filesystem** (most serverless/free-tier platforms wipe local files on every redeploy), uploaded photos will disappear. For anything beyond local use, swap the storage in `server/src/routes/uploads.js` for a real object store (Cloudinary, S3, Supabase Storage) — the endpoint's shape (`POST` a file, get back a URL) stays the same either way.

## 3. Frontend

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

If the API isn't running, public pages (Home/About/Events/Crew) fall back to sample data
so nothing looks broken while you finish setting up Postgres. Login/Register/Dashboard
need the real API, since they're not meaningful with fake data.

## Customizing

- **Roster / events**: `server/db/seed-events.sql` and `seed-users.js`, or manage everything
  live from the Admin Dashboard once logged in.
- **Theme**: the light switch in the navbar toggles `data-theme` on `<html>`; colors live at
  the top of `client/src/index.css`.
- **JWT_SECRET**: change this in `.env` before deploying — the example value is not secure.

---

## Deploying it

This walkthrough uses a specific, free-to-start combination: **Neon** (database) +
**Render** (API) + **Vercel** (frontend). Any equivalent host works the same way —
the steps below just make it concrete instead of abstract.

### 1. Push your code to GitHub

Both `server/` and `client/` need to live in a git repo that Render/Vercel can pull
from (they don't accept zip uploads for auto-deploys). Create a repo, commit
everything **except** `node_modules/`, `.env`, and `server/uploads/*` (already
covered by `server/.gitignore` — add a matching one for `client/` if you don't
already have one: `node_modules/`, `.env`, `dist/`).

### 2. Database — Neon

1. Sign up at [neon.tech](https://neon.tech), create a project.
2. Copy the connection string it gives you (starts with `postgresql://...`).
3. Run your schema and seed data against it. Easiest way: paste each file's
   contents into Neon's built-in SQL Editor (in their dashboard) and run them
   in order — `schema.sql`, then `seed-events.sql`. Or from your terminal:
   ```bash
   psql "postgresql://<your-neon-connection-string>" -f server/db/schema.sql
   psql "postgresql://<your-neon-connection-string>" -f server/db/seed-events.sql
   ```
4. `seed-users.js` is a Node script, not SQL, so it needs to run with
   `DATABASE_URL` pointed at Neon. Simplest way: temporarily set
   `DATABASE_URL=<your-neon-string>` in your **local** `server/.env`, run
   `npm run seed:users` once from your machine, then switch `.env` back to
   your local database. (This only has to happen once, ever, per environment.)

### 3. Backend — Render

1. Sign up at [render.com](https://render.com), **New → Web Service**, connect your
   GitHub repo, set **Root Directory** to `server`.
2. Build command: `npm install`. Start command: `npm start`.
3. Under Environment, add these variables:
   - `DATABASE_URL` — your Neon connection string
   - `JWT_SECRET` — generate one with:
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
     Paste the output in. Never reuse the example value from `.env.example`.
   - `CORS_ORIGIN` — leave blank for now, you'll fill this in after step 4
   - `PORT` — Render sets this automatically, you don't need to add it
4. Deploy. Once it's live, copy the Render URL (e.g. `https://ultraboyz-api.onrender.com`).

### 4. Frontend — Vercel

1. Sign up at [vercel.com](https://vercel.com), **Add New → Project**, connect the
   same repo, set **Root Directory** to `client`.
2. Framework preset: Vite. Build command `npm run build`, output directory `dist`
   (Vercel usually detects these automatically).
3. Add an environment variable: `VITE_API_URL` = your Render URL from step 3
   (e.g. `https://ultraboyz-api.onrender.com`, no trailing slash).
4. Deploy. Copy the Vercel URL it gives you (e.g. `https://ultraboyz.vercel.app`).

### 5. Close the loop

Go back to Render → your service → Environment → set `CORS_ORIGIN` to your Vercel
URL from step 4 → save (Render redeploys automatically). This locks the API down
so only your actual site can call it.

### 6. Log in and lock down the admin account

1. Open your Vercel URL.
2. Log in with the seeded admin: `admin@ultraboyz.club` / `Ultraboyz2026!`.
3. Go to **Dashboard → Members**, find your own admin row, click **Edit**, fill
   in **Reset password** with something only you know, **Save changes**.
4. Do the same for any crew members still on the shared `Welcome123!` password
   — or just tell them to log in and change it themselves from their own
   dashboard.

That's it — send your co-runners the Vercel link.

### If something's not loading after deploy

- **Blank page / API errors in the browser console:** almost always `VITE_API_URL`
  is missing or wrong on Vercel, or `CORS_ORIGIN` on Render doesn't exactly match
  your Vercel URL (no trailing slash, correct `https://`).
- **"relation does not exist" errors:** the production database is missing
  `schema.sql` — go back to step 2.
- **Can't log in at all:** `seed-users.js` was never run against the production
  database — also step 2.
- **Uploaded photos don't show up after a while:** Render's free tier filesystem
  isn't permanent across redeploys. Fine for a demo; for something you'll keep
  using, swap `server/src/routes/uploads.js` to upload to Cloudinary or S3
  instead of local disk.
