import { createLogger, format, transports } from "winston";

import { NODE_ENV } from "../../../config/config.service.js";

//logs filter
const filterBy = (key, value) => {
  return format((info) => {
    if (info[key] == value) return info;
    return false;
  })();
};

const logger = createLogger({
  level: NODE_ENV === "production" ? "info" : "debug",
  defaultMeta: { environment: NODE_ENV },
  format: format.combine(
    format.timestamp({ format: `YYYY-MM-DD HH:mm:ss` }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
    format.prettyPrint(),
  ),
  exitOnError: false,
  transports: [
    //app error file
    new transports.File({
      dirname: "logs",
      filename: "error.log",
      level: "error",
      format: format.combine(
        filterBy("module", "app"),
        // format.json(),
        format.prettyPrint(),
      ),
    }),
    //redis error file
    new transports.File({
      dirname: "logs",
      filename: "redis-error.log",
      level: "error",
      format: format.combine(
        filterBy("module", "redis"),
        // format.json(),
        format.prettyPrint(),
      ),
    }),
    //app file
    new transports.File({
      dirname: "logs",
      filename: "app.log",
      level: NODE_ENV === "production" ? "info" : "debug",
      format: format.combine(
        filterBy("module", "app"),
        // format.json(),
        format.prettyPrint(),
      ),
    }),
  ],
});

//export loggers
export const appLogger = logger.child({ module: "app" });
export const redisLogger = logger.child({ module: "redis" });
