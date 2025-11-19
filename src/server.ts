import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app';
import { ENV } from "./config/env";

dotenv.config();

const PORT = ENV.PORT || 4000;
const MONGO_URI = ENV.MONGO_URI || '';

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

start();
