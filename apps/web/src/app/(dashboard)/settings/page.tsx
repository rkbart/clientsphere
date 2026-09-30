export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="/settings/profile" className="card p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-[var(--text-secondary)] mt-2">Manage your account settings</p>
        </a>

        <a href="/settings/team" className="card p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold">Team</h2>
          <p className="text-[var(--text-secondary)] mt-2">Manage team members and roles</p>
        </a>

        <a href="/settings/ai" className="card p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold">AI Provider</h2>
          <p className="text-[var(--text-secondary)] mt-2">Configure AI settings</p>
        </a>

        <a href="/settings/custom-fields" className="card p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold">Custom Fields</h2>
          <p className="text-[var(--text-secondary)] mt-2">Define custom data fields</p>
        </a>

        <a href="/settings/views" className="card p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold">Saved Views</h2>
          <p className="text-[var(--text-secondary)] mt-2">Manage saved filters and views</p>
        </a>

        <a href="/settings/webhooks" className="card p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold">Webhooks</h2>
          <p className="text-[var(--text-secondary)] mt-2">Configure webhook integrations</p>
        </a>

        <a href="/settings/api-tokens" className="card p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold">API Tokens</h2>
          <p className="text-[var(--text-secondary)] mt-2">Personal access tokens for integrations</p>
        </a>

        <a href="/settings/import-export" className="card p-6 hover:shadow-md transition-shadow">
          <h2 className="text-lg font-semibold">Import/Export</h2>
          <p className="text-[var(--text-secondary)] mt-2">Import and export data</p>
        </a>
      </div>
    </div>
  );
}
