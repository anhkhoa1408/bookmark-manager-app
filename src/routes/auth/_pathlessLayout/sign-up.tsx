import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/_pathlessLayout/sign-up')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/auth/_pathlessLayout/sign-up"!</div>
}
