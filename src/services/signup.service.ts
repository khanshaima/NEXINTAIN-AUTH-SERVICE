import bcrypt from "bcrypt";
import { User } from "../models/user.model";
import { DEFAULT_COUNTRY_CODE } from "../constants/auth.constants";
import { SignupData } from "../types/auth.types";

export const signupUser = async (data: SignupData) => {
  const { name, email, mobile_number, country_code, password } = data;

  // Check if user already exists by email or mobile+code
    const existingUser = await User.findOne({
      $or: [
        { email },
        { mobile_number, country_code: country_code ?? DEFAULT_COUNTRY_CODE },
        { mobile_number: mobile_number}
      ]
    });
    //since email signup happens before login check if email already present, since mobile signup happend after login, check if signup completed basis name present or not
    if (existingUser && ((email && existingUser?.email) || (existingUser?.mobile_number && existingUser?.name))) {
    throw new Error("User already exists with provided email or mobile number");
  }

// Hash password if provided
  let hashedPassword: string | undefined;
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  if (!existingUser) {
    // Create new user
    const newUser = await User.create({
      name,
      email,
      mobile_number,
      country_code: country_code ?? DEFAULT_COUNTRY_CODE,
      password: hashedPassword,
    });
    return newUser;
  }

  /// Update existing user (from OTP login) with new fields
    const updatedFields: any = {};
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (mobile_number) updatedFields.mobile_number = mobile_number;
    if (country_code) updatedFields.country_code = country_code ?? DEFAULT_COUNTRY_CODE;
    if (hashedPassword) updatedFields.password = hashedPassword;

    const updatedUser = await User.findByIdAndUpdate(existingUser._id, { $set: updatedFields }, { new: true, runValidators: true });

  return updatedUser;
};
