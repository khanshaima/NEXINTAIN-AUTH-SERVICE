import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
} from "../constants/auth.constants";
import { ENV } from "../config/env";

const ACCESS_SECRET = ENV.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = ENV.JWT_REFRESH_SECRET!;

export const signAccessToken = (userId: string) =>{
  return jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

export const signRefreshToken = (userId: string) =>{
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET);
};
