import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type MappingRule = {
  id: string;
  column: string;
  columnLabel: string;
  condition: string;
  conditionLabel: string;
  compareValue: string;
  displayValue: string;
};

export type MappingState = {
  rules: MappingRule[];
  addRule: (rule: Omit<MappingRule, "id">) => void;
  removeRule: (id: string) => void;
};

export const useMappingStore = create<MappingState>()(
  persist(
    (set) => ({
      rules: [],
      addRule: (rule) =>
        set((state) => ({
          rules: [
            ...state.rules,
            { ...rule, id: crypto.randomUUID() },
          ],
        })),
      removeRule: (id) =>
        set((state) => ({
          rules: state.rules.filter((r) => r.id !== id),
        })),
    }),
    {
      name: "huwai-variable-mapping",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

function compare(
  raw: string | number,
  condition: string,
  compareValue: string,
): boolean {
  const a = raw;
  const b = compareValue;
  const numA = Number(a);
  const numB = Number(b);
  const bothNumeric = !Number.isNaN(numA) && !Number.isNaN(numB);

  switch (condition) {
    case "=":
      if (bothNumeric) return numA === numB;
      return String(a).trim() === String(b).trim();
    case ">":
      return bothNumeric ? numA > numB : false;
    case "<":
      return bothNumeric ? numA < numB : false;
    case ">=":
      return bothNumeric ? numA >= numB : false;
    case "<=":
      return bothNumeric ? numA <= numB : false;
    default:
      return false;
  }
}

export function getDisplayValue(
  columnKey: string,
  rawValue: string | number,
  rules: MappingRule[],
): string | number {
  const value = rawValue ?? "";
  for (const rule of rules) {
    if (rule.column !== columnKey) continue;
    if (compare(value, rule.condition, rule.compareValue)) {
      return rule.displayValue;
    }
  }
  return rawValue;
}
