"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  ArrowUp,
  FileText,
  Image as ImageIcon,
  Plus,
  Square,
  X,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { ToolsSelector } from "@/src/components/tools/ToolsSelector";
import { ModelSelector } from "@/src/components/model-selector/ModelSelector";

import type { AIModel } from "@/src/lib/types/model";
import type { SendChatMessageRequest } from "@/src/lib/api/chat";

interface ChatComposerProps {
  onSend: (request: SendChatMessageRequest) => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

const MAX_ATTACHMENTS = 10;
const MAX_TEXTAREA_HEIGHT = 240;

export function ChatComposer({
  onSend,
  disabled = false,
  isGenerating = false,
}: ChatComposerProps) {
  const [message, setMessage] = useState("");

  const [selectedModel, setSelectedModel] =
    useState<AIModel | null>(null);

  const [selectedTools, setSelectedTools] =
    useState<string[]>([]);

  const [attachedFiles, setAttachedFiles] =
    useState<File[]>([]);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  /*
   * The user can continue typing while the model
   * is generating.
   *
   * Sending is disabled until generation finishes.
   */
  const generating = isGenerating;

  const canSend =
    message.trim().length > 0 &&
    !generating &&
    !disabled &&
    selectedModel !== null;

  /*
   * Automatically resize the textarea.
   *
   * The textarea grows until 240px (~10 lines).
   * After that, only the textarea scrolls.
   */
  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = "56px";

    const newHeight = Math.min(
      textarea.scrollHeight,
      MAX_TEXTAREA_HEIGHT,
    );

    textarea.style.height = `${newHeight}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > MAX_TEXTAREA_HEIGHT
        ? "auto"
        : "hidden";
  }, [message]);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();

    if (
      !trimmedMessage ||
      generating ||
      disabled ||
      !selectedModel
    ) {
      return;
    }

    const request: SendChatMessageRequest = {
      message: trimmedMessage,
      model: selectedModel.id,
      provider: selectedModel.provider,
      tools: selectedTools,
    };

    onSend(request);

    setMessage("");
  };

  const handleAddFiles = () => {
    if (
      generating ||
      disabled ||
      attachedFiles.length >= MAX_ATTACHMENTS
    ) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFilesSelected = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    setAttachedFiles((current) => {
      const existingKeys = new Set(
        current.map(
          (file) =>
            `${file.name}-${file.size}-${file.lastModified}`,
        ),
      );

      const availableSlots =
        MAX_ATTACHMENTS - current.length;

      if (availableSlots <= 0) {
        return current;
      }

      const uniqueFiles = Array.from(files)
        .filter((file) => {
          const key = `${file.name}-${file.size}-${file.lastModified}`;

          return !existingKeys.has(key);
        })
        .slice(0, availableSlots);

      return [...current, ...uniqueFiles];
    });

    /*
     * Allow selecting the same file again later.
     */
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles((current) =>
      current.filter(
        (_, fileIndex) => fileIndex !== index,
      ),
    );
  };

  const isImageFile = (file: File) =>
    file.type.startsWith("image/");

  return (
    <div className="shrink-0 px-4 pb-5 pt-3">
      <div className="mx-auto w-full max-w-3xl">

        {/* =====================================================
            COMPOSER
            ===================================================== */}

        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm transition-shadow focus-within:shadow-md">

          {/* ===================================================
              ATTACHMENT ROW
              =================================================== */}

          {attachedFiles.length > 0 && (
            <div className="border-b px-3 py-3">
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {attachedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex w-[220px] shrink-0 items-center gap-2 rounded-xl border bg-muted/40 px-2.5 py-2"
                  >
                    {/* File icon */}
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background">
                      {isImageFile(file) ? (
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    {/* File information */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">
                        {file.name}
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      disabled={generating || disabled}
                      onClick={() =>
                        handleRemoveFile(index)
                      }
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================
              TEXT AREA
              =================================================== */}

          <Textarea
            ref={textareaRef}
            value={message}
            disabled={disabled}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey
              ) {
                event.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={
              generating
                ? "Type your next prompt..."
                : "Ask CloudOps anything..."
            }
            className="min-h-[56px] max-h-[240px] resize-none overflow-y-hidden border-0 bg-background px-4 py-4 shadow-none focus-visible:ring-0"
            rows={1}
          />

          {/* ===================================================
              TOOLBAR
              =================================================== */}

          <div className="flex min-h-[48px] items-center justify-between bg-background px-2 py-2">

            {/* Left controls */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={
                  generating ||
                  disabled ||
                  attachedFiles.length >= MAX_ATTACHMENTS
                }
                className="h-8 w-8 rounded-lg"
                aria-label="Add files or images"
                onClick={handleAddFiles}
              >
                <Plus className="h-4 w-4" />
              </Button>

              {attachedFiles.length > 0 && (
                <span className="ml-1 text-[11px] text-muted-foreground">
                  {attachedFiles.length}/{MAX_ATTACHMENTS}
                </span>
              )}
            </div>

            {/* Right controls */}
            <div className="flex min-w-0 items-center gap-1">
              <ToolsSelector
                onSelectionChange={setSelectedTools}
              />

              <ModelSelector
                value={selectedModel ?? undefined}
                onChange={(model) => {
                  if (generating || disabled) {
                    return;
                  }

                  setSelectedModel(model ?? null);
                }}
              />

              <Button
                type="button"
                size="icon"
                disabled={!canSend}
                onClick={handleSubmit}
                className="h-8 w-8 shrink-0 rounded-lg"
                aria-label={
                  generating
                    ? "Generation in progress"
                    : "Send message"
                }
              >
                {generating ? (
                  <Square className="h-3.5 w-3.5 fill-current" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* ===================================================
              HIDDEN FILE INPUT
              =================================================== */}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.txt,.md,.csv,.json,.yaml,.yml,.log,.doc,.docx,.xls,.xlsx"
            className="hidden"
            onChange={handleFilesSelected}
          />
        </div>

        {/* =====================================================
            DISCLAIMER
            ===================================================== */}

        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          CloudOps AI can make mistakes. Verify critical
          infrastructure information before taking action.
        </p>
      </div>
    </div>
  );
}