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

import type { DevOpsTool } from "@/src/lib/types/tool";

interface ToolConnectionDialogProps {
  tool: DevOpsTool | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: (toolId: DevOpsTool["id"]) => void;
}

interface ConnectionForm {
  url: string;
  username: string;
  token: string;
  projectId: string;
}

const EMPTY_FORM: ConnectionForm = {
  url: "",
  username: "",
  token: "",
  projectId: "",
};

export function ToolConnectionDialog({
  tool,
  open,
  onOpenChange,
  onConnected,
}: ToolConnectionDialogProps) {
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

  if (!tool) {
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

  /*
   * Temporary frontend-only connection.
   *
   * Later:
   * POST /api/tools/{tool.id}/connect
   *
   * The backend will validate and securely store
   * the credentials. The frontend must never persist
   * tokens/API keys in localStorage.
   */
  const handleConnect = async () => {
    setIsConnecting(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 700),
      );

      onConnected?.(tool.id);
      onOpenChange(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const renderTextInput = ({
    id,
    label,
    placeholder,
    value,
    field,
    type = "text",
  }: {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    field: keyof ConnectionForm;
    type?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) =>
          updateField(field, event.target.value)
        }
        disabled={isConnecting}
      />
    </div>
  );

  const renderFields = () => {
    switch (tool.id) {
      case "jenkins":
        return (
          <>
            {renderTextInput({
              id: "jenkins-url",
              label: "Jenkins URL",
              placeholder:
                "https://jenkins.example.com",
              value: form.url,
              field: "url",
            })}

            {renderTextInput({
              id: "jenkins-username",
              label: "Username",
              placeholder: "Username",
              value: form.username,
              field: "username",
            })}

            {renderTextInput({
              id: "jenkins-token",
              label: "API Token",
              placeholder: "Jenkins API token",
              value: form.token,
              field: "token",
              type: "password",
            })}
          </>
        );

      case "github":
        return (
          <>
            {renderTextInput({
              id: "github-url",
              label: "GitHub URL",
              placeholder: "https://github.com",
              value: form.url,
              field: "url",
            })}

            {renderTextInput({
              id: "github-token",
              label: "Personal Access Token",
              placeholder: "GitHub token",
              value: form.token,
              field: "token",
              type: "password",
            })}
          </>
        );

      case "prometheus":
        return (
          <>
            {renderTextInput({
              id: "prometheus-url",
              label: "Prometheus URL",
              placeholder:
                "http://localhost:9090",
              value: form.url,
              field: "url",
            })}

            {renderTextInput({
              id: "prometheus-token",
              label: "API Token",
              placeholder:
                "API token if authentication is enabled",
              value: form.token,
              field: "token",
              type: "password",
            })}
          </>
        );

      case "grafana":
        return (
          <>
            {renderTextInput({
              id: "grafana-url",
              label: "Grafana URL",
              placeholder:
                "https://grafana.example.com",
              value: form.url,
              field: "url",
            })}

            {renderTextInput({
              id: "grafana-token",
              label: "API Token",
              placeholder: "Grafana API token",
              value: form.token,
              field: "token",
              type: "password",
            })}
          </>
        );

      case "kubernetes":
        return (
          <>
            {renderTextInput({
              id: "kubernetes-name",
              label: "Cluster Name",
              placeholder: "production-cluster",
              value: form.projectId,
              field: "projectId",
            })}

            {renderTextInput({
              id: "kubernetes-url",
              label: "API Server URL",
              placeholder:
                "https://kubernetes-api-server",
              value: form.url,
              field: "url",
            })}

            {renderTextInput({
              id: "kubernetes-token",
              label: "Service Account Token",
              placeholder:
                "Kubernetes authentication token",
              value: form.token,
              field: "token",
              type: "password",
            })}
          </>
        );

      case "docker":
        return (
          <>
            {renderTextInput({
              id: "docker-host",
              label: "Docker Host",
              placeholder:
                "unix:///var/run/docker.sock",
              value: form.url,
              field: "url",
            })}

            {renderTextInput({
              id: "docker-token",
              label: "Registry Token",
              placeholder:
                "Optional registry token",
              value: form.token,
              field: "token",
              type: "password",
            })}
          </>
        );

      case "gcp":
        return (
          <>
            {renderTextInput({
              id: "gcp-project",
              label: "GCP Project ID",
              placeholder: "my-gcp-project",
              value: form.projectId,
              field: "projectId",
            })}

            <div className="rounded-lg border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
              Google Cloud authentication will be
              handled securely by the backend. Do not
              paste service-account credentials into
              this frontend form.
            </div>
          </>
        );

      default:
        return null;
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
            Configure the connection required for
            CloudOps AI to access {tool.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {renderFields()}

          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
            <KeyRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />

            <span>
              Credentials will be sent to the backend
              for validation and secure storage. They
              will not be persisted by this frontend.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() =>
              onOpenChange(false)
            }
            disabled={isConnecting}
          >
            Cancel
          </Button>

          <Button
            onClick={handleConnect}
            disabled={isConnecting}
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