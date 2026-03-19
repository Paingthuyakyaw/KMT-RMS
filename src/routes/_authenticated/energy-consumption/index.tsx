import EnergyConsumption from '@/features/energy-consumption'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/energy-consumption/')({
  component: EnergyConsumption,
})


