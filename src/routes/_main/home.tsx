import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/home/home"!</div>;
}
