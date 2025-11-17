import rateLimit from "express-rate-limit";

export const createRateLimiter = (
  maxRequests: number,
  windowMinutes: number,
  message?: string
) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      success: false,
      message: message || "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });


export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,                 // max 100 requests per IP per window
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,    // RateLimit headers
  legacyHeaders: false,     // Disable X-RateLimit-* headers
});