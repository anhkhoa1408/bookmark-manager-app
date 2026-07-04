export type FirebaseDecodedIdToken = {
  uid: string;
  email?: string;
  name?: string;
  picture?: string | null;
  email_verified?: boolean;
};

type VerifyFirebaseIdTokenResponse = {
  user?: FirebaseDecodedIdToken;
  error?: string;
  message?: string;
};

const getFirebaseTokenVerifierUrl = () => {
  const url = process.env.VERCEL_FIREBASE_AUTH_FUNCTION_URL;
  if (!url) {
    throw new Error("Missing Vercel Firebase auth function URL.");
  }

  return url;
};

const getFirebaseTokenVerifierSecret = () => {
  const secret = process.env.VERCEL_FIREBASE_AUTH_FUNCTION_SECRET;
  if (!secret) {
    throw new Error("Missing Vercel Firebase auth function secret.");
  }

  return secret;
};

export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseDecodedIdToken> {
  const response = await fetch(getFirebaseTokenVerifierUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Auth-Secret": getFirebaseTokenVerifierSecret(),
    },
    body: JSON.stringify({ idToken }),
  });

  const payload = (await response.json().catch(() => ({}))) as VerifyFirebaseIdTokenResponse;

  if (!response.ok) {
    throw new Error(payload.message ?? payload.error ?? "Failed to verify Firebase ID token.");
  }

  if (!payload.user?.uid) {
    throw new Error("Vercel Firebase auth function returned an invalid user.");
  }

  return payload.user;
}
