import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(8, "Phone must be at least 8 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CUSTOMER", "MECHANIC"]).optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(1, "Phone is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
