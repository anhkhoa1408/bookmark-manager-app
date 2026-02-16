import { decodeToken } from "@/server/decodeToken";
import { betterAuth, BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { DecodedIdToken } from "firebase-admin/auth";
import { redirect } from "@tanstack/react-router";

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
        decoded = await decodeToken({
          data: body.idToken,
        });
      } catch (err) {
        throw new Response("UNAUTHORIZED", { status: 401 });
      }

      const email = decoded.email;
      if (!email) {
        throw new Response("UNAUTHORIZED", { status: 401 });
      }

      const user = {
        id: decoded.sub,
        email,
        name: decoded.name ?? "",
        image: decoded.picture ?? null,
        emailVerified: decoded.email_verified ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const session = await handler.context.internalAdapter.createSession(decoded.sub);
      await setSessionCookie(handler, { session, user });

      return handler.json({ user });
    }),
  },
});

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [firebaseAuthPlugin(), tanstackStartCookies()],
});
