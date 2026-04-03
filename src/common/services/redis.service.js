import { redisClient } from "../../DB/index.js";
import { redisLogger } from "./logger.service.js";

//set
export const set = async ({ key, value, time }) => {
  try {
    let data = typeof value === "string" ? value : JSON.stringify(value);

    return time
      ? await redisClient.set(key, data, { EX: time })
      : await redisClient.set(key, data);
  } catch (error) {
    redisLogger.error("Redis SET failed", {
      message: error.message,
      stack: error.stack,
    });
  }
};

// get
export const get = async ({ key }) => {
  try {
    const value = await redisClient.get(key);
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  } catch (error) {
    redisLogger.error("Redis GET failed", {
      message: error.message,
      stack: error.stack,
    });
  }
};

// incr
export const incr = async ({ key }) => {
  try {
    return await redisClient.incr(key);
  } catch (error) {
    redisLogger.error("Redis INCR failed", {
      message: error.message,
      stack: error.stack,
    });
  }
};

// decr
export const decr = async ({ key }) => {
  try {
    return await redisClient.decr(key);
  } catch (error) {
    redisLogger.error("Redis DECR failed", {
      message: error.message,
      stack: error.stack,
    });
  }
};

// expire
export const expire = async ({ key, seconds }) => {
  try {
    return await redisClient.expire(key, seconds);
  } catch (error) {
    redisLogger.error("Redis EXPIRE failed", {
      message: error.message,
      stack: error.stack,
    });
  }
};

// exists
export const exists = async ({ keys = [] }) => {
  try {
    return await redisClient.exists(...keys);
  } catch (error) {
    redisLogger.error("Redis EXISTS failed", {
      message: error.message,
      stack: error.stack,
    });
  }
};

//del
export const del = async ({ keys = [] }) => {
  try {
    return await redisClient.del(keys);
  } catch (error) {
    redisLogger.error("Redis DEL failed", {
      message: error.message,
      stack: error.stack,
    });
  }
};

//keys
export const keys = async ({ pattern }) => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    redisLogger.error("Redis KEYS failed", {
      message: error.message,
      stack: error.stack,
    });
  }
};
