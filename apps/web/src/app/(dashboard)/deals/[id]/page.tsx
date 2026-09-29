"use client";

import { useDeal } from "@/hooks/use-deals";

interface DealData {
  id: string;
  title: string;
  amount: number;
  currency: string;
  stage_id: string;
  pipeline_id: string;
  expected_close_date: string;
  probability: number;
  closed_at: string | null;
  created_at: string;
}

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const { data, isLoading } = useDeal(params.id);
  const deal = data as unknown as DealData | undefined;

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (!deal) return <div className="text-center py-8">Deal not found</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{deal.title}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Deal Info</h2>
          <dl className="space-y-3">
            <div><dt className="text-sm text-gray-500">Amount</dt><dd className="mt-1 text-2xl font-bold">${deal.amount?.toLocaleString()}</dd></div>
            <div><dt className="text-sm text-gray-500">Currency</dt><dd className="mt-1">{deal.currency}</dd></div>
            <div><dt className="text-sm text-gray-500">Expected Close Date</dt><dd className="mt-1">{deal.expected_close_date || "N/A"}</dd></div>
            <div><dt className="text-sm text-gray-500">Probability</dt><dd className="mt-1">{deal.probability}%</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="space-y-3">
            <div><span className="text-sm text-gray-500">Stage:</span><span className="ml-2 font-medium">{deal.stage_id}</span></div>
            <div><span className="text-sm text-gray-500">Pipeline:</span><span className="ml-2 font-medium">{deal.pipeline_id}</span></div>
            {deal.closed_at && <div><span className="text-sm text-gray-500">Closed:</span><span className="ml-2 font-medium">{new Date(deal.closed_at).toLocaleDateString()}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
