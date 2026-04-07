import { create } from "zustand";
import { persist } from "zustand/middleware";

type TimezoneState = {
  timeZoneId: string;
  setTimeZoneId: (timeZoneId: string) => void;
};

export const useTimezoneStore = create<TimezoneState>()(
  persist(
    (set) => ({
      timeZoneId: "Asia/Rangoon",
      setTimeZoneId: (timeZoneId) => set({ timeZoneId }),
    }),
    { name: "huwai-timezone" },
  ),
);
