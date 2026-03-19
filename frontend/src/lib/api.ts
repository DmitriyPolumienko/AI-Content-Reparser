const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface ExtractResponse {
  transcript: string;
  word_count: number;
}

export interface GenerateResponse {
  content: string;
  chars_used: number;
  chars_remaining: number;
  words_used: number;
  words_remaining: number;
  videos_processed: number;
}

export interface SymbolPackage {
  id: string;
  symbols: number;
  price_usd: number;
}

export interface OverLimitDetail {
  code: "over_limit";
  message: string;
  chars_remaining: number;
  packages: SymbolPackage[];
  billing_note: string;
}

export interface GenerateParams {
  transcript: string;
  content_type: string;
  keywords: string[];
  user_id?: string;
  tone_of_voice?: string;
  target_min_chars?: number;
  target_max_chars?: number;
  language?: string;
  include_source_link?: boolean;
  video_url?: string | null;
}

export type StreamEvent =
  | { type: "start" }
  | { type: "delta"; text: string }
  | { type: "end"; chars_remaining: number; videos_processed: number; generation_id?: string | null }
  | { type: "error"; code: string; message: string; packages?: SymbolPackage[]; billing_note?: string; chars_remaining?: number };

export interface GenerationHistoryItem {
  id: string;
  content_type: string;
  title: string | null;
  video_url: string | null;
  created_at: string;
  /** Only present when fetching a single item by id */
  content?: string;
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

export async function generateContent(params: GenerateParams): Promise<GenerateResponse> {
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

/**
 * Stream content generation using SSE from /api/generate/stream.
 * Calls onEvent for each parsed SSE event.
 * Returns a cleanup function to abort the stream.
 */
export function streamGenerateContent(
  params: GenerateParams,
  onEvent: (event: StreamEvent) => void,
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/generate/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: "mock-user-123", ...params }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errBody = await res.json().catch(() => ({}));
        onEvent({
          type: "error",
          code: "http_error",
          message: errBody.detail ?? "Failed to start content generation.",
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.slice(6)) as StreamEvent;
              onEvent(event);
            } catch {
              // ignore malformed SSE lines
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        onEvent({
          type: "error",
          code: "network_error",
          message: (err as Error).message ?? "Network error during streaming.",
        });
      }
    }
  })();

  return controller;
}

/** List recent generations for a user (metadata only, no content). */
export async function listGenerations(
  userId: string,
  limit = 10,
): Promise<GenerationHistoryItem[]> {
  try {
    const res = await fetch(
      `${API_BASE}/api/history?user_id=${encodeURIComponent(userId)}&limit=${limit}`,
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Fetch a single saved generation by id (includes full content). */
export async function getGeneration(id: string): Promise<GenerationHistoryItem | null> {
  try {
    const res = await fetch(`${API_BASE}/api/history/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

