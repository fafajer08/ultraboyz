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

This is a two-piece app (a Postgres-backed API + a static React build), so you're
deploying three things: a database, the backend, and the frontend. A few solid,
current combinations:

**Simplest — frontend + backend + DB, mostly free**
- **Database:** [Neon](https://neon.tech) or [Supabase](https://supabase.com) — both give you a
  permanent free Postgres instance (no 30/90-day expiry), just paste the connection
  string into `server/.env`.
- **Backend:** [Render](https://render.com) — deploy `server/` as a Web Service (Node).
  Free tier exists but spins down after inactivity and takes ~30–60s to wake back up;
  the $7/mo Starter tier removes that if it matters for a demo.
- **Frontend:** [Vercel](https://vercel.com) or [Netlify](https://netlify.com) — deploy `client/` as a
  static/Vite site, both free for hobby projects. Set an environment variable or
  `vite.config.js` proxy override pointing at your Render backend URL instead of
  `localhost:4000`.

**All-in-one alternative**
- **[Railway](https://railway.app)** — can host the Node backend, a Postgres database, and
  (with a static-site buildpack) the frontend all in one project. No permanent free
  tier anymore (moved to a one-time trial credit), but the visual project graph makes
  wiring a PERN app together fast, and small hobby usage is inexpensive.

**Before deploying**
1. Set a strong, random `JWT_SECRET` in production — never reuse the example one.
2. Update `client/vite.config.js`'s proxy (dev-only) — in production, either serve the
   API from the same domain/subdomain as the frontend, or set `VITE_API_URL` and update
   `apiFetch` in `AuthContext.jsx` to prefix it, since Vite's dev proxy doesn't apply
   to a production build.
3. Run `schema.sql` + `seed-events.sql` + `seed-users.js` against your **production**
   database, not just your local one.
4. Immediately log in as the seeded admin and change the default password.
