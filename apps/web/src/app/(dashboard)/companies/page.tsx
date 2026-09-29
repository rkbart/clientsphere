"use client";

import { useCompanies } from "@/hooks/use-companies";
import Link from "next/link";

export default function CompaniesPage() {
  const { data, isLoading } = useCompanies();

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Companies</h1>
        <Link
          href="/companies/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Company
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Industry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.data?.map((company: any) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/companies/${company.id}`} className="text-blue-600 hover:text-blue-500">
                    {company.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {company.domain}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {company.industry}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link href={`/companies/${company.id}`} className="text-blue-600 hover:text-blue-500">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
