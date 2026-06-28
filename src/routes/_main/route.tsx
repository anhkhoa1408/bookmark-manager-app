import MainTemplate from "@/components/templates/MainTemplate";
import { authMiddleware } from "@/middleware/auth";
import { getTags } from "@/server/tags";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main")({
  loader: async () => {
    try {
      return {
        tags: await getTags(),
        loadError: null,
      };
    } catch (error) {
      console.error("Could not load tags.", error);

      return {
        tags: [],
        loadError: "Could not load tags right now. Your bookmark pages are still available.",
      };
    }
  },
  staleTime: 30_000,
  gcTime: 5 * 60_000,
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  const { tags, loadError } = Route.useLoaderData();

  return <MainTemplate tags={tags} dataLoadError={loadError} />;
}
