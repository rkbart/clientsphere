import type { AIConfig, AIProvider, ProviderDef } from "@/types/ai";
import { PROVIDER_MAP, DEFAULT_PROVIDER, resolveBaseURL, displayName } from "./providers";

const STORE_KEY = "clientsphere-ai-settings";

export interface AISettingsStore {
  provider: AIProvider;
  keys: Partial<Record<string, string>>;
  models: Partial<Record<string, string>>;
  baseURLs: Partial<Record<string, string>>;
}

const EMPTY_STORE: AISettingsStore = {
  provider: DEFAULT_PROVIDER,
  keys: {},
  models: {},
  baseURLs: {},
};

export function loadSettingsStore(): AISettingsStore {
  if (typeof window === "undefined") return { ...EMPTY_STORE };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { ...EMPTY_STORE };
    const parsed = JSON.parse(raw) as Partial<AISettingsStore>;
    return {
      provider: parsed.provider ?? DEFAULT_PROVIDER,
      keys: { ...(parsed.keys ?? {}) },
      models: { ...(parsed.models ?? {}) },
      baseURLs: { ...(parsed.baseURLs ?? {}) },
    };
  } catch {
    return { ...EMPTY_STORE };
  }
}

export function saveSettingsStore(store: AISettingsStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export interface ResolvedConfig {
  def: ProviderDef;
  apiKey: string;
  model: string;
  baseURL: string;
}

export function resolveConfig(config?: AIConfig): ResolvedConfig {
  const store = loadSettingsStore();
  const provider = config?.provider ?? store.provider;
  const def = PROVIDER_MAP[provider] ?? PROVIDER_MAP[DEFAULT_PROVIDER];
  const apiKey = config?.apiKey ?? store.keys[def.id] ?? "";
  const model = (config?.model ?? store.models[def.id] ?? "").trim() || def.defaultModel;
  return {
    def,
    apiKey,
    model,
    baseURL: resolveBaseURL(def, config?.baseURL ?? store.baseURLs[def.id]),
  };
}

export function loadAIConfig(): AIConfig {
  const store = loadSettingsStore();
  const def = PROVIDER_MAP[store.provider] ?? PROVIDER_MAP[DEFAULT_PROVIDER];
  return {
    provider: def.id,
    apiKey: store.keys[def.id] ?? "",
    model: store.models[def.id] ?? "",
    baseURL: store.baseURLs[def.id] ?? "",
  };
}

export async function callLocalAI(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const r = resolveConfig(config);
  if (r.def.local && r.def.id !== "custom") {
    return openAICompatible({
      def: r.def,
      apiKey: r.apiKey,
      model: r.model,
      baseURL: r.baseURL,
      system: systemPrompt,
      user: userPrompt,
    });
  }
  throw new Error("Local provider required for browser-direct calls");
}

async function openAICompatible(args: {
  def: ProviderDef;
  apiKey: string;
  model: string;
  baseURL: string;
  system: string;
  user: string;
}): Promise<string> {
  const { def, apiKey, model, baseURL, system, user } = args;
  if (!model) {
    throw new Error(`No model set for ${displayName(def)}. Pick one in Settings → AI Provider.`);
  }
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`${displayName(def)} error (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function testLocalConnection(config?: AIConfig): Promise<string> {
  const r = resolveConfig(config);
  if (!r.def.local) {
    return "Server-side only for this provider";
  }
  try {
    await callLocalAI(config ?? { provider: "ollama" }, "Reply with exactly: ok", "ok");
    return "Connected.";
  } catch (err) {
    throw new Error(`${displayName(r.def)} connection failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
