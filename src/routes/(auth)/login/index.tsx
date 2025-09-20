import { component$ } from "@builder.io/qwik";
import { routeAction$, zod$, z, Form } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Server-side action
export const useLoginAction = routeAction$(
  async (data, { cookie, redirect, platform, fail }) => {
    // This runs on the server
    console.log("Login attempt:", data.email);

    try {
      // Get database from platform
      const db = platform.env?.DB;
      if (!db) {
        return fail(500, {
          message: "Database connection failed",
        });
      }

      // TODO: Implement actual login logic with database
      // For now, we'll create a mock implementation

      // Hash password (in production, use proper hashing)
      const passwordHash = await hashPassword(data.password);

      // Mock successful login for test@example.com
      if (data.email === "test@example.com" && data.password === "password123") {
        // Create session
        const sessionId = crypto.randomUUID();

        // Set session cookie
        cookie.set("session", sessionId, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        // Redirect to dashboard
        throw redirect(302, "/dashboard");
      }

      // Invalid credentials
      return fail(401, {
        message: "Invalid email or password",
      });
    } catch (error) {
      // Re-throw redirects
      if (error instanceof Response) {
        throw error;
      }

      console.error("Login error:", error);
      return fail(500, {
        message: "An error occurred during login",
      });
    }
  },
  zod$(loginSchema)
);

// Simple password hashing for demo (use bcrypt/argon2 in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "charity-tracker-salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default component$(() => {
  const action = useLoginAction();

  return (
    <>
      <h2 class="text-2xl font-bold text-center mb-6">Sign In</h2>

      {/* Error message */}
      {action.value?.failed && (
        <div class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{action.value.message}</span>
        </div>
      )}

      {/* Login Form */}
      <Form action={action} class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            class="input input-bordered"
            required
            autoComplete="email"
          />
          {action.value?.fieldErrors?.email && (
            <label class="label">
              <span class="label-text-alt text-error">{action.value.fieldErrors.email}</span>
            </label>
          )}
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Password</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            class="input input-bordered"
            required
            autoComplete="current-password"
          />
          {action.value?.fieldErrors?.password && (
            <label class="label">
              <span class="label-text-alt text-error">{action.value.fieldErrors.password}</span>
            </label>
          )}
          <label class="label">
            <a href="/forgot-password" class="label-text-alt link link-hover">
              Forgot password?
            </a>
          </label>
        </div>

        <div class="form-control mt-6">
          <button
            type="submit"
            class="btn btn-primary"
            disabled={action.isRunning}
          >
            {action.isRunning ? (
              <span class="loading loading-spinner"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </div>
      </Form>

      <div class="divider">OR</div>

      <div class="text-center">
        <p class="text-sm">
          Don't have an account?{" "}
          <a href="/register" class="link link-primary">
            Sign up for free
          </a>
        </p>
      </div>

      {/* Demo credentials hint */}
      <div class="alert alert-info mt-6">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <div>
          <div class="text-xs">Demo credentials:</div>
          <div class="text-xs">Email: test@example.com</div>
          <div class="text-xs">Password: password123</div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Sign In - Charity Tracker",
  meta: [
    {
      name: "description",
      content: "Sign in to your Charity Tracker account to manage donations",
    },
  ],
};