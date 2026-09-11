"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  CircleAlert,
  CircleDot,
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

import {
  DEVOPS_TOOLS,
  type DevOpsTool,
  type ToolStatus,
} from "@/src/lib/types/tool";

import { ToolConnectionDialog } from "./ToolConnectionDialog";

interface ToolsSelectorProps {
  onSelectionChange?: (toolIds: string[]) => void;
}

function StatusIndicator({
  status,
}: {
  status: ToolStatus;
}) {
  switch (status) {
    case "connected":
      return (
        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
          <Check className="h-3 w-3" />
          Connected
        </span>
      );

    case "available":
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CircleDot className="h-3 w-3" />
          Connect
        </span>
      );

    case "not_available":
    default:
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CircleAlert className="h-3 w-3" />
          Not available
        </span>
      );
  }
}

export function ToolsSelector({
  onSelectionChange,
}: ToolsSelectorProps) {
  const [tools, setTools] = useState<DevOpsTool[]>(
    DEVOPS_TOOLS,
  );

  /*
   * Tool currently being configured.
   */
  const [selectedTool, setSelectedTool] =
    useState<DevOpsTool | null>(null);

  /*
   * Keep the connection dialog state separate
   * from the dropdown state.
   *
   * This is important because the dropdown and
   * connection dialog are two different overlays.
   */
  const [isDialogOpen, setIsDialogOpen] =
    useState(false);

  /*
   * Tools selected for the current chat request.
   *
   * Initially select tools that are already connected.
   */
  const [selectedTools, setSelectedTools] =
    useState<string[]>(
      DEVOPS_TOOLS.filter(
        (tool) => tool.status === "connected",
      ).map((tool) => tool.id),
    );

  const connectedCount = tools.filter(
    (tool) => tool.status === "connected",
  ).length;

  /*
   * Open the connection dialog for an available tool.
   */
  const handleConnect = (tool: DevOpsTool) => {
    if (tool.status !== "available") {
      return;
    }

    setSelectedTool(tool);
    setIsDialogOpen(true);
  };

  /*
   * Called after the connection dialog successfully
   * connects a tool.
   */
  const handleConnected = (
    toolId: DevOpsTool["id"],
  ) => {
    setTools((currentTools) =>
      currentTools.map((tool) =>
        tool.id === toolId
          ? {
              ...tool,
              status: "connected",
            }
          : tool,
      ),
    );

    setSelectedTools((currentTools) => {
      if (currentTools.includes(toolId)) {
        return currentTools;
      }

      const updatedTools = [
        ...currentTools,
        toolId,
      ];

      onSelectionChange?.(updatedTools);

      return updatedTools;
    });
  };

  /*
   * Select/unselect an already connected tool
   * for the current chat request.
   */
  const toggleToolSelection = (
    tool: DevOpsTool,
  ) => {
    if (tool.status !== "connected") {
      return;
    }

    setSelectedTools((currentTools) => {
      const isSelected = currentTools.includes(
        tool.id,
      );

      const updatedTools = isSelected
        ? currentTools.filter(
            (id) => id !== tool.id,
          )
        : [...currentTools, tool.id];

      onSelectionChange?.(updatedTools);

      return updatedTools;
    });
  };

  /*
   * Handles closing the connection dialog.
   */
  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);

    if (!open) {
      setSelectedTool(null);
    }
  };

  return (
    <>
      {/* =================================================
          TOOLS DROPDOWN
          ================================================= */}

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
                {selectedTools.length}/{connectedCount}
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
              <span>DevOps tools</span>

              <span className="text-xs font-normal text-muted-foreground">
                {connectedCount} connected
              </span>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          {tools.map((tool) => {
            const isAvailable =
              tool.status === "available";

            const isConnected =
              tool.status === "connected";

            const isUnavailable =
              tool.status === "not_available";

            const isSelected =
              selectedTools.includes(tool.id);

            return (
              <DropdownMenuItem
                key={tool.id}
                disabled={isUnavailable}
                onClick={() => {
                  /*
                   * AVAILABLE TOOL
                   *
                   * Same simple interaction pattern
                   * as the model selector.
                   *
                   * Clicking the tool sets the selected
                   * tool and opens the connection dialog.
                   */
                  if (isAvailable) {
                    handleConnect(tool);
                    return;
                  }

                  /*
                   * CONNECTED TOOL
                   *
                   * Toggle whether this tool should be
                   * included in the current chat request.
                   */
                  if (isConnected) {
                    toggleToolSelection(tool);
                  }
                }}
                className={[
                  "cursor-pointer p-3",
                  isUnavailable
                    ? "cursor-not-allowed"
                    : "",
                ].join(" ")}
              >
                <div className="flex w-full items-center gap-3">
                  {/* Tool icon */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                    <Plug className="h-4 w-4" />
                  </div>

                  {/* Tool information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {tool.name}
                      </span>

                      {isConnected &&
                        isSelected && (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        )}
                    </div>

                    <div className="truncate text-xs text-muted-foreground">
                      {tool.description}
                    </div>
                  </div>

                  {/* Status */}
                  <StatusIndicator
                    status={tool.status}
                  />
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* =================================================
          TOOL CONNECTION DIALOG

          IMPORTANT:
          This is OUTSIDE DropdownMenu.
          It has its own explicit open state.
          ================================================= */}

      <ToolConnectionDialog
        tool={selectedTool}
        open={isDialogOpen}
        onOpenChange={handleDialogChange}
        onConnected={handleConnected}
      />
    </>
  );
}