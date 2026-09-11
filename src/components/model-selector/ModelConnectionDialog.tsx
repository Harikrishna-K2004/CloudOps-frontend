"use client";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

import { useModelTokenActions } from "@/src/lib/hooks/useModelTokenActions";

import type { AIProvider } from "@/src/lib/types/model";

interface ModelConnectionDialogProps {
  provider: AIProvider | null;
  configured: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
}

export function ModelConnectionDialog({
  provider,
  configured,
  open,
  onOpenChange,
  onChanged,
}: ModelConnectionDialogProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  const {
    save,
    remove,
    saving,
    deleting,
    error,
  } = useModelTokenActions();

  if (!provider) {
    return null;
  }

  const isBusy = saving || deleting;

  const handleSave = async () => {
    const trimmedKey = apiKey.trim();

    if (!trimmedKey || isBusy) {
      return;
    }

    try {
      await save(provider.id, trimmedKey);

      setApiKey("");
      setShowKey(false);

      onChanged?.();
      onOpenChange(false);
    } catch {
      // The hook exposes the error for display below.
    }
  };

  const handleDelete = async () => {
    if (isBusy) {
      return;
    }

    try {
      await remove(provider.id);

      setApiKey("");
      setShowKey(false);

      onChanged?.();
      onOpenChange(false);
    } catch {
      // The hook exposes the error for display below.
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isBusy) {
          onOpenChange(nextOpen);

          if (!nextOpen) {
            setApiKey("");
            setShowKey(false);
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted/50">
              <KeyRound className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <DialogTitle>
                {configured
                  ? `Manage ${provider.name} API key`
                  : `Connect ${provider.name}`}
              </DialogTitle>

              <DialogDescription className="mt-1">
                {configured
                  ? "Replace or remove the API key used to access this provider."
                  : `Add an API key to discover and use ${provider.name} models.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {configured && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />

              <div>
                <p className="text-sm font-medium">
                  API key connected
                </p>

                <p className="text-xs text-muted-foreground">
                  Your existing key is securely stored.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor={`api-key-${provider.id}`}
              className="text-sm font-medium"
            >
              {configured
                ? "New API key"
                : "API key"}
            </label>

            <div className="relative">
              <Input
                id={`api-key-${provider.id}`}
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(event) =>
                  setApiKey(event.target.value)
                }
                placeholder={
                  configured
                    ? "Enter a new API key"
                    : "Enter your API key"
                }
                disabled={isBusy}
                autoComplete="off"
                className="h-10 pr-10"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={isBusy || !apiKey}
                onClick={() =>
                  setShowKey((current) => !current)
                }
                className="absolute right-1 top-1"
                aria-label={
                  showKey
                    ? "Hide API key"
                    : "Show API key"
                }
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            <p className="text-xs leading-5 text-muted-foreground">
              Your key is encrypted before being stored and
              is never displayed after it is saved.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {error}
            </div>
          )}

          {configured && (
            <div className="border-t pt-4">
              <button
                type="button"
                disabled={isBusy}
                onClick={handleDelete}
                className="flex items-center gap-2 text-sm font-medium text-destructive transition-colors hover:text-destructive/80 disabled:pointer-events-none disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                {deleting
                  ? "Removing API key..."
                  : "Remove API key"}
              </button>

              <p className="mt-1 pl-6 text-xs text-muted-foreground">
                Removing the key will disable this provider
                until it is connected again.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              isBusy || apiKey.trim().length === 0
            }
            onClick={handleSave}
          >
            {saving && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {saving
              ? "Saving..."
              : configured
                ? "Update API key"
                : "Connect provider"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}