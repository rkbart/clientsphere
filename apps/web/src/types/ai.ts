export type AIProvider =
  | "ollama"
  | "lmstudio"
  | "openrouter"
  | "groq"
  | "gemini"
  | "deepseek"
  | "openai"
  | "anthropic"
  | "custom";

export type AITask =
  | "chat"
  | "draft_email"
  | "suggest_next_action"
  | "enrich"
  | "summarize_deal"
  | "score";

export interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  baseURL?: string;
  temperature?: number;
}

export interface ModelPreset {
  value: string;
  label: string;
}

export interface ProviderDef {
  id: AIProvider;
  label: string;
  kind: "openai-compatible" | "anthropic";
  local: boolean;
  needsKey: boolean;
  keyPlaceholder?: string;
  keyUrl?: string;
  keyUrlLabel?: string;
  baseURL: string;
  editableEndpoint: boolean;
  models: ModelPreset[];
  defaultModel: string;
  hint: string;
  freeNote?: string;
}
