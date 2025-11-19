import { Response } from "express";
import { ZodError } from "zod";

export const handleControllerError = (res: Response, error: unknown) => {
  console.error("Controller Error:", error);

  // Zod validation error
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      errors: error.issues,
    });
  }

  // Generic Error object
  if (error instanceof Error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  // Unknown non-error thrown
  return res.status(400).json({
    success: false,
    error: "Something went wrong",
  });
};
