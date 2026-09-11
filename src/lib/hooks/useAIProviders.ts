"use client";

import { useEffect, useState } from "react";
import {
  getAIProviders,
  type AIProvider,
} from "@/src/lib/api/providers";
import {
  getCachedProviders,
  setCachedProviders,
} from "@/src/lib/api/providerCache";

export function useAIProviders() {
  const [providers, setProviders] = useState<AIProvider[]>(
    () => getCachedProviders() ?? [],
  );
  const [loading, setLoading] = useState(
    () => getCachedProviders() === null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getCachedProviders()) {
      return;
    }

    let cancelled = false;

    async function loadProviders() {
      try {
        setLoading(true);
        setError(null);

        const result = await getAIProviders();

        if (!cancelled) {
          setCachedProviders(result.providers);
          setProviders(result.providers);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load AI providers",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProviders();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    providers,
    loading,
    error,
  };
}