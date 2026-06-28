import MainTemplate from "@/components/templates/MainTemplate";
import { authMiddleware } from "@/middleware/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main")({
  loader: () => ({
    tags: [],
  }),
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  const { tags } = Route.useLoaderData();

  return <MainTemplate tags={tags} />;
}
