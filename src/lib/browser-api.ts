const browserBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const csrfCookie = 'bookstore_csrf=';
const requestTimeoutMs = 10_000;

function csrfToken() {
  if (typeof document === 'undefined') return undefined;
  return document.cookie.split(';').map(part => part.trim()).find(part => part.startsWith(csrfCookie))?.slice(csrfCookie.length);
}

export class BrowserApiError extends Error {
  constructor(public readonly status: number, message: string) { super(message); }
}

/** A network failure is distinct from an API response such as 401 or 403. */
export class BrowserApiUnavailableError extends Error {
  constructor() {
    super('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
  }
}

export async function browserApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (init.body && !isFormData && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(init.method?.toUpperCase() ?? 'GET')) {
    const token = csrfToken();
    if (token) headers.set('X-CSRF-Token', token);
  }
  // fetch has no timeout by default. A disconnected API must never leave a
  // route gate or a submit button in a permanent loading state.
  const controller = new AbortController();
  const abortFromCaller = () => controller.abort();
  init.signal?.addEventListener('abort', abortFromCaller, { once: true });
  const timeout = window.setTimeout(() => controller.abort(), isFormData ? 30_000 : requestTimeoutMs);

  let response: Response;
  try {
    response = await fetch(`${browserBase}${path}`, {
      ...init,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (error) {
    if (!init.signal?.aborted) throw new BrowserApiUnavailableError();
    throw error;
  } finally {
    window.clearTimeout(timeout);
    init.signal?.removeEventListener('abort', abortFromCaller);
  }
  if (response.status === 204) return undefined as T;
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'message' in body && typeof body.message === 'string'
      ? body.message : `Yêu cầu thất bại (${response.status})`;
    throw new BrowserApiError(response.status, message);
  }
  return body as T;
}
