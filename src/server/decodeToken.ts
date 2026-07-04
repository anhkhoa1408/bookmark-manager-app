import { createServerFn } from "@tanstack/react-start";
import { verifyFirebaseIdToken, type FirebaseDecodedIdToken } from "@/lib/firebase/id-token";

export const decodeToken = createServerFn({
  method: "POST",
})
  .validator((idToken: string) => idToken)
  .handler(async ({ data }): Promise<FirebaseDecodedIdToken> => {
    const idToken = data;
    if (!idToken) {
      throw new Response("BAD_REQUEST", { status: 400 });
    }

    const decoded = await verifyFirebaseIdToken(idToken);

    if (!decoded.uid || !decoded.email) {
      throw new Response("BAD_REQUEST", { status: 400 });
    }

    return decoded;
  });
