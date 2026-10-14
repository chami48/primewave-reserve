
import { Suspense } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";

const errorMessages: Record<string, string> = {
  "invalid-input": "Enter your name, email, and a password with at least 8 characters.",
  "signup-failed": "Account registration failed. Please try again or contact an administrator.",
  "profile-failed": "Account was created, but the employee profile could not be prepared. Please contact an administrator.",
};

async function RegisterNotice({
  searchParams,
}: PageProps<"/register">) {
  const params = await searchParams;
  const error =
    typeof params.error === "string" ? errorMessages[params.error] : null;

  if (!error) {
    return null;
  }

  return (
    <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}
    </p>
  );
}

export default function RegisterPage(props: PageProps<"/register">) {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-950">
            PW
          </span>
          <div>
            <p className="font-bold">PrimeWave Reserve</p>
            <p className="text-sm text-slate-300">Resource Reservation Suite</p>
          </div>
        </div>
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
            Join your workspace
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight">
            Create bookings with visibility, approvals, and reliable conflict protection.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Employee accounts start with secure reservation access and administrator-reviewed booking workflows.
          </p>
        </div>
        <p className="text-sm text-slate-400">New accounts are assigned the employee role.</p>
      </section>

      <section className="flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-900">
          Create your account
        </h1>
        <p className="text-slate-500 mt-2 mb-8">
          Get started with PrimeWave Reserve.
        </p>

        <Suspense fallback={null}>
          <RegisterNotice {...props} />
        </Suspense>

        <form action={signup} className="space-y-5">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              maxLength={100}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              placeholder="Minimum 8 characters"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-7">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
      </section>
    </main>
  );
}
