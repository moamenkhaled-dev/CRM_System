import { KeyGeneratorEnum } from "../../common/enums/keyGenerator.enums.js";
import { createLimiter } from "./rateLimit.factory.middleware.js";

//create activity limiter
export const createActivityLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 40,
  keyGenerator: KeyGeneratorEnum.User,
});

//activities list
export const activitiesListLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: KeyGeneratorEnum.User,
});

//get activity by id limiter
export const getActivityByIdLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 80,
  keyGenerator: KeyGeneratorEnum.User,
});

//get all activities of contact limiter
export const getAllActivitiesOfContactLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 50,
  keyGenerator: KeyGeneratorEnum.User,
});

//get all activities of deal limiter
export const getAllActivitiesOfDealLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 50,
  keyGenerator: KeyGeneratorEnum.User,
});

//update activity limiter
export const updateActivityLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 40,
  keyGenerator: KeyGeneratorEnum.User,
});

//delete activity limiter
export const deleteActivityLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: KeyGeneratorEnum.User,
});
