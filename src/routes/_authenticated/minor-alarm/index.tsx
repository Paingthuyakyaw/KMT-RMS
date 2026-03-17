import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/minor-alarm/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/minor-alarm/"!</div>
}
