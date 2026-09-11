import { apiFetch } from "./client";

export interface AIModel {
  id: string;
  name: string;
}

export interface AIModelsResponse {
  provider: string;
  models: AIModel[];
  cached?: boolean;
}

export async function getAIModels(
  provider: string,
): Promise<AIModelsResponse> {
  const response = await apiFetch(`/api/models/${encodeURIComponent(provider)}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.error ||
        `Failed to fetch models (${response.status})`,
    );
  }

  return response.json();
}