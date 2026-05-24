"use client";

import { useCallback, useState } from "react";

import { en } from "@/lib/i18n/en";
import { tl } from "@/lib/i18n/tl";
import type { Locale } from "@/lib/i18n/en";

export type SupportedLocale = "en" | "tl";

const STORAGE_KEY = "inspect-ph:locale";

const locales: Record<SupportedLocale, Locale> = { en, tl };

function detectBrowserLocale(): SupportedLocale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language.split("-")[0].toLowerCase();
  return lang === "fil" || lang === "tl" ? "tl" : "en";
}

export function useLocale() {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    return saved ?? detectBrowserLocale();
  });

  const setLocale = useCallback((next: SupportedLocale) => {
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  return { locale, setLocale, t: locales[locale] };
}
