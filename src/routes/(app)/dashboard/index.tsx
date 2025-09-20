import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";
import { useUser } from "../layout";

// Load dashboard data
export const useDashboardData = routeLoader$(async ({ cookie }) => {
  // TODO: Fetch from database
  // Mock data for now
  return {
    ytdDonations: 1250.00,
    ytdTaxSavings: 275.00,
    donationCount: 3,
    topCharities: [
      { name: "Red Cross", amount: 500 },
      { name: "United Way", amount: 450 },
      { name: "Local Food Bank", amount: 300 },
    ],
    recentDonations: [
      {
        id: "1",
        charity: "Red Cross",
        amount: 500,
        date: "2025-01-15",
        type: "money",
      },
      {
        id: "2",
        charity: "United Way",
        amount: 450,
        date: "2025-01-10",
        type: "money",
      },
      {
        id: "3",
        charity: "Local Food Bank",
        amount: 300,
        date: "2025-01-05",
        type: "items",
      },
    ],
    monthlyTrend: [
      { month: "Jan", amount: 1250 },
    ],
  };
});

export default component$(() => {
  const user = useUser();
  const data = useDashboardData();

  return (
    <>
      {/* Welcome Header */}
      <div class="mb-8">
        <h1 class="text-3xl font-bold">Welcome back, {user.value.name}!</h1>
        <p class="text-base-content/70">
          Here's your donation summary for 2025
        </p>
      </div>

      {/* Stats Grid */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* YTD Donations */}
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="stat-title">YTD Donations</div>
            <div class="stat-value">${data.value.ytdDonations.toLocaleString()}</div>
            <div class="stat-desc">{data.value.donationCount} donations made</div>
          </div>
        </div>

        {/* Tax Savings */}
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-success">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <div class="stat-title">Tax Savings</div>
            <div class="stat-value text-success">${data.value.ytdTaxSavings}</div>
            <div class="stat-desc">At 22% tax bracket</div>
          </div>
        </div>

        {/* Usage */}
        <div class="stats shadow">
          <div class="stat">
            <div class="stat-figure text-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-8 h-8 stroke-current">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div class="stat-title">Plan Usage</div>
            <div class="stat-value text-sm">{user.value.donationCount}/{user.value.donationLimit}</div>
            <div class="stat-desc">
              {user.value.plan === "free" ? (
                <a href="/billing" class="link link-primary">Upgrade for unlimited</a>
              ) : (
                "Unlimited donations"
              )}
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Donations */}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <div class="flex justify-between items-center mb-4">
              <h2 class="card-title">Recent Donations</h2>
              <a href="/donations/new" class="btn btn-primary btn-sm">
                Add Donation
              </a>
            </div>
            <div class="overflow-x-auto">
              <table class="table table-zebra">
                <thead>
                  <tr>
                    <th>Charity</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data.value.recentDonations.map((donation) => (
                    <tr key={donation.id}>
                      <td>{donation.charity}</td>
                      <td>${donation.amount}</td>
                      <td>{donation.date}</td>
                      <td>
                        <span class={`badge ${
                          donation.type === "money" ? "badge-success" : "badge-info"
                        }`}>
                          {donation.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div class="card-actions justify-end mt-4">
              <a href="/donations" class="btn btn-ghost btn-sm">
                View All →
              </a>
            </div>
          </div>
        </div>

        {/* Top Charities */}
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body">
            <h2 class="card-title mb-4">Top Charities</h2>
            <div class="space-y-4">
              {data.value.topCharities.map((charity, index) => (
                <div key={charity.name} class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="avatar placeholder">
                      <div class="bg-primary text-primary-content rounded-full w-10">
                        <span>{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <div class="font-semibold">{charity.name}</div>
                      <div class="text-sm text-base-content/70">
                        ${charity.amount} donated
                      </div>
                    </div>
                  </div>
                  <div class="radial-progress text-primary" style={`--value:${(charity.amount / data.value.ytdDonations) * 100}`}>
                    {Math.round((charity.amount / data.value.ytdDonations) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <a href="/donations/new" class="btn btn-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Donation
        </a>
        <a href="/charities" class="btn btn-outline">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Find Charities
        </a>
        <a href="/reports" class="btn btn-outline">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          Tax Report
        </a>
        <a href="/settings" class="btn btn-outline">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </a>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Dashboard - Charity Tracker",
  meta: [
    {
      name: "description",
      content: "View your donation summary and tax savings",
    },
  ],
};