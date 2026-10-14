
import { Suspense } from "react";
import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { ArrowRight, CalendarDays, Command } from "lucide-react";
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
    <main className="primewave-bg grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden p-10 text-[#082044] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-8 rounded-[2rem] bg-[url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center shadow-[0_30px_90px_rgba(15,23,42,0.18)]" />
        <div className="absolute inset-8 rounded-[2rem] bg-gradient-to-r from-white/92 via-white/72 to-white/18" />
        <div className="flex items-center gap-3">
          <span className="relative flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20">
            <Command className="size-5" />
          </span>
          <div className="relative">
            <p className="font-bold">PrimeWave Reserve</p>
            <p className="text-sm text-slate-600">Resource operations suite</p>
          </div>
        </div>
        <div className="relative max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-600">
            Join your workspace
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.02]">
            Create bookings with visibility, approvals, and reliable conflict protection.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Employee accounts start with secure reservation access and administrator-reviewed booking workflows.
          </p>
        </div>
        <p className="relative text-sm text-slate-500">New accounts are assigned the employee role.</p>
      </section>

      <section className="flex items-center justify-center p-5 sm:p-8">
      <div className="premium-panel w-full max-w-md rounded-[1.75rem] p-7 sm:p-9">
        <div className="flex items-center gap-2 text-sm font-bold tracking-[0.12em] text-blue-600 uppercase">
          <CalendarDays className="size-4" /> Employee access
        </div>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
          Create your account
        </h1>
        <p className="mt-2 mb-8 text-slate-500">
          Get started with PrimeWave Reserve.
        </p>

        <Suspense fallback={null}>
          <RegisterNotice {...props} />
        </Suspense>

        <form action={signup} className="space-y-5">
          <div>
              <label htmlFor="full_name" className="mb-2 block text-sm font-semibold text-slate-800">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              maxLength={100}
              className="premium-field w-full rounded-xl px-4 py-3"
              placeholder="Your full name"
            />
          </div>

          <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="premium-field w-full rounded-xl px-4 py-3"
              placeholder="you@company.com"
            />
          </div>

          <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-800">
              Password
            </label>
            <PasswordInput
              id="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="premium-field w-full rounded-xl px-4 py-3"
              placeholder="Minimum 8 characters"
            />
          </div>

          <button
            type="submit"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            Create Account <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
      </section>
    </main>
  );
}
