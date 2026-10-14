
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

type SafeSupabaseError = {
  code?: string;
  message?: string;
  status?: number;
  name?: string;
};

function logSupabaseError(context: string, error: SafeSupabaseError) {
  console.error(`[auth] ${context}`, {
    code: error.code,
    message: error.message,
    status: error.status,
    name: error.name,
  });
}

function loginErrorCode(error: SafeSupabaseError) {
  const message = error.message?.toLowerCase() ?? "";

  if (error.code === "email_not_confirmed" || message.includes("not confirmed")) {
    return "email-not-confirmed";
  }

  return "invalid-credentials";
}

async function ensureEmployeeProfile({
  supabase,
  user,
  fullName,
  email,
}: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: User;
  fullName: string;
  email: string;
}) {
  const { data: existingProfile, error: lookupError } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (lookupError) {
    logSupabaseError("signup profile lookup failed", lookupError);
    return false;
  }

  if (existingProfile) {
    console.info("[auth] signup profile exists", {
      userId: user.id,
      profileId: existingProfile.id,
      role: existingProfile.role,
    });
    return true;
  }

  const { error: insertError } = await supabase.from("users").insert({
    id: crypto.randomUUID(),
    auth_user_id: user.id,
    full_name: fullName,
    email,
    role: "employee",
  });

  if (insertError) {
    logSupabaseError("signup profile insert failed", insertError);
    return false;
  }

  console.info("[auth] signup profile inserted", {
    userId: user.id,
    role: "employee",
  });
  return true;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=missing-fields");
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logSupabaseError("login signInWithPassword failed", error);
    redirect(`/login?error=${loginErrorCode(error)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("role")
        .eq("auth_user_id", user.id)
        .single()
    : { data: null };

  revalidatePath("/", "layout");
  redirect(profile?.role === "admin" ? "/admin/dashboard" : "/dashboard");
}

export async function signup(formData: FormData) {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || password.length < 8) {
    redirect("/register?error=invalid-input");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "http://localhost:3000/dashboard",
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    logSupabaseError("signup auth.signUp failed", error);
    redirect("/register?error=signup-failed");
  }

  if (!data.user) {
    console.error("[auth] signup auth.signUp returned no user", {
      email,
      hasSession: Boolean(data.session),
    });
    redirect("/register?error=signup-failed");
  }

  console.info("[auth] signup auth.signUp succeeded", {
    userId: data.user.id,
    email,
    hasSession: Boolean(data.session),
  });

  if (data.session) {
    const profileReady = await ensureEmployeeProfile({
      supabase,
      user: data.user,
      fullName,
      email,
    });

    if (!profileReady) {
      redirect("/register?error=profile-failed");
    }
  } else {
    console.info("[auth] signup awaiting email confirmation", {
      userId: data.user.id,
      profileCreation: "database-trigger",
    });
  }

  redirect("/login?message=check-email");
}

export async function logout() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
