"use client";

import { useCompany } from "@/hooks/use-companies";
import { useParams } from "next/navigation";

export default function CompanyDetailPage() {
  const params = useParams();
  const { data: company, isLoading } = useCompany(params.id as string);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!company) {
    return <div className="text-center py-8">Company not found</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{company.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Company Info</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-500">Domain</dt>
              <dd className="mt-1">{company.domain}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Industry</dt>
              <dd className="mt-1">{company.industry}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Size Range</dt>
              <dd className="mt-1">{company.size_range}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500">Annual Revenue</dt>
              <dd className="mt-1">${company.annual_revenue?.toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Description</h2>
          <p className="text-gray-600">{company.description || "No description provided."}</p>
        </div>
      </div>
    </div>
  );
}
