import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Lock,
  Mail,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { login } from "@/app/actions/auth";
import { PasswordInput } from "@/components/password-input";

const errorMessages: Record<string, string> = {
  "missing-fields": "Enter your email address and password.",
  "invalid-credentials": "The email or password is incorrect.",
  "email-not-confirmed": "Please confirm your email before signing in.",
};

const successMessages: Record<string, string> = {
  "check-email": "Account created. Check your email to confirm your account.",
};

async function LoginNotice({ searchParams }: PageProps<"/login">) {
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
        <p className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {message}
        </p>
      ) : null}
    </>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#061d45] px-16 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=90')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061d45]/98 via-[#0b3d88]/76 to-[#0b4ea2]/18" />
        <div className="absolute inset-x-0 bottom-28 h-28 bg-[linear-gradient(165deg,transparent_0%,transparent_42%,rgb(37_99_235/0.62)_43%,rgb(37_99_235/0.62)_55%,transparent_56%)] opacity-70" />
        <div className="absolute inset-x-0 bottom-24 h-24 bg-[linear-gradient(170deg,transparent_0%,transparent_40%,rgb(59_130_246/0.45)_41%,rgb(59_130_246/0.45)_53%,transparent_54%)] opacity-70" />

        <div className="relative flex items-start justify-between gap-6">
          <Link href="/" className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/20 p-3 ring-1 ring-white/10">
              <Image src="/primewave-lab-icon.png" alt="PrimeWave Lab" width={40} height={40} className="size-full object-contain" />
            </span>
            <span className="leading-none">
              <span className="block text-3xl font-bold tracking-tight">
                PrimeWave
              </span>
              <span className="mt-1 block text-2xl font-medium text-blue-100">
                Reserve
              </span>
            </span>
          </Link>
          <p className="pt-2 text-sm font-semibold text-blue-100/70">
            Smart Spaces. Better Teams.
          </p>
        </div>

        <div className="relative max-w-[520px]">
          <h1 className="text-6xl font-bold leading-[1.08] tracking-tight">
            Book. Manage.
            <br />
            Work Better.
          </h1>
          <p className="mt-8 max-w-[460px] text-xl leading-8 text-blue-50/92">
            PrimeWave Reserve helps your team book meeting rooms, projectors
            and office resources quickly and easily. Create a more productive
            workplace, together.
          </p>

          <div className="mt-12 space-y-7">
            <div className="flex items-start gap-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white ring-1 ring-white/10">
                <CalendarDays className="size-6" />
              </span>
              <span>
                <span className="block text-lg font-bold">Easy Booking</span>
                <span className="mt-1 block text-base text-blue-50/78">
                  Book resources in seconds
                </span>
              </span>
            </div>
            <div className="flex items-start gap-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white ring-1 ring-white/10">
                <ShieldCheck className="size-6" />
              </span>
              <span>
                <span className="block text-lg font-bold">
                  Secure & Reliable
                </span>
                <span className="mt-1 block text-base text-blue-50/78">
                  Powered by Supabase
                </span>
              </span>
            </div>
            <div className="flex items-start gap-5">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/12 text-white ring-1 ring-white/10">
                <Users className="size-6" />
              </span>
              <span>
                <span className="block text-lg font-bold">Built for Teams</span>
                <span className="mt-1 block text-base text-blue-50/78">
                  Work better, together
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <p className="text-sm text-blue-50/68">
            Trusted by forward-thinking teams
          </p>
          <div className="mt-7 flex items-center gap-14 text-xl font-semibold text-white/58">
            <span>SLIIT</span>
            <span>Microsoft</span>
            <span>Google</span>
            <span>Meta</span>
          </div>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
        <div className="absolute right-12 top-12 hidden items-center gap-3 text-sm font-semibold text-slate-600 sm:flex">
          <Sun className="size-5 text-blue-600" />
          Light Mode
        </div>

        <div className="w-full max-w-[640px]">
          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-[#07183d]">
                Welcome back
              </h1>
              <p className="mt-4 max-w-md text-xl leading-8 text-[#506895]">
                Sign in to your PrimeWave Reserve account to continue.
              </p>
            </div>

            <div className="mb-10 grid grid-cols-2 border-b border-slate-200 text-center text-lg font-semibold">
              <span className="border-b-2 border-blue-600 pb-5 text-blue-600">
                Sign In
              </span>
              <Link
                href="/register"
                className="pb-5 text-[#506895] transition hover:text-blue-600"
              >
                Create Account
              </Link>
            </div>

            <Suspense fallback={null}>
              <LoginNotice {...props} />
            </Suspense>

            <form action={login} className="space-y-7">
              <div>
                <label
                  htmlFor="email"
                  className="mb-3 block text-lg font-bold text-[#07183d]"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6c7fa8]" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="h-16 w-full rounded-xl border border-[#cfd9eb] bg-white pl-16 pr-5 text-lg text-[#07183d] shadow-sm outline-none transition placeholder:text-[#8092b7] focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-3 block text-lg font-bold text-[#07183d]"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[#6c7fa8]" />
                  <PasswordInput
                    id="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    className="h-16 w-full rounded-xl border border-[#cfd9eb] bg-white pl-16 pr-14 text-lg text-[#07183d] shadow-sm outline-none transition placeholder:text-[#8092b7] focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-base">
                <label className="flex items-center gap-3 text-[#506895]">
                  <input
                    type="checkbox"
                    name="remember"
                    defaultChecked
                    className="size-5 rounded border-[#cfd9eb] accent-blue-600"
                  />
                  Remember me
                </label>
                <Link href="/login" className="font-medium text-blue-600">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="group inline-flex h-16 w-full items-center justify-center gap-3 rounded-xl bg-blue-600 text-lg font-bold text-white shadow-[0_18px_35px_rgba(37,99,235,0.24)] transition hover:bg-blue-700"
              >
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                Sign In
              </button>
            </form>

            <div className="my-10 flex items-center gap-6 text-sm text-[#6c7fa8]">
              <span className="h-px flex-1 bg-slate-200" />
              or continue with
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              className="inline-flex h-16 w-full items-center justify-center gap-4 rounded-xl border border-[#cfd9eb] bg-white text-lg font-bold text-[#07183d] shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
            >
              <span className="text-2xl font-bold text-[#ea4335]">G</span>
              Continue with Google
            </button>

            <p className="mt-10 text-center text-base text-[#506895]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-blue-600">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
