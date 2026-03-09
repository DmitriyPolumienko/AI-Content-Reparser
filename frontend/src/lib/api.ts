const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface ExtractResponse {
  transcript: string;
  word_count: number;
}

export interface GenerateResponse {
  content: string;
  words_used: number;
  words_remaining: number;
}

export async function extractTranscript(url: string): Promise<ExtractResponse> {
  const res = await fetch(`${API_BASE}/api/extract`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Failed to extract transcript.");
  }

  return res.json();
}

export async function generateContent(params: {
  transcript: string;
  content_type: string;
  keywords: string[];
  user_id?: string;
}): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: "mock-user-123", ...params }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Failed to generate content.");
  }

  return res.json();
}
