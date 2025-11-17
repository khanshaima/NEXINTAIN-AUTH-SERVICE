import { Schema, model, Document } from 'mongoose';
import { DEFAULT_COUNTRY_CODE } from '../constants/auth.constants';

export interface IOtp extends Document {
  mobile_number: string;
  country_code: string;
  otp: string;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    mobile_number: { type: String, required: true },
    country_code: { type: String, required: true, default: DEFAULT_COUNTRY_CODE },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Otp = model<IOtp>('Otp', otpSchema);