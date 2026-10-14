"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  resourceSchema,
  resourceUpdateSchema,
} from "@/lib/validations/resource";
import type {
  Resource,
  ResourceActionResult,
  ResourceInput,
  ResourceUpdateInput,
} from "@/types/resource";

type AppUser = {
  id: string;
  role: "admin" | "employee";
};

const resourceSelect =
  "id, name, type, description, image_url, capacity, status, created_at";

type SafeDatabaseError = {
  code?: string;
  message?: string;
  hint?: string;
  details?: string;
};

function validationErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(([, value]) => value)
  ) as Record<string, string[]>;
}

async function getAuthenticatedUser(): Promise<
  ResourceActionResult<AppUser>
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Please sign in to continue." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "Your user profile could not be loaded." };
  }

  const role = String(profile.role);
  if (role !== "admin" && role !== "employee") {
    return { success: false, error: "Your user role is not configured." };
  }

  return {
    success: true,
    data: { id: String(profile.id), role },
  };
}

async function requireAdmin(): Promise<ResourceActionResult<AppUser>> {
  const userResult = await getAuthenticatedUser();

  if (!userResult.success) {
    return userResult;
  }

  if (userResult.data.role !== "admin") {
    return {
      success: false,
      error: "You do not have permission to manage resources.",
    };
  }

  return userResult;
}

function normalizeDatabaseError(message = "Unable to complete the request.") {
  return { success: false, error: message } satisfies ResourceActionResult;
}

function logDatabaseError(context: string, error: SafeDatabaseError) {
  console.error(`[resources] ${context}`, {
    code: error.code,
    message: error.message,
    hint: error.hint,
    details: error.details,
  });
}

function revalidateResourcePages() {
  revalidatePath("/resources");
  revalidatePath("/admin/resources");
  revalidatePath("/dashboard");
}

export async function getResources(): Promise<ResourceActionResult<Resource[]>> {
  const userResult = await getAuthenticatedUser();
  if (!userResult.success) {
    return userResult;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select(resourceSelect)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    return normalizeDatabaseError("Resources could not be loaded.");
  }

  return { success: true, data: (data ?? []) as Resource[] };
}

export async function getResourceById(
  id: string
): Promise<ResourceActionResult<Resource>> {
  const userResult = await getAuthenticatedUser();
  if (!userResult.success) {
    return userResult;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select(resourceSelect)
    .eq("id", id)
    .single();

  if (error || !data) {
    return normalizeDatabaseError("Resource could not be found.");
  }

  return { success: true, data: data as Resource };
}

export async function createResource(
  input: ResourceInput
): Promise<ResourceActionResult<Resource>> {
  const adminResult = await requireAdmin();
  if (!adminResult.success) {
    return adminResult;
  }

  const parsed = resourceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted resource fields.",
      fieldErrors: validationErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .insert({
      id: crypto.randomUUID(),
      ...parsed.data,
    })
    .select(resourceSelect)
    .single();

  if (error || !data) {
    if (error) {
      logDatabaseError("createResource insert failed", error);
    }

    return normalizeDatabaseError("Resource could not be created.");
  }

  revalidateResourcePages();
  return { success: true, data: data as Resource, message: "Resource created." };
}

export async function updateResource(
  id: string,
  input: ResourceUpdateInput
): Promise<ResourceActionResult<Resource>> {
  const adminResult = await requireAdmin();
  if (!adminResult.success) {
    return adminResult;
  }

  const parsed = resourceUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the highlighted resource fields.",
      fieldErrors: validationErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .update(parsed.data)
    .eq("id", id)
    .select(resourceSelect)
    .single();

  if (error || !data) {
    return normalizeDatabaseError("Resource could not be updated.");
  }

  revalidateResourcePages();
  return { success: true, data: data as Resource, message: "Resource updated." };
}

export async function deleteResource(
  id: string
): Promise<ResourceActionResult<{ id: string }>> {
  const adminResult = await requireAdmin();
  if (!adminResult.success) {
    return adminResult;
  }

  const supabase = await createClient();
  const { count, error: reservationError } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("resource_id", id);

  if (reservationError) {
    return normalizeDatabaseError("Reservation history could not be checked.");
  }

  if ((count ?? 0) > 0) {
    return {
      success: false,
      error:
        "This resource has reservation history and cannot be deleted safely.",
    };
  }

  const { error } = await supabase.from("resources").delete().eq("id", id);

  if (error) {
    return normalizeDatabaseError("Resource could not be deleted.");
  }

  revalidateResourcePages();
  return { success: true, data: { id }, message: "Resource deleted." };
}
