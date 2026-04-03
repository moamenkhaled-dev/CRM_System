import { createClient } from "redis";

import { REDIS_URI } from "../../config/config.service.js";
import { redisLogger } from "../common/services/index.js";

export const redisClient = createClient({ url: REDIS_URI });

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log(`REDIS_DB Connected Successfully`);
  } catch (error) {
    console.log(`REDIS_DB connection Failed`);
    redisLogger.error(`Fail To Connect With Redis`, {
      message: error.message,
      stack: error.stack,
    });
  }
};
