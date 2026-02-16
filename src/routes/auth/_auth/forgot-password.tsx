import { ForgotPasswordForm } from "@/components/molecules/ForgotPasswordForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_auth/forgot-password")({
  ssr: false,
  component: RouteComponent,
});

function RouteComponent() {
  return <ForgotPasswordForm />;
}
