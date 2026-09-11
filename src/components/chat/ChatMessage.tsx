"use client";

import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type ChatMessageRole =
  | "user"
  | "assistant";

export interface ChatMessageData {
  id: string;
  role: ChatMessageRole;
  content: string;
}

interface ChatMessageProps {
  message: ChatMessageData;
}

const MAX_VISIBLE_HEIGHT = 240;

/*
 * Professional code block.
 *
 * The important part is that `children` here is
 * the ORIGINAL Markdown code text.
 *
 * We do not convert React elements into strings,
 * so `[object Object]` can never appear.
 */
function CodeBlock({
  children,
  language,
}: {
  children: ReactNode;
  language?: string;
}) {
  const [copied, setCopied] =
    useState(false);

  /*
   * Fenced Markdown code content is normally a
   * string at this point.
   */
  const code = String(children).replace(
    /\n$/,
    "",
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error(
        "Failed to copy code:",
        error,
      );
    }
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border/70 bg-[#111111] shadow-sm">
      {/* Code header */}
      <div className="flex h-9 items-center justify-between border-b border-white/5 bg-white/[0.025] px-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          </div>

          {language && (
            <span className="ml-2 text-[10px] font-medium uppercase tracking-[0.12em] text-white/40">
              {language}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/45 transition hover:bg-white/5 hover:text-white/80"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre className="m-0 overflow-x-auto p-4">
        <code className="block whitespace-pre font-mono text-[13px] leading-6 text-white/80">
          {code}
        </code>
      </pre>
    </div>
  );
}

export function ChatMessage({
  message,
}: ChatMessageProps) {
  const isUser =
    message.role === "user";

  const [expanded, setExpanded] =
    useState(false);

  const [isOverflowing, setIsOverflowing] =
    useState(false);

  const messageRef =
    useRef<HTMLDivElement>(null);

  /*
   * USER MESSAGE
   */
  useEffect(() => {
    if (
      !isUser ||
      !messageRef.current
    ) {
      return;
    }

    const element =
      messageRef.current;

    const checkOverflow = () => {
      setIsOverflowing(
        element.scrollHeight >
          MAX_VISIBLE_HEIGHT + 1,
      );
    };

    checkOverflow();

    const observer =
      new ResizeObserver(
        checkOverflow,
      );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    isUser,
    message.content,
  ]);

  if (isUser) {
    return (
      <div className="w-full">
        <div className="mx-auto flex w-full max-w-3xl justify-end px-6 py-4">
          <div className="max-w-[80%] min-w-0">
            <div
              ref={messageRef}
              className={[
                "overflow-hidden rounded-2xl",
                "bg-muted/60 px-4 py-3",
                "text-sm leading-6 text-foreground/90",
                "dark:bg-muted/40",
                !expanded
                  ? "max-h-[240px]"
                  : "max-h-none",
              ].join(" ")}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>

            {isOverflowing && (
              <button
                type="button"
                onClick={() =>
                  setExpanded(
                    (current) =>
                      !current,
                  )
                }
                className="mt-1 flex items-center gap-1 px-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {expanded ? (
                  <>
                    <span>
                      Show less
                    </span>

                    <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <span>
                      Read more
                    </span>

                    <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
   * ASSISTANT MESSAGE
   */
  return (
    <div className="w-full">
      <article className="mx-auto w-full max-w-3xl px-6 py-6">
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
          ]}
          components={{
            /*
             * Main heading
             */
            h1({ children }) {
              return (
                <div className="mb-7 mt-1 border-b border-border/60 pb-4">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {children}
                  </h1>
                </div>
              );
            },

            /*
             * Section heading
             */
            h2({ children }) {
              return (
                <h2 className="mb-4 mt-10 border-b border-border/40 pb-2 text-xl font-semibold tracking-tight text-foreground">
                  {children}
                </h2>
              );
            },

            /*
             * Subsection heading
             */
            h3({ children }) {
              return (
                <h3 className="mb-3 mt-8 text-lg font-semibold tracking-tight text-foreground">
                  {children}
                </h3>
              );
            },

            h4({ children }) {
              return (
                <h4 className="mb-2 mt-6 text-base font-semibold text-foreground">
                  {children}
                </h4>
              );
            },

            /*
             * Paragraph
             */
            p({ children }) {
              return (
                <p className="my-4 text-[14px] leading-7 text-foreground/85">
                  {children}
                </p>
              );
            },

            /*
             * Bold
             */
            strong({ children }) {
              return (
                <strong className="font-semibold text-foreground">
                  {children}
                </strong>
              );
            },

            /*
             * Inline code:
             *
             * `nums`
             * `O(n)`
             * `Prometheus`
             */
            code({
              className,
              children,
            }) {
              const match =
                /language-([\w-]+)/.exec(
                  className || "",
                );

              /*
               * A language class means this is
               * a fenced code block.
               */
              if (match) {
                return (
                  <CodeBlock
                    language={match[1]}
                  >
                    {children}
                  </CodeBlock>
                );
              }

              return (
                <code className="rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 font-mono text-[0.86em] text-foreground">
                  {children}
                </code>
              );
            },

            /*
             * Fenced code without an explicit
             * language.
             *
             * Example:
             *
             * ```
             * some code
             * ```
             */
            pre({ children }) {
              return (
                <div className="my-6">
                  {children}
                </div>
              );
            },

            /*
             * Unordered list
             */
            ul({ children }) {
              return (
                <ul className="my-5 list-disc space-y-2 pl-6 text-[14px] leading-7 marker:text-muted-foreground/60">
                  {children}
                </ul>
              );
            },

            /*
             * Ordered list
             */
            ol({ children }) {
              return (
                <ol className="my-5 list-decimal space-y-2 pl-6 text-[14px] leading-7 marker:font-medium marker:text-muted-foreground">
                  {children}
                </ol>
              );
            },

            /*
             * List item
             */
            li({ children }) {
              return (
                <li className="pl-1">
                  {children}
                </li>
              );
            },

            /*
             * Blockquote
             */
            blockquote({ children }) {
              return (
                <blockquote className="my-6 rounded-r-lg border-l-2 border-border bg-muted/20 px-4 py-3 text-muted-foreground">
                  {children}
                </blockquote>
              );
            },

            /*
             * Horizontal separator
             */
            hr() {
              return (
                <div className="my-9 h-px bg-border/60" />
              );
            },

            /*
             * Table
             */
            table({ children }) {
              return (
                <div className="my-7 overflow-x-auto rounded-xl border border-border/70">
                  <table className="chat-table m-0 min-w-full border-collapse text-sm">
                    {children}
                  </table>
                </div>
              );
            },

            thead({ children }) {
              return (
                <thead className="bg-muted/40">
                  {children}
                </thead>
              );
            },

            th({ children }) {
              return (
                <th className="border-b border-border/70 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {children}
                </th>
              );
            },

            td({ children }) {
              return (
                <td className="border-b border-border/50 px-4 py-3 align-top text-[13px] leading-6">
                  {children}
                </td>
              );
            },

            /*
             * Links
             */
            a({ children, href }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground"
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </article>
    </div>
  );
}