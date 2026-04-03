import mongoose from "mongoose";

import { DB_URI } from "../../config/config.service.js";
import { appLogger } from "../common/services/index.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log(`DataBase Connected Successfully`);
  } catch (error) {
    console.log(`DataBase Connection Failed`);
    appLogger.error(`mongoDB connection Failed`, {
      message: error.message,
      stack: error.stack,
    });
  }
};
