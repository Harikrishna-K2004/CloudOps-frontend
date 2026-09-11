"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  addChatMessage,
  createChat,
  deleteChat,
  generateChatTitle,
  getChatMessages,
  getChats,
  updateChatTitle,
  type Chat,
  type ChatMessage,
} from "@/src/lib/api/chat";

export function useChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] =
    useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getChats();
      setChats(result);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load chats",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const openChat = useCallback(
    async (chatId: string) => {
      try {
        setMessagesLoading(true);
        setError(null);
        setCurrentChatId(chatId);
        setMessages([]);

        const result = await getChatMessages(chatId);

        setMessages(result);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load chat messages",
        );
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    [],
  );

  const startNewChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
    setError(null);
  }, []);

  const ensureChat = useCallback(
    async (
      provider?: string,
      model?: string,
    ): Promise<Chat> => {
      if (currentChatId) {
        const existingChat =
          chats.find(
            (chat) => chat.id === currentChatId,
          );

        if (existingChat) {
          return existingChat;
        }
      }

      const chat = await createChat(
        provider,
        model,
      );

      setChats((current) => [
        chat,
        ...current,
      ]);

      setCurrentChatId(chat.id);

      return chat;
    },
    [currentChatId, chats],
  );

  const saveMessage = useCallback(
    async (
      chatId: string,
      role: "user" | "assistant",
      content: string,
    ) => {
      const message = await addChatMessage(
        chatId,
        role,
        content,
      );

      setMessages((current) => [
        ...current,
        message,
      ]);

      return message;
    },
    [],
  );

  const generateTitle = useCallback(
    async (
      chatId: string,
      message: string,
      provider?: string,
      model?: string,
    ) => {
      const updatedChat = await generateChatTitle(
        chatId,
        message,
        provider,
        model,
      );

      setChats((current) =>
        current.map((chat) =>
          chat.id === chatId
            ? updatedChat
            : chat,
        ),
      );

      return updatedChat;
    },
    [],
  );

  const editChatTitle = useCallback(
    async (
      chatId: string,
      title: string,
    ) => {
      const updatedChat =
        await updateChatTitle(
          chatId,
          title,
        );

      setChats((current) =>
        current.map((chat) =>
          chat.id === chatId
            ? updatedChat
            : chat,
        ),
      );

      return updatedChat;
    },
    [],
  );

  const removeChat = useCallback(
    async (chatId: string) => {
      await deleteChat(chatId);

      setChats((current) =>
        current.filter(
          (chat) => chat.id !== chatId,
        ),
      );

      if (currentChatId === chatId) {
        setCurrentChatId(null);
        setMessages([]);
      }
    },
    [currentChatId],
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return {
    chats,
    currentChatId,
    messages,
    loading,
    messagesLoading,
    error,
    loadChats,
    openChat,
    startNewChat,
    ensureChat,
    saveMessage,
    generateTitle,
    editChatTitle,
    removeChat,
  };
}