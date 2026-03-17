# V2Post

A SaaS application that converts YouTube videos into SEO-optimized content (articles, posts) using AI.

**Stack:** Next.js (App Router) + Tailwind CSS + Framer Motion (frontend), Python FastAPI (backend), Supabase (auth/db).

---

## Project Structure

```
AI-Content-Reparser/
├── frontend/   # Next.js App Router
└── backend/    # Python FastAPI
    └── supabase/
        └── migrations/  # SQL migration files
```

---

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in your keys
uvicorn main:app --reload
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## Supabase Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the database migration

Open **Supabase Dashboard → SQL Editor**, paste the contents of
`backend/supabase/migrations/001_initial_schema.sql`, and run it.

This creates the following tables with Row Level Security enabled:

| Table | Description |
|---|---|
| `users` | Extends `auth.users` with word-limit balance |
| `transcripts` | Extracted YouTube transcripts per user |
| `generated_content` | AI-generated articles / posts per user |

### 3. Configure environment variables

Add the Supabase credentials to your backend and frontend `.env` files (see
[Environment Variables](#environment-variables) below).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key (GPT-4.1) |
| `OPENAI_MODEL` | OpenAI model name (default: `gpt-4.1`) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |
| `ALLOWED_ORIGINS_REGEX` | Regex pattern for dynamic CORS origins (default: `https://.*\.vercel\.app`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase **service role** secret key (server-side only) |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon** (publishable) key |

> ⚠️ **Security:** Never expose the service role key on the frontend.
> The frontend only uses the anon key; the backend uses the service role key.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check (used by Render) |
| POST | `/api/extract` | Extract transcript from YouTube URL |
| POST | `/api/generate` | Generate content from transcript |

---

## Troubleshooting

### Transcript extraction fails

- **"Transcripts are disabled"** – The video owner has disabled captions. Try a different video.
- **"No transcript found"** – The video has no English or Russian captions. Try adding `&hl=en` to the URL or choose a video with captions.
- **Private / age-restricted videos** – These cannot be accessed without authentication.

---

## 🚀 Deployment

### Frontend (Vercel)
1. Import repo on [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `frontend`
3. Add env vars:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
4. Deploy

### Backend (Render)
1. Create new Web Service on [render.com](https://render.com)
2. Connect GitHub repo
3. Set **Root Directory** to `backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add env vars:
   - `OPENAI_API_KEY` = your OpenAI key
   - `OPENAI_MODEL` = `gpt-4.1`
   - `ALLOWED_ORIGINS` = your Vercel frontend URL
   - `ALLOWED_ORIGINS_REGEX` = (optional) regex for Vercel preview URLs
   - `SUPABASE_URL` = your Supabase project URL
   - `SUPABASE_KEY` = your Supabase service role key
7. Deploy

### Connecting Frontend ↔ Backend
- In Vercel: set `NEXT_PUBLIC_API_URL` to your Render service URL (e.g., `https://v2post-api.onrender.com`)
- In Render: set `ALLOWED_ORIGINS` to your Vercel URL (e.g., `https://ai-content-reparser.vercel.app`)

