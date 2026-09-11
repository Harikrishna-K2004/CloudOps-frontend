"use client";

import { useEffect, useState } from "react";

import type { AIModel } from "@/src/lib/api/models";
import { getAvailableModels } from "@/src/lib/api/modelService";

export function useAIModels(
  provider: string | null,
  enabled = true,
) {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModels() {
      if (!provider || !enabled) {
        setModels([]);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setModels([]);

        const result = await getAvailableModels(provider);

        if (!cancelled) {
          setModels(result);
        }
      } catch (error) {
        if (!cancelled) {
          setModels([]);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load models",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadModels();

    return () => {
      cancelled = true;
    };
  }, [provider, enabled]);

  return {
    models,
    loading,
    error,
  };
}