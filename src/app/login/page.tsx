import { Suspense } from "react";
import { login } from "@/app/actions/auth";
import { PasswordInput } from "@/components/password-input";
import { AuthShell } from "@/components/auth-shell";
import { AuthSubmit } from "@/components/auth-submit";
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
        <p className="auth-notice auth-notice-error">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="auth-notice auth-notice-success">
          {message}
        </p>
      ) : null}
    </>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <AuthShell mode="login">
      <Suspense fallback={null}><LoginNotice {...props} /></Suspense>
      <form action={login} className="auth-form">
        <div>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="auth-input" placeholder="you@company.com" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <PasswordInput id="password" name="password" required autoComplete="current-password" className="auth-input" placeholder="Enter your password" />
        </div>
        <AuthSubmit>Sign in</AuthSubmit>
      </form>
    </AuthShell>
  );
}