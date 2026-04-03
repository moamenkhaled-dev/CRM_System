import { KeyGeneratorEnum } from "../../common/enums/keyGenerator.enums.js";
import { createLimiter } from "./rateLimit.factory.middleware.js";

//create task limiter
export const createTaskLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 40,
  keyGenerator: KeyGeneratorEnum.User,
});

//tasks list limiter
export const tasksListLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: KeyGeneratorEnum.User,
});

//over due tasks limiter
export const overDueTasksLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 30,
  keyGenerator: KeyGeneratorEnum.User,
});

//get task by id limiter
export const getTaskByIdLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 60,
  keyGenerator: KeyGeneratorEnum.User,
});

//delete task limiter
export const deleteTaskLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 10,
  keyGenerator: KeyGeneratorEnum.User,
});

//update task limiter
export const updateTaskLimiter = createLimiter({
  windowMs: 60 * 1000,
  limit: 40,
  keyGenerator: KeyGeneratorEnum.User,
});
