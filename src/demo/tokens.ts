import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import { OIDC_CONFIG, getStoredNonce } from './config';

const JWKS = createRemoteJWKSet(new URL(OIDC_CONFIG.jwksEndpoint));

export interface ValidatedClaims extends JWTPayload {
  sub: string;
  email?: string;
  name?: string;
  iss: string;
  aud: string;
  exp: number;
  iat?: number;
  nonce?: string;
}

export async function validateIdToken(idToken: string): Promise<ValidatedClaims> {
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: OIDC_CONFIG.issuer,
    audience: OIDC_CONFIG.clientId,
    algorithms: ['RS256', 'ES256'],
  });

  const expectedNonce = getStoredNonce();
  if (expectedNonce && payload.nonce && payload.nonce !== expectedNonce) {
    throw new Error('Validación de nonce fallida: el nonce del token no coincide con el enviado.');
  }

  if (!payload.sub) {
    throw new Error('Token inválido: falta el claim sub.');
  }

  return payload as ValidatedClaims;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<{
  access_token: string;
  id_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: OIDC_CONFIG.clientId,
    code,
    redirect_uri: OIDC_CONFIG.redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(OIDC_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error al intercambiar código por tokens (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  if (!data.id_token) {
    throw new Error('Respuesta del token endpoint sin id_token.');
  }

  return data;
}

export async function fetchUserInfo(accessToken: string): Promise<{
  sub: string;
  email?: string;
  name?: string;
}> {
  const response = await fetch(OIDC_CONFIG.userinfoEndpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener UserInfo (${response.status})`);
  }

  return response.json();
}
