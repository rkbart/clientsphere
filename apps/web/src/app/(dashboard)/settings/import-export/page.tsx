"use client";

export default function ImportExportSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Import / Export</h1>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">CSV Import</h2>
        <p className="text-[var(--text-secondary)] mb-4">Import contacts, companies, or deals from CSV files.</p>
        <input type="file" accept=".csv" className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent-soft)] file:text-[var(--text-primary)] hover:file:bg-[var(--border)]" />
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">CSV Export</h2>
        <p className="text-[var(--text-secondary)] mb-4">Export your data as CSV files.</p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary">Export Contacts</button>
          <button className="btn-secondary">Export Companies</button>
          <button className="btn-secondary">Export Deals</button>
        </div>
      </div>
    </div>
  );
}
