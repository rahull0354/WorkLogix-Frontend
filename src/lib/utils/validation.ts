import { z } from "zod";

// login form validation
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid Email Address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// register form validation
export const registerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be atleast 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),

  email: z.string().min(1, "Email is required").email("Invalid Email Address"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),

  fullname: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// project form validation
export const projectSchema = z.object({
  projectName: z
    .string()
    .min(1, "Project name is required")
    .min(3, "Project name must be at least 3 characters")
    .max(100, "Project name must be at most 100 characters"),
  clientName: z
    .string()
    .min(1, "Client name is required")
    .min(2, "Client name must be at least 2 characters")
    .max(100, "Client name must be at most 100 characters"),
  hourlyRate: z
    .string()
    .min(1, "Hourly rate is required")
    .refine((val) => !isNaN(Number(val)), "Hourly rate must be a number")
    .refine((val) => Number(val) > 0, "Hourly rate must be greater than 0")
    .transform((val) => Number(val)),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be at most 500 characters"),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// update project validation
export const updateProjectSchema = projectSchema.partial();
export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

// time entry description validation

export const timeEntrySchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must be at most 500 characters"),
});

export type TimeEntryFormData = z.infer<typeof timeEntrySchema>;
