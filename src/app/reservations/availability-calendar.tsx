"use client";

import Link from "next/link";
import { CalendarPlus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getResourceBookedSlotsForRange } from "@/app/actions/reservations";
import type { Resource } from "@/types/resource";

type Props = {
  resources: Resource[];
};

type Slot = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
};

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function dateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function monthTitle(value: Date) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AvailabilityCalendar({ resources }: Props) {
  const [resourceId, setResourceId] = useState(resources[0]?.id ?? "");
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => dateKey(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const selectedResource = resources.find((resource) => resource.id === resourceId);

  const days = useMemo(() => {
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
    const monthDays: (Date | null)[] = Array.from({ length: offset }, () => null);

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      monthDays.push(
        new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)
      );
    }

    while (monthDays.length % 7 !== 0) {
      monthDays.push(null);
    }

    return monthDays;
  }, [visibleMonth]);

  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, Slot[]>();
    slots.forEach((slot) => {
      const key = dateKey(new Date(slot.start_time));
      grouped.set(key, [...(grouped.get(key) ?? []), slot]);
    });
    return grouped;
  }, [slots]);

  const selectedSlots = slotsByDate.get(selectedDate) ?? [];

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

      if (result.success) {
        setSlots(result.data);
        setError(null);
      } else {
        setSlots([]);
        setError(result.error);
      }
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

  if (resources.length === 0) {
    return null;
  }

  return (
    <section className="premium-panel rounded-2xl p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Availability Calendar
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                See booked and free days before creating a reservation.
              </p>
            </div>
            <select
              value={resourceId}
              onChange={(event) => setResourceId(event.target.value)}
              className="premium-field h-11 rounded-xl px-3 text-sm font-semibold"
            >
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} - {resource.type}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-950">
                {monthTitle(visibleMonth)}
              </h3>
              <div className="flex gap-2">
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
              {weekDays.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {days.map((day, index) => {
                if (!day) {
                  return <span key={`blank-${index}`} className="h-12" />;
                }

                const key = dateKey(day);
                const daySlots = slotsByDate.get(key) ?? [];
                const isSelected = key === selectedDate;
                const isToday = key === dateKey(new Date());

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedDate(key)}
                    className={`relative h-12 rounded-xl border text-sm font-bold transition ${
                      isSelected
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:border-blue-400"
                    }`}
                  >
                    {day.getDate()}
                    {daySlots.length > 0 ? (
                      <span
                        className={`absolute bottom-1 left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full ${
                          isSelected ? "bg-red-300" : "bg-red-500"
                        }`}
                      />
                    ) : (
                      <span
                        className={`absolute bottom-1 left-1/2 h-1.5 w-5 -translate-x-1/2 rounded-full ${
                          isSelected ? "bg-blue-300" : "bg-blue-500"
                        } ${isToday ? "opacity-100" : "opacity-60"}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div
            className="h-32 rounded-xl bg-slate-100 bg-cover bg-center"
            style={{
              backgroundImage: selectedResource?.image_url
                ? `url(${selectedResource.image_url})`
                : "linear-gradient(135deg, #dbeafe, #e0f2fe)",
            }}
          />
          <div className="mt-4">
            <p className="text-sm font-semibold text-blue-700">
              {selectedResource?.type ?? "Resource"}
            </p>
            <h3 className="text-lg font-bold text-slate-950">
              {selectedResource?.name ?? "Selected resource"}
            </h3>
          </div>
          <div className="mt-4 rounded-xl bg-white p-4">
            <p className="text-sm font-bold text-slate-950">{selectedDate}</p>
            {error ? (
              <p className="mt-2 text-sm text-red-700">{error}</p>
            ) : selectedSlots.length > 0 ? (
              <div className="mt-3 space-y-2">
                {selectedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
                  >
                    <Clock className="size-4" />
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                Free day. No bookings found.
              </p>
            )}
          </div>
          <Link
            href={`/reservations/new?resource=${resourceId}`}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-600/15 hover:bg-blue-700"
          >
            <CalendarPlus className="size-4" />
            Book this resource
          </Link>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-5 rounded-full bg-blue-500" />
              Free
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-5 rounded-full bg-red-500" />
              Booked
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
