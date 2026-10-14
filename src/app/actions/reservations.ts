"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reservationInputSchema } from "@/lib/validations/reservation";
import type {
  Reservation,
  ReservationActionResult,
  ReservationInput,
} from "@/types/reservation";
import type { Resource } from "@/types/resource";

type AppUser = {
  id: string;
  role: "admin" | "employee";
};

type DbError = {
  code?: string;
  message?: string;
  hint?: string;
  details?: string;
};

const reservationSelect =
  "id, user_id, resource_id, start_time, end_time, status, created_at, resources(id, name, type, description, image_url, capacity, status, created_at)";

function logReservationError(context: string, error: DbError) {
  console.error(`[reservations] ${context}`, {
    code: error.code,
    message: error.message,
    hint: error.hint,
    details: error.details,
  });
}

function validationErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  return Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(([, value]) => value)
  ) as Record<string, string[]>;
}

function toDateRange(input: ReservationInput) {
  return {
    start: new Date(`${input.date}T${input.startTime}:00`).toISOString(),
    end: new Date(`${input.date}T${input.endTime}:00`).toISOString(),
  };
}

function friendlyDbError(error: DbError, fallback: string) {
  if (error.code === "23P01" || error.code === "23505") {
    return "That resource is already reserved for the selected time.";
  }

  if (error.code === "23514") {
    return "The reservation time range is invalid.";
  }

  return fallback;
}

async function getCurrentAppUser(): Promise<ReservationActionResult<AppUser>> {
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
    if (profileError) {
      logReservationError("profile lookup failed", profileError);
    }
    return { success: false, error: "Your user profile could not be loaded." };
  }

  const role = String(profile.role);
  if (role !== "admin" && role !== "employee") {
    return { success: false, error: "Your user role is not configured." };
  }

  return { success: true, data: { id: String(profile.id), role } };
}

async function requireAdmin(): Promise<ReservationActionResult<AppUser>> {
  const user = await getCurrentAppUser();
  if (!user.success) {
    return user;
  }

  if (user.data.role !== "admin") {
    return {
      success: false,
      error: "You do not have permission to manage reservations.",
    };
  }

  return user;
}

export async function getBookableResources(): Promise<
  ReservationActionResult<Resource[]>
> {
  const user = await getCurrentAppUser();
  if (!user.success) {
    return user;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("id, name, type, description, image_url, capacity, status, created_at")
    .eq("status", "available")
    .order("type")
    .order("name");

  if (error) {
    logReservationError("bookable resource lookup failed", error);
    return { success: false, error: "Resources could not be loaded." };
  }

  return { success: true, data: (data ?? []) as Resource[] };
}

export async function checkResourceAvailability(
  input: ReservationInput
): Promise<ReservationActionResult<{ available: boolean }>> {
  const user = await getCurrentAppUser();
  if (!user.success) {
    return user;
  }

  const parsed = reservationInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the booking details.",
      fieldErrors: validationErrors(parsed.error),
    };
  }

  const { start, end } = toDateRange(parsed.data);
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("resource_id", parsed.data.resourceId)
    .in("status", ["pending", "confirmed"])
    .lt("start_time", end)
    .gt("end_time", start);

  if (error) {
    logReservationError("availability check failed", error);
    return { success: false, error: "Availability could not be checked." };
  }

  return { success: true, data: { available: (count ?? 0) === 0 } };
}

export async function getResourceBookedSlots(
  resourceId: string,
  date: string
): Promise<
  ReservationActionResult<{ id: string; start_time: string; end_time: string; status: string }[]>
> {
  const user = await getCurrentAppUser();
  if (!user.success) {
    return user;
  }

  if (!resourceId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { success: true, data: [] };
  }

  const dayStart = new Date(`${date}T00:00:00`).toISOString();
  const dayEnd = new Date(`${date}T23:59:59.999`).toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_resource_booked_slots", {
    p_resource_id: resourceId,
    p_day_start: dayStart,
    p_day_end: dayEnd,
  });

  if (error) {
    logReservationError("booked slots lookup failed", error);
    return { success: false, error: "Booked slots could not be loaded." };
  }

  return { success: true, data: data ?? [] };
}

export async function getResourceBookedSlotsForRange(
  resourceId: string,
  rangeStart: string,
  rangeEnd: string
): Promise<
  ReservationActionResult<{ id: string; start_time: string; end_time: string; status: string }[]>
> {
  const user = await getCurrentAppUser();
  if (!user.success) {
    return user;
  }

  if (!resourceId) {
    return { success: true, data: [] };
  }

  const start = new Date(rangeStart);
  const end = new Date(rangeEnd);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return { success: true, data: [] };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_resource_booked_slots", {
    p_resource_id: resourceId,
    p_day_start: start.toISOString(),
    p_day_end: end.toISOString(),
  });

  if (error) {
    logReservationError("booked slots range lookup failed", error);
    return { success: false, error: "Booked calendar could not be loaded." };
  }

  return { success: true, data: data ?? [] };
}

export async function createReservation(
  input: ReservationInput
): Promise<ReservationActionResult<Reservation>> {
  const user = await getCurrentAppUser();
  if (!user.success) {
    return user;
  }

  const parsed = reservationInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the booking details.",
      fieldErrors: validationErrors(parsed.error),
    };
  }

  const { start, end } = toDateRange(parsed.data);
  const supabase = await createClient();

  const { data: resource, error: resourceError } = await supabase
    .from("resources")
    .select("id, status")
    .eq("id", parsed.data.resourceId)
    .single();

  if (resourceError || !resource) {
    if (resourceError) {
      logReservationError("resource lookup failed", resourceError);
    }
    return { success: false, error: "Selected resource could not be found." };
  }

  if (resource.status !== "available") {
    return { success: false, error: "Only available resources can be booked." };
  }

  const availability = await checkResourceAvailability(parsed.data);
  if (!availability.success) {
    return availability;
  }

  if (!availability.data.available) {
    return {
      success: false,
      error: "That resource is already reserved for the selected time.",
    };
  }

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      id: crypto.randomUUID(),
      user_id: user.data.id,
      resource_id: parsed.data.resourceId,
      start_time: start,
      end_time: end,
      status: "pending",
    })
    .select(reservationSelect)
    .single();

  if (error || !data) {
    if (error) {
      logReservationError("create reservation failed", error);
      return { success: false, error: friendlyDbError(error, "Booking failed.") };
    }

    return { success: false, error: "Booking failed." };
  }

  revalidatePath("/reservations");
  revalidatePath("/reservations/new");
  return {
    success: true,
    data: data as unknown as Reservation,
    message: "Booking created.",
  };
}

export async function getMyReservations(): Promise<
  ReservationActionResult<Reservation[]>
> {
  const user = await getCurrentAppUser();
  if (!user.success) {
    return user;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(reservationSelect)
    .eq("user_id", user.data.id)
    .order("start_time", { ascending: true });

  if (error) {
    logReservationError("my reservations lookup failed", error);
    return { success: false, error: "Reservations could not be loaded." };
  }

  return { success: true, data: (data ?? []) as unknown as Reservation[] };
}

export async function getAllReservationsForAdmin(): Promise<
  ReservationActionResult<Reservation[]>
> {
  const admin = await requireAdmin();
  if (!admin.success) {
    return admin;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(reservationSelect)
    .order("start_time", { ascending: false });

  if (error) {
    logReservationError("admin reservations lookup failed", error);
    return { success: false, error: "Reservations could not be loaded." };
  }

  return { success: true, data: (data ?? []) as unknown as Reservation[] };
}

export async function updateReservationStatusForAdmin(
  id: string,
  status: "pending" | "confirmed" | "cancelled"
): Promise<ReservationActionResult<{ id: string; status: string }>> {
  const admin = await requireAdmin();
  if (!admin.success) {
    return admin;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id);

  if (error) {
    logReservationError("admin reservation status update failed", error);
    return { success: false, error: "Reservation status could not be updated." };
  }

  revalidatePath("/admin/reservations");
  revalidatePath("/reservations");
  revalidatePath(`/reservations/${id}`);
  return { success: true, data: { id, status }, message: "Reservation updated." };
}

export async function getReservationById(
  id: string
): Promise<ReservationActionResult<Reservation>> {
  const user = await getCurrentAppUser();
  if (!user.success) {
    return user;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select(reservationSelect)
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) {
      logReservationError("reservation detail lookup failed", error);
    }
    return { success: false, error: "Reservation could not be found." };
  }

  return { success: true, data: data as unknown as Reservation };
}

export async function cancelReservation(
  id: string
): Promise<ReservationActionResult<{ id: string }>> {
  const user = await getCurrentAppUser();
  if (!user.success) {
    return user;
  }

  const supabase = await createClient();
  const { data: reservation, error: lookupError } = await supabase
    .from("reservations")
    .select("id, user_id, start_time, status")
    .eq("id", id)
    .single();

  if (lookupError || !reservation) {
    if (lookupError) {
      logReservationError("cancel lookup failed", lookupError);
    }
    return { success: false, error: "Reservation could not be found." };
  }

  if (reservation.user_id !== user.data.id && user.data.role !== "admin") {
    return { success: false, error: "You cannot cancel this reservation." };
  }

  if (reservation.status === "cancelled" || new Date(reservation.start_time) <= new Date()) {
    return {
      success: false,
      error: "Only upcoming active reservations can be cancelled.",
    };
  }

  const { error } = await supabase.rpc("cancel_own_reservation", {
    p_reservation_id: id,
  });

  if (error) {
    logReservationError("cancel rpc failed", error);
    return { success: false, error: "Reservation could not be cancelled." };
  }

  revalidatePath("/reservations");
  revalidatePath(`/reservations/${id}`);
  return { success: true, data: { id }, message: "Reservation cancelled." };
}
