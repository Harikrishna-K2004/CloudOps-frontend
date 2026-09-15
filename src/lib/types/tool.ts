export type ToolSource = "custom" | "mcp";

export type ToolStatus =
  | "connected"
  | "available"
  | "not_available"
  | "error";

export interface ToolConnectionField {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  secret?: boolean;
}

export interface ToolConnectionSchema {
  fields: ToolConnectionField[];
}

export interface DevOpsTool {
  id: string;
  name: string;
  description: string;
  sourceType: ToolSource;
  connectionSchema: ToolConnectionSchema;
  status: ToolStatus;
}

export interface ToolConnection {
  id: string;
  integrationId: string;
  providerId: string;
  connectionName: string;
  status: "connected" | "error" | "disabled";
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ToolIntegration {
  id: string;
  providerId: string;
  name: string;
  description: string;
  sourceType: ToolSource;
  connectionSchema: ToolConnectionSchema;
  isEnabled: boolean;
  status: ToolStatus;
  connection: ToolConnection | null;
}