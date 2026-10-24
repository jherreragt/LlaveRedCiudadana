export const OIDC_CONFIG = {
  issuer: 'https://letjzluumsacjagsgdtn.supabase.co/auth/v1',
  authorizationEndpoint: 'https://letjzluumsacjagsgdtn.supabase.co/auth/v1/authorize',
  tokenEndpoint: 'https://letjzluumsacjagsgdtn.supabase.co/auth/v1/oauth/token',
  jwksEndpoint: 'https://letjzluumsacjagsgdtn.supabase.co/auth/v1/.well-known/jwks.json',
  userinfoEndpoint: 'https://letjzluumsacjagsgdtn.supabase.co/auth/v1/userinfo',

  // This client_id must be registered in Supabase Dashboard > Authentication > OAuth Apps.
  // Replace with the actual client_id after registering this demo app.
  clientId: 'demo-integracion-llave-gt',

  // Redirect URI must match exactly what is registered in the OAuth client.
  // This demo app runs at /demo within the same origin.
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/demo/callback` : '',

  scopes: 'openid email profile',
};

const STORAGE_KEYS = {
  PKCE_VERIFIER: 'demo_pkce_verifier',
  OAUTH_STATE: 'demo_oauth_state',
  NONCE: 'demo_oauth_nonce',
  SESSION: 'demo_oidc_session',
};

export function generateRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function buildAuthUrlAsync(): Promise<string> {
  const state = generateRandomString(32);
  const nonce = generateRandomString(32);
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  sessionStorage.setItem(STORAGE_KEYS.OAUTH_STATE, state);
  sessionStorage.setItem(STORAGE_KEYS.NONCE, nonce);
  sessionStorage.setItem(STORAGE_KEYS.PKCE_VERIFIER, codeVerifier);

  const params = new URLSearchParams({
    client_id: OIDC_CONFIG.clientId,
    redirect_uri: OIDC_CONFIG.redirectUri,
    response_type: 'code',
    scope: OIDC_CONFIG.scopes,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `${OIDC_CONFIG.authorizationEndpoint}?${params.toString()}`;
}

export function getStoredState(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.OAUTH_STATE);
}

export function getStoredNonce(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.NONCE);
}

export function getStoredVerifier(): string | null {
  return sessionStorage.getItem(STORAGE_KEYS.PKCE_VERIFIER);
}

export function clearOAuthState(): void {
  sessionStorage.removeItem(STORAGE_KEYS.OAUTH_STATE);
  sessionStorage.removeItem(STORAGE_KEYS.NONCE);
  sessionStorage.removeItem(STORAGE_KEYS.PKCE_VERIFIER);
}

export interface OIDCSession {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  userInfo: {
    sub: string;
    email?: string;
    name?: string;
  };
  loginTime: string;
}

export function saveSession(session: OIDCSession): void {
  sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function getStoredSession(): OIDCSession | null {
  const raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OIDCSession;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
}
