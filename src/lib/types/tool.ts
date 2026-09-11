export type ToolStatus =
  | "connected"
  | "available"
  | "not_available";

export type ToolId =
  | "github"
  | "jenkins"
  | "kubernetes"
  | "docker"
  | "prometheus"
  | "grafana"
  | "gcp";

export interface DevOpsTool {
  id: ToolId;
  name: string;
  description: string;
  status: ToolStatus;
}

export const DEVOPS_TOOLS: DevOpsTool[] = [
  {
    id: "github",
    name: "GitHub",
    description: "Repositories, pull requests and workflows",
    status: "available",
  },
  {
    id: "jenkins",
    name: "Jenkins",
    description: "Builds, pipelines and deployments",
    status: "available",
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    description: "Clusters, pods and workloads",
    status: "available",
  },
  {
    id: "docker",
    name: "Docker",
    description: "Containers and images",
    status: "available",
  },
  {
    id: "prometheus",
    name: "Prometheus",
    description: "Metrics and time-series data",
    status: "available",
  },
  {
    id: "grafana",
    name: "Grafana",
    description: "Dashboards and observability",
    status: "available",
  },
  {
    id: "gcp",
    name: "Google Cloud",
    description: "Cloud resources and services",
    status: "available",
  },
];