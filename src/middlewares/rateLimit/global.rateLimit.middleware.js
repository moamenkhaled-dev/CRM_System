import geoip from "geoip-lite";

import { createLimiter } from "./rateLimit.factory.middleware.js";
import { appLogger } from "../../common/services/logger.service.js";

export const globalLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: (req) => {
    const response = geoip.lookup(req.ip);
    if (!response) {
      appLogger.info(`someone try to access website with unknown IP`, {
        method: req.method,
        path: req.path,
        statusCode: req.statusCode,
        ip: req.ip,
      });
      return 0;
    }
    return 100;
  },
});
