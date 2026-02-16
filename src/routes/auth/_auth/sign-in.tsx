import { SignInForm } from "@/components/molecules/SignInForm";
import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

const searchSchema = z.object({
  returnUrl: z.string().optional(),
});

export const Route = createFileRoute("/auth/_auth/sign-in")({
  ssr: false,
  component: RouteComponent,
  validateSearch: searchSchema,
});

function RouteComponent() {
  return <SignInForm />;
}
