"use client";

export default function ImportExportSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Import / Export</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">CSV Import</h2>
        <p className="text-gray-500 mb-4">Import contacts, companies, or deals from CSV files.</p>
        <input type="file" accept=".csv" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">CSV Export</h2>
        <p className="text-gray-500 mb-4">Export your data as CSV files.</p>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
            Export Contacts
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
            Export Companies
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
            Export Deals
          </button>
        </div>
      </div>
    </div>
  );
}
