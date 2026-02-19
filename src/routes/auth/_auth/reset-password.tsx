import { ResetPasswordForm } from "@/components/organisms/(auth)/ResetPasswordForm";
import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

const searchSchema = z.object({
  oobCode: z.string().optional(),
});

export const Route = createFileRoute("/auth/_auth/reset-password")({
  component: RouteComponent,
  validateSearch: searchSchema,
});

function RouteComponent() {
  return <ResetPasswordForm />;
}
