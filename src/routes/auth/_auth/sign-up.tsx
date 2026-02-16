import { SignUpForm } from "@/components/molecules/SignUpForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_auth/sign-up")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUpForm />;
}
