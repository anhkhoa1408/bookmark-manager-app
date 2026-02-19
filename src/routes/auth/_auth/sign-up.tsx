import { SignUpForm } from "@/components/organisms/(auth)/SignUpForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_auth/sign-up")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return <SignUpForm />;
}
