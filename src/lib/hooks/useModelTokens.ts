"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getModelTokenStatuses,
  type ModelTokenStatus,
} from "@/src/lib/api/modelTokens";

export function useModelTokens() {
  const [tokens, setTokens] = useState<ModelTokenStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getModelTokenStatuses();

      setTokens(
        Array.isArray(result)
          ? result
          : [],
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load API key status",
      );

      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  function isConfigured(provider: string): boolean {
    return tokens.some(
      (token) =>
        token.provider === provider &&
        token.isConfigured,
    );
  }

  return {
    tokens,
    loading,
    error,
    isConfigured,
    refresh: loadTokens,
  };
}