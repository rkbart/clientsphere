"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAiSettings, useAiChat } from "@/hooks/use-ai";
import { PROVIDERS } from "@/lib/ai/providers";
import { isBrowserDirect, browserDirect } from "@/lib/ai/direct";
import { Send, Bot, User, AlertCircle, Sparkles } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Who should I follow up with this week?",
  "What's in my open pipeline?",
  "Which deals need attention?",
];

function errMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object" && error !== null && "error" in error) {
    const e = (error as { error: unknown }).error;
    if (typeof e === "string") return e;
    if (Array.isArray(e)) return e.join(", ");
  }
  return "The assistant could not respond. Try again.";
}

export default function AIPage() {
  const { data: settings, isLoading } = useAiSettings();
  const chat = useAiChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [nextId, setNextId] = useState(1);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    const userId = nextId;
    const assistantId = nextId + 1;
    setNextId((id) => id + 2);
    setMessages((prev) => [...prev, { id: userId, role: "user", text: message }]);
    setInput("");
    setBusy(true);
    try {
      let reply: string;
      if (settings && isBrowserDirect(settings)) {
        reply = await browserDirect(settings, { kind: "chat", message });
      } else {
        const result = await chat.mutateAsync(message);
        reply = result.response || "(empty response)";
      }
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", text: `⚠ ${errMessage(error)}` },
      ]);
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <div className="card p-6 space-y-3">
          <div className="h-8 bg-[var(--bg-elevated)] rounded w-1/3 animate-pulse" />
          <div className="h-64 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!settings?.enabled) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <div className="card p-10 text-center space-y-4">
          <Sparkles className="h-8 w-8 mx-auto text-[var(--text-tertiary)]" />
          <div>
            <p className="font-medium">AI is turned off</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {settings?.provider
                ? "Turn AI on to chat with your CRM data."
                : "Connect a provider first, then turn AI on."}
            </p>
          </div>
          <Link href="/settings/ai" className="btn-primary inline-flex">
            Open AI settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Answers use your account&apos;s contacts, deals and tasks — nothing else.
        </p>
      </div>

      <div className="card flex flex-col h-[min(70vh,640px)]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4">
              <Bot className="h-8 w-8 text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-secondary)]">Ask anything about your CRM.</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="btn-ghost text-xs border border-[var(--border)]">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-[var(--radius-lg)] px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === "user"
                    ? "bg-[var(--accent)] text-white"
                    : m.text.startsWith("⚠")
                      ? "bg-red-50 text-red-700"
                      : "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                }`}
              >
                {m.text.replace(/^⚠\s*/, "")}
              </div>
              {m.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
              )}
            </div>
          ))}

          {busy && (
            <div className="flex gap-3 items-center">
              <div className="w-7 h-7 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-[var(--text-secondary)]" />
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-[var(--border-subtle)] p-4 flex gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about your contacts, deals or tasks…"
            rows={1}
            className="input resize-none flex-1 min-h-[42px] max-h-32"
            aria-label="Message"
          />
          <button type="submit" disabled={!input.trim() || busy} className="btn-primary self-end" aria-label="Send">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {!settings.api_key_set && !(PROVIDERS.find((p) => p.id === settings.provider)?.local ?? false) && (
        <p className="text-xs text-[var(--warning)] flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" />
          No API key saved — requests will fail until you add one in{" "}
          <Link href="/settings/ai" className="underline">AI settings</Link>.
        </p>
      )}
    </div>
  );
}
