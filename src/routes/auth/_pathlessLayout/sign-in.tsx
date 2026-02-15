import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { Textarea } from "@/components/atoms/textarea";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/_pathlessLayout/sign-in")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="min-h-screen w-[50vw] flex items-center justify-center dark">
      <Input />
      <Textarea />
      <Button variant="secondary" size="icon">
        Sign In
      </Button>
    </div>
  );
}
