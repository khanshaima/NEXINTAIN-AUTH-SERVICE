import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { createUserSchema } from "../validators/user.validators";
import { signupUser } from "../services/signup.service";
import { DEFAULT_COUNTRY_CODE } from "../constants/auth.constants";

export const signupController = async (req: Request, res: Response) => {
  try {
    const { name, email, mobile_number, country_code, password } = req.body;

    // Validate input with Zod schema (optional fields handled)
    createUserSchema.parse({ name, email, mobile_number, country_code ,password});

    const user = await signupUser({ name, email, mobile_number, country_code: country_code || DEFAULT_COUNTRY_CODE, password });

    return res.status(201).json({
      success: true,
      message: `Signup successful for ${user?.name}`,
      user: { name: user?.name, email: user?.email, mobile_number: user?.mobile_number },
    });

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err?.issues });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};
