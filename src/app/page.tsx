"use client";

import { useRef } from "react";

import { Sidebar } from "@/src/components/sidebar/Sidebar";
import { ChatArea } from "@/src/components/chat/ChatArea";
import { AuthGuard } from "@/src/components/auth/AuthGuard";
import { useChats } from "@/src/lib/hooks/useChats";

export default function Home() {
  const chatState = useChats();
  const resetChatRef = useRef<(() => void) | null>(null);

  const handleNewChat = () => {
    resetChatRef.current?.();
  };

  const handleChatSelect = (chatId: string) => {
    chatState.openChat(chatId);
  };

  return (
    <AuthGuard>
      <main className="flex h-screen overflow-hidden">
        <Sidebar
          chatState={chatState}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
        />

        <section className="flex min-w-0 flex-1 flex-col">
          <ChatArea
            chatState={chatState}
            onNewChatReady={(resetChat) => {
              resetChatRef.current = resetChat;
            }}
          />
        </section>
      </main>
    </AuthGuard>
  );
}