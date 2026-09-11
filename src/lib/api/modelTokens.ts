import { apiFetch } from "./client";
import { clearCachedModels } from "./modelCache";

export interface ModelTokenStatus {
  id?: string;
  provider: string;
  isConfigured: boolean;
}

export async function getModelTokenStatuses(): Promise<
  ModelTokenStatus[]
> {
  const response = await apiFetch("/api/model-tokens");

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.error ||
        `Failed to fetch model token status (${response.status})`,
    );
  }

  return response.json();
}

export async function saveModelToken(
  provider: string,
  token: string,
): Promise<ModelTokenStatus> {
  const response = await apiFetch(
    `/api/model-tokens/${encodeURIComponent(provider)}`,
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.error ||
        `Failed to save API key (${response.status})`,
    );
  }

  clearCachedModels(provider);
  return response.json();
}

export async function deleteModelToken(
  provider: string,
): Promise<void> {
  const response = await apiFetch(
    `/api/model-tokens/${encodeURIComponent(provider)}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.error ||
        `Failed to delete API key (${response.status})`,
    );
  }
  
  clearCachedModels(provider);
}