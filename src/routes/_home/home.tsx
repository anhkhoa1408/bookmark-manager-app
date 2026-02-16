import { authMiddleware } from "@/middleware/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_home/home")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  return <div>Hello "/home/home"!</div>;
}
