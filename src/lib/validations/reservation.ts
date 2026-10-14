import { z } from "zod";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a valid 24-hour time");

export const reservationInputSchema = z
  .object({
    resourceId: z.string().uuid("Select a resource"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Select a valid date"),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .superRefine((value, context) => {
    const start = new Date(`${value.date}T${value.startTime}:00`);
    const end = new Date(`${value.date}T${value.endTime}:00`);
    const now = new Date();

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      context.addIssue({
        code: "custom",
        path: ["date"],
        message: "Select a valid reservation date and time",
      });
      return;
    }

    if (start <= now) {
      context.addIssue({
        code: "custom",
        path: ["startTime"],
        message: "Reservations must start in the future",
      });
    }

    if (end <= start) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time",
      });
    }
  });
