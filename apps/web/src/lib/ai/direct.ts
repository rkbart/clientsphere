import { apiClient, getAuthHeadersForApi } from "@/lib/api/client";
import type { AIProvider } from "@/types/ai";
import { PROVIDER_MAP } from "@/lib/ai/providers";

export interface DirectSettings {
  provider?: string | null;
  model?: string | null;
  base_url?: string | null;
}

export type PromptKind = "chat" | "draft_email";

export function isBrowserDirect(settings?: DirectSettings): boolean {
  if (!settings?.provider) return false;
  const def = PROVIDER_MAP[settings.provider as AIProvider];
  return Boolean(def?.local);
}

/**
 * Browser-direct mode for local models: fetches the server-assembled prompts
 * (audited, account-scoped) and sends them straight from the browser to the
 * local provider — the CRM data never touches a remote API.
 */
export async function browserDirect(
  settings: DirectSettings,
  body: { kind: PromptKind; message?: string; contact_id?: string; purpose?: string; deal_id?: string },
): Promise<string> {
  const def = PROVIDER_MAP[settings.provider as AIProvider];
  const baseURL = (settings.base_url?.trim() || def?.baseURL || "").replace(/\/+$/, "");
  const model = settings.model?.trim() || def?.defaultModel;
  if (!baseURL || !model) {
    throw new Error("Local provider is missing a base URL or model — check AI settings.");
  }

  const { data, error } = await apiClient.POST("/ai/prompts", {
    body: body as never,
    headers: getAuthHeadersForApi(),
  });
  if (error || !data) throw new Error("Could not assemble prompts on the server.");
  const systemPrompt = data.system_prompt ?? "";
  const userPrompt = data.user_prompt ?? "";

  let res: Response;
  try {
    res = await fetch(`${baseURL}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
  } catch {
    throw new Error(`Could not reach the local model at ${baseURL} — is it running?`);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Local model error ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Local model returned an empty response.");
  return content;
}
