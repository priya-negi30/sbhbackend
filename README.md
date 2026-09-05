# SBH Hospital — Backend API

Node.js + Express + SQL Server (Sequelize) backend that powers the SBH Hospital admin panel and public website. Manages **Doctors**, **Gallery**, **Career (Jobs + Applications)**, and **Blogs**.

## 1. Requirements
- Node.js 18+
- Microsoft SQL Server (Azure SQL Database, AWS RDS for SQL Server, or any reachable SQL Server 2016+ instance)

## 2. Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your SQL Server credentials:

```
DB_HOST=your-sql-server-host.database.windows.net
DB_PORT=1433
DB_NAME=sbh_hospital
DB_USER=your_sql_username
DB_PASSWORD=your_sql_password
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false
JWT_SECRET=change_this_to_a_long_random_secret
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
PUBLIC_URL=http://localhost:5000
```

`DB_ENCRYPT=true` is required by most cloud SQL Server providers (Azure SQL included) — only set it to `false` for a local/on-prem SQL Server without a valid TLS certificate. If you hit certificate errors against a self-hosted instance, try `DB_TRUST_SERVER_CERTIFICATE=true` instead of disabling encryption.

Create the database itself first (tables are created automatically on first run):

```sql
CREATE DATABASE sbh_hospital;
```

## 3. Seed sample data + default admin login

```bash
npm run seed
```

This creates:
- Default admin login → configurable via `.env` (`DEFAULT_ADMIN_EMAIL` / `DEFAULT_ADMIN_PASSWORD`), default: `admin@sbhhospital.com` / `Admin@123`
- 10 sample doctors, 5 sample jobs, 18 gallery placeholder rows, and 5 blog posts (pulled from your existing frontend content)

**⚠️ Change the default admin password after first login, and never commit `.env` to version control.**

## 4. Run the server

```bash
npm run dev      # with auto-reload (nodemon)
# or
npm start        # plain node
```

Server runs at `http://localhost:5000` by default. Health check: `GET /api/health`.

## 5. API Overview

### Public endpoints (used by the main website)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctors` | List active doctors |
| GET | `/api/doctors/:id` | Get one doctor |
| GET | `/api/gallery` | List gallery images (optional `?category=`) |
| GET | `/api/jobs` | List open job postings |
| GET | `/api/jobs/:id` | Get one job |
| POST | `/api/jobs/:id/apply` | Submit a job application (multipart, field `resume`) |
| GET | `/api/blogs` | List published blog posts (optional `?category=`) |
| GET | `/api/blogs/:permalink` | Get one blog post by slug |

### Admin endpoints (require `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Current admin profile |
| POST | `/api/auth/change-password` | Change password |
| POST/PUT/DELETE | `/api/doctors[/:id]` | Manage doctors (multipart `image` field for photo) |
| POST/PUT/DELETE | `/api/gallery[/:id]` | Manage gallery (multipart `images` field, up to 20 files) |
| POST/PUT/DELETE | `/api/jobs[/:id]` | Manage job postings |
| GET | `/api/jobs/:id/applications` | Applications for one job |
| GET | `/api/applications` | All applications (all jobs) |
| PATCH | `/api/applications/:id/status` | Update application status |
| POST/PUT/DELETE | `/api/blogs[/:id]` | Manage blog posts (multipart `image` field for cover, JSON `content` for rich blocks) |

Uploaded files are served statically from `/uploads/...` (e.g. `http://localhost:5000/uploads/doctors/xyz.png`).

## 6. Project Structure

```
backend/
  src/
    config/db.js          # Sequelize connection
    models/                # Doctor, GalleryImage, Job, JobApplication, Blog, Admin
    middleware/             # JWT auth, Multer upload, error handler
    controllers/            # Business logic per resource
    routes/                 # Express routers
    utils/seed.js           # Seeds admin + sample data
    app.js / server.js      # Express app + entrypoint
  uploads/                  # Uploaded images/resumes (served statically)
```

## 7. Deploying

### Deploying to Vercel

This project includes `api/index.js` (the actual serverless entry point Vercel invokes) and a `vercel.json` pointing to it explicitly — this avoids ambiguity since `src/app.js`/`src/server.js` also match Vercel's auto-detected Express file locations, which can otherwise result in a 404 if the wrong one is picked.

Two things **must** be done before this will fully work on Vercel:

1. **Use a remote SQL Server host.** Vercel's servers can't reach a database on `localhost`. Point `DB_HOST`/`DB_USER`/`DB_PASSWORD` at a cloud-reachable SQL Server instance (Azure SQL Database, AWS RDS for SQL Server, etc.).
2. **Create the database schema once, from your machine, before first use** — pointing your local `.env` at the same remote database:
   ```bash
   npm run seed
   ```
   This runs `sequelize.sync()` (creates all tables) and seeds the default admin + sample data. The serverless entry point (`api/index.js`) intentionally does **not** run this automatically on every cold start (that would be slow and unsafe under concurrent invocations) — so this is a one-time (or per-schema-change) step, not something that happens on deploy.
3. **File uploads won't persist** on Vercel's filesystem (`multer` writes to local disk, which is ephemeral/read-only in this environment, and `express.static()` isn't supported there either). If you're deploying here, uploads need to be moved to a cloud storage provider (e.g. Vercel Blob, S3, Cloudinary) — ask if you'd like this wired up.

Then deploy:
```bash
npm i -g vercel
vercel        # first deploy
vercel --prod # promote to production
```
Set all your `.env` values as Environment Variables in the Vercel dashboard (Project → Settings → Environment Variables), including `PUBLIC_URL` set to your deployed URL (e.g. `https://sbh-api.vercel.app`) so returned image/resume URLs are correct.

### Deploying elsewhere (traditional Node host / VPS / cPanel)
- Set `NODE_ENV=production`, a strong `JWT_SECRET`, and real `CORS_ORIGINS` for your live frontend + admin panel domains.
- Set `PUBLIC_URL` to your backend's public domain so returned image/resume URLs are correct.
- Put this behind a reverse proxy (Nginx) with HTTPS in production. Local disk uploads and a local/on-prem SQL Server work as-is — no code changes needed, unlike the Vercel path above.

