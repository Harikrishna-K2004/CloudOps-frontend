import { apiFetch } from "./client";

export interface AIProvider {
  id: string;
  name: string;
  requires_api_key: boolean;
}

export interface AIProvidersResponse {
  providers: AIProvider[];
}

export async function getAIProviders(): Promise<AIProvidersResponse> {
  const response = await apiFetch("/api/models/");

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.error ||
        `Failed to fetch providers (${response.status})`,
    );
  }

  return response.json();
}