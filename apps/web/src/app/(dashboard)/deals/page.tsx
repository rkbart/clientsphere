"use client";

import { useDeals } from "@/hooks/use-deals";
import Link from "next/link";

export default function DealsPage() {
  const { data, isLoading } = useDeals();

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Deals</h1>
        <Link
          href="/deals/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Deal
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Close
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data?.data?.map((deal: any) => (
              <tr key={deal.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/deals/${deal.id}`} className="text-blue-600 hover:text-blue-500">
                    {deal.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  ${deal.amount?.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {deal.stage_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {deal.expected_close_date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link href={`/deals/${deal.id}`} className="text-blue-600 hover:text-blue-500">
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
