import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useLogout = routeLoader$(async ({ cookie, redirect }) => {
  // Clear the session cookie
  cookie.delete("session", { path: "/" });

  // Redirect to home page
  throw redirect(302, "/");
});

export default component$(() => {
  return (
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <h1 class="text-2xl">Signing out...</h1>
      </div>
    </div>
  );
});