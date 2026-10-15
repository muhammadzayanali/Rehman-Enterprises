# Rehman Enterprises / Heritage Home Decore

Premium handmade-rug company site with a lightweight catalog CMS.

```text
frontend/   React public site + admin CMS
backend/    Django REST API + SQLite + media
```

Local stack:

```text
React  → http://localhost:5173
Django → http://localhost:8000
SQLite → backend/db.sqlite3
Media  → backend/media/
```

## Backend

Use Python 3.11+ (Django 5). On this machine:

```bash
cd backend
/usr/local/bin/python3.13 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_catalog
python manage.py runserver
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`. `seed_catalog` writes that staff user into SQLite.

Developer Django Admin is at:

```text
http://localhost:8000/django-admin/
```

The customer-facing CMS is the React admin at `/admin`.

## Run the full website (every time)

Open two terminals.

**Terminal 1 — backend**

```bash
cd "/Users/muhammadzayanali/Developer/rahman enterprises/backend"
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 — frontend**

```bash
cd "/Users/muhammadzayanali/Developer/rahman enterprises/frontend"
npm run dev
```

Then open:

- Website: http://localhost:5173
- Customer login: http://localhost:5173/login
- Admin CMS: http://localhost:5173/admin
- Django API: http://localhost:8000/api
- Developer Django Admin: http://localhost:8000/django-admin/

Admin login: `admin@gmail.com` / `1234567`  
Customer login: `user@gmail.com` / `1234567`

First-time setup only:

```bash
cd backend
/usr/local/bin/python3.13 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py seed_catalog
python manage.py runserver
```

```bash
cd frontend
npm install
npm run dev
```

Environment:

```text
VITE_API_URL=http://localhost:8000/api
```

## How the catalog works

Collections on Shop are **categories** (Abshar, Aslan, Fine Mughal, runners, and so on). Each category uses the image from `frontend/public/product/`. Clicking a collection opens the products in that category. For the first catalog, each product reuses its category image until unique photos are uploaded in admin.
