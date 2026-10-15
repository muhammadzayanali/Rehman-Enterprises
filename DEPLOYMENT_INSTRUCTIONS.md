# Deploy Rehman Enterprises (free lifetime stack)

This is a **Django REST + React (Vite)** app. Do not follow Node/Mongo setup guides.

| Piece | Free service | Why |
| --- | --- | --- |
| Backend API | Render web service (free) | Sleeps after 15 minutes idle; first request can take ~30–50s |
| Database | **Supabase Postgres** | Django is SQL. Do **not** use MongoDB. Do **not** use Render Postgres (deleted after 30 days) |
| Images | Cloudinary | Render’s disk is wiped on every deploy |
| Frontend | Netlify | Later step — not required to bring the API live |

Local development still uses SQLite (`backend/db.sqlite3`). Production uses `DATABASE_URL`.

---

## 1. Create the free database (Supabase)

1. Sign up at [https://supabase.com](https://supabase.com) and create a project.
2. Project Settings → Database → **Connection string** → URI.
3. Use the **Transaction** pooler (port **6543**) for Render.
4. Replace `[YOUR-PASSWORD]` with the database password.
5. Copy the URI. Example shape:

```text
postgresql://postgres.xxxx:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

---

## 2. Create Cloudinary (images)

1. Sign up at [https://cloudinary.com](https://cloudinary.com).
2. From the dashboard copy **Cloud Name**, **API Key**, and **API Secret**.

---

## 3. Push this repo to GitHub

The project must be a GitHub repository so Render can build it.

```bash
cd "/Users/muhammadzayanali/Developer/rahman enterprises"
git init
git add .
git commit -m "Prepare Django API for Render + Supabase + Cloudinary"
# Create an empty GitHub repo named rehman-enterprises, then:
git remote add origin https://github.com/YOUR_USER/rehman-enterprises.git
git branch -M main
git push -u origin main
```

Never commit `backend/.env`, `backend/db.sqlite3`, or `backend/media/`.

---

## 4. Deploy the backend on Render

1. Sign up at [https://render.com](https://render.com) with GitHub.
2. **New +** → **Web Service** → select this repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python
   - **Build Command:** `chmod +x build.sh && ./build.sh`
   - **Start Command:** `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120`
   - **Instance type:** Free
   - **Health check path:** `/api/health/`
4. Environment variables:

| Key | Value |
| --- | --- |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_SECRET_KEY` | a long random string |
| `DJANGO_ALLOWED_HOSTS` | `.onrender.com` |
| `DATABASE_URL` | the Supabase URI from step 1 |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |
| `CLIENT_ORIGIN` | `http://localhost:5173` for now; later your Netlify URL |

5. Click **Deploy**. When it finishes, Render gives you a URL like `https://rehman-enterprises-api.onrender.com`.
6. Confirm: `https://YOUR-API.onrender.com/api/health/` returns `{"ok": true, ...}`.

First visit after idle can take 30–50 seconds while the free instance wakes up.

---

## 5. Load your existing catalog (optional)

A fresh Supabase database is empty. To copy local SQLite data:

```bash
cd backend
source venv/bin/activate
python manage.py dumpdata --natural-foreign --natural-primary \
  --exclude contenttypes --exclude auth.Permission --exclude sessions \
  -o catalog_dump.json
DATABASE_URL="YOUR_SUPABASE_URI" python manage.py loaddata catalog_dump.json
```

Then re-upload collection/product images in `/admin` so they land on Cloudinary (local `media/` files are not on Render).

Create the staff user on production:

```bash
# From Render Shell, or locally with DATABASE_URL set:
python manage.py createsuperuser
```

Or set `ADMIN_EMAIL` / `ADMIN_PASSWORD` and run `python manage.py seed_catalog` **once** (do not re-run it later or it may reset catalog rows).

---

## 6. Frontend (later)

On Netlify: base directory `frontend`, env `VITE_API_URL=https://YOUR-API.onrender.com/api`. Then set Render `CLIENT_ORIGIN` to the Netlify URL.
