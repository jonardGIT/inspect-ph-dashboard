"use client";

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

export function useBrowserQueryParams<Key extends string>({
  defaults,
  keys,
}: UseBrowserQueryParamsOptions<Key>) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

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
