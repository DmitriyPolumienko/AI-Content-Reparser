const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? 'API error');
  }
  return res.json() as Promise<T>;
}

export interface ExtractResponse {
  subtitles: string;
  video_id: string;
  title: string | null;
}

export interface GenerateResponse {
  content: string;
  words_used: number;
  tokens_left: number;
}

export async function extractSubtitles(url: string): Promise<ExtractResponse> {
  return apiFetch<ExtractResponse>('/api/extract', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export async function generateContent(payload: {
  subtitles: string;
  content_type: string;
  keywords: string[];
  user_id?: string;
}): Promise<GenerateResponse> {
  return apiFetch<GenerateResponse>('/api/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
