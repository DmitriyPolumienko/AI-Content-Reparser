# AI Content Reparser

> Transform YouTube videos into SEO articles, LinkedIn posts, and Twitter threads instantly with AI.

## 🎨 Premium Dark Theme SaaS Application

Built with **Next.js 16 + Framer Motion** (frontend) and **Python FastAPI** (backend).

---

## 📁 Project Structure

```
AI-Content-Reparser/
├── frontend/          # Next.js App Router + Tailwind CSS + Framer Motion
│   └── src/
│       ├── app/       # Landing page + Dashboard
│       ├── components/
│       │   ├── effects/   # Visual effect components (GradientOrbs, StarField, etc.)
│       │   ├── landing/   # Landing page sections
│       │   ├── dashboard/ # Dashboard step components
│       │   └── ui/        # Base UI components
│       └── lib/           # API client + Supabase
└── backend/           # Python FastAPI
    └── app/
        ├── routers/       # API endpoints
        ├── services/      # AI generator + video extractors + balance
        └── models/        # Pydantic schemas
```

## 🚀 Quick Start

### Frontend
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
uvicorn main:app --reload
```

## ✨ Features

- **Hero section** with animated gradient orbs, star field, and typewriter effect
- **Bento grid features** with spotlight hover effects
- **Infinite marquee** social proof bar
- **Premium pricing** cards with monthly/annual toggle
- **Dark glass morphism** UI throughout
- **4-step dashboard** with skeleton loaders and toast notifications
- **GPT-4.1 content generation** (SEO articles, LinkedIn posts, Twitter threads)
- **YouTube transcript extraction** with extensible extractor architecture

