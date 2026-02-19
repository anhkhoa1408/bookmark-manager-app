import MainTemplate from "@/components/templates/MainTemplate";
import { authMiddleware } from "@/middleware/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  return <MainTemplate />;
}
