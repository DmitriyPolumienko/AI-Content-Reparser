# AI Content Reparser

A SaaS application that converts YouTube videos into SEO-optimized content (articles, posts) using AI.

**Stack:** Next.js (App Router) + Tailwind CSS + Framer Motion (frontend), Python FastAPI (backend), Supabase (auth/db).

---

## Project Structure

```
AI-Content-Reparser/
├── frontend/   # Next.js App Router
└── backend/    # Python FastAPI
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

## Environment Variables

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | OpenAI API key (GPT-4.1) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon/service key |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/extract` | Extract transcript from YouTube URL |
| POST | `/api/generate` | Generate content from transcript |

---

## 🚀 Deployment

### Frontend (Vercel)
1. Import repo on [vercel.com/new](https://vercel.com/new)
2. Set **Root Directory** to `frontend`
3. Add env var: `NEXT_PUBLIC_API_URL` = your Render backend URL

### Backend (Render)
1. Create new Web Service on [render.com](https://render.com)
2. Connect this repo
3. Set **Root Directory** to `backend`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add env vars: `OPENAI_API_KEY`, `ALLOWED_ORIGINS` = your Vercel frontend URL
