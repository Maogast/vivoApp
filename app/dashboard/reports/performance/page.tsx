// app/dashboard/reports/performance/page.tsx
// This file will display the performance reports for the logged-in user.

import React from 'react';
import { redirect } from 'next/navigation';
import { getUserFromServer } from '@/lib/get-user.server'; // Your server-side user utility

// You can add data fetching functions here later, for example:
// import { fetchPerformanceData } from '@/lib/api';

// You might create a dedicated component for rendering the performance data:
// import { PerformanceReportComponent } from '@/components/Reports/PerformanceReportComponent';

export default async function PerformancePage() {
  // 1) Grab the logged-in user from the server-side function
  const user = await getUserFromServer();

  // 2) If there's no session, kick them to login
  if (!user) {
    redirect('/login');
  }

  // 3) (Optional) Fetch performance data here, similar to how you fetch sales data
  // For now, we'll just have a placeholder.
  // const performanceData = await fetchPerformanceData(user.region_code, user.outlet_code);

  // 4) Render the performance page content
  return (
    <div className="flex flex-col h-full w-full p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Performance Report</h1>
      <p className="text-gray-700">
        Welcome, {user.name}! This page will display your detailed performance reports.
        You can integrate charts, graphs, and tables here.
      </p>
      {/* <PerformanceReportComponent data={performanceData} /> 
        Once you have your data fetching and rendering component ready,
        you can uncomment and use it here.
      */}
      {/* Changed bg-white to bg-transparent to allow the watermark to show through */}
      <div className="mt-8 p-6 bg-transparent rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Key Metrics Overview</h2>
        <ul className="list-disc list-inside text-gray-600">
          <li>Total Sales Achieved: [Dynamic Data Placeholder]</li>
          <li>Target Attainment: [Dynamic Data Placeholder]</li>
          <li>Commission Earned: [Dynamic Data Placeholder]</li>
          <li>Average SKU Quantity: [Dynamic Data Placeholder]</li>
        </ul>
        <p className="mt-4 text-sm text-gray-500">
          (Data will be loaded from your API and displayed here)
        </p>
      </div>
    </div>
  );
}
