"use client";

import { useEffect, useState } from "react";
import { KeyRound, Link } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";

import type {
  AIModel,
  AIProvider,
} from "@/src/lib/types/model";

interface ModelConnectionDialogProps {
  model: AIModel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: (model: AIModel) => void;
}

interface ConnectionForm {
  apiKey: string;
  baseUrl: string;
}

const EMPTY_FORM: ConnectionForm = {
  apiKey: "",
  baseUrl: "",
};

export function ModelConnectionDialog({
  model,
  open,
  onOpenChange,
  onConnected,
}: ModelConnectionDialogProps) {
  const [form, setForm] =
    useState<ConnectionForm>(EMPTY_FORM);

  const [isConnecting, setIsConnecting] =
    useState(false);

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM);
      setIsConnecting(false);
    }
  }, [open]);

  if (!model) {
    return null;
  }

  const updateField = (
    field: keyof ConnectionForm,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const isOllama = model.provider === "ollama";

  const providerName = getProviderName(
    model.provider,
  );

  const handleConnect = async () => {
    if (isOllama && !form.baseUrl.trim()) {
      return;
    }

    if (!isOllama && !form.apiKey.trim()) {
      return;
    }

    setIsConnecting(true);

    try {
      /*
       * Temporary frontend-only connection.
       *
       * Later this will become:
       *
       * POST /api/models/connect
       *
       * The backend will validate the credential
       * and securely store it in the database.
       *
       * The API key must NOT be stored in localStorage
       * or any frontend persistent storage.
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 700),
      );

      onConnected?.(model);
      onOpenChange(false);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
            <Link className="h-5 w-5" />
          </div>

          <DialogTitle>
            Connect {model.name}
          </DialogTitle>

          <DialogDescription>
            Connect {model.name} to CloudOps AI using your{" "}
            {providerName} configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {isOllama ? (
            <div className="space-y-2">
              <Label htmlFor="ollama-base-url">
                Ollama URL
              </Label>

              <Input
                id="ollama-base-url"
                type="url"
                placeholder="http://localhost:11434"
                value={form.baseUrl}
                onChange={(event) =>
                  updateField(
                    "baseUrl",
                    event.target.value,
                  )
                }
                disabled={isConnecting}
              />

              <p className="text-xs text-muted-foreground">
                The URL where your Ollama server is
                running.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="model-api-key">
                API Key
              </Label>

              <Input
                id="model-api-key"
                type="password"
                placeholder={`Enter your ${providerName} API key`}
                value={form.apiKey}
                onChange={(event) =>
                  updateField(
                    "apiKey",
                    event.target.value,
                  )
                }
                disabled={isConnecting}
              />
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
            <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />

            <span>
              Your credentials will be sent to the backend
              for validation and secure storage. They will
              not be persisted by this frontend.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isConnecting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConnect}
            disabled={
              isConnecting ||
              (isOllama
                ? !form.baseUrl.trim()
                : !form.apiKey.trim())
            }
          >
            {isConnecting
              ? "Connecting..."
              : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getProviderName(
  provider: AIProvider,
): string {
  switch (provider) {
    case "openai":
      return "OpenAI";

    case "anthropic":
      return "Anthropic";

    case "gemini":
      return "Google AI";

    case "ollama":
      return "Ollama";

    default:
      return "AI provider";
  }
}