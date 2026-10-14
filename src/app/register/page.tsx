import { Suspense } from "react";
import { signup } from "@/app/actions/auth";
import { PasswordInput } from "@/components/password-input";
import { AuthShell } from "@/components/auth-shell";
import { AuthSubmit } from "@/components/auth-submit";
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
    <p className="auth-notice auth-notice-error">
      {error}
    </p>
  );
}

export default function RegisterPage(props: PageProps<"/register">) {
  return (
    <AuthShell mode="register">
      <Suspense fallback={null}><RegisterNotice {...props} /></Suspense>
      <form action={signup} className="auth-form">
        <div>
          <label htmlFor="full_name">Full name</label>
          <input id="full_name" name="full_name" required maxLength={100} autoComplete="name" className="auth-input" placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="auth-input" placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <PasswordInput id="password" name="password" required minLength={8} autoComplete="new-password" className="auth-input" placeholder="Create a password" aria-describedby="password-hint" />
          <p id="password-hint" className="auth-note">Use at least 8 characters.</p>
        </div>
        <AuthSubmit>Create account</AuthSubmit>
      </form>
    </AuthShell>
  );
}