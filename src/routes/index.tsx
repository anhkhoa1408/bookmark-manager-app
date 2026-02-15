import { Button } from "@/components/atoms/button";
import { authClient } from "@/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const signIn = async () => {
    const data = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return <Button onClick={signIn}>Sign In</Button>;
}
