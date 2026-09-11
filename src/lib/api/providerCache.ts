import type { AIProvider } from "./providers";

let providersCache: AIProvider[] | null = null;

export function getCachedProviders(): AIProvider[] | null {
  return providersCache;
}

export function setCachedProviders(
  providers: AIProvider[],
): void {
  providersCache = providers;
}

export function clearCachedProviders(): void {
  providersCache = null;
}