import { z } from "zod";

export const sendOtpSchema = z.object({
  country_code: z.string().min(1).max(4).optional(),
  mobile_number: z.string().min(10).max(10)
});

export const verifyOtpSchema = z.object({
  country_code: z.string().min(1).max(4).optional(),
  mobile_number: z.string().min(10).max(10),
  otp: z.string().min(4).max(6)
});

export const loginWithEmailSchema = z.object({
  email: z.email(),
  password: z.string()
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const googleCallbackQuerySchema = z.object({
  code: z.string().min(1, "Google auth code is required"),
});

export const setPasswordSchema = z.object({
  query: z.object({
    token: z.string().min(1, "Token required"),
  }),
  body: z.object({
    password: z.string().min(8, "Password required"),
  }),
});