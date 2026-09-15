import { apiFetch } from "./client";

import type {
  ToolConnection,
  ToolIntegration,
} from "@/src/lib/types/tool";

export async function getToolIntegrations(): Promise<
  ToolIntegration[]
> {
  const response = await apiFetch("/api/tools/integrations");

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.error ||
        `Failed to fetch tool integrations (${response.status})`,
    );
  }

  const data = await response.json();

  return data.integrations ?? data;
}

export async function getToolConnections(): Promise<
  ToolConnection[]
> {
  const response = await apiFetch("/api/tools/connections");

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.error ||
        `Failed to fetch tool connections (${response.status})`,
    );
  }

  const data = await response.json();

  return data.connections ?? data;
}

export async function connectTool(
  providerId: string,
  credentials: Record<string, string>,
  connectionName = "Default",
): Promise<ToolConnection> {
  const response = await apiFetch(
    `/api/tools/${encodeURIComponent(providerId)}/connect`,
    {
      method: "POST",
      body: JSON.stringify({
        credentials,
        connectionName,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.error ||
        `Failed to connect ${providerId} (${response.status})`,
    );
  }

  const data = await response.json();

  return data.connection ?? data;
}

export async function disconnectTool(
  providerId: string,
): Promise<void> {
  const response = await apiFetch(
    `/api/tools/${encodeURIComponent(providerId)}/connect`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    throw new Error(
      errorBody?.error ||
        `Failed to disconnect ${providerId} (${response.status})`,
    );
  }
}