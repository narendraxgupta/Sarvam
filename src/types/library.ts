import type { ModelId } from "@/types";

export interface PromptVersion {
  id: string;
  body: string;
  message?: string;
  createdAt: number;
}

export interface SavedPrompt {
  id: string;
  title: string;
  body: string;
  tags: string[];
  model?: ModelId;
  createdAt: number;
  updatedAt: number;
  versions: PromptVersion[];
  pinned?: boolean;
}

export type TurnRole = "user" | "assistant";

export interface ConversationTurn {
  id: string;
  role: TurnRole;
  content: string;
  createdAt: number;
  model?: ModelId;
  streaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  model: ModelId;
  turns: ConversationTurn[];
  createdAt: number;
  updatedAt: number;
}
