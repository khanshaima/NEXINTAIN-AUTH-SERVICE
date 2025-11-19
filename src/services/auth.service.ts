import { Otp } from "../models/otp.model";
import { generateOtp } from "../utils/otp";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import {
  generateSetPasswordToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { OTP_EXPIRY_MINUTES } from "../constants/auth.constants";
import { DecodedToken, Tokens } from "../types/auth.types";
import { ENV } from "../config/env";
import jwt from 'jsonwebtoken';
import { MESSAGES } from "../constants/messages.constants";

export async function sendMobileOtp(
  country_code: string,
  mobile_number: string
) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await Otp.findOneAndUpdate(
    { mobile_number, country_code },
    { otp, expiresAt },
    { upsert: true, new: true }
  );
  console.log(
    `OTP: ${otp}, for ${country_code}${mobile_number} will expire at: ${expiresAt.toISOString()}`
  );
  return { otp, expiresAt };
}

export async function verifyMobileOtp(
  country_code: string,
  mobile_number: string,
  otp: string
) {
  const record = await Otp.findOne({ mobile_number, country_code });

  if (!record) return false;

  if (record.otp !== otp) return false;

  if (record.expiresAt < new Date()) return false;
  // OTP is valid → now check for existing user
  let user = await User.findOne({ mobile_number });

  if (!user) {
    // create new user if not found
    user = await User.create({
      mobile_number,
    });
  }

  return user;
}

export const loginWithEmail = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  console.log("User found for email login:", user);
  if (!user || !user?.email) throw new Error(MESSAGES.ERR_USER_NOT_FOUND);

  if (!user.password)
    throw new Error(
      `Set a 'password' to enable email login using the url: ${
        ENV.BACKEND_URL
      }/auth/set-password?token=${generateSetPasswordToken({
        email: user.email,
      })}`
    );

  const isValid = await bcrypt.compare(password, user?.password);
  if (!isValid) throw new Error("Invalid password");

  // Generate JWT tokens
  const accessToken = signAccessToken(user?._id!.toString());
  const refreshToken = signRefreshToken(user?._id!.toString());

  // Save refresh token
  user.refreshTokens = [...(user.refreshTokens || []), refreshToken];
  await user.save();

  return { accessToken, refreshToken, name: user?.name };
};

export const refreshTokens = async (
  oldRefreshToken: string
): Promise<Tokens> => {
  const payload = verifyRefreshToken(oldRefreshToken);
  if (!payload || typeof payload === "string")
    throw new Error("Invalid refresh token payload");

  const user = await User.findById(payload?.userId);
  if (!user) throw new Error(MESSAGES.ERR_USER_NOT_FOUND);
  if (!user.refreshTokens?.includes(oldRefreshToken))
    throw new Error("Refresh token invalid");

  const newAccessToken = signAccessToken(user?._id!.toString());
  const newRefreshToken = signRefreshToken(user._id!.toString());

  // Replace old refresh token
  user.refreshTokens = user.refreshTokens.filter((t) => t !== oldRefreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const setPasswordService = async (token: string, password: string) => {
  // 1. Verify token
  let decoded: DecodedToken;
  try {
    decoded = jwt.verify(token, ENV.JWT_ACCESS_SECRET) as DecodedToken;
  } catch (err) {
    throw new Error(MESSAGES.ERR_INVALID_OR_EXPIRED_TOKEN);
  }

  // 2. Ensure correct token purpose
  if (decoded.purpose !== "set_password") {
    throw new Error(MESSAGES.ERR_WRONG_TOKEN_TYPE);
  }

  // 3. Fetch user
  const user = await User.findOne({ email: decoded.email });
  if (!user) {
    throw new Error(MESSAGES.ERR_USER_NOT_FOUND);
  }

  // 4. Hash and save password
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;

  await user.save();
};