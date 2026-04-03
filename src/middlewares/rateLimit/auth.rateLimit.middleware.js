import { KeyGeneratorEnum } from "../../common/enums/keyGenerator.enums.js";
import { createLimiter } from "./rateLimit.factory.middleware.js";

//register limiter
export const registerLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  keyGenerator: KeyGeneratorEnum.User,
});

//login limiter
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
});

//profile limiter
export const profileLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: KeyGeneratorEnum.User,
});

//logout limiter
export const logoutLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: KeyGeneratorEnum.User,
});

//update password limiter
export const updatePasswordLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 5,
  keyGenerator: KeyGeneratorEnum.User,
});
