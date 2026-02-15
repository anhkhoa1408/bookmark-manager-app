import { Checkbox } from "@/components/atoms/checkbox";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_pathlessLayout/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen w-[50vw] flex items-center justify-center">
      <Checkbox />
    </div>
  );
}
