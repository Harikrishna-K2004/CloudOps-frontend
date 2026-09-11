import type { AIModel } from "./models";

const modelCache = new Map<string, AIModel[]>();

export function getCachedModels(
  provider: string,
): AIModel[] | null {
  return modelCache.get(provider) ?? null;
}

export function setCachedModels(
  provider: string,
  models: AIModel[],
): void {
  modelCache.set(provider, models);
}

export function clearCachedModels(
  provider?: string,
): void {
  if (provider) {
    modelCache.delete(provider);
    return;
  }

  modelCache.clear();
}

export function hasCachedModels(
  provider: string,
): boolean {
  return modelCache.has(provider);
}