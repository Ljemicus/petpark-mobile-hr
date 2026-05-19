import Constants from 'expo-constants';
import { supabase } from '../supabase';

const DEFAULT_API_BASE_URL = 'https://petpark.hr';

export type ApiErrorPayload = {
  ok?: false;
  code?: string;
  message?: string;
  error?: string;
  details?: unknown;
};

export class PetParkApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor({ status, code, message, details }: { status: number; code?: string; message: string; details?: unknown }) {
    super(message);
    this.name = 'PetParkApiError';
    this.status = status;
    this.code = code || `HTTP_${status}`;
    this.details = details;
  }
}

function fallbackMessageForStatus(status: number) {
  if (status === 401) return 'Prijavi se za nastavak.';
  if (status === 403) return 'Nemaš dopuštenje za ovu akciju.';
  if (status === 404) return 'Traženi sadržaj nije pronađen.';
  if (status === 429) return 'Previše zahtjeva odjednom. Pričekaj trenutak pa pokušaj ponovno.';
  if (status >= 500) return 'PetPark trenutno ne može obraditi zahtjev. Pokušaj ponovno malo kasnije.';
  return 'PetPark zahtjev nije uspio.';
}

export function getApiBaseUrl() {
  const configured = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
  return String(configured).replace(/\/$/, '');
}

export async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new PetParkApiError({ status: 401, code: 'SESSION_UNAVAILABLE', message: 'Sesiju trenutno nije moguće dohvatiti.' });
  return data.session?.access_token || null;
}

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}

export async function petParkApi<T>(path: string, options: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const { auth = false, headers, ...requestOptions } = options;
  const token = auth ? await getAccessToken() : null;

  if (auth && !token) {
    throw new PetParkApiError({ status: 401, code: 'UNAUTHORIZED', message: 'Prijavi se za nastavak.' });
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...requestOptions,
      headers: {
        accept: 'application/json',
        ...(requestOptions.body ? { 'content-type': 'application/json' } : null),
        ...(token ? { authorization: `Bearer ${token}` } : null),
        ...headers,
      },
    });
  } catch (error) {
    throw new PetParkApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Ne mogu se spojiti na PetPark. Provjeri internet vezu i pokušaj ponovno.',
      details: error,
    });
  }

  const json = await parseJson(response);

  if (!response.ok) {
    const payload = (json || {}) as ApiErrorPayload;
    throw new PetParkApiError({
      status: response.status,
      code: payload.code || payload.error || `HTTP_${response.status}`,
      message: payload.message || payload.error || fallbackMessageForStatus(response.status),
      details: payload.details,
    });
  }

  return json as T;
}

export function apiGap(feature: string, endpoint: string): never {
  throw new PetParkApiError({
    status: 501,
    code: 'MOBILE_API_GAP',
    message: `${feature} još nema mobile-safe API endpoint (${endpoint}). Ne koristimo direktan Supabase/admin pristup iz mobile appa.`,
  });
}
