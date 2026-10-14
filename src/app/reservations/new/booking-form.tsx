"use client";

import { useSearchParams } from "next/navigation";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  checkResourceAvailability,
  createReservation,
  getResourceBookedSlots,
  getResourceBookedSlotsForRange,
} from "@/app/actions/reservations";
import type { Resource } from "@/types/resource";

type Props = {
  resources: Resource[];
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toDateInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function monthLabel(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(value);
}

export function BookingForm({ resources }: Props) {
  const searchParams = useSearchParams();
  const requestedResource = searchParams.get("resource");
  const initialResource =
    resources.find((resource) => resource.id === requestedResource)?.id ??
    resources[0]?.id ??
    "";
  const [resourceId, setResourceId] = useState(initialResource);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<
    { id: string; start_time: string; end_time: string; status: string }[]
  >([]);
  const [monthSlots, setMonthSlots] = useState<
    { id: string; start_time: string; end_time: string; status: string }[]
  >([]);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedResource = useMemo(
    () => resources.find((resource) => resource.id === resourceId) ?? null,
    [resources, resourceId]
  );

  function input() {
    return { resourceId, date, startTime, endTime };
  }

  function formatTime(value: string) {
    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  }

  const monthDays = useMemo(() => {
    const firstDay = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1
    );
    const lastDay = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0
    );
    const offset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = Array.from({ length: offset }, () => null);

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      days.push(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day));
    }

    while (days.length % 7 !== 0) {
      days.push(null);
    }

    return days;
  }, [visibleMonth]);

  const bookedDates = useMemo(() => {
    const dates = new Set<string>();
    monthSlots.forEach((slot) => {
      dates.add(toDateInputValue(new Date(slot.start_time)));
    });
    return dates;
  }, [monthSlots]);

  useEffect(() => {
    let ignore = false;

    if (!resourceId || !date) {
      return;
    }

    getResourceBookedSlots(resourceId, date).then((result) => {
      if (ignore) {
        return;
      }

      if (result.success) {
        setBookedSlots(result.data);
        setSlotsError(null);
      } else {
        setBookedSlots([]);
        setSlotsError(result.error);
      }
    });

    return () => {
      ignore = true;
    };
  }, [resourceId, date]);

  useEffect(() => {
    let ignore = false;

    if (!resourceId) {
      return;
    }

    const rangeStart = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      1
    );
    const rangeEnd = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      1
    );

    getResourceBookedSlotsForRange(
      resourceId,
      rangeStart.toISOString(),
      rangeEnd.toISOString()
    ).then((result) => {
      if (ignore) {
        return;
      }

      setMonthSlots(result.success ? result.data : []);
    });

    return () => {
      ignore = true;
    };
  }, [resourceId, visibleMonth]);

  function moveMonth(direction: -1 | 1) {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + direction, 1)
    );
  }

  function selectCalendarDate(value: Date) {
    setDate(toDateInputValue(value));
  }

  function checkAvailability() {
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await checkResourceAvailability(input());
      if (!result.success) {
        setError(result.error);
        return;
      }
      setMessage(
        result.data.available
          ? "This resource is available for your selected time."
          : "This resource is already booked for that time."
      );
    });
  }

  function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await createReservation(input());
      if (!result.success) {
        setError(result.error);
        return;
      }
      setMessage("Booking confirmed. You can view it in My Reservations.");
      setDate("");
      setStartTime("");
      setEndTime("");
    });
  }

  return (
    <form onSubmit={submitBooking} className="grid gap-6 xl:grid-cols-[300px_1fr_360px]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {selectedResource ? (
          <div className="space-y-4">
            <div
              className="h-40 rounded-xl bg-slate-100 bg-cover bg-center"
              style={{
                backgroundImage: selectedResource.image_url
                  ? `url(${selectedResource.image_url})`
                  : "linear-gradient(135deg, #ecfdf5, #e2e8f0)",
              }}
              aria-label={`${selectedResource.name} image`}
            />
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                {selectedResource.type}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                {selectedResource.name}
              </h2>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {selectedResource.description || "No description provided."}
            </p>
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              Capacity:{" "}
              <span className="font-semibold text-slate-950">
                {selectedResource.capacity ?? "Not applicable"}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600">No available resources found.</p>
        )}
      </aside>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-950">Select date and time</h2>
        </div>
        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Resource</span>
            <select
              required
              value={resourceId}
              onChange={(event) => setResourceId(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} - {resource.type}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Date</span>
              <input
                required
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Start</span>
              <input
                required
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">End</span>
              <input
                required
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-950">
                {monthLabel(visibleMonth)}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => moveMonth(-1)}
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-950"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveMonth(1)}
                  className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-950"
                  aria-label="Next month"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
              {weekDays.map((weekDay) => (
                <span key={weekDay}>{weekDay}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {monthDays.map((calendarDay, index) => {
                if (!calendarDay) {
                  return <span key={`blank-${index}`} className="h-12" />;
                }

                const calendarDate = toDateInputValue(calendarDay);
                const isSelected = calendarDate === date;
                const isBooked = bookedDates.has(calendarDate);
                const isPast =
                  new Date(`${calendarDate}T23:59:59`) < new Date();

                return (
                  <button
                    key={calendarDate}
                    type="button"
                    onClick={() => selectCalendarDate(calendarDay)}
                    disabled={isPast}
                    className={`relative h-12 rounded-xl border text-sm font-semibold transition ${
                      isSelected
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:border-emerald-400"
                    } ${isPast ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    {calendarDay.getDate()}
                    {isBooked ? (
                      <span
                        className={`absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full ${
                          isSelected ? "bg-emerald-300" : "bg-red-500"
                        }`}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-500" />
                Booked day
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-slate-950" />
                Selected day
              </span>
            </div>
          </section>

          {error ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={checkAvailability}
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Clock className="size-4" />}
              Check availability
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-slate-300"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
              Submit booking
            </button>
          </div>
        </div>
      </section>

      <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Summary</h2>
        {selectedResource ? (
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div>
              <p className="font-semibold text-slate-950">{selectedResource.name}</p>
              <p className="text-emerald-700">{selectedResource.type}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p>Date: {date || "Not selected"}</p>
              <p>Time: {startTime && endTime ? `${startTime} - ${endTime}` : "Not selected"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-950">Booked slots</p>
              {!date ? (
                <p className="mt-2 text-slate-500">Select a date to view bookings.</p>
              ) : slotsError ? (
                <p className="mt-2 text-red-700">{slotsError}</p>
              ) : bookedSlots.length === 0 ? (
                <p className="mt-2 text-emerald-700">No bookings for this date.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {bookedSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="rounded-lg bg-red-50 px-3 py-2 text-red-700"
                    >
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-5 text-sm text-slate-600">No available resources found.</p>
        )}
      </aside>
    </form>
  );
}
