import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { verifyFirebaseIdToken } from "@/lib/firebase/id-token";

const FIREBASE_ID_TOKEN_MAX_AGE_SECONDS = 60 * 60;

const firebaseAuthPlugin = (): BetterAuthPlugin => ({
  id: "firebase-auth",
  endpoints: {
    signIn: createAuthEndpoint("/firebase/sign-in", { method: "POST", requireHeaders: true }, async (handler) => {
      const body = handler.body;
      if (!body.idToken) {
        return handler.json({ error: "BAD_REQUEST", message: "Missing Firebase ID token." }, { status: 400 });
      }

      try {
        const decoded = await verifyFirebaseIdToken(body.idToken);

        const email = decoded.email;
        if (!decoded.uid || !email) {
          return handler.json(
            { error: "UNAUTHORIZED", message: "Firebase ID token is missing user claims." },
            { status: 401 },
          );
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
      } catch (error) {
        console.error("[auth:firebase-sign-in]", error);

        return handler.json(
          {
            error: "UNAUTHORIZED",
            message: "Failed to sign in with Firebase.",
            detail: error instanceof Error ? error.message : String(error),
          },
          { status: 401 },
        );
      }
    }),
  },
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: ["https://bookmark-management.vercel.app", "https://*.vercel.app"],
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
