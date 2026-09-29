"use client";

import { useState } from "react";
import { PROVIDERS } from "@/lib/ai/providers";
import { loadSettingsStore, saveSettingsStore } from "@/lib/ai/local-provider";

export default function AISettingsPage() {
  const [settings, setSettings] = useState(loadSettingsStore);
  const [saved, setSaved] = useState(false);

  const currentProvider = PROVIDERS.find((p) => p.id === settings.provider);

  const handleSave = () => {
    saveSettingsStore(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">AI Provider Settings</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Provider</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Provider</label>
            <select
              value={settings.provider}
              onChange={(e) =>
                setSettings({ ...settings, provider: e.target.value as any })
              }
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.freeNote ? ` — ${p.freeNote}` : ""}
                </option>
              ))}
            </select>
            {currentProvider && (
              <p className="mt-1 text-sm text-gray-500">{currentProvider.hint}</p>
            )}
          </div>

          {currentProvider?.needsKey && (
            <div>
              <label className="block text-sm font-medium text-gray-700">API Key</label>
              <input
                type="password"
                value={settings.keys[settings.provider] || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    keys: { ...settings.keys, [settings.provider]: e.target.value },
                  })
                }
                placeholder={currentProvider.keyPlaceholder}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              {currentProvider.keyUrl && (
                <p className="mt-1 text-sm text-gray-500">
                  Get your key at{" "}
                  <a
                    href={currentProvider.keyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    {currentProvider.keyUrlLabel}
                  </a>
                </p>
              )}
            </div>
          )}

          {currentProvider && currentProvider.models.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <select
                value={settings.models[settings.provider] || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    models: { ...settings.models, [settings.provider]: e.target.value },
                  })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {currentProvider.models.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            {saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
