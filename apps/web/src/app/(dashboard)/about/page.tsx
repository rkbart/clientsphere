"use client";

import { Coffee, Github } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">ClientSphere</h1>
        <p className="mt-2 text-gray-600">
          A free, customizable CRM for small businesses
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Built with</h2>
        <ul className="space-y-2 text-gray-600">
          <li>• Rails 8 (Backend API)</li>
          <li>• Next.js (Frontend)</li>
          <li>• Tailwind CSS + shadcn/ui</li>
          <li>• PostgreSQL</li>
          <li>• AI: 14 providers (free + paid)</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="mb-4 text-gray-600">
          If ClientSphere helps you, consider supporting development:
        </p>
        <a
          href="https://www.buymeacoffee.com/rkbart"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-500"
        >
          <Coffee className="h-5 w-5" />
          Buy Me a Coffee
        </a>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <a
          href="https://github.com/rkbart"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <Github className="h-5 w-5" />
          GitHub
        </a>
      </div>
    </div>
  );
}
