import { createServerFn } from "@tanstack/react-start";
import type { DecodedIdToken } from "firebase-admin/auth";

export const decodeToken = createServerFn({
  method: "POST",
})
  .validator((idToken: string) => idToken)
  .handler(async ({ data }): Promise<DecodedIdToken> => {
    const idToken = data;
    if (!idToken) {
      throw new Response("BAD_REQUEST", { status: 400 });
    }

    const { adminAuth } = await import("@/lib/firebase/firebase-admin");
    const decoded = await adminAuth.verifyIdToken(idToken);

    if (!decoded.user_id || !decoded.email) {
      throw new Response("BAD_REQUEST", { status: 400 });
    }

    return decoded;
  });
