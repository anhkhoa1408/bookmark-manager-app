import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_pathlessLayout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}
