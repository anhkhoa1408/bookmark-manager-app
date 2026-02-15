import { SignInForm } from "@/components/molecules/SignInForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_pathlessLayout/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignInForm />;
}
