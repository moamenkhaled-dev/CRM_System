import {
  decr,
  exists,
  expire,
  incr,
  redisLogger,
} from "../../common/services/index.js";

export const redisStore = (windowMs) => {
  return {
    async incr(key, cb) {
      try {
        const count = await incr({ key });
        if (count == 1) {
          await expire({ key, seconds: windowMs / 1000 });
        }
        cb(null, count, new Date(Date.now() + windowMs));
      } catch (error) {
        redisLogger.error(`Fail in redis store`, {
          message: error.message,
          stack: error.stack,
        });
      }
    },
    async decrement(key) {
      try {
        if (await exists({ keys: [key] })) {
          await decr({ key });
        }
      } catch (error) {
        redisLogger.error("Fail in decrement", {
          message: error.message,
        });
      }
    },
  };
};
