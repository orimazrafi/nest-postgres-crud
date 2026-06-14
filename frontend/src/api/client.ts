/** Base URL for API calls. Empty string uses same origin (nginx/Vite proxy). */
const API_BASE = import.meta.env.VITE_API_URL ?? '';

type ApiErrorBody = {
  message?: string | string[];
  statusCode?: number;
};

/** Thrown when the API returns a non-2xx response. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Parses Nest validation errors into a single message string. */
function formatErrorMessage(body: ApiErrorBody, fallback: string): string {
  if (!body.message) {
    return fallback;
  }
  return Array.isArray(body.message) ? body.message.join(', ') : body.message;
}

/** Sends a JSON request to the API with session cookies included. */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as ApiErrorBody;
      message = formatErrorMessage(body, message);
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
