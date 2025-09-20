import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <div class="min-h-screen bg-base-200">
      {/* Hero Section */}
      <div class="hero min-h-[600px] bg-gradient-to-br from-primary to-secondary">
        <div class="hero-content text-center text-primary-content">
          <div class="max-w-2xl">
            <h1 class="text-6xl font-bold mb-8">
              Charity Tracker
            </h1>
            <p class="text-2xl mb-8">
              Smart donation tracking for maximum tax benefits
            </p>
            <p class="text-lg mb-12 opacity-90">
              Track all your charitable donations in one place.
              Optimize your tax deductions with real-time calculations.
            </p>
            <div class="flex gap-4 justify-center">
              <a href="/register" class="btn btn-lg btn-accent">
                Get Started Free
              </a>
              <a href="/login" class="btn btn-lg btn-ghost">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div class="container mx-auto px-4 py-20">
        <h2 class="text-4xl font-bold text-center mb-16">
          Everything You Need for Donation Tracking
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="text-4xl mb-4">📊</div>
              <h3 class="card-title text-2xl mb-4">Smart Analytics</h3>
              <p>
                Real-time tax savings calculations based on your income bracket and filing status.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="text-4xl mb-4">🏢</div>
              <h3 class="card-title text-2xl mb-4">500+ Charities</h3>
              <p>
                Pre-loaded IRS-verified charities with autocomplete search and custom additions.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="text-4xl mb-4">🧾</div>
              <h3 class="card-title text-2xl mb-4">Receipt Storage</h3>
              <p>
                Secure cloud storage for all donation receipts with IRS-compliant documentation.
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Feature 4 */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="text-4xl mb-4">💰</div>
              <h3 class="card-title text-2xl mb-4">Multiple Types</h3>
              <p>
                Track money, items, mileage, stocks, and crypto donations all in one place.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="text-4xl mb-4">📈</div>
              <h3 class="card-title text-2xl mb-4">Tax Reports</h3>
              <p>
                Generate IRS Schedule A ready reports with all your deductible donations.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <div class="text-4xl mb-4">⚡</div>
              <h3 class="card-title text-2xl mb-4">Instant Loading</h3>
              <p>
                Zero hydration with Qwik framework means instant interactivity on any device.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div class="bg-base-100 py-20">
        <div class="container mx-auto px-4">
          <h2 class="text-4xl font-bold text-center mb-16">
            Simple, Transparent Pricing
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div class="card bg-base-200 shadow-xl">
              <div class="card-body">
                <h3 class="card-title text-3xl mb-4">Free</h3>
                <div class="text-4xl font-bold mb-6">$0<span class="text-base font-normal">/year</span></div>
                <ul class="space-y-3 mb-8">
                  <li class="flex items-center">
                    <span class="mr-2">✅</span> Track up to 10 donations
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">✅</span> Basic tax calculations
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">✅</span> Receipt storage
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">❌</span> Annual reports
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">❌</span> Priority support
                  </li>
                </ul>
                <a href="/register" class="btn btn-outline btn-primary">
                  Start Free
                </a>
              </div>
            </div>

            {/* Standard Plan */}
            <div class="card bg-primary text-primary-content shadow-xl">
              <div class="card-body">
                <div class="badge badge-accent mb-2">POPULAR</div>
                <h3 class="card-title text-3xl mb-4">Standard</h3>
                <div class="text-4xl font-bold mb-6">$50<span class="text-base font-normal">/year</span></div>
                <ul class="space-y-3 mb-8">
                  <li class="flex items-center">
                    <span class="mr-2">✅</span> Unlimited donations
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">✅</span> Advanced tax optimization
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">✅</span> Unlimited receipt storage
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">✅</span> Annual tax reports
                  </li>
                  <li class="flex items-center">
                    <span class="mr-2">✅</span> Priority support
                  </li>
                </ul>
                <a href="/register?plan=standard" class="btn btn-accent">
                  Get Standard
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div class="bg-gradient-to-r from-primary to-secondary py-20">
        <div class="container mx-auto px-4 text-center text-primary-content">
          <h2 class="text-4xl font-bold mb-8">
            Ready to Maximize Your Tax Deductions?
          </h2>
          <p class="text-xl mb-12 max-w-2xl mx-auto">
            Join thousands of users who save an average of $2,400 per year
            in taxes with smart donation tracking.
          </p>
          <a href="/register" class="btn btn-lg btn-accent">
            Start Tracking Today
          </a>
        </div>
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Charity Tracker - Smart Donation Tracking for Tax Benefits",
  meta: [
    {
      name: "description",
      content: "Track charitable donations, maximize tax deductions, and manage receipts with our smart donation tracking platform. Free to start.",
    },
  ],
};