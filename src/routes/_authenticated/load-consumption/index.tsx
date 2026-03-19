import LoadConsumption from '@/features/load-consumption'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/load-consumption/')({
  component: LoadConsumption,
})

