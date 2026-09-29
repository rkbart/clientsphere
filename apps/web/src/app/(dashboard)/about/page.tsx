"use client";

import { Coffee, Github, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-lg mx-auto space-y-8 animate-fade-in">
      <div className="text-center">
        <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-xl">C</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">ClientSphere</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          A free, customizable CRM for small businesses
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold mb-3">Built with</h2>
        <div className="grid grid-cols-2 gap-2 text-sm text-[var(--text-secondary)]">
          <span>Rails 8 API</span>
          <span>Next.js</span>
          <span>Tailwind CSS</span>
          <span>shadcn/ui</span>
          <span>PostgreSQL</span>
          <span>14 AI Providers</span>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold mb-3">Open source</h2>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Free to use, free to self-host, free forever.
        </p>
        <a
          href="https://github.com/rkbart/clientsphere"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary w-full justify-center"
        >
          <Github className="h-4 w-4" />
          View on GitHub
          <ExternalLink className="h-3 w-3 text-[var(--text-tertiary)]" />
        </a>
      </div>

      <div className="card p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          If ClientSphere helps you, consider supporting development
        </p>
        <a
          href="https://www.buymeacoffee.com/rkbart"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full justify-center"
        >
          <Coffee className="h-4 w-4" />
          Buy Me a Coffee
        </a>
      </div>
    </div>
  );
}
