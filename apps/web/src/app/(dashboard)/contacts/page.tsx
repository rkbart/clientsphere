"use client";

import { useContacts } from "@/hooks/use-contacts";
import Link from "next/link";

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  lead_score: number;
  status: number;
}

interface ContactsResponse {
  data: Contact[];
  meta: { total_count: number; total_pages: number; current_page: number; per_page: number };
}

export default function ContactsPage() {
  const { data, isLoading } = useContacts();
  const typed = data as unknown as ContactsResponse;

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Link
          href="/contacts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Contact
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {typed?.data?.map((contact) => (
              <tr key={contact.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/contacts/${contact.id}`} className="text-blue-600 hover:text-blue-500">
                    {contact.first_name} {contact.last_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{contact.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{contact.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    contact.lead_score >= 70 ? "bg-green-100 text-green-800" :
                    contact.lead_score >= 40 ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {contact.lead_score}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link href={`/contacts/${contact.id}`} className="text-blue-600 hover:text-blue-500">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
