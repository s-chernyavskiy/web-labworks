/** In Docker, nginx proxies `/api/*` to the Nest app; locally use the dev server URL. */
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '/api');

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  userId?: string;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const userId =
    options.userId ??
    (() => {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return undefined;
      try {
        return (JSON.parse(raw) as { id?: string }).id;
      } catch {
        return undefined;
      }
    })();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(userId ? { 'user-id': userId } : {}),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
