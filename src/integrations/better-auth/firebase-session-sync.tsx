import { authClient } from "@/lib/firebase/auth-client";
import { auth } from "@/lib/firebase/firebase";
import { exchangeFirebaseTokenForSession } from "@/lib/firebase/session";
import { onIdTokenChanged } from "firebase/auth";
import { useEffect, useRef } from "react";

export function FirebaseSessionSync() {
  const { data: session } = authClient.useSession();
  const sessionUserId = session?.user.id;
  const refreshPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (!sessionUserId) {
      return;
    }

    return onIdTokenChanged(auth, (user) => {
      if (!user || user.uid !== sessionUserId || !user.emailVerified) {
        return;
      }

      if (refreshPromiseRef.current) {
        return;
      }

      const refreshPromise = exchangeFirebaseTokenForSession(user)
        .catch(() => {
          // Keep the current session in place and let protected routes handle expiry.
        })
        .finally(() => {
          if (refreshPromiseRef.current === refreshPromise) {
            refreshPromiseRef.current = null;
          }
        });

      refreshPromiseRef.current = refreshPromise;
    });
  }, [sessionUserId]);

  return null;
}
