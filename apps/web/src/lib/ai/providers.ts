import type { AIProvider, ProviderDef } from "@/types/ai";

export const PROVIDERS: ProviderDef[] = [
  {
    id: "ollama",
    label: "Ollama (local)",
    kind: "openai-compatible",
    local: true,
    needsKey: false,
    baseURL: "http://localhost:11434/v1",
    editableEndpoint: true,
    models: [
      { value: "llama3.1", label: "Llama 3.1 (good all-rounder)" },
      { value: "qwen2.5", label: "Qwen 2.5 (strong multilingual)" },
      { value: "mistral", label: "Mistral (fast)" },
      { value: "gemma2", label: "Gemma 2 (efficient)" },
    ],
    defaultModel: "llama3.1",
    hint: "Free and private — models run on your machine. Install from ollama.com, then pull a model (`ollama pull llama3.1`) and serve it (`ollama serve`).",
    freeNote: "Free · private",
  },
  {
    id: "lmstudio",
    label: "LM Studio (local)",
    kind: "openai-compatible",
    local: true,
    needsKey: false,
    baseURL: "http://localhost:1234/v1",
    editableEndpoint: true,
    models: [],
    defaultModel: "",
    hint: "Free and private. Load any GGUF model in LM Studio, start its local server (default port 1234), then type the exact model identifier shown in LM Studio.",
    freeNote: "Free · private",
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    kind: "openai-compatible",
    local: false,
    needsKey: true,
    keyPlaceholder: "sk-or-...",
    keyUrl: "https://openrouter.ai/keys",
    keyUrlLabel: "openrouter.ai/keys",
    baseURL: "https://openrouter.ai/api/v1",
    editableEndpoint: false,
    models: [
      { value: "meta-llama/llama-3.1-8b-instruct:free", label: "Llama 3.1 8B (free)" },
      { value: "qwen/qwen-2.5-72b-instruct:free", label: "Qwen 2.5 72B (free)" },
      { value: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash (cheap)" },
    ],
    defaultModel: "meta-llama/llama-3.1-8b-instruct:free",
    hint: "One key for hundreds of models, including free ones (the :free suffix). Free-tier model ids change often — if one stops working, pick another.",
    freeNote: "Free models available",
  },
  {
    id: "groq",
    label: "Groq",
    kind: "openai-compatible",
    local: false,
    needsKey: true,
    keyPlaceholder: "gsk_...",
    keyUrl: "https://console.groq.com/keys",
    keyUrlLabel: "console.groq.com/keys",
    baseURL: "https://api.groq.com/openai/v1",
    editableEndpoint: false,
    models: [
      { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B (very fast)" },
      { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
    ],
    defaultModel: "llama-3.1-8b-instant",
    hint: "Extremely fast inference with a generous free tier. Great default if you don't run Ollama.",
    freeNote: "Generous free tier",
  },
  {
    id: "gemini",
    label: "Google Gemini",
    kind: "openai-compatible",
    local: false,
    needsKey: true,
    keyPlaceholder: "AIza...",
    keyUrl: "https://aistudio.google.com/apikey",
    keyUrlLabel: "aistudio.google.com/apikey",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    editableEndpoint: false,
    models: [
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (free tier)" },
      { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
    ],
    defaultModel: "gemini-2.0-flash",
    hint: "Google AI Studio keys carry a free allowance. Served here through Gemini's OpenAI-compatible endpoint.",
    freeNote: "Free allowance",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    kind: "openai-compatible",
    local: false,
    needsKey: true,
    keyPlaceholder: "sk-...",
    keyUrl: "https://platform.deepseek.com/api_keys",
    keyUrlLabel: "platform.deepseek.com",
    baseURL: "https://api.deepseek.com/v1",
    editableEndpoint: false,
    models: [
      { value: "deepseek-chat", label: "DeepSeek V3 (cheap, strong)" },
    ],
    defaultModel: "deepseek-chat",
    hint: "Very cheap frontier-class quality. No free tier, but usage costs fractions of a cent.",
  },
  {
    id: "openai",
    label: "OpenAI",
    kind: "openai-compatible",
    local: false,
    needsKey: true,
    keyPlaceholder: "sk-...",
    keyUrl: "https://platform.openai.com/api-keys",
    keyUrlLabel: "platform.openai.com",
    baseURL: "https://api.openai.com/v1",
    editableEndpoint: false,
    models: [
      { value: "gpt-4o-mini", label: "GPT-4o Mini (fast, cheap)" },
      { value: "gpt-4o", label: "GPT-4o (best quality)" },
    ],
    defaultModel: "gpt-4o-mini",
    hint: "Pay-as-you-go. Calls go straight from your browser to OpenAI with your key.",
  },
  {
    id: "anthropic",
    label: "Anthropic",
    kind: "anthropic",
    local: false,
    needsKey: true,
    keyPlaceholder: "sk-ant-...",
    keyUrl: "https://console.anthropic.com/",
    keyUrlLabel: "console.anthropic.com",
    baseURL: "https://api.anthropic.com/v1",
    editableEndpoint: false,
    models: [
      { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (fast)" },
      { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (best)" },
    ],
    defaultModel: "claude-3-5-haiku-20241022",
    hint: "Dedicated client with browser-access headers. Pay-as-you-go.",
  },
  {
    id: "custom",
    label: "Custom endpoint",
    kind: "openai-compatible",
    local: true,
    needsKey: false,
    baseURL: "",
    editableEndpoint: true,
    models: [],
    defaultModel: "",
    hint: "Any OpenAI-compatible server: vLLM, text-generation-webui, LocalAI, llama.cpp server. Paste the base URL (.../v1) and type the model id.",
    freeNote: "Your infrastructure",
  },
];

export const PROVIDER_MAP: Record<AIProvider, ProviderDef> = Object.fromEntries(
  PROVIDERS.map((p) => [p.id, p])
) as Record<AIProvider, ProviderDef>;

export const DEFAULT_PROVIDER: AIProvider = "ollama";

export function resolveBaseURL(def: ProviderDef, override?: string): string {
  const raw = (override ?? "").trim() || def.baseURL;
  return raw.replace(/\/+$/, "");
}

export function displayName(def: ProviderDef): string {
  return def.label.replace(/\s*\(.*?\)\s*$/, "");
}
