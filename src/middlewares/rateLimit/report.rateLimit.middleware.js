import { KeyGeneratorEnum } from "../../common/enums/keyGenerator.enums.js";
import { createLimiter } from "./rateLimit.factory.middleware.js";

//get total deal values per stage limiter
export const getTotalDealValuesPerStageLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: KeyGeneratorEnum.User,
});

//get won deals per sales rep limiter
export const getWonDealsPerSalesRepLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: KeyGeneratorEnum.User,
});

//get contacts growth limiter
export const getContactsGrowthLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: KeyGeneratorEnum.User,
});

//lead to customer conversion limiter
export const leadToCustomerConversionLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: KeyGeneratorEnum.User,
});

//count of overdue tasks by rep limiter
export const countOfOverdueTasksByRepLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: KeyGeneratorEnum.User,
});
