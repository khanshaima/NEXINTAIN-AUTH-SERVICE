import { OAuth2Client } from "google-auth-library";
import { User, IUser } from "../models/user.model";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { Tokens, GoogleUser } from "../types/auth.types";

// Create or login user
export const googleLoginOrSignupWithGoogleData = async (userData: GoogleUser): Promise<{ user: IUser; tokens: Tokens }> => {
  let user = await User.findOne({ $or: [{ email: userData.email }, { google_id: userData.google_id }] });

  if (!user) {
    user = await User.create(userData);
  }

  const accessToken = signAccessToken(user?._id!.toString());
  const refreshToken = signRefreshToken(user?._id!.toString());

  user.refreshTokens = user?.refreshTokens??[];
  user?.refreshTokens?.push(refreshToken);
  await user.save();

  return { user, tokens: { accessToken, refreshToken } };
};
