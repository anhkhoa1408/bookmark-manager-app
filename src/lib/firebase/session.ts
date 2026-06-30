import type { User } from "firebase/auth";

export async function exchangeFirebaseTokenForSession(user: User, options?: { forceRefresh?: boolean }) {
  const idToken = await user.getIdToken(options?.forceRefresh);

  const response = await fetch("/api/auth/firebase/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to exchange Firebase token for session.");
  }
}
