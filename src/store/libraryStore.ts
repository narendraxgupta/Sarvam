import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeStorage } from "@/lib/persist/storage";
import { SEED_LIBRARY } from "@/data/samplePromptLibrary";
import { runStream } from "@/lib/stream/runStream";
import { uid } from "@/lib/utils";
import type { ModelId } from "@/types";
import type {
  Conversation,
  ConversationTurn,
  SavedPrompt,
} from "@/types/library";

interface LibraryState {
  prompts: SavedPrompt[];
  selectedPromptId: string | null;
  activeTags: string[];
  query: string;

  // Conversation mode
  conversations: Conversation[];
  activeConversationId: string | null;

  // Prompt CRUD
  createPrompt: (
    init?: Partial<Omit<SavedPrompt, "id" | "createdAt" | "updatedAt" | "versions">>,
  ) => string;
  updatePrompt: (id: string, updates: Partial<SavedPrompt>) => void;
  commitVersion: (id: string, message?: string) => void;
  deletePrompt: (id: string) => void;
  togglePin: (id: string) => void;
  selectPrompt: (id: string | null) => void;

  // Filters
  setQuery: (q: string) => void;
  toggleTag: (t: string) => void;
  clearTags: () => void;

  // Conversation actions
  startConversation: (model: ModelId, systemPrompt?: string) => string;
  selectConversation: (id: string | null) => void;
  sendTurn: (text: string) => Promise<void>;
  cancelConversation: () => void;
  deleteConversation: (id: string) => void;
}

let currentTurnAbort: AbortController | null = null;

let currentTurnRunId = 0;

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      prompts: SEED_LIBRARY,
      selectedPromptId: null,
      activeTags: [],
      query: "",
      conversations: [],
      activeConversationId: null,
      createPrompt: (init) => {
        const id = uid();
        const now = Date.now();
        const body = init?.body ?? "";
        const prompt: SavedPrompt = {
          id,
          title: init?.title ?? "Untitled prompt",
          body,
          tags: init?.tags ?? [],
          model: init?.model,
          pinned: init?.pinned ?? false,
          createdAt: now,
          updatedAt: now,
          versions: [
            { id: uid(), body, createdAt: now, message: "initial" },
          ],
        };
        set((s) => ({
          prompts: [prompt, ...s.prompts],
          selectedPromptId: id,
        }));
        return id;
      },
      updatePrompt: (id, updates) => {
        set((s) => ({
          prompts: s.prompts.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p,
          ),
        }));
      },
      commitVersion: (id, message) => {
        set((s) => ({
          prompts: s.prompts.map((p) => {
            if (p.id !== id) return p;
            const last = p.versions[p.versions.length - 1];
            if (last?.body === p.body) return p; // nothing to commit
            const version = {
              id: uid(),
              body: p.body,
              message,
              createdAt: Date.now(),
            };
            return { ...p, versions: [...p.versions, version] };
          }),
        }));
      },
      deletePrompt: (id) => {
        set((s) => ({
          prompts: s.prompts.filter((p) => p.id !== id),
          selectedPromptId: s.selectedPromptId === id ? null : s.selectedPromptId,
        }));
      },
      togglePin: (id) => {
        set((s) => ({
          prompts: s.prompts.map((p) =>
            p.id === id ? { ...p, pinned: !p.pinned } : p,
          ),
        }));
      },
      selectPrompt: (selectedPromptId) => set({ selectedPromptId }),
      setQuery: (query) => set({ query }),
      toggleTag: (t) =>
        set((s) => ({
          activeTags: s.activeTags.includes(t)
            ? s.activeTags.filter((x) => x !== t)
            : [...s.activeTags, t],
        })),
      clearTags: () => set({ activeTags: [] }),
      startConversation: (model, systemPrompt) => {
        const id = uid();
        const now = Date.now();
        const turns: ConversationTurn[] = [];
        if (systemPrompt && systemPrompt.trim()) {
          turns.push({
            id: uid(),
            role: "assistant",
            content: `Ready when you are. (System: "${systemPrompt.trim()}")`,
            createdAt: now,
            model,
          });
        }
        const conv: Conversation = {
          id,
          title: "New conversation",
          model,
          turns,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          conversations: [conv, ...s.conversations],
          activeConversationId: id,
        }));
        return id;
      },
      selectConversation: (id) => set({ activeConversationId: id }),
      sendTurn: async (text) => {
        const { activeConversationId } = get();
        if (!activeConversationId || !text.trim()) return;
        const convId = activeConversationId;
        const now = Date.now();
        const userTurn: ConversationTurn = {
          id: uid(),
          role: "user",
          content: text.trim(),
          createdAt: now,
        };
        const assistantId = uid();
        let model: ModelId = "helix-m";
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== convId) return c;
            model = c.model;
            const turns = [
              ...c.turns,
              userTurn,
              {
                id: assistantId,
                role: "assistant" as const,
                content: "",
                createdAt: now + 1,
                model: c.model,
                streaming: true,
              },
            ];
            const title =
              c.turns.length === 0 && userTurn.content
                ? userTurn.content.slice(0, 48)
                : c.title;
            return { ...c, turns, title, updatedAt: now };
          }),
        }));

        if (currentTurnAbort) currentTurnAbort.abort();
        const ac = new AbortController();
        currentTurnAbort = ac;
        const runId = ++currentTurnRunId;
        const isCurrent = () => runId === currentTurnRunId;

        const writeAssistant = (
          patch: (turn: ConversationTurn) => ConversationTurn,
        ) => {
          set((s) => ({
            conversations: s.conversations.map((c) => {
              if (c.id !== convId) return c;
              return {
                ...c,
                turns: c.turns.map((t) => (t.id === assistantId ? patch(t) : t)),
              };
            }),
          }));
        };

        await runStream({
          prompt: text,
          model,
          failureMode: "none",
          signal: ac.signal,
          handlers: {
            onToken: (_token, fullOutput) => {
              if (!isCurrent()) return;
              writeAssistant((t) => ({ ...t, content: fullOutput }));
            },
            onDone: (finalOutput) => {
              if (!isCurrent()) return;
              writeAssistant((t) => ({
                ...t,
                content: finalOutput,
                streaming: false,
              }));
              set((s) => ({
                conversations: s.conversations.map((c) =>
                  c.id === convId ? { ...c, updatedAt: Date.now() } : c,
                ),
              }));
            },
            onError: (_err, partial) => {
              if (!isCurrent()) return;
              writeAssistant((t) => ({
                ...t,
                content:
                  partial || t.content || "(stream interrupted before any output)",
                streaming: false,
              }));
            },
          },
        });
      },
      cancelConversation: () => {
        currentTurnAbort?.abort();
        currentTurnRunId++;
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === s.activeConversationId
              ? {
                  ...c,
                  turns: c.turns.map((t) =>
                    t.streaming ? { ...t, streaming: false } : t,
                  ),
                }
              : c,
          ),
        }));
      },
      deleteConversation: (id) => {
        if (get().activeConversationId === id) {
          currentTurnAbort?.abort();
          currentTurnRunId++;
        }
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== id),
          activeConversationId:
            s.activeConversationId === id ? null : s.activeConversationId,
        }));
      },
    }),
    {
      name: "hx-library",
      storage: createJSONStorage(() => safeStorage),
      partialize: (s) => ({
        prompts: s.prompts,
        conversations: s.conversations.slice(0, 20).map((c) => ({
          ...c,
          turns: c.turns.map((t) =>
            t.streaming ? { ...t, streaming: false } : t,
          ),
        })),
      }),
    },
  ),
);

export function selectAllTags(prompts: SavedPrompt[]): string[] {
  const set = new Set<string>();
  for (const p of prompts) for (const t of p.tags) set.add(t);
  return Array.from(set).sort();
}

export function filterPrompts(
  prompts: SavedPrompt[],
  query: string,
  tags: string[],
): SavedPrompt[] {
  const q = query.trim().toLowerCase();
  const out = prompts.filter((p) => {
    if (tags.length > 0 && !tags.every((t) => p.tags.includes(t))) return false;
    if (!q) return true;
    if (p.title.toLowerCase().includes(q)) return true;
    if (p.body.toLowerCase().includes(q)) return true;
    return p.tags.some((t) => t.toLowerCase().includes(q));
  });
  out.sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
  return out;
}
