import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Scroll the main document to the bottom (e.g. when opening filter popovers). */
export function scrollWindowToBottom(
  behavior: ScrollBehavior = "smooth",
): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  window.scrollTo({
    top: Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
    ),
    behavior,
  });
}


export const buildFormData = (payload: Record<string, any>) => {
  const formData = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, String(value));
    }
  });

  return formData;
};