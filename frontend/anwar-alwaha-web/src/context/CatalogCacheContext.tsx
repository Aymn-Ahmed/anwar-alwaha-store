import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { productsApi } from '../api/productsApi';
import { couponsApi } from '../api/couponsApi';
import { CatalogIndexItem } from '../types/product.types';
import { normalizeArabic, tokenizeArabic } from '../utils/arabicNormalizer';

interface CatalogCacheContextType {
  catalog: CatalogIndexItem[];
  isLoading: boolean;
  hideUnverifiedPhotos: boolean;
  searchCatalog: (query: string, categoryId?: string, limit?: number) => CatalogIndexItem[];
  getSuggestions: (query: string, limit?: number) => string[];
  refreshCatalog: () => Promise<void>;
}

const CatalogCacheContext = createContext<CatalogCacheContextType | undefined>(undefined);

const IDB_NAME = 'AnwarAlwaha_CatalogCache_v1';
const IDB_STORE = 'catalog_store';
const IDB_KEY = 'full_catalog_index';
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour

// Helper to open IndexedDB
function openIndexedDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Read from IndexedDB
async function readFromIndexedDB(): Promise<{ items: CatalogIndexItem[]; timestamp: number } | null> {
  const db = await openIndexedDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

// Write to IndexedDB
async function writeToIndexedDB(items: CatalogIndexItem[]): Promise<void> {
  const db = await openIndexedDB();
  if (!db) return;
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put({ items, timestamp: Date.now() }, IDB_KEY);
  } catch {
    // Ignore IDB write failures silently
  }
}

export const CatalogCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<CatalogIndexItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hideUnverifiedPhotos, setHideUnverifiedPhotos] = useState(false);

  // Pre-normalized search index for 0ms ultra-fast lookup
  const searchIndex = useMemo(() => {
    return catalog.map((item) => ({
      item,
      normName: normalizeArabic(item.name),
      normKeywords: normalizeArabic(item.searchKeywords || ''),
      normCategory: normalizeArabic(item.categoryTitle || ''),
      barcode: (item.barcode || '').trim().toLowerCase(),
    }));
  }, [catalog]);

  const fetchAndCacheCatalog = useCallback(async () => {
    try {
      const [items, settings] = await Promise.all([
        productsApi.getCatalogIndex(),
        couponsApi.getStoreSettings(),
      ]);

      if (items && items.length > 0) {
        setCatalog(items);
        writeToIndexedDB(items);
      }
      if (settings) {
        setHideUnverifiedPhotos(Boolean(settings.hideUnverifiedPhotos));
      }
    } catch {
      // Ignore background fetch errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  // On mount: load instantly from IndexedDB, then revalidate in background
  useEffect(() => {
    let isMounted = true;

    async function initCatalog() {
      // 1. Try instant read from local IndexedDB
      const cached = await readFromIndexedDB();
      if (isMounted && cached && cached.items && cached.items.length > 0) {
        setCatalog(cached.items);
        setIsLoading(false);

        // If cache is still fresh (< 1 hour), skip immediate network fetch
        if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
          return;
        }
      }

      // 2. Fetch fresh catalog in background from server
      if (isMounted) {
        fetchAndCacheCatalog();
      }
    }

    initCatalog();

    return () => {
      isMounted = false;
    };
  }, [fetchAndCacheCatalog]);

  // Instant zero-latency search engine
  const searchCatalog = useCallback(
    (query: string, categoryId?: string, limit: number = 60): CatalogIndexItem[] => {
      const cleanQuery = query.trim();
      if (!cleanQuery && !categoryId) return catalog.slice(0, limit);

      const normQuery = normalizeArabic(cleanQuery);
      const tokens = tokenizeArabic(cleanQuery);
      const isBarcodeQuery = /^[0-9]+$/.test(cleanQuery);

      const matches: { item: CatalogIndexItem; score: number }[] = [];

      for (let i = 0; i < searchIndex.length; i++) {
        const entry = searchIndex[i];

        // Category filter if supplied
        if (categoryId && entry.item.categoryId !== categoryId) {
          continue;
        }

        if (!normQuery) {
          matches.push({ item: entry.item, score: 1 });
          continue;
        }

        let score = 0;

        // 1. Barcode direct match
        if (isBarcodeQuery && entry.barcode) {
          if (entry.barcode === cleanQuery) score += 200;
          else if (entry.barcode.includes(cleanQuery)) score += 100;
        }

        // 2. Exact start or substring in product name
        if (entry.normName.startsWith(normQuery)) {
          score += 120;
        } else if (entry.normName.includes(normQuery)) {
          score += 70;
        }

        // 3. Token-based matching (all tokens must match in name or keywords)
        if (tokens.length > 1) {
          const allTokensInName = tokens.every((t) => entry.normName.includes(t));
          if (allTokensInName) score += 50;

          const allTokensInCombined = tokens.every(
            (t) =>
              entry.normName.includes(t) ||
              entry.normKeywords.includes(t) ||
              entry.normCategory.includes(t)
          );
          if (allTokensInCombined) score += 30;
        }

        // 4. Keywords or category match
        if (entry.normKeywords && entry.normKeywords.includes(normQuery)) {
          score += 35;
        }
        if (entry.normCategory && entry.normCategory.includes(normQuery)) {
          score += 25;
        }

        if (score > 0) {
          matches.push({ item: entry.item, score });
        }
      }

      // Sort by score descending
      matches.sort((a, b) => b.score - a.score);
      return matches.slice(0, limit).map((m) => m.item);
    },
    [catalog, searchIndex]
  );

  // Clean deduplicated text keyword suggestions
  const getSuggestions = useCallback(
    (query: string, limit: number = 6): string[] => {
      const clean = query.trim();
      if (clean.length < 2) return [];

      const normQuery = normalizeArabic(clean);
      const tokens = tokenizeArabic(clean);
      const suggestions = new Set<string>();

      for (let i = 0; i < searchIndex.length; i++) {
        const entry = searchIndex[i];
        if (!entry.normName.includes(normQuery) && !entry.normKeywords.includes(normQuery)) {
          continue;
        }

        // Extract meaningful 2-4 word phrases from matching product names
        const words = entry.item.name
          .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter((w) => w.length > 1);

        if (words.length >= 2) {
          const twoWord = words.slice(0, 2).join(' ');
          if (normalizeArabic(twoWord).includes(normQuery)) {
            suggestions.add(twoWord);
          }
        }

        if (words.length >= 3) {
          const threeWord = words.slice(0, 3).join(' ');
          if (normalizeArabic(threeWord).includes(normQuery)) {
            suggestions.add(threeWord);
          }
        }

        // Also add full name if concise
        if (words.length <= 4) {
          suggestions.add(words.join(' '));
        }

        // Check search keywords
        if (entry.item.searchKeywords) {
          const kwList = entry.item.searchKeywords
            .split(/[,،|]/)
            .map((s) => s.trim())
            .filter((s) => s.length >= 2 && s.length <= 30);

          for (const kw of kwList) {
            if (normalizeArabic(kw).includes(normQuery)) {
              suggestions.add(kw);
            }
            if (suggestions.size >= limit) break;
          }
        }

        if (suggestions.size >= limit) break;
      }

      return Array.from(suggestions).slice(0, limit);
    },
    [searchIndex]
  );

  return (
    <CatalogCacheContext.Provider
      value={{
        catalog,
        isLoading,
        hideUnverifiedPhotos,
        searchCatalog,
        getSuggestions,
        refreshCatalog: fetchAndCacheCatalog,
      }}
    >
      {children}
    </CatalogCacheContext.Provider>
  );
};

export const useCatalogCache = (): CatalogCacheContextType => {
  const context = useContext(CatalogCacheContext);
  if (!context) {
    throw new Error('useCatalogCache must be used within a CatalogCacheProvider');
  }
  return context;
};
