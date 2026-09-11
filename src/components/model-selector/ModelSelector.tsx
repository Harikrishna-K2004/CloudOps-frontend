"use client";

import {
  Check,
  ChevronDown,
  Cpu,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import { useAIProviders } from "@/src/lib/hooks/useAIProviders";
import { useAIModels } from "@/src/lib/hooks/useAIModels";
import { useModelTokens } from "@/src/lib/hooks/useModelTokens";

import { ModelConnectionDialog } from "./ModelConnectionDialog";

import type {
  AIModel,
  AIProvider,
} from "@/src/lib/types/model";

interface ModelSelectorProps {
  value?: AIModel;
  onChange?: (model: AIModel | undefined) => void;
}

export function ModelSelector({
  value,
  onChange,
}: ModelSelectorProps) {
  const {
    providers,
    loading: providersLoading,
  } = useAIProviders();

  const {
    loading: tokensLoading,
    isConfigured,
    refresh: refreshTokens,
  } = useModelTokens();

  const [selectedProvider, setSelectedProvider] =
    useState<AIProvider | null>(null);

  const [connectionProvider, setConnectionProvider] =
    useState<AIProvider | null>(null);

  const [connectionOpen, setConnectionOpen] =
    useState(false);

  const [invalidProviders, setInvalidProviders] =
    useState<Set<string>>(new Set());

  const providerConfigured = selectedProvider
    ? selectedProvider.id === "ollama" ||
      (isConfigured(selectedProvider.id) &&
        !invalidProviders.has(selectedProvider.id))
    : false;

  const {
    models,
    loading: modelsLoading,
    error: modelsError,
  } = useAIModels(
    selectedProvider?.id ?? null,
    providerConfigured && !tokensLoading,
  );

  useEffect(() => {
    if (
      selectedProvider ||
      providers.length === 0 ||
      tokensLoading
    ) {
      return;
    }

    const firstConfiguredProvider =
      providers.find(
        (provider) =>
          provider.id === "ollama" ||
          isConfigured(provider.id),
      );

    if (firstConfiguredProvider) {
      setSelectedProvider(firstConfiguredProvider);
    }
  }, [
    providers,
    selectedProvider,
    tokensLoading,
    isConfigured,
  ]);

  useEffect(() => {
    if (
      !selectedProvider ||
      selectedProvider.id === "ollama" ||
      !modelsError
    ) {
      return;
    }

    const isInvalidApiKey =
      /invalid_api_key|invalid api key|unauthorized|invalid.*key/i.test(
        modelsError,
      );

    if (!isInvalidApiKey) {
      return;
    }

    setInvalidProviders((current) => {
      const next = new Set(current);
      next.add(selectedProvider.id);
      return next;
    });

    onChange?.(undefined);
  }, [
    selectedProvider,
    modelsError,
    onChange,
  ]);

  useEffect(() => {
    if (!selectedProvider) {
      return;
    }

    if (!providerConfigured) {
      if (value) {
        onChange?.(undefined);
      }

      return;
    }

    if (modelsLoading) {
      if (
        value &&
        value.provider !== selectedProvider.id
      ) {
        onChange?.(undefined);
      }

      return;
    }

    if (modelsError) {
      if (value?.provider === selectedProvider.id) {
        onChange?.(undefined);
      }

      return;
    }

    if (models.length === 0) {
      if (
        value &&
        value.provider !== selectedProvider.id
      ) {
        onChange?.(undefined);
      }

      return;
    }

    const currentModelIsValid =
      value?.provider === selectedProvider.id &&
      models.some((model) => model.id === value.id);

    if (currentModelIsValid) {
      return;
    }

    const defaultModel = models[0];

    onChange?.({
      id: defaultModel.id,
      name: defaultModel.name,
      provider: selectedProvider.id,
      description: selectedProvider.name,
      local: selectedProvider.id === "ollama",
    });
  }, [
    selectedProvider,
    providerConfigured,
    models,
    modelsLoading,
    modelsError,
    value,
    onChange,
  ]);

  const selectedModel = useMemo(() => {
    if (
      value &&
      value.provider === selectedProvider?.id
    ) {
      return value;
    }

    return null;
  }, [value, selectedProvider]);

  const handleProviderSelect = (
    provider: AIProvider,
  ) => {
    setSelectedProvider(provider);

    if (value?.provider !== provider.id) {
      onChange?.(undefined);
    }
  };

  const handleModelSelect = (
    model: AIModel,
  ) => {
    if (!selectedProvider) {
      return;
    }

    onChange?.({
      ...model,
      provider: selectedProvider.id,
      description: selectedProvider.name,
      local: selectedProvider.id === "ollama",
    });
  };

  const handleConnectProvider = (
    provider: AIProvider,
  ) => {
    setInvalidProviders((current) => {
      const next = new Set(current);
      next.delete(provider.id);
      return next;
    });

    setConnectionProvider(provider);
    setConnectionOpen(true);
  };

  const providerName =
    selectedProvider?.name ?? "Select provider";

  const displayModelName = (() => {
    if (providersLoading || tokensLoading) {
      return "Loading...";
    }

    if (!selectedProvider) {
      return "Select provider";
    }

    if (!providerConfigured) {
      return "Not configured";
    }

    if (modelsLoading) {
      return "Loading model...";
    }

    if (modelsError) {
      return "Not configured";
    }

    return selectedModel?.name ?? "No model";
  })();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            className="h-9 gap-2 px-2.5 font-medium"
            disabled={
              providersLoading ||
              tokensLoading
            }
          >
            {providersLoading ||
            tokensLoading ||
            modelsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Cpu className="h-4 w-4 text-muted-foreground" />
            )}

            <span className="max-w-40 truncate">
              {displayModelName}
            </span>

            {selectedProvider && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                · {providerName}
              </span>
            )}

            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="w-80 max-h-[70vh] overflow-y-auto"
        >
          <DropdownMenuLabel>
            AI Provider
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {providersLoading ||
          tokensLoading ? (
            <div className="flex items-center gap-2 px-3 py-5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading providers...
            </div>
          ) : (
            providers.map((provider) => {
              const configured =
                provider.id === "ollama" ||
                (isConfigured(provider.id) &&
                  !invalidProviders.has(provider.id));

              const active =
                selectedProvider?.id === provider.id;

              return (
                <DropdownMenuItem
                  key={provider.id}
                  onClick={() =>
                    handleProviderSelect(provider)
                  }
                  className="cursor-pointer p-3"
                >
                  <div className="flex w-full items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                      <Cpu className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {provider.name}
                        </span>

                        {configured && (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            {provider.id === "ollama"
                              ? "LOCAL"
                              : "CONNECTED"}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {provider.id === "ollama"
                          ? "Local provider"
                          : configured
                            ? "API key configured"
                            : "Not configured"}
                      </div>
                    </div>

                    {!configured ? (
                      <button
                        type="button"
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Connect ${provider.name}`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleConnectProvider(provider);
                        }}
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                    ) : active ? (
                      <Check className="h-4 w-4" />
                    ) : null}
                  </div>
                </DropdownMenuItem>
              );
            })
          )}

          {selectedProvider && (
            <>
              <DropdownMenuSeparator />

              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-sm font-medium">
                  {selectedProvider.name}
                </div>

                {selectedProvider.id !== "ollama" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 shrink-0 gap-1.5 whitespace-nowrap px-2"
                    aria-label={
                      providerConfigured
                        ? `Manage ${selectedProvider.name} API key`
                        : `Connect ${selectedProvider.name}`
                    }
                    onClick={() =>
                      handleConnectProvider(selectedProvider)
                    }
                  >
                    <KeyRound className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {providerConfigured
                        ? "Manage API key"
                        : "Connect provider"}
                    </span>
                  </Button>
                )}
              </div>

              {!providerConfigured ? (
                <div className="px-3 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        Provider not configured
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Add an API key to discover and use
                        models from {selectedProvider.name}.
                      </p>
                    </div>
                  </div>
                </div>
              ) : modelsLoading ? (
                <div className="flex items-center gap-2 px-3 py-5 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Discovering available models...
                </div>
              ) : modelsError ? (
                <div className="px-3 py-4 text-sm text-destructive">
                  {modelsError}
                </div>
              ) : models.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground">
                  No models are currently available for this
                  provider.
                </div>
              ) : (
                models.map((model) => {
                  const uiModel: AIModel = {
                    id: model.id,
                    name: model.name,
                    provider: selectedProvider.id,
                    description: selectedProvider.name,
                    local:
                      selectedProvider.id === "ollama",
                  };

                  return (
                    <DropdownMenuItem
                      key={model.id}
                      onClick={() =>
                        handleModelSelect(uiModel)
                      }
                      className="cursor-pointer p-3"
                    >
                      <div className="flex w-full items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                          <Cpu className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-medium">
                            {model.name}
                          </div>

                          <div className="truncate text-xs text-muted-foreground">
                            {selectedProvider.name}
                          </div>
                        </div>

                        {selectedModel?.id ===
                          model.id && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ModelConnectionDialog
        provider={connectionProvider}
        configured={
          connectionProvider
            ? connectionProvider.id === "ollama" ||
              isConfigured(connectionProvider.id)
            : false
        }
        open={connectionOpen}
        onOpenChange={setConnectionOpen}
        onChanged={async () => {
          await refreshTokens();

          if (connectionProvider) {
            setInvalidProviders((current) => {
              const next = new Set(current);
              next.delete(connectionProvider.id);
              return next;
            });

            setSelectedProvider(connectionProvider);
            onChange?.(undefined);
          }
        }}
      />
    </>
  );
}