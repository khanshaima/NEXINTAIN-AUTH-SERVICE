import { z } from "zod";
import { MESSAGES } from "../constants/messages.constants";

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
  refreshToken: z.string().min(1, MESSAGES.ERR_REFRESH_TOKEN_MISSING),
});

export const googleCallbackQuerySchema = z.object({
  code: z.string().min(1, MESSAGES.ERR_GOOGLE_CODE_MISSING),
});

export const setPasswordSchema = z.object({
  query: z.object({
    token: z.string().min(1, MESSAGES.ERR_TOKEN_MISSING),
  }),
  body: z.object({
    password: z.string().min(8, MESSAGES.ERR_PASSWORD_MISSING),
  }),
});