import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { KeyGeneratorEnum } from "../../common/enums/index.js";
import { redisStore } from "./rateLimit.store.middleware.js";
import { RedisKeys } from "../../common/services/index.js";

export const createLimiter = ({
  windowMs,
  limit,
  skipSuccessfulRequests = false,
  skipFailedRequests = false,
  keyGenerator = KeyGeneratorEnum.IP,
  store = redisStore(windowMs),
  legacyHeaders = true,
  requestPropertyName = "rateLimit",
} = {}) => {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator: (req) => {
      let key;
      switch (keyGenerator) {
        case KeyGeneratorEnum.User:
          key = RedisKeys.RateLimit.UserEndPointKey({
            userId: req.user._id,
            path: req.path,
          });
          break;

        default:
          const ip = ipKeyGenerator(req.ip, 56);
          key = RedisKeys.RateLimit.IPEndPointKey({ ip, path: req.path });
          break;
      }

      return key;
    },
    store,
    legacyHeaders,
    requestPropertyName,
    handler: (req, res, next) => {
      res.status(429).json({
        success: false,
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many API calls",
      });
    },
  });
};
