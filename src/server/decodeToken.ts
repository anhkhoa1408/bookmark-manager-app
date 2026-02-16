import { adminAuth } from "@/lib/firebase-admin";
import { createServerFn } from "@tanstack/react-start";
import { DecodedIdToken } from "node_modules/firebase-admin/lib/auth/token-verifier";

export const decodeToken = createServerFn<"POST", string, void, DecodedIdToken>({
  method: "POST",
}).handler(async (ctx) => {
  const idToken = ctx.data;
  if (!idToken) {
    throw new Response("BAD_REQUEST", { status: 400 });
  }

  const decoded = await adminAuth.verifyIdToken(idToken);
  if (!decoded.user_id || !decoded.email) {
    throw new Response("BAD_REQUEST", { status: 400 });
  }

  return decoded;
});
