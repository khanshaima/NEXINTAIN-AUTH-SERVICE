import { Request, Response } from "express";
import { loginWithEmailSchema, sendOtpSchema, verifyOtpSchema, refreshSchema, googleCallbackQuerySchema, setPasswordSchema } from "../validators/auth.validators";
import { loginWithEmail, sendMobileOtp, verifyMobileOtp, refreshTokens, setPasswordService } from "../services/auth.service";
import { DEFAULT_COUNTRY_CODE, GOOGLE_ACCOUNT_BASE_URL, GOOGLE_SCOPE } from "../constants/auth.constants";
import { Tokens, GoogleUser } from "../types/auth.types";
import { OAuth2Client } from "google-auth-library";
import { ENV } from "../config/env";
import { googleLoginOrSignupWithGoogleData } from "../services/googleAuth.service";
import { google } from "googleapis";
import { handleControllerError } from "../utils/handleControllerError";
import { MESSAGES } from "../constants/messages.constants";

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
      message: MESSAGES.OTP_SENT,
      expiresAt
    });

  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};

export const verifyOtpController = async (req: Request, res: Response) => {
  try {
    const { country_code, mobile_number, otp  } = verifyOtpSchema.parse(req.body);

    const user = await verifyMobileOtp(country_code ?? DEFAULT_COUNTRY_CODE, mobile_number, otp);

    if (!user) {
      return res.status(400).json({ success: false, message: MESSAGES.OTP_INVALID });
    }

    return res.json({ success: true, message: `OTP verified, Welcome ${user.name??'New User, please sign up'}.` });

  } catch (error: unknown ) {
    return handleControllerError(res, error);
  }
};

export const loginWithEmailController = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginWithEmailSchema.parse(req.body);
    const { accessToken, refreshToken, name  } = await loginWithEmail(email, password);
    return res.json({
      success: true,
      message: MESSAGES.EMAIL_LOGIN_SUCCESS,
      data: { accessToken, refreshToken, name  } 
    });

  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};

export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);

    const tokens: Tokens = await refreshTokens(refreshToken);

    res.json({ success: true, ...tokens });
  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};

// Step 1: Redirect user to Google consent page
export const googleAuthUrlController = (req: Request, res: Response) => {
  try {
  const scope = GOOGLE_SCOPE;

  const url = `${GOOGLE_ACCOUNT_BASE_URL}?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.BACKEND_URL}/auth/google/callback&scope=${scope}&access_type=offline`;
    
  res.json({ success: true, message: MESSAGES.GOOGLE_LOGIN_URL_PROMPT, url });
  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};

export const googleAuthCallbackController = async (req: Request, res: Response) => {
  try {
   const { code } = googleCallbackQuerySchema.parse(req.query);

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
  } catch (error: unknown) {
    return handleControllerError(res, error);
  }
};

export const setPasswordController = async (req: Request, res: Response) => {
  try {
    const parsed = setPasswordSchema.parse({
      query: req.query,
      body: req.body,
    });

    const { token } = parsed.query;
    const { password } = parsed.body;

    await setPasswordService(token, password);
    return res.json({success: true, message: MESSAGES.PASSWORD_SET_SUCCESS});
  } catch (error) {
    return handleControllerError(res, error);
  }
};