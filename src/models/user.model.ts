import { Schema, model, Document } from 'mongoose';
import { DEFAULT_COUNTRY_CODE } from '../constants/auth.constants';

export interface IUser extends Document {
  name?: string;
  email?: string;
  mobile_number?: string;
  country_code?: string;
  google_id?: string;
  password?: string;   // hashed
  refreshTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    mobile_number: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    google_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    country_code: {
      type: String,
      default: DEFAULT_COUNTRY_CODE
    },
    password: {
      type: String
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);