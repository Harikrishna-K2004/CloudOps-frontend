"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Activity,
  ArrowDown,
} from "lucide-react";

import { ChatComposer } from "./ChatComposer";
import { ChatMessages } from "./ChatMessages";
import type { ChatMessageData } from "./ChatMessage";

import {
  sendChatMessage,
  type SendChatMessageRequest,
} from "@/src/lib/api/chat";

import type { useChats } from "@/src/lib/hooks/useChats";

type ChatState = ReturnType<typeof useChats>;

interface ChatAreaProps {
  chatState: ChatState;
  onNewChatReady?: (resetChat: () => void) => void;
}

/**
 * Remove model thinking/reasoning blocks before
 * displaying or storing the final response.
 */
function cleanModelResponse(content: string): string {
  if (!content) {
    return content;
  }

  return content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/<think>[\s\S]*$/gi, "")
    .replace(/<thinking>[\s\S]*$/gi, "")
    .trim();
}

export function ChatArea({
  chatState,
  onNewChatReady,
}: ChatAreaProps) {
  const {
    messages: storedMessages,
    messagesLoading,
    startNewChat,
    ensureChat,
    saveMessage,
    generateTitle,
  } = chatState;

  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollButton, setShowScrollButton] =
    useState(false);

  const scrollContainerRef =
    useRef<HTMLDivElement>(null);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  /*
   * Reset the current conversation.
   */
  useEffect(() => {
    onNewChatReady?.(() => {
      startNewChat();
      setIsGenerating(false);
    });
  }, [onNewChatReady, startNewChat]);

  /*
   * Convert stored database messages into the format
   * required by ChatMessages.
   *
   * useMemo is important here.
   *
   * Without it, a new messages array would be created
   * on every render and could unnecessarily trigger
   * scrolling while the user is reading an older message.
   */
  const messages = useMemo<ChatMessageData[]>(
    () =>
      storedMessages.map((message) => ({
        id: message.id,
        role: message.role,
        content:
          message.role === "assistant"
            ? cleanModelResponse(message.content)
            : message.content,
      })),
    [storedMessages],
  );

  /*
   * Automatically scroll to the bottom when:
   *
   * - A conversation is opened
   * - Messages are loaded
   * - A new message is added
   *
   * It does NOT run simply because the component
   * re-rendered while the user is scrolling.
   */
  useEffect(() => {
    if (messagesLoading) {
      return;
    }

    const container =
      scrollContainerRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    /*
     * Only automatically scroll if the user is
     * already reasonably close to the bottom.
     */
    if (distanceFromBottom < 180) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    }
  }, [messages.length, messagesLoading]);

  /*
   * Detect whether the user has scrolled away
   * from the bottom.
   */
  function handleScroll() {
    const container =
      scrollContainerRef.current;

    if (!container) {
      return;
    }

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    setShowScrollButton(
      distanceFromBottom > 250,
    );
  }

  /*
   * Quickly return to the latest message.
   */
  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });

    setShowScrollButton(false);
  }

  /*
   * Send a message to the selected provider/model.
   */
  const handleSendMessage = async (
    request: SendChatMessageRequest,
  ) => {
    const trimmedContent =
      request.message.trim();

    if (
      !trimmedContent ||
      isGenerating ||
      messagesLoading
    ) {
      return;
    }

    try {
      /*
       * Create the database chat only when the
       * first message is actually sent.
       */
      const isNewChat = storedMessages.length === 0;

      const chat = await ensureChat(
        request.provider,
        request.model,
      );

      /*
       * Save the user's message.
       */
      await saveMessage(
        chat.id,
        "user",
        trimmedContent,
      );

      /*
       * Generate the title only for the first message
       * of a newly created chat.
       */
      if (isNewChat) {
        try {
          await generateTitle(
            chat.id,
            trimmedContent,
            request.provider,
            request.model,
          );
        } catch (error) {
          console.error(
            "Failed to generate chat title:",
            error,
          );
        }
      }

      /*
       * The model request is now being generated.
       */
      setIsGenerating(true);

      /*
       * Call the existing AI backend.
       */
      const response =
        await sendChatMessage({
          ...request,
          chatId: chat.id,
          message: trimmedContent,
        });

      /*
       * Remove any model reasoning/thinking
       * section before storing the response.
       */
      const cleanedResponse =
        cleanModelResponse(response);

      /*
       * Save the assistant response.
       */
      await saveMessage(
        chat.id,
        "assistant",
        cleanedResponse,
      );
    } catch (error) {
      console.error(
        "Failed to send chat message:",
        error,
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const isBusy =
    messagesLoading || isGenerating;

  return (
    <section className="relative flex min-h-0 flex-1 flex-col bg-background">
      {/* =====================================================
          CHAT CONTENT
          ===================================================== */}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto scroll-smooth"
      >
        {/* ===================================================
            LOADING EXISTING CHAT
            =================================================== */}

        {messagesLoading ? (
          <div className="flex h-full items-center justify-center px-6">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted/40">
                <Activity className="h-6 w-6 animate-pulse" />

                <span className="absolute inset-0 animate-ping rounded-2xl border border-muted-foreground/20" />
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Loading conversation
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Retrieving your messages...
                </p>
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* =================================================
             NEW / EMPTY CHAT
             ================================================= */

          <div className="flex min-h-full items-center justify-center px-6">
            <div className="flex max-w-2xl flex-col items-center text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted/30">
                <Activity className="h-7 w-7" />
              </div>

              <h1 className="text-2xl font-semibold tracking-tight">
                How can I help you?
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Ask CloudOps AI anything about your
                cloud infrastructure, DevOps, or
                development.
              </p>
            </div>
          </div>
        ) : (
          /* =================================================
             EXISTING CONVERSATION
             ================================================= */

          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
            <ChatMessages
              messages={messages}
            />

            {/* =============================================
                MODEL GENERATING INDICATOR
                ============================================= */}

            {isGenerating && (
              <div className="mt-6 flex items-center gap-3">
                {/* CloudOps AI icon */}
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border bg-muted/40">
                  <Activity className="h-4 w-4 animate-pulse" />

                  <span className="absolute inset-0 animate-ping rounded-xl border border-muted-foreground/20" />
                </div>

                {/* Generating status */}
                <div className="flex items-center gap-2 rounded-xl border bg-muted/30 px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    CloudOps AI
                  </span>

                  <span className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.3s]" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:-0.15s]" />

                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
                  </span>

                  <span className="text-xs text-muted-foreground">
                    Generating
                  </span>
                </div>
              </div>
            )}

            {/* Scroll target */}
            <div
              ref={bottomRef}
              className="h-1"
            />
          </div>
        )}
      </div>

      {/* =====================================================
          GO TO BOTTOM
          ===================================================== */}

      {showScrollButton &&
        !messagesLoading && (
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label="Go to latest message"
            className="absolute bottom-28 right-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border bg-background/95 shadow-md backdrop-blur transition hover:bg-muted"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
        )}

      {/* =====================================================
          MESSAGE COMPOSER
          ===================================================== */}

      <div className="shrink-0">
        <ChatComposer
          onSend={handleSendMessage}
          disabled={messagesLoading}
          isGenerating={isGenerating}
        />
      </div>
    </section>
  );
}