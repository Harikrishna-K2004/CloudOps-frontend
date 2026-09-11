export async function getDummyChatResponse(
  message: string,
): Promise<string> {
  await new Promise((resolve) =>
    setTimeout(resolve, 700),
  );

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("kubernetes")) {
    return `I checked your Kubernetes-related request.

This is currently a dummy response. Once the backend is connected, CloudOps AI will use the configured Kubernetes tool to retrieve real cluster information such as:

• Pods
• Deployments
• Services
• Events
• Logs
• Resource usage

The AI model will then analyze that information and explain the issue.`;
  }

  if (
    lowerMessage.includes("jenkins") ||
    lowerMessage.includes("pipeline") ||
    lowerMessage.includes("build")
  ) {
    return `I found a Jenkins-related request.

This is currently dummy data. In the real implementation, CloudOps AI will query Jenkins for builds, pipeline status, failures and deployment information before analyzing the issue.`;
  }

  if (
    lowerMessage.includes("github") ||
    lowerMessage.includes("repository") ||
    lowerMessage.includes("repo")
  ) {
    return `I found a GitHub-related request.

This is currently dummy data. The backend will eventually use the connected GitHub integration to inspect repositories, pull requests, commits and workflows.`;
  }

  return `I understand your request:

"${message}"

This is currently a dummy CloudOps AI response.

Once the backend is connected, the selected AI model will determine which connected DevOps tools are required, retrieve the relevant infrastructure data, and analyze the issue.`;
}