import { useRef, useEffect, useCallback } from 'react';

export interface UseIndependentScrollOptions {
  /** The current active category/tab/list key (e.g. activeCategoryId || 'all') */
  activeKey: string;
  /** Whether list data is currently loading */
  isLoading?: boolean;
  /** Keys whose changes represent a search or filter change (resets active scroll to 0) */
  resetDependencies?: any[];
  /** Optional custom scroll target element (default: window) */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Default top offset on reset (default: 0) */
  topOffset?: number;
}

export function useIndependentScroll({
  activeKey,
  isLoading = false,
  resetDependencies = [],
  containerRef,
  topOffset = 0,
}: UseIndependentScrollOptions) {
  // Map of activeKey -> scrollY position
  const scrollPositionsRef = useRef<Record<string, number>>({});
  // Track previous active key to save before switching
  const prevKeyRef = useRef<string>(activeKey);
  // Track pending restore for when items finish rendering
  const pendingRestoreKeyRef = useRef<string | null>(null);

  const getScroll = useCallback((): number => {
    if (containerRef?.current) {
      return containerRef.current.scrollTop;
    }
    return window.scrollY || document.documentElement.scrollTop || 0;
  }, [containerRef]);

  const setScroll = useCallback(
    (top: number, behavior: ScrollBehavior = 'instant') => {
      if (containerRef?.current) {
        containerRef.current.scrollTo({ top, behavior });
      } else {
        window.scrollTo({ top, behavior });
      }
    },
    [containerRef]
  );

  // Function to explicitly save current scroll before a category/tab switch
  const saveCurrentScroll = useCallback(() => {
    const currentPos = getScroll();
    scrollPositionsRef.current[prevKeyRef.current] = currentPos;
  }, [getScroll]);

  // Handle activeKey switch
  useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== activeKey) {
      // 1. Save scroll position of the previous category
      scrollPositionsRef.current[prevKey] = getScroll();
      prevKeyRef.current = activeKey;

      // 2. Check if target key was previously visited
      const savedPos = scrollPositionsRef.current[activeKey];
      if (savedPos !== undefined && savedPos > 0) {
        // Previously visited category: queue restore once loaded
        pendingRestoreKeyRef.current = activeKey;
        // Also perform immediate scroll attempt
        requestAnimationFrame(() => {
          setScroll(savedPos, 'instant');
        });
      } else {
        // First visit to this category/tab: clean reset to top (0)
        scrollPositionsRef.current[activeKey] = topOffset;
        pendingRestoreKeyRef.current = null;
        requestAnimationFrame(() => {
          setScroll(topOffset, 'instant');
        });
      }
    }
  }, [activeKey, getScroll, setScroll, topOffset]);

  // When loading finishes, if there is a pending restore for a previously visited category, restore it
  useEffect(() => {
    if (!isLoading && pendingRestoreKeyRef.current === activeKey) {
      const targetPos = scrollPositionsRef.current[activeKey];
      if (targetPos !== undefined && targetPos > 0) {
        requestAnimationFrame(() => {
          setScroll(targetPos, 'instant');
        });
      }
      pendingRestoreKeyRef.current = null;
    }
  }, [isLoading, activeKey, setScroll]);

  // Reset scroll on filter / search change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // When search query or filters change, reset active scroll position to 0
    scrollPositionsRef.current[activeKey] = topOffset;
    pendingRestoreKeyRef.current = null;
    requestAnimationFrame(() => {
      setScroll(topOffset, 'instant');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDependencies);

  return {
    scrollPositionsRef,
    saveCurrentScroll,
    resetScroll: () => {
      scrollPositionsRef.current[activeKey] = topOffset;
      setScroll(topOffset, 'instant');
    },
  };
}
