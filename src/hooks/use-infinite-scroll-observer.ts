import { useEffect, useRef } from "react";

type UseInfiniteScrollObserverArgs = {
  /** Scroll container element ref (root of IntersectionObserver). If omitted, viewport is used. */
  rootRef?: React.RefObject<HTMLElement | null>;
  /**
   * Prefer this when the scroll root mounts after first paint (e.g. Radix ScrollArea viewport).
   * Ref-based `rootRef` is often still null on the observer's first effect run, so IO falls back to
   * the window and infinite scroll never tracks the real scroll container.
   */
  rootElement?: HTMLElement | null;
  /** The sentinel element ref to observe. */
  targetRef: React.RefObject<Element | null>;
  /** Whether observer should trigger loading. */
  enabled: boolean;
  /** Whether a load is currently in-flight (prevents duplicate triggers). */
  isLoading: boolean;
  /** Callback to load more items. */
  onLoadMore: () => Promise<unknown> | void;
  /** IntersectionObserver rootMargin. */
  rootMargin?: string;
  /** IntersectionObserver threshold. */
  threshold?: number;
};

/**
 * Reusable IntersectionObserver-based infinite scroll.
 * Prevents rapid duplicate triggers via an internal in-flight guard.
 */
export function useInfiniteScrollObserver({
  rootRef,
  rootElement,
  targetRef,
  enabled,
  isLoading,
  onLoadMore,
  rootMargin = "250px",
  threshold = 0.1,
}: UseInfiniteScrollObserverArgs) {
  const inFlightRef = useRef(false);

  useEffect(() => {
    // release guard when external loading finishes
    if (!isLoading) inFlightRef.current = false;
  }, [isLoading]);

  useEffect(() => {
    if (!enabled) return;

    const root = rootElement ?? rootRef?.current ?? null;
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (!enabled) return;
        if (isLoading) return;
        if (inFlightRef.current) return;

        inFlightRef.current = true;
        Promise.resolve(onLoadMore()).finally(() => {
          // If consumer doesn't flip isLoading, this prevents immediate double-fire.
          // It will be released when isLoading becomes false again.
          if (!isLoading) inFlightRef.current = false;
        });
      },
      {
        root,
        rootMargin,
        threshold,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    enabled,
    isLoading,
    onLoadMore,
    rootMargin,
    rootElement,
    rootRef,
    targetRef,
    threshold,
  ]);
}

