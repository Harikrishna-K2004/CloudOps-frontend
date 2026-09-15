"use client";

import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  CircleAlert,
  CircleDot,
  Loader2,
  Plug,
  Wrench,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

import type { ToolIntegration } from "@/src/lib/types/tool";

import {
  disconnectTool,
  getToolIntegrations,
} from "@/src/lib/api/tools";

import { ToolConnectionDialog } from "./ToolConnectionDialog";

function StatusIndicator({
  status,
}: {
  status: ToolIntegration["status"];
}) {
  switch (status) {
    case "connected":
      return (
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" />
          Connected
        </span>
      );

    case "error":
      return (
        <span className="flex items-center gap-1.5 text-xs text-destructive">
          <CircleAlert className="h-3 w-3" />
          Error
        </span>
      );

    case "not_available":
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CircleAlert className="h-3 w-3" />
          Not available
        </span>
      );

    case "available":
    default:
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CircleDot className="h-3 w-3" />
          Connect
        </span>
      );
  }
}

export function ToolsSelector() {
  const [tools, setTools] = useState<ToolIntegration[]>([]);
  const [selectedTool, setSelectedTool] =
    useState<ToolIntegration | null>(null);

  const [isDialogOpen, setIsDialogOpen] =
    useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [disconnectingId, setDisconnectingId] =
    useState<string | null>(null);

  const loadTools = async () => {
    try {
      setIsLoading(true);

      const integrations =
        await getToolIntegrations();

      setTools(integrations);
    } catch (error) {
      console.error(
        "Failed to load tool integrations:",
        error,
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTools();
  }, []);

  const connectedCount = tools.filter(
    (tool) => tool.status === "connected",
  ).length;

  const handleConnect = (
    tool: ToolIntegration,
  ) => {
    if (
      tool.status !== "available" &&
      tool.status !== "error"
    ) {
      return;
    }

    setSelectedTool(tool);
    setIsDialogOpen(true);
  };

  const handleConnected = async () => {
    await loadTools();
  };

  const handleDisconnect = async (
    tool: ToolIntegration,
  ) => {
    if (tool.status !== "connected") {
      return;
    }

    try {
      setDisconnectingId(tool.providerId);

      await disconnectTool(tool.providerId);

      await loadTools();
    } catch (error) {
      console.error(
        "Failed to disconnect tool:",
        error,
      );
    } finally {
      setDisconnectingId(null);
    }
  };

  const handleDialogChange = (
    open: boolean,
  ) => {
    setIsDialogOpen(open);

    if (!open) {
      setSelectedTool(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="h-8 gap-1.5 rounded-lg px-2 text-xs font-medium"
            >
              <Wrench className="h-3.5 w-3.5" />

              <span>Tools</span>

              <span className="text-muted-foreground">
                {connectedCount}
              </span>

              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          }
        />

        <DropdownMenuContent
          align="end"
          side="top"
          className="w-80"
        >
          <DropdownMenuLabel>
            <div className="flex items-center justify-between">
              <span>DevOps integrations</span>

              <span className="text-xs font-normal text-muted-foreground">
                {connectedCount} connected
              </span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading integrations...
            </div>
          ) : tools.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No integrations available.
            </div>
          ) : (
            tools.map((tool) => {
              const isConnected =
                tool.status === "connected";

              const isUnavailable =
                tool.status === "not_available";

              const isDisconnecting =
                disconnectingId ===
                tool.providerId;

              return (
                <DropdownMenuItem
                  key={tool.providerId}
                  disabled={
                    isUnavailable ||
                    isDisconnecting
                  }
                  onClick={() => {
                    if (isConnected) {
                      void handleDisconnect(tool);
                      return;
                    }

                    handleConnect(tool);
                  }}
                  className={[
                    "cursor-pointer p-3",
                    isUnavailable
                      ? "cursor-not-allowed"
                      : "",
                  ].join(" ")}
                >
                  <div className="flex w-full items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                      <Plug className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {tool.name}
                        </span>

                        {isConnected && (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>

                      <div className="truncate text-xs text-muted-foreground">
                        {tool.description}
                      </div>
                    </div>

                    {isDisconnecting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      <StatusIndicator
                        status={tool.status}
                      />
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })
          )}

          {connectedCount > 0 && (
            <>
              <DropdownMenuSeparator />

              <div className="px-3 py-2 text-[11px] leading-4 text-muted-foreground">
                Connected integrations are automatically
                available to CloudOps AI. You don't need
                to select individual tools.
              </div>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ToolConnectionDialog
        tool={selectedTool}
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
        onConnected={handleConnected}
      />
    </>
  );
}