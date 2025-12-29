export const API_BASE = "http://localhost:5000";

export function api(path: string) {
  if (!path.startsWith("/")) path = "/" + path;
  return `${API_BASE}${path}`;
}
