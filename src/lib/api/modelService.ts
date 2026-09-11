import {
  getAIModels,
  type AIModel,
} from "./models";
import {
  getCachedModels,
  setCachedModels,
  clearCachedModels,
} from "./modelCache";

export async function getAvailableModels(
  provider: string,
): Promise<AIModel[]> {
  const cachedModels = getCachedModels(provider);

  if (cachedModels) {
    return cachedModels;
  }

  const result = await getAIModels(provider);

  setCachedModels(provider, result.models);

  return result.models;
}

export function invalidateModelCache(
  provider?: string,
): void {
  clearCachedModels(provider);
}