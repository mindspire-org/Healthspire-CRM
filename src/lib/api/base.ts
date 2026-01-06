// Prefer Vite env variable, fallback to localhost for dev
const VITE_API_URL = (import.meta as any)?.env?.VITE_API_URL as string | undefined;

function computeApiBase() {
  const raw = (VITE_API_URL && String(VITE_API_URL).trim()) || "";
  if (raw) {
    // If env accidentally points to the frontend dev server origin, fallback to :5000
    try {
      if (typeof window !== "undefined") {
        const envUrl = new URL(raw, window.location.origin);
        const appOrigin = window.location.origin;
        if (envUrl.origin === appOrigin) {
          return `http://${window.location.hostname}:5000`;
        }
      }
    } catch {
      // If it's not a valid URL, ignore and fallback
    }
    return raw;
  }

  // More robust fallback: try common backend ports
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // Try 5000 first (common Flask/Django port), then 3001, then 8000
    return `http://${hostname}:5000`;
  }

  return "http://localhost:5000";
}

export const API_BASE = computeApiBase();

export function api(path: string) {
  if (!path.startsWith("/")) path = "/" + path;
  return `${API_BASE}${path}`;
}
