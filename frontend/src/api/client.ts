import { firebaseAuth } from '../lib/firebase';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

async function getAuthToken(): Promise<string | null> {
  const user = firebaseAuth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(false);
  } catch {
    return null;
  }
}

async function buildHeaders(extra?: HeadersInit): Promise<HeadersInit> {
  const token = await getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export async function apiClient(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = await buildHeaders(options.headers as HeadersInit);

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Token expired — force-refresh and retry once
  if (response.status === 401) {
    const user = firebaseAuth.currentUser;
    if (user) {
      try {
        const newToken = await user.getIdToken(true);
        const retryHeaders = await buildHeaders({
          Authorization: `Bearer ${newToken}`,
        });
        return fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: retryHeaders,
        });
      } catch {
        // Fall through and return original 401
      }
    }
  }

  return response;
}
