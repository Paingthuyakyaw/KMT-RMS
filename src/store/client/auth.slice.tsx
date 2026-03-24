import type { StateCreator } from "zustand";

export interface AuthSlice {
  token: string;
  setAuth: (token: string) => void;
  removeAuth: () => void; // ✅ add
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => {
  const token = localStorage.getItem("token") || "";

  return {
    token,

    setAuth: (newToken: string) =>
      set(() => {
        localStorage.setItem("token", newToken);
        return { token: newToken };
      }),

    removeAuth: () =>
      set(() => {
        localStorage.removeItem("token"); // ✅ remove from storage
        return { token: "" }; // ✅ reset state
      }),
  };
};
