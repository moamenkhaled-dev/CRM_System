import { KeyGeneratorEnum } from "../../common/enums/index.js";
import { createLimiter } from "./rateLimit.factory.middleware.js";

//create contact
export const createContactLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: KeyGeneratorEnum.User,
});

//contact list limiter
export const contactsListLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: KeyGeneratorEnum.User,
});

//get contact by id limiter
export const getContactByIdLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 80,
  keyGenerator: KeyGeneratorEnum.User,
});

//update contact
export const updateContactSchema = createLimiter({
  windowMs: 60 * 1000,
  limit: 40,
  keyGenerator: KeyGeneratorEnum.User,
});

//delete contact limiter
export const deleteContactLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: KeyGeneratorEnum.User,
});

//contact search limiter
export const contactSearchLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 40,
  keyGenerator: KeyGeneratorEnum.User,
});
