"use client";

import { useState } from "react";
import {
  saveModelToken,
  deleteModelToken,
} from "@/src/lib/api/modelTokens";
import { clearCachedModels } from "@/src/lib/api/modelCache";

export function useModelTokenActions() {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(provider: string, token: string) {
    try {
      setSaving(true);
      setError(null);

      const result = await saveModelToken(provider, token);

      clearCachedModels(provider);

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to save API key";

      setError(message);
      throw error;
    } finally {
      setSaving(false);
    }
  }

  async function remove(provider: string) {
    try {
      setDeleting(true);
      setError(null);

      await deleteModelToken(provider);

      clearCachedModels(provider);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete API key";

      setError(message);
      throw error;
    } finally {
      setDeleting(false);
    }
  }

  return {
    save,
    remove,
    saving,
    deleting,
    error,
  };
}