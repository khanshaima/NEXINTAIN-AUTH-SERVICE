export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleUser {
  email: string;
  name: string;
  google_id: string;
}

export interface SignupData {
  name?: string;
  email?: string;
  mobile_number?: string;
  country_code?: string;
  password?: string;
}

export interface DecodedToken {
  email: string;
  purpose: string;
  iat?: number;
  exp?: number;
}