import { component$ } from "@builder.io/qwik";
import { routeAction$, zod$, z, Form } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  plan: z.enum(["free", "standard"]).optional().default("free"),
  agreeToTerms: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.agreeToTerms === "on", {
  message: "You must agree to the terms",
  path: ["agreeToTerms"],
});

// Server-side action
export const useRegisterAction = routeAction$(
  async (data, { cookie, redirect, platform, fail }) => {
    console.log("Registration attempt:", data.email);

    try {
      // Get database from platform
      const db = platform.env?.DB;
      if (!db) {
        return fail(500, {
          message: "Database connection failed",
        });
      }

      // TODO: Implement actual registration with database
      // For now, we'll create a mock implementation

      // Check if user exists (mock)
      if (data.email === "existing@example.com") {
        return fail(400, {
          message: "An account with this email already exists",
        });
      }

      // Hash password
      const passwordHash = await hashPassword(data.password);

      // Create user (mock)
      const userId = crypto.randomUUID();

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

      // Redirect to dashboard or onboarding
      throw redirect(302, "/dashboard");
    } catch (error) {
      // Re-throw redirects
      if (error instanceof Response) {
        throw error;
      }

      console.error("Registration error:", error);
      return fail(500, {
        message: "An error occurred during registration",
      });
    }
  },
  zod$(registerSchema)
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
  const action = useRegisterAction();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const defaultPlan = searchParams.get('plan') || 'free';

  return (
    <>
      <h2 class="text-2xl font-bold text-center mb-6">Create Account</h2>

      {/* Error message */}
      {action.value?.failed && (
        <div class="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{action.value.message}</span>
        </div>
      )}

      {/* Registration Form */}
      <Form action={action} class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Full Name</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
            class="input input-bordered"
            required
            autoComplete="name"
          />
          {action.value?.fieldErrors?.name && (
            <label class="label">
              <span class="label-text-alt text-error">{action.value.fieldErrors.name}</span>
            </label>
          )}
        </div>

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
            autoComplete="new-password"
          />
          {action.value?.fieldErrors?.password && (
            <label class="label">
              <span class="label-text-alt text-error">{action.value.fieldErrors.password}</span>
            </label>
          )}
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Confirm Password</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            class="input input-bordered"
            required
            autoComplete="new-password"
          />
          {action.value?.fieldErrors?.confirmPassword && (
            <label class="label">
              <span class="label-text-alt text-error">{action.value.fieldErrors.confirmPassword}</span>
            </label>
          )}
        </div>

        {/* Plan Selection */}
        <div class="form-control">
          <label class="label">
            <span class="label-text">Select Plan</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <label class="cursor-pointer">
              <input
                type="radio"
                name="plan"
                value="free"
                class="radio radio-primary peer hidden"
                checked={defaultPlan === 'free'}
              />
              <div class="card border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5">
                <div class="card-body p-3">
                  <h4 class="font-bold">Free</h4>
                  <p class="text-xs">10 donations/year</p>
                </div>
              </div>
            </label>
            <label class="cursor-pointer">
              <input
                type="radio"
                name="plan"
                value="standard"
                class="radio radio-primary peer hidden"
                checked={defaultPlan === 'standard'}
              />
              <div class="card border-2 border-base-300 peer-checked:border-primary peer-checked:bg-primary/5">
                <div class="card-body p-3">
                  <h4 class="font-bold">Standard</h4>
                  <p class="text-xs">$50/year unlimited</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Terms Agreement */}
        <div class="form-control">
          <label class="label cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              class="checkbox checkbox-primary"
              required
            />
            <span class="label-text ml-2">
              I agree to the{" "}
              <a href="/terms" class="link link-primary">Terms of Service</a>
              {" and "}
              <a href="/privacy" class="link link-primary">Privacy Policy</a>
            </span>
          </label>
          {action.value?.fieldErrors?.agreeToTerms && (
            <label class="label">
              <span class="label-text-alt text-error">{action.value.fieldErrors.agreeToTerms}</span>
            </label>
          )}
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
              "Create Account"
            )}
          </button>
        </div>
      </Form>

      <div class="divider">OR</div>

      <div class="text-center">
        <p class="text-sm">
          Already have an account?{" "}
          <a href="/login" class="link link-primary">
            Sign in
          </a>
        </p>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Sign Up - Charity Tracker",
  meta: [
    {
      name: "description",
      content: "Create your free Charity Tracker account to start tracking donations",
    },
  ],
};