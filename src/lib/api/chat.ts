import { apiFetch } from "./client";

export interface Chat {
  id: string;
  title: string;
  provider?: string | null;
  model?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface SendChatMessageRequest {
  message: string;
  model?: string;
  provider?: string;
  tools?: string[];
}

export interface SendChatMessageResponse {
  response: string;
}

export async function getChats(): Promise<Chat[]> {
  const response = await apiFetch("/api/chats");

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Failed to load chats (${response.status})`,
    );
  }

  if (!data || !Array.isArray(data.chats)) {
    throw new Error(
      "Chat history returned an invalid response.",
    );
  }

  return data.chats;
}

export async function createChat(
  provider?: string,
  model?: string,
): Promise<Chat> {
  const response = await apiFetch("/api/chats", {
    method: "POST",
    body: JSON.stringify({
      title: "New Chat",
      provider,
      model,
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Failed to create chat (${response.status})`,
    );
  }

  if (!data?.chat) {
    throw new Error(
      "Create chat returned an invalid response.",
    );
  }

  return data.chat;
}

export async function getChat(
  chatId: string,
): Promise<Chat> {
  const response = await apiFetch(
    `/api/chats/${encodeURIComponent(chatId)}`,
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Failed to load chat (${response.status})`,
    );
  }

  if (!data?.chat) {
    throw new Error(
      "Chat returned an invalid response.",
    );
  }

  return data.chat;
}

export async function getChatMessages(
  chatId: string,
): Promise<ChatMessage[]> {
  const response = await apiFetch(
    `/api/chats/${encodeURIComponent(chatId)}/messages`,
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Failed to load messages (${response.status})`,
    );
  }

  if (!data || !Array.isArray(data.messages)) {
    throw new Error(
      "Chat messages returned an invalid response.",
    );
  }

  return data.messages;
}

export async function addChatMessage(
  chatId: string,
  role: "user" | "assistant",
  content: string,
): Promise<ChatMessage> {
  const response = await apiFetch(
    `/api/chats/${encodeURIComponent(chatId)}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        role,
        content,
      }),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Failed to save message (${response.status})`,
    );
  }

  if (!data?.message) {
    throw new Error(
      "Save message returned an invalid response.",
    );
  }

  return data.message;
}

export async function updateChatTitle(
  chatId: string,
  title: string,
): Promise<Chat> {
  const response = await apiFetch(
    `/api/chats/${encodeURIComponent(chatId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        title,
      }),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Failed to update chat title (${response.status})`,
    );
  }

  if (!data?.chat) {
    throw new Error(
      "Update chat title returned an invalid response.",
    );
  }

  return data.chat;
}

export async function generateChatTitle(
  chatId: string,
  message: string,
  provider?: string,
  model?: string,
): Promise<Chat> {
  const response = await apiFetch(
    `/api/chats/${encodeURIComponent(chatId)}/title`,
    {
      method: "POST",
      body: JSON.stringify({
        message,
        provider,
        model,
      }),
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.detail ||
        `Failed to generate chat title (${response.status})`,
    );
  }

  if (!data?.chat) {
    throw new Error(
      "Generate chat title returned an invalid response.",
    );
  }

  return data.chat;
}

export async function deleteChat(
  chatId: string,
): Promise<void> {
  const response = await apiFetch(
    `/api/chats/${encodeURIComponent(chatId)}`,
    {
      method: "DELETE",
    },
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Failed to delete chat (${response.status})`,
    );
  }

  if (!data?.success) {
    throw new Error(
      "Delete chat returned an invalid response.",
    );
  }
}

export async function sendChatMessage(
  request: SendChatMessageRequest,
): Promise<string> {
  const response = await apiFetch("/api/chat", {
    method: "POST",
    body: JSON.stringify(request),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.detail ||
        `Chat API failed with status ${response.status}`,
    );
  }

  if (
    !data ||
    typeof data.response !== "string"
  ) {
    throw new Error(
      "Chat API returned an invalid response.",
    );
  }

  return data.response;
}