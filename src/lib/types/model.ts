export type AIProviderId = string;

export interface AIProvider {
  id: AIProviderId;
  name: string;
  requires_api_key: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  provider: AIProviderId;
  description?: string;
  local?: boolean;
}