import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, ShieldCheck, Users } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import "./auth.css";

export function AuthShell({ mode, children }: { mode: "login" | "register"; children: ReactNode }) {
  const signup = mode === "register";
  return (
    <main className="auth-page">
      <aside className="auth-story">
        <Link href="/" className="auth-brand">
          <span className="auth-logo"><Image src="/primewave-lab-icon.png" alt="" width={32} height={32} /></span>
          <span>PrimeWave <span className="auth-brand-sub">Reserve</span></span>
        </Link>
        <div className="auth-story-content">
          <span className="auth-eyebrow">YOUR WORKSPACE, IN SYNC</span>
          <h1>Better spaces.<br />Better work.</h1>
          <p>A little less coordination. A lot more room to do your best work.</p>
          <div className="auth-features">
            <div><CalendarDays size={18} /><span>Book rooms & resources<span>Find the right space in seconds.</span></span></div>
            <div><Users size={18} /><span>Keep your team aligned<span>One clear view of every reservation.</span></span></div>
            <div><ShieldCheck size={18} /><span>Plan with confidence<span>Secure access. Reliable availability.</span></span></div>
          </div>
        </div>
        <div className="auth-story-footer"><span>Built for a better working day.</span><ArrowUpRight size={18} /></div>
      </aside>
      <section className="auth-main">
        <header className="auth-topbar"><Link href="/" className="auth-mobile-brand">PrimeWave Reserve</Link><ThemeToggle /></header>
        <div className="auth-card">
          <span className="auth-kicker">{signup ? "JOIN YOUR WORKSPACE" : "WELCOME TO PRIMEWAVE"}</span>
          <h2>{signup ? "Create your account" : "Welcome back"}</h2>
          <p className="auth-intro">{signup ? "A smoother working day starts here." : "Sign in to your workspace. Make room for great work."}</p>
          <nav className="auth-tabs" aria-label="Account access">
            <Link href="/login" aria-current={!signup ? "page" : undefined}>Sign in</Link>
            <Link href="/register" aria-current={signup ? "page" : undefined}>Create account</Link>
          </nav>
          {children}
          <p className="auth-switch">{signup ? "Already have an account?" : "New to PrimeWave?"} <Link href={signup ? "/login" : "/register"}>{signup ? "Sign in" : "Create an account"}</Link></p>
        </div>
        <footer className="auth-footer"><ShieldCheck size={13} /> Secure access to your team&apos;s workspace</footer>
      </section>
    </main>
  );
}
