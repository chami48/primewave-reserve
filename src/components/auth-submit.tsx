"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function AuthSubmit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <button className="auth-submit" type="submit" disabled={pending}>{pending ? "Please wait…" : children}{pending ? <Loader2 size={15} className="animate-spin" /> : <ArrowRight size={15} />}</button>;
}
