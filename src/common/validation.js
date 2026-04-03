import joi from "joi";
import { Types } from "mongoose";

import {
  RoleEnum,
  ContactSourceEnum,
  ContactStatusEnum,
  DealStageEnum,
  ActivityTypeEnum,
  ActivityOutComeEnum,
  TaskPriorityEnum,
} from "./enums/index.js";

export const generalValidationFields = {
  id: joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value)
      ? value
      : helper.message(
          "Invalid ID format. Please provide a valid MongoDB ObjectId",
        );
  }),
  name: joi.string().max(150).trim(),
  email: joi.string().email(),
  password: joi
    .string()
    .pattern(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
    .message(
      "Password must be at least 8 characters long, contain at least one uppercase letter and one number",
    ),
  confirmPassword: (matchPath) => {
    return joi.string().valid(joi.ref(matchPath)).when(matchPath, {
      is: joi.exist(),
      then: joi.required(),
      otherwise: joi.optional(),
    });
  },
  role: joi
    .string()
    .valid(...Object.values(RoleEnum))
    .default(RoleEnum.Sales_Rep),
  phone: joi.string(),
  countryCode: joi.string().length(2).uppercase().when("phone", {
    is: joi.exist(),
    then: joi.required(),
    otherwise: joi.optional(),
  }),
  company: joi.string(),
  jobTitle: joi.string(),
  status: joi
    .string()
    .valid(...Object.values(ContactStatusEnum))
    .default(ContactStatusEnum.Lead),
  statusNoDefault: joi.string().valid(...Object.values(ContactStatusEnum)),
  source: joi.string().valid(...Object.values(ContactSourceEnum)),
  page: joi.string().custom((value, helper) => {
    if (isNaN(value)) {
      return helper.message("please page must be number");
    }
  }),
  limit: joi.string().default(5),
  key: joi.string().max(150),
  title: joi.string().max(200),
  stage: joi.string().valid(...Object.values(DealStageEnum)),
  value: joi.number().positive(),
  currency: joi.string().uppercase().length(3).default("USD"),
  currencyUpdate: joi.string().uppercase().length(3),
  expectedCloseDate: joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
  probability: joi.number().positive().max(100),
  lostReason: joi
    .string()
    .max(4000)
    .when("stage", {
      is: joi.equal(DealStageEnum.Lost),
      then: joi.required(),
      otherwise: joi.optional(),
    }),
  description: joi.string().max(1000),
  type: joi.string().valid(...Object.values(ActivityTypeEnum)),
  notes: joi.string().max(2000),
  scheduledAt: joi
    .date()
    .strict(false)
    .greater(new Date())
    .when("type", {
      is: joi.valid(ActivityTypeEnum.Call, ActivityTypeEnum.Meeting),
      then: joi.required(),
      otherwise: joi.optional(),
    }),
  duration: joi
    .number()
    .positive()
    .when("type", {
      is: joi.valid(ActivityTypeEnum.Call, ActivityTypeEnum.Meeting),
      then: joi.required(),
      otherwise: joi.optional(),
    }),
  outcome: joi.string().valid(...Object.values(ActivityOutComeEnum)),
  outcomeNote: joi.string().max(2000),
  taskTitle: joi.string().max(255),
  dueDate: joi.date().iso().greater(new Date()).strict(false),
  priority: joi.string().valid(...Object.values(TaskPriorityEnum)),
  isCompleted: joi.boolean().strict(false),
  completedAt: joi
    .date()
    .iso()
    .greater(new Date())
    .strict(false)
    .when("isCompleted", {
      is: true,
      then: joi.required(),
      otherwise: joi.optional(),
    }),
  date: joi.date().strict(false),
};
