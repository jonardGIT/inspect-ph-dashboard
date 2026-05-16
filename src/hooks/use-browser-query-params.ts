"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UseBrowserQueryParamsOptions<Key extends string> {
  defaults?: Partial<Record<Key, string>>;
  keys: readonly Key[];
}

function normalizeValue(value: string | undefined) {
  return value?.trim() ?? "";
}

function parsePage(value: string | null) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function storageKey(pathname: string) {
  return `inspect-ph-filters:${pathname}`;
}

function loadSavedParams(pathname: string): URLSearchParams | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(pathname));
    if (!raw) return null;
    return new URLSearchParams(raw);
  } catch {
    return null;
  }
}

function saveParams(pathname: string, params: URLSearchParams) {
  if (typeof window === "undefined") return;
  try {
    const value = params.toString();
    if (value) {
      window.localStorage.setItem(storageKey(pathname), value);
    } else {
      window.localStorage.removeItem(storageKey(pathname));
    }
  } catch {
    // storage unavailable
  }
}

export function useBrowserQueryParams<Key extends string>({
  defaults,
  keys,
}: UseBrowserQueryParamsOptions<Key>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const restoredRef = useRef(false);

  // On first render: if URL has no filter params, restore from localStorage
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const hasAnyKey = keys.some((key) => searchParams.has(key));
    if (hasAnyKey) return; // URL already has filters — respect them

    const saved = loadSavedParams(pathname);
    if (!saved) return;

    const hasAnySaved = keys.some((key) => saved.has(key));
    if (!hasAnySaved) return;

    // Copy only known keys + page from saved params
    const nextParams = new URLSearchParams();
    keys.forEach((key) => {
      const v = saved.get(key);
      if (v) nextParams.set(key, v);
    });
    const page = saved.get("page");
    if (page && page !== "1") nextParams.set("page", page);

    router.replace(`${pathname}?${nextParams.toString()}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const values = keys.reduce(
    (result, key) => {
      result[key] = searchParams.get(key) ?? defaults?.[key] ?? "";
      return result;
    },
    {} as Record<Key, string>,
  );

  const replaceParams = (nextParams: URLSearchParams) => {
    const nextQuery = nextParams.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) {
      return;
    }

    // Persist to localStorage
    saveParams(pathname, nextParams);

    if (!nextQuery) {
      router.replace(pathname);
      return;
    }

    router.replace(`${pathname}?${nextQuery}`);
  };

  const setValue = (key: Key, value: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const normalizedValue = normalizeValue(value);
    const defaultValue = normalizeValue(defaults?.[key]);

    if (!normalizedValue || normalizedValue === defaultValue) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, normalizedValue);
    }

    nextParams.set("page", "1");
    replaceParams(nextParams);
  };

  const setValues = (updates: Partial<Record<Key, string>>) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    keys.forEach((key) => {
      if (!(key in updates)) {
        return;
      }

      const nextValue = updates[key];
      const normalizedValue = normalizeValue(nextValue);
      const defaultValue = normalizeValue(defaults?.[key]);

      if (!normalizedValue || normalizedValue === defaultValue) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, normalizedValue);
      }
    });

    nextParams.set("page", "1");
    replaceParams(nextParams);
  };

  return {
    activeCount: keys.filter((key) => {
      const normalizedValue = normalizeValue(values[key]);
      const defaultValue = normalizeValue(defaults?.[key]);

      return Boolean(normalizedValue) && normalizedValue !== defaultValue;
    }).length,
    clearValues: () => {
      const nextParams = new URLSearchParams(searchParams.toString());

      keys.forEach((key) => nextParams.delete(key));
      nextParams.delete("page");
      saveParams(pathname, nextParams);
      replaceParams(nextParams);
    },
    page: parsePage(searchParams.get("page")),
    setPage: (value: number) => {
      const nextParams = new URLSearchParams(searchParams.toString());
      const normalizedValue = String(Math.max(1, Math.floor(value)));

      if (normalizedValue === "1") {
        nextParams.delete("page");
      } else {
        nextParams.set("page", normalizedValue);
      }

      replaceParams(nextParams);
    },
    setValue,
    setValues,
    values,
  };
}
