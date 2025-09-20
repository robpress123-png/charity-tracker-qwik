import { component$, Slot } from "@builder.io/qwik";
import { VERSION_INFO } from "~/lib/version";

export default component$(() => {
  return (
    <div class="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        {/* Logo/Brand */}
        <div class="text-center mb-8">
          <a href="/" class="inline-block">
            <h1 class="text-4xl font-bold text-white mb-2">
              Charity Tracker <span class="text-lg font-normal opacity-75">{VERSION_INFO}</span>
            </h1>
            <p class="text-white/80">Smart Donation Management</p>
          </a>
        </div>

        {/* Auth Card */}
        <div class="card bg-base-100 shadow-2xl">
          <div class="card-body">
            <Slot />
          </div>
        </div>
      </div>
    </div>
  );
});