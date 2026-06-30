import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import type { DecodedIdToken } from "firebase-admin/auth";

const FIREBASE_ID_TOKEN_MAX_AGE_SECONDS = 60 * 60;

const firebaseAuthPlugin = (): BetterAuthPlugin => ({
  id: "firebase-auth",
  endpoints: {
    signIn: createAuthEndpoint("/firebase/sign-in", { method: "POST", requireHeaders: true }, async (handler) => {
      const body = handler.body;
      if (!body.idToken) {
        throw new Response("BAD_REQUEST", { status: 400 });
      }

      let decoded: DecodedIdToken;
      try {
        const { adminAuth } = await import("@/lib/firebase/firebase-admin");

        decoded = await adminAuth.verifyIdToken(body.idToken);
      } catch (error) {
        console.error("[auth:firebase-sign-in] Failed to verify Firebase ID token", error);
        throw new Response("UNAUTHORIZED", { status: 401 });
      }

      const email = decoded.email;
      if (!decoded.uid || !email) {
        throw new Response("UNAUTHORIZED", { status: 401 });
      }

      const user = {
        id: decoded.uid,
        email,
        name: decoded.name ?? "",
        image: decoded.picture ?? null,
        emailVerified: decoded.email_verified ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session = await handler.context.internalAdapter.createSession(decoded.uid);
      await setSessionCookie(handler, { session, user });

      return handler.json({ user });
    }),
  },
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  session: {
    expiresIn: FIREBASE_ID_TOKEN_MAX_AGE_SECONDS,
    cookieCache: {
      enabled: true,
      maxAge: FIREBASE_ID_TOKEN_MAX_AGE_SECONDS,
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [firebaseAuthPlugin(), tanstackStartCookies()],
});
