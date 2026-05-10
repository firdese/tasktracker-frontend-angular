import { environment } from '../environments/environment';
import Keycloak, { type KeycloakInstance } from 'keycloak-js';

type JwtClaims = Record<string, unknown>;
type AuthProvider = 'keycloak' | 'supabase';

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

let keycloakClient: KeycloakInstance | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function getAuthProvider(): AuthProvider {
  return environment.auth.provider === 'keycloak' ? 'keycloak' : 'supabase';
}

export function getAuthProviderLabel(): string {
  return getAuthProvider() === 'keycloak' ? 'Keycloak' : 'Supabase';
}

export function isPasswordSignInAvailable(): boolean {
  return getAuthProvider() === 'supabase';
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

function parseSupabaseSession(
  rawSession: string | null,
): SupabaseSession | null {
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

function getKeycloakClient(): KeycloakInstance {
  if (keycloakClient) {
    return keycloakClient;
  }

  const config = environment.auth.keycloak;
  if (
    !config?.issuer?.trim() ||
    !config.realm?.trim() ||
    !config.clientId?.trim()
  ) {
    throw new Error('Keycloak issuer, realm, and clientId are required');
  }

  keycloakClient = new Keycloak({
    url: config.issuer,
    realm: config.realm,
    clientId: config.clientId,
  });

  return keycloakClient;
}

export async function initializeAuth(): Promise<boolean> {
  if (getAuthProvider() === 'keycloak') {
    return getKeycloakClient().init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    });
  }

  return hasAccessToken();
}

function persistSession(session: SupabaseSession): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(getSessionStorageKey(), JSON.stringify(session));
}

export function getAccessToken(): string | null {
  if (getAuthProvider() === 'keycloak') {
    return keycloakClient?.token ?? null;
  }

  if (!isBrowser()) {
    return null;
  }

  const session = parseSupabaseSession(
    localStorage.getItem(getSessionStorageKey()),
  );
  return session?.access_token ?? null;
}

export function hasAccessToken(): boolean {
  return !!getAccessToken();
}

export function getUserProfile(): { name: string; email: string } {
  if (getAuthProvider() === 'keycloak') {
    const parsedToken = keycloakClient?.tokenParsed as JwtClaims | undefined;
    const name =
      (typeof parsedToken?.['name'] === 'string'
        ? parsedToken['name']
        : undefined) ??
      (typeof parsedToken?.['preferred_username'] === 'string'
        ? parsedToken['preferred_username']
        : undefined) ??
      (typeof parsedToken?.['email'] === 'string'
        ? parsedToken['email']
        : undefined) ??
      'Account';
    const email =
      (typeof parsedToken?.['email'] === 'string'
        ? parsedToken['email']
        : '') ?? '';

    return { name, email };
  }

  if (!isBrowser()) {
    return { name: 'Account', email: '' };
  }

  const session = parseSupabaseSession(
    localStorage.getItem(getSessionStorageKey()),
  );
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
  if (getAuthProvider() === 'keycloak') {
    void keycloakClient?.logout({
      redirectUri: isBrowser() ? window.location.origin + '/login' : undefined,
    });
    return;
  }

  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(getSessionStorageKey());
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<void> {
  if (getAuthProvider() === 'keycloak') {
    await signInWithProvider();
    return;
  }

  const anonKey = environment.auth.anonKey?.trim();

  if (!anonKey) {
    throw new Error('Supabase anon key is not configured');
  }

  const response = await fetch(
    `${environment.auth.issuer}/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

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

export async function signInWithProvider(returnUrl = '/'): Promise<void> {
  if (getAuthProvider() === 'keycloak') {
    const redirectUrl = new URL(returnUrl, window.location.origin);
    await getKeycloakClient().login({
      redirectUri: redirectUrl.toString(),
    });
    return;
  }

  throw new Error('Provider sign-in is only available for redirect-based auth');
}
