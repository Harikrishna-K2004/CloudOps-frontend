"use client";

import {
  Activity,
  Ellipsis,
  LogOut,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Settings,
  Trash2,
  UserCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import { ThemeToggle } from "@/src/components/theme/ThemeToggle";
import { supabase } from "@/src/lib/supabase/client";
import type { useChats } from "@/src/lib/hooks/useChats";

type ChatState = ReturnType<typeof useChats>;

interface SidebarProps {
  chatState: ChatState;
  onNewChat?: () => void;
  onChatSelect?: (chatId: string) => void;
}

export function Sidebar({
  chatState,
  onNewChat,
  onChatSelect,
}: SidebarProps) {
  const router = useRouter();

  const {
    chats,
    currentChatId,
    loading: chatsLoading,
    error: chatsError,
    openChat,
    editChatTitle,
    removeChat,
  } = chatState;

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const [menuChatId, setMenuChatId] = useState<string | null>(null);

  const [editingChatId, setEditingChatId] = useState<string | null>(
    null
  );
  const [editingTitle, setEditingTitle] = useState("");

  const [collapsed, setCollapsed] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setEmail(user?.email ?? null);
    }

    loadUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setSettingsOpen(false);
      }

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuChatId(null);
      }
    }

    if (settingsOpen || menuChatId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [settingsOpen, menuChatId]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function handleChatSelect(chatId: string) {
    setMenuChatId(null);

    // Already selected — don't fetch again.
    if (chatId === currentChatId) {
      return;
    }

    await openChat(chatId);
    onChatSelect?.(chatId);
  }

  function handleEditStart(chatId: string, title: string) {
    setMenuChatId(null);
    setEditingChatId(chatId);
    setEditingTitle(title);
  }

  async function handleEditSave() {
    if (!editingChatId) {
      return;
    }

    const title = editingTitle.trim();

    if (!title) {
      return;
    }

    try {
      await editChatTitle(editingChatId, title);

      setEditingChatId(null);
      setEditingTitle("");
    } catch (error) {
      console.error("Failed to update chat title:", error);
    }
  }

  function handleEditCancel() {
    setEditingChatId(null);
    setEditingTitle("");
  }

  async function handleDeleteChat(chatId: string) {
    setMenuChatId(null);

    try {
      await removeChat(chatId);

      if (chatId === currentChatId) {
        onNewChat?.();
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  }

  return (
    <aside
      className={`flex shrink-0 flex-col border-r bg-background transition-all duration-200 ${
        collapsed ? "w-16" : "w-72"
      }`}
    >
      {/* Header */}
      <div
        className={`flex h-16 items-center border-b ${
          collapsed
            ? "justify-center px-2"
            : "justify-between px-4"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border">
              <Activity className="h-5 w-5" />
            </div>

            <span className="font-semibold">
              CloudOps AI
            </span>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* New Chat */}
      <div className="p-3">
        <Button
          variant="outline"
          className={`w-full gap-2 ${
            collapsed ? "justify-center px-0" : "justify-start"
          }`}
          onClick={onNewChat}
        >
          <MessageSquarePlus className="h-4 w-4" />

          {!collapsed && "New Chat"}
        </Button>
      </div>

      {/* Recent Conversations */}
      {!collapsed && (
        <div className="min-h-0 flex-1 overflow-y-auto px-3">
          <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
            Recent conversations
          </p>

          {chatsLoading ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              Loading conversations...
            </p>
          ) : chatsError ? (
            <p className="px-2 py-3 text-sm text-destructive">
              {chatsError}
            </p>
          ) : chats.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              No conversations yet.
            </p>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => {
                const isActive = chat.id === currentChatId;
                const isEditing = chat.id === editingChatId;

                if (isEditing) {
                  return (
                    <div
                      key={chat.id}
                      className="space-y-2 rounded-lg border p-2"
                    >
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleEditSave();
                          }

                          if (event.key === "Escape") {
                            handleEditCancel();
                          }
                        }}
                        className="w-full rounded-md border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2"
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </Button>

                        <Button
                          size="sm"
                          onClick={handleEditSave}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={chat.id}
                    className={`group relative flex items-center rounded-lg ${
                      isActive ? "bg-muted" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleChatSelect(chat.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 truncate px-3 py-2 text-left text-sm disabled:cursor-default"
                    >
                      <span className="min-w-0 truncate">
                        {chat.title}
                      </span>
                    </button>

                    <div
                      ref={
                        menuChatId === chat.id
                          ? menuRef
                          : undefined
                      }
                      className="relative"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 h-8 w-8 shrink-0"
                        onClick={() =>
                          setMenuChatId(
                            menuChatId === chat.id
                              ? null
                              : chat.id
                          )
                        }
                      >
                        <Ellipsis className="h-4 w-4" />
                      </Button>

                      {menuChatId === chat.id && (
                        <div className="absolute right-0 top-9 z-50 w-40 rounded-lg border bg-popover p-1 shadow-md">
                          <button
                            type="button"
                            onClick={() =>
                              handleEditStart(
                                chat.id,
                                chat.title
                              )
                            }
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                          >
                            <Pencil className="h-4 w-4" />
                            Edit title
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteChat(chat.id)
                            }
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-muted"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete chat
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bottom Controls */}
      <div className="relative border-t p-3" ref={settingsRef}>
        <div className="flex items-center">
          <Button
            variant="ghost"
            className={`flex-1 gap-2 ${
              collapsed
                ? "justify-center px-0"
                : "justify-start"
            }`}
            onClick={() =>
              setSettingsOpen((current) => !current)
            }
          >
            <Settings className="h-4 w-4" />

            {!collapsed && "Settings"}
          </Button>

          {!collapsed && <ThemeToggle />}
        </div>

        {settingsOpen && (
          <div
            className={`absolute bottom-14 z-50 w-64 rounded-lg border bg-popover p-3 shadow-md ${
              collapsed ? "left-14" : "left-3"
            }`}
          >
            <div className="flex items-center gap-3 border-b pb-3">
              <UserCircle className="h-5 w-5 shrink-0" />

              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  Signed in as
                </p>

                <p className="truncate text-sm font-medium">
                  {email ?? "User"}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              className="mt-2 w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}