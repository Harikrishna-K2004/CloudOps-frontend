"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Link,
  Loader2,
} from "lucide-react";

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
  ToolIntegration,
} from "@/src/lib/types/tool";

import { connectTool } from "@/src/lib/api/tools";

interface ToolConnectionDialogProps {
  tool: ToolIntegration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void | Promise<void>;
}

export function ToolConnectionDialog({
  tool,
  open,
  onOpenChange,
  onConnected,
}: ToolConnectionDialogProps) {
  const [values, setValues] =
    useState<Record<string, string>>({});

  const [isConnecting, setIsConnecting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setValues({});
      setIsConnecting(false);
      setError(null);
    }
  }, [open]);

  if (!tool) {
    return null;
  }

  const fields =
    tool.connectionSchema?.fields ?? [];

  const updateField = (
    key: string,
    value: string,
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    setError(null);
  };

  const handleConnect = async () => {
    const missingRequiredField = fields.find(
      (field) =>
        field.required &&
        !values[field.key]?.trim(),
    );

    if (missingRequiredField) {
      setError(
        `${missingRequiredField.label} is required.`,
      );
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      await connectTool(
        tool.providerId,
        values,
      );

      await onConnected?.();

      onOpenChange(false);
    } catch (error) {
      console.error(
        `Failed to connect ${tool.providerId}:`,
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to connect the integration.",
      );
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
            Connect {tool.name}
          </DialogTitle>

          <DialogDescription>
            Configure {tool.name} so CloudOps AI can
            use its available tools when investigating
            your infrastructure.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {fields.map((field) => (
            <div
              key={field.key}
              className="space-y-2"
            >
              <Label htmlFor={`${tool.providerId}-${field.key}`}>
                {field.label}
              </Label>

              <Input
                id={`${tool.providerId}-${field.key}`}
                type={
                  field.type === "password" ||
                  field.secret
                    ? "password"
                    : "text"
                }
                placeholder={`Enter ${field.label.toLowerCase()}`}
                value={values[field.key] ?? ""}
                onChange={(event) =>
                  updateField(
                    field.key,
                    event.target.value,
                  )
                }
                disabled={isConnecting}
                autoComplete="off"
              />
            </div>
          ))}

          {fields.length === 0 && (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
              This integration does not require any
              connection credentials.
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
            <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />

            <span>
              Credentials are sent directly to the
              CloudOps backend for secure storage. They
              are not persisted by this frontend.
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
            onClick={() => void handleConnect()}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}