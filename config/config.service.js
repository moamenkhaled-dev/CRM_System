import { config } from "dotenv";
import ms from "ms";
import { resolve } from "node:path";

export const NODE_ENV = process.env.NODE_ENV;
const envFile = {
  development: ".env.dev",
  production: ".env.prod",
};
config({ path: resolve(`./config/${envFile[NODE_ENV]}`) });

//App
export const PORT = parseInt(process.env.PORT);
export const APPLICATION_NAME = process.env.APPLICATION_NAME;

//DB
export const DB_URI = process.env.DB_URI;
export const REDIS_URI = process.env.REDIS_URI;

//Security
export const SALT_ROUND = parseInt(process.env.SALT_ROUND);
export const JWT_SECRET = process.env.JWT_SECRET;
export const EXPIRES_IN = process.env.EXPIRES_IN;
export const EXPIRES_IN_SECONDS = ms(EXPIRES_IN) / 100;
