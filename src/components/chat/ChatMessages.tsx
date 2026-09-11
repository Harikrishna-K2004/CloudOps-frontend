"use client";

import { useEffect, useRef } from "react";

import {
  ChatMessage,
  type ChatMessageData,
} from "./ChatMessage";

interface ChatMessagesProps {
  messages: ChatMessageData[];
}

export function ChatMessages({
  messages,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      className="w-full"
      role="log"
      aria-live="polite"
      aria-label="CloudOps AI conversation"
    >
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
        />
      ))}

      <div
        ref={bottomRef}
        aria-hidden="true"
      />
    </div>
  );
}