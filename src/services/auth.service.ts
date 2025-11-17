import { Otp } from "../models/otp.model";
import { generateOtp } from "../utils/otp";
import { User } from "../models/user.model";
import bcrypt from "bcrypt";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { OTP_EXPIRY_MINUTES } from "../constants/auth.constants";
import { Tokens } from "../types/auth.types";

export async function sendMobileOtp(country_code: string, mobile_number: string) {
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await Otp.findOneAndUpdate(
    { mobile_number, country_code },
    { otp, expiresAt },
    { upsert: true, new: true }
  );
  console.log(`OTP: ${otp}, for ${country_code}${mobile_number} will expire at: ${expiresAt.toISOString()}`);
  return { otp, expiresAt };
}

export async function verifyMobileOtp(country_code: string, mobile_number: string, otp: string) {
  const record = await Otp.findOne({ mobile_number, country_code });

  if (!record) return false;

  if (record.otp !== otp) return false;

  if (record.expiresAt < new Date()) return false;
  // OTP is valid → now check for existing user
  let user = await User.findOne({ mobile_number });

  if (!user) {
    // create new user if not found
    user = await User.create({
      mobile_number
    });
  }

  return user;
}

export const loginWithEmail = async (email: string, password: string) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (!user.password) throw new Error("Password not set for this user");

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


export const refreshTokens = async (oldRefreshToken: string): Promise<Tokens> => {
  const payload = verifyRefreshToken(oldRefreshToken);
  if(!payload || typeof payload === 'string') 
    throw new Error("Invalid refresh token payload");

  const user = await User.findById(payload?.userId);
  if (!user) throw new Error("User not found");
  if (!user.refreshTokens?.includes(oldRefreshToken)) throw new Error("Refresh token invalid");

  const newAccessToken = signAccessToken(user?._id!.toString());
  const newRefreshToken = signRefreshToken(user._id!.toString());

  // Replace old refresh token
  user.refreshTokens = user.refreshTokens.filter((t) => t !== oldRefreshToken);
  user.refreshTokens.push(newRefreshToken);
  await user.save();

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};