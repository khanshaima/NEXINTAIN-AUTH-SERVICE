export const OTP_EXPIRY_MINUTES = 10;
export const DEFAULT_COUNTRY_CODE = "+91";
export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY = "7d";
export const GENERATE_TOKEN_EXPIRY = "30m";

export const GOOGLE_ACCOUNT_BASE_URL= "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_SCOPE = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
  ].join(" ") ;