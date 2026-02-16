import { SignInForm } from "@/components/molecules/SignInForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_auth/sign-in")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return <SignInForm />;
}
