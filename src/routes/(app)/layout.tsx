import { component$, Slot } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

// Loader to check authentication
export const useUser = routeLoader$(async ({ cookie, redirect }) => {
  const sessionId = cookie.get("session")?.value;

  if (!sessionId) {
    // Not authenticated, redirect to login
    throw redirect(302, "/login");
  }

  // TODO: In production, validate session with database/KV
  // For now, return mock user data
  return {
    id: "user-123",
    name: "John Doe",
    email: "test@example.com",
    plan: "free",
    donationCount: 3,
    donationLimit: 10,
  };
});

export default component$(() => {
  const user = useUser();

  return (
    <div class="min-h-screen bg-base-200">
      {/* Navigation */}
      <div class="navbar bg-base-100 shadow-lg">
        <div class="flex-1">
          <a href="/dashboard" class="btn btn-ghost text-xl">
            Charity Tracker
          </a>
        </div>
        <div class="flex-none">
          <ul class="menu menu-horizontal px-1">
            <li>
              <a href="/dashboard">Dashboard</a>
            </li>
            <li>
              <a href="/donations">Donations</a>
            </li>
            <li>
              <a href="/charities">Charities</a>
            </li>
            <li>
              <details>
                <summary>
                  {user.value.name}
                </summary>
                <ul class="p-2 bg-base-100 rounded-t-none">
                  <li><a href="/settings">Settings</a></li>
                  <li><a href="/billing">Billing</a></li>
                  <li><a href="/logout">Sign Out</a></li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>

      {/* Page Content */}
      <div class="container mx-auto px-4 py-8">
        <Slot />
      </div>

      {/* Plan Notification for Free Users */}
      {user.value.plan === "free" && (
        <div class="toast toast-end">
          <div class="alert alert-info">
            <span>
              {user.value.donationCount}/{user.value.donationLimit} donations used.{" "}
              <a href="/billing" class="link">Upgrade to Standard</a>
            </span>
          </div>
        </div>
      )}
    </div>
  );
});