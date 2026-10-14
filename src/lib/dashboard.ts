export const dashboardTimeZone = "Asia/Colombo";

export type DashboardBooking = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
};

export function dashboardDay(now: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: dashboardTimeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)!.value;
  const start = new Date(`${part("year")}-${part("month")}-${part("day")}T00:00:00+05:30`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function bookingActivity(bookings: DashboardBooking[], dayStart: Date) {
  return Array.from({ length: 24 }, (_, hour) => {
    const start = dayStart.getTime() + hour * 60 * 60 * 1000;
    const end = start + 60 * 60 * 1000;
    const active = bookings.filter((booking) =>
      (booking.status === "pending" || booking.status === "confirmed") &&
      new Date(booking.start_time).getTime() < end &&
      new Date(booking.end_time).getTime() > start
    );
    return {
      hour,
      pending: active.filter((booking) => booking.status === "pending").length,
      confirmed: active.filter((booking) => booking.status === "confirmed").length,
    };
  });
}
