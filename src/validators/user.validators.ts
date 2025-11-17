import { z } from "zod";
import { DEFAULT_COUNTRY_CODE } from "../constants/auth.constants";
import { PassThrough } from "stream";

export const createUserSchema = z
  .object({
    name: z.string().min(2).max(50),
    email: z.email().optional(),
    mobile_number: z.string().min(10).max(10).optional(),
    country_code: z.string().default(DEFAULT_COUNTRY_CODE),
    password: z.string().min(8).max(100).optional(),
  })
  .refine((data) => data.email || data.mobile_number, {
    message: "Either email or mobile_number must be provided",
    path: ["email"]
  })// Password complexity: 1 uppercase, 1 number, 1 special character
  // Password is required if email is provided
  .refine((data) => !data.email || (data.email && data.password), {
    message: "Password is required when email is provided",
    path: ["password"],
  })
  .refine(
    (data) => !data.password || /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(data.password),
    {
      message: "Password must contain at least one uppercase letter, one number, and one special character",
      path: ["password"],
    }
  );;
