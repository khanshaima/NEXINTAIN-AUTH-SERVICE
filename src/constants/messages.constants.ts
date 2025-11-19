export const MESSAGES = {
  OTP_SENT: "OTP sent successfully",
  OTP_INVALID: "Invalid OTP",

  EMAIL_LOGIN_SUCCESS: "Email login successful",

  GOOGLE_LOGIN_URL_PROMPT: "Please verify using the url",

  PASSWORD_SET_SUCCESS: "Password set successfully",

  ERR_GOOGLE_CODE_MISSING: "Google auth code missing",
  ERR_TOKEN_MISSING: "Token required",
  ERR_PASSWORD_MISSING: "Password required",
  ERR_INVALID_OR_EXPIRED_TOKEN: "Invalid or expired token",
  ERR_WRONG_TOKEN_TYPE: "Wrong token type",
  ERR_USER_NOT_FOUND: "User not found",
  ERR_REFRESH_TOKEN_MISSING: "Refresh token is required",
  SERVER_ERROR: "Server error"
} as const;
