import { KeyGeneratorEnum } from "../../common/enums/keyGenerator.enums.js";
import { createLimiter } from "./rateLimit.factory.middleware.js";

//create deal limiter
export const createDealLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: KeyGeneratorEnum.User,
});

//get deal by id limiter
export const getDealByIdLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 80,
  keyGenerator: KeyGeneratorEnum.User,
});

//deals list limiter
export const dealsListLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: KeyGeneratorEnum.User,
});

//update deal limiter
export const updateDealLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 40,
  keyGenerator: KeyGeneratorEnum.User,
});

//delete deal limiter
export const deleteDealLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: KeyGeneratorEnum.User,
});

//get deals grouped by stage limiter
export const getDealsGroupedByStageLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: KeyGeneratorEnum.User,
});
