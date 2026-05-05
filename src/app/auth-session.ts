import { environment } from '../environments/environment';

type JwtClaims = Record<string, unknown>;

type SupabaseSession = {
  access_token?: string;
  user?: {
    email?: string;
    user_metadata?: {
      display_name?: string;
      full_name?: string;
      name?: string;
    };
  };
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function decodeJwtPayload(token: string): JwtClaims {
  try {
    const payload = token.split('.')[1];
    if (!payload) {
      return {};
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const normalized = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = atob(normalized);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return {};
  }
}

function parseSupabaseSession(rawSession: string | null): SupabaseSession | null {
  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as SupabaseSession;
  } catch {
    return null;
  }
}

function getSessionStorageKey(): string {
  const configuredStorageKey = environment.auth.storageKey?.trim();
  if (configuredStorageKey) {
    return configuredStorageKey;
  }

  const projectRef = environment.auth.projectRef?.trim();
  if (projectRef) {
    return `sb-${projectRef}-auth-token`;
  }

  return 'sb-auth-token';
}

export function initializeAuth(): Promise<boolean> {
  return Promise.resolve(hasAccessToken());
}

function persistSession(session: SupabaseSession): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(getSessionStorageKey(), JSON.stringify(session));
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  const session = parseSupabaseSession(localStorage.getItem(getSessionStorageKey()));
  return session?.access_token ?? null;
}

export function hasAccessToken(): boolean {
  return !!getAccessToken();
}

export function getUserProfile(): { name: string; email: string } {
  if (!isBrowser()) {
    return { name: 'Account', email: '' };
  }

  const session = parseSupabaseSession(localStorage.getItem(getSessionStorageKey()));
  const claims = decodeJwtPayload(session?.access_token ?? '');
  const userMetadata = session?.user?.user_metadata ?? {};

  const name =
    userMetadata.full_name ??
    userMetadata.display_name ??
    userMetadata.name ??
    (typeof claims['name'] === 'string' ? claims['name'] : undefined) ??
    (typeof claims['preferred_username'] === 'string'
      ? claims['preferred_username']
      : undefined) ??
    (typeof claims['email'] === 'string' ? claims['email'] : undefined) ??
    session?.user?.email ??
    'Account';

  const email =
    session?.user?.email ??
    (typeof claims['email'] === 'string' ? claims['email'] : '') ??
    '';

  return { name, email };
}

export function signOut(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(getSessionStorageKey());
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<void> {
  const anonKey = environment.auth.anonKey?.trim();

  if (!anonKey) {
    throw new Error('Supabase anon key is not configured');
  }

  const response = await fetch(`${environment.auth.issuer}/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const payload = (await response.json()) as
    | SupabaseSession
    | { error_description?: string; msg?: string };

  if (!response.ok) {
    throw new Error(
      ('error_description' in payload && payload.error_description) ||
        ('msg' in payload && payload.msg) ||
        'Supabase sign-in failed',
    );
  }

  persistSession(payload as SupabaseSession);
}
