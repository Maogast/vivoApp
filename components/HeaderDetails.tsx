// components/HeaderDetails.tsx
import React from 'react';

interface HeaderDetailsProps {
  title: string;
  description: string;
  regionName: string;
  outletName: string;
}

/**
 * A reusable header component for dashboard pages, displaying title, description,
 * and user's region and outlet information.
 */
export default function HeaderDetails({ title, description, regionName, outletName }: HeaderDetailsProps) {
  return (
    <div className="mb-6 border-b pb-4">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-600 mt-2">{description}</p>
      <div className="mt-4 text-sm text-gray-500">
        <p>Region: <span className="font-semibold">{regionName}</span></p>
        <p>Outlet: <span className="font-semibold">{outletName}</span></p>
      </div>
    </div>
  );
}
