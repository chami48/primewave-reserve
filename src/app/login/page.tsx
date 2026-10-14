
import { Suspense } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";

const errorMessages: Record<string, string> = {
  "missing-fields": "Enter your email address and password.",
  "invalid-credentials": "The email or password is incorrect.",
  "email-not-confirmed": "Please confirm your email before signing in.",
};

const successMessages: Record<string, string> = {
  "check-email": "Account created. Check your email to confirm your account.",
};

async function LoginNotice({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const error =
    typeof params.error === "string" ? errorMessages[params.error] : null;
  const message =
    typeof params.message === "string" ? successMessages[params.message] : null;

  if (!error && !message) {
    return null;
  }

  return (
    <>
      {error ? (
        <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}
    </>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
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
            Enterprise scheduling
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight">
            Reserve spaces, equipment, and teams without conflicts.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            A polished platform for resource visibility, approvals, and secure booking workflows.
          </p>
        </div>
        <p className="text-sm text-slate-400">Secure access powered by Supabase Auth.</p>
      </section>

      <section className="flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <span className="text-emerald-600 font-bold text-xl">
            PrimeWave Reserve
          </span>
          <h1 className="text-3xl font-bold text-slate-900 mt-5">
            Welcome back
          </h1>
          <p className="text-slate-500 mt-2">
            Sign in to manage your reservations.
          </p>
        </div>

        <Suspense fallback={null}>
          <LoginNotice {...props} />
        </Suspense>

        <form action={login} className="space-y-5">
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
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-7">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-emerald-600 font-semibold">
            Create account
          </Link>
        </p>
      </div>
      </section>
    </main>
  );
}
