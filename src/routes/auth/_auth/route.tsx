import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-screen h-screen flex items-center justify-center px-16">
      <Outlet />
    </div>
  );
}
