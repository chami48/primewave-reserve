import type { Resource } from "@/types/resource";

export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export type Reservation = {
  id: string;
  user_id: string;
  resource_id: string;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  created_at: string;
  resources?: Resource | null;
};

export type ReservationInput = {
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
};

export type ReservationActionResult<T = null> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
