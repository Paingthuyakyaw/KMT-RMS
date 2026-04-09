import type { EnergyLeafKey } from "./constants";

export type EnergyCellValue = string | number | "-";
export type EnergyRow = Record<EnergyLeafKey, EnergyCellValue>;
