// Prefer Vite env variable, fallback to localhost for dev
const VITE_API_URL = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
export const API_BASE = (VITE_API_URL && String(VITE_API_URL).trim()) || "http://localhost:5000";

export function api(path: string) {
  if (!path.startsWith("/")) path = "/" + path;
  return `${API_BASE}${path}`;
}
