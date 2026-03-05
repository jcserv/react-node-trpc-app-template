export function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    console.warn("Failed to parse JSON:", raw.slice(0, 100));
    return fallback;
  }
}
