"use client";

import { useState } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { Menu } from "@base-ui/react/menu";
import {
  PanelLeft,
  PanelLeftClose,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";

type Page = { id: string; name: string; createdAt: number };

interface PagesSidebarProps {
  pages: Page[];
  pageId: string | null;
  onSelectPage: (id: string) => void;
  onCreatePage: (name: string) => Promise<void>;
  onRenamePage: (id: string, name: string) => Promise<void>;
  onDeletePage: (id: string) => Promise<void>;
}

export default function PagesSidebar({
  pages,
  pageId,
  onSelectPage,
  onCreatePage,
  onRenamePage,
  onDeletePage,
}: PagesSidebarProps) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameName, setRenameName] = useState("");

  function handleSelect(id: string) {
    onSelectPage(id);
    setOpen(false);
  }

  function startRename(page: Page) {
    setRenamingId(page.id);
    setRenameName(page.name);
  }

  function cancelRename() {
    setRenamingId(null);
    setRenameName("");
  }

  async function commitRename() {
    const id = renamingId;
    if (!id) return;
    const name = renameName.trim();
    const current = pages.find((p) => p.id === id)?.name;
    setRenamingId(null);
    setRenameName("");
    if (name && name !== current) await onRenamePage(id, name);
  }

  function cancelAdd() {
    setAdding(false);
    setNewName("");
  }

  async function handleCreate() {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    await onCreatePage(name);
    setCreating(false);
    setNewName("");
    setAdding(false);
    setOpen(false);
  }

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="left">
      <Drawer.Trigger className="inline-flex items-center justify-center p-1.5 text-gray-900 hover:bg-gray-50 dark:text-foreground dark:hover:bg-[#424242] rounded transition-colors">
        <PanelLeft className="w-4 h-4" />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className="[--backdrop-opacity:0.2] dark:[--backdrop-opacity:0.7] fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-[swiping]:duration-0 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 supports-[-webkit-touch-callout:none]:absolute" />
        <Drawer.Viewport className="fixed inset-0 z-50 flex items-stretch justify-start">
          <Drawer.Popup className="h-full w-80 max-w-[calc(100vw-3rem)] bg-gray-50 dark:bg-[#1b1b1b] p-6 text-gray-900 dark:text-foreground outline-1 outline-gray-200 dark:outline-gray-700 overflow-y-auto overscroll-contain touch-auto [transform:translateX(var(--drawer-swipe-movement-x))] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-[swiping]:select-none data-[ending-style]:[transform:translateX(-100%)] data-[starting-style]:[transform:translateX(-100%)]">
            <Drawer.Content className="flex flex-col h-full">
              <div className="-mt-1.5 mb-6 flex items-center justify-between">
                <img
                  src="/logo-dark.png"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="dark:hidden"
                />
                <img
                  src="/logo-light.png"
                  alt="Logo"
                  width={28}
                  height={28}
                  className="hidden dark:block"
                />
                <Drawer.Close
                  aria-label="Close sidebar"
                  className="inline-flex items-center justify-center p-1.5 text-gray-900 hover:bg-gray-100 dark:text-foreground dark:hover:bg-[#424242] rounded transition-colors"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </Drawer.Close>
              </div>

              {/* New page */}
              <div className="mb-2">
                {adding ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleCreate();
                        if (e.key === "Escape") cancelAdd();
                      }}
                      onBlur={cancelAdd}
                      placeholder="Page name"
                      className="flex-1 h-9 px-3 rounded-md bg-white dark:bg-[#2a2a2a] text-[13px] text-gray-900 dark:text-foreground outline-1 outline-gray-200 dark:outline-gray-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handleCreate}
                      disabled={!newName.trim() || creating}
                      className="inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:opacity-90 disabled:opacity-40 transition-opacity"
                      aria-label="Create page"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAdding(true)}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                  >
                    <Plus className="w-4 h-4 shrink-0" />
                    New page
                  </button>
                )}
              </div>

              {/* Page list */}
              <div className="flex flex-col gap-0.5">
                {pages.map((page) => {
                  const active = page.id === pageId;

                  if (renamingId === page.id) {
                    return (
                      <input
                        key={page.id}
                        autoFocus
                        value={renameName}
                        onChange={(e) => setRenameName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitRename();
                          if (e.key === "Escape") cancelRename();
                        }}
                        onBlur={commitRename}
                        className="h-9 px-3 rounded-md bg-white dark:bg-[#2a2a2a] text-[13px] text-gray-900 dark:text-foreground outline-1 outline-gray-200 dark:outline-gray-700 focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-blue-600"
                      />
                    );
                  }

                  return (
                    <div
                      key={page.id}
                      className={`group flex items-center rounded-md transition-colors ${
                        active
                          ? "bg-white dark:bg-[#424242] shadow-sm"
                          : "hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                      }`}
                    >
                      <button
                        onClick={() => handleSelect(page.id)}
                        className={`flex flex-1 min-w-0 items-center gap-2 pl-3 pr-1 py-2 text-[13px] font-medium text-left ${
                          active
                            ? "text-gray-900 dark:text-foreground"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        <span className="flex-1 truncate">{page.name}</span>
                      </button>
                      <Menu.Root>
                        <Menu.Trigger
                          aria-label="Page options"
                          className="mr-1.5 inline-flex items-center justify-center p-1 rounded text-gray-400 hover:text-gray-900 hover:cursor-pointer opacity-0 group-hover:opacity-100 data-popup-open:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Menu.Trigger>
                        <Menu.Portal>
                          <Menu.Positioner
                            side="bottom"
                            align="end"
                            sideOffset={4}
                            className="z-60"
                          >
                            <Menu.Popup className="min-w-36 rounded-md bg-white dark:bg-[#2a2a2a] p-1 text-gray-900 dark:text-foreground outline-1 outline-gray-200 dark:outline-gray-700 shadow-lg">
                              <Menu.Item
                                onClick={() => startRename(page)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[13px] cursor-default select-none outline-none data-highlighted:bg-gray-100 dark:data-highlighted:bg-[#424242]"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Rename
                              </Menu.Item>
                              {pages.length > 1 && (
                                <Menu.Item
                                  onClick={() => onDeletePage(page.id)}
                                  className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[13px] cursor-default select-none outline-none text-rose-600 dark:text-rose-400 data-highlighted:bg-rose-50 dark:data-highlighted:bg-rose-950"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete
                                </Menu.Item>
                              )}
                            </Menu.Popup>
                          </Menu.Positioner>
                        </Menu.Portal>
                      </Menu.Root>
                    </div>
                  );
                })}
              </div>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
