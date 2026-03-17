import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/critial-alarm/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/critial-alarm/"!</div>
}
