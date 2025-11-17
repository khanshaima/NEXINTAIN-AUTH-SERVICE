import { Request, Response } from "express";
import { loginWithEmailSchema, sendOtpSchema, verifyOtpSchema, refreshSchema } from "../validators/auth.validators";
import { loginWithEmail, sendMobileOtp, verifyMobileOtp, refreshTokens } from "../services/auth.service";
import { DEFAULT_COUNTRY_CODE } from "../constants/auth.constants";
import { z } from "zod";
import { Tokens, GoogleUser } from "../types/auth.types";
import { OAuth2Client } from "google-auth-library";
import { ENV } from "../config/env";
import { googleLoginOrSignupWithGoogleData } from "../services/googleAuth.service";
import { google } from "googleapis";

const client = new OAuth2Client(
  ENV.GOOGLE_CLIENT_ID,
  ENV.GOOGLE_CLIENT_SECRET,
  `${ENV.BACKEND_URL}/auth/google/callback`
);

export const sendOtpController = async (req: Request, res: Response) => {
  try {
    const { country_code, mobile_number } = sendOtpSchema.parse(req.body);
    const { otp, expiresAt } = await sendMobileOtp(country_code ?? DEFAULT_COUNTRY_CODE, mobile_number);
    console.log(`Sent OTP: ${otp} to mobile: ${country_code??DEFAULT_COUNTRY_CODE}${mobile_number}`);
    return res.json({
      success: true,
      message: "OTP sent successfully",
      expiresAt
    });

  } catch (error) {
    console.error("Error in sendOtpController:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error?.issues });
    }
    return res.status(400).json({ success: false, error });
  }
};

export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { country_code, mobile_number, otp  } = verifyOtpSchema.parse(req.body);

    const user = await verifyMobileOtp(country_code ?? DEFAULT_COUNTRY_CODE, mobile_number, otp);

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    return res.json({ success: true, message: `OTP verified, Welcome ${user.name??'New User, please sign up'}.` });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error?.issues });
    }
    return res.status(400).json({ success: false, error });
  }
};

export const loginWithEmailController = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginWithEmailSchema.parse(req.body);
    const { accessToken, refreshToken, name  } = await loginWithEmail(email, password);
    return res.json({
      success: true,
      message: "Email login successful",
      data: { accessToken, refreshToken, name  } 
    });

  } catch (error) {
    console.error("Error in loginWithEmailController:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error?.issues });
    }
    return res.status(400).json({ success: false, error });
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);

    const tokens: Tokens = await refreshTokens(refreshToken);

    res.json({ success: true, ...tokens });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: err?.issues });
    }
    return res.status(401).json({ success: false, message: err.message });
  }
};

// Step 1: Redirect user to Google consent page
export const googleAuthUrlController = (req: Request, res: Response) => {
    const scope = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ].join(" ") ;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.BACKEND_URL}/auth/google/callback&scope=${scope}&access_type=offline`;

  res.json({ success: true, message:"Please verify using the url",url });
};

export const googleAuthCallbackController = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) throw new Error("Google auth code missing");

    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: client, version: "v2" });
    const { data } = await oauth2.userinfo.get();

    const googleUser: GoogleUser = {
      email: data.email!,
      name: data.name!,
      google_id: data.id!,
    };
    const result = await googleLoginOrSignupWithGoogleData(googleUser);

    res.json({
      success: true,
      user: { id: result.user._id, email: result.user.email, name: result.user.name },
      googleUser,
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};