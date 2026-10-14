import { z } from "zod";

export const resourceStatusSchema = z.enum(["available", "maintenance"]);

const optionalText = z
  .string()
  .trim()
  .max(500, "Description must be 500 characters or fewer")
  .optional()
  .transform((value) => (value ? value : null));

export const resourceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Resource name must be at least 2 characters")
    .max(120, "Resource name must be 120 characters or fewer"),
  type: z
    .string()
    .trim()
    .min(2, "Resource type must be at least 2 characters")
    .max(80, "Resource type must be 80 characters or fewer"),
  description: optionalText,
  image_url: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .max(1000, "Image URL must be 1000 characters or fewer")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value ? value : null)),
  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be greater than zero")
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  status: resourceStatusSchema,
});

export const resourceUpdateSchema = resourceSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "At least one field must be provided"
);
