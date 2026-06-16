"use client";
import { useEffect, useState } from "react";

let cached: Record<string, string> | null = null;
let pending: Promise<Record<string, string>> | null = null;

async function load(): Promise<Record<string, string>> {
  if (cached) return cached;
  if (!pending) {
    pending = fetch("/api/page-texts")
      .then(r => r.json())
      .then(d => { cached = d.texts ?? {}; return cached!; })
      .catch(() => { cached = {}; return {}; });
  }
  return pending;
}

export function usePageTexts(): Record<string, string> {
  const [texts, setTexts] = useState<Record<string, string>>(cached ?? {});
  useEffect(() => { load().then(setTexts); }, []);
  return texts;
}

export function pt(texts: Record<string, string>, key: string, fallback: string): string {
  return texts[key] || fallback;
}
