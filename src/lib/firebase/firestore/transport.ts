const FIRESTORE_SCOPE = "https://www.googleapis.com/auth/datastore";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DATABASE_ID = "(default)";

type FirestoreTokenResponse = {
  access_token: string;
  expires_in?: number;
};

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function firestoreFetch(url: string, init: RequestInit = {}) {
  const token = await getAccessToken();

  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

export async function assertOk(response: Response) {
  if (response.ok) {
    return;
  }

  const body = await response.text().catch(() => "");
  throw new Error(`Firestore request failed with ${response.status}: ${body}`);
}

export function collectionUrl(collectionName: string) {
  return `${firestoreBaseUrl()}/${collectionName}`;
}

export function documentUrl(collectionName: string, id: string) {
  return `${collectionUrl(collectionName)}/${id}`;
}

export function firestoreDocumentName(collectionName: string, id: string) {
  return `projects/${getProjectId()}/databases/${DATABASE_ID}/documents/${collectionName}/${id}`;
}

export function runQueryUrl() {
  return `${firestoreBaseUrl()}:runQuery`;
}

export function commitUrl() {
  return `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/${DATABASE_ID}/documents:commit`;
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);

  if (tokenCache && tokenCache.expiresAt - 60 > now) {
    return tokenCache.token;
  }

  const assertion = await createServiceAccountAssertion(now);
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  await assertTokenOk(response);

  const payload = (await response.json()) as FirestoreTokenResponse;
  tokenCache = {
    token: payload.access_token,
    expiresAt: now + (payload.expires_in ?? 3600),
  };

  return tokenCache.token;
}

async function assertTokenOk(response: Response) {
  if (response.ok) {
    return;
  }

  const body = await response.text().catch(() => "");
  throw new Error(`Firebase access token request failed with ${response.status}: ${body}`);
}

async function createServiceAccountAssertion(now: number) {
  const clientEmail = getRequiredEnv("FIREBASE_CLIENT_EMAIL", "VITE_FIREBASE_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("FIREBASE_PRIVATE_KEY", "VITE_FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: clientEmail,
    scope: FIRESTORE_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signature = await signJwt(unsignedToken, privateKey);

  return `${unsignedToken}.${signature}`;
}

async function signJwt(unsignedToken: string, privateKey: string) {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsignedToken));

  return base64UrlEncode(signature);
}

function pemToArrayBuffer(pem: string) {
  const base64 = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function base64UrlEncode(value: string | ArrayBuffer) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function getRequiredEnv(key: string, fallbackKey?: string) {
  const value = process.env[key] ?? (fallbackKey ? process.env[fallbackKey] : undefined);

  if (!value) {
    throw new Error(`Missing ${key}${fallbackKey ? ` or ${fallbackKey}` : ""}.`);
  }

  return value;
}

function getProjectId() {
  return getRequiredEnv("FIREBASE_PROJECT_ID", "VITE_FIREBASE_PROJECT_ID");
}

function firestoreBaseUrl() {
  return `https://firestore.googleapis.com/v1/projects/${getProjectId()}/databases/${DATABASE_ID}/documents`;
}
