import joi from "joi";
import { generalValidationFields } from "../../common/validation.js";

//create activity schema
export const createActivitySchema = {
  body: joi
    .object()
    .keys({
      ownerId: generalValidationFields.id.required(),
      contactId: generalValidationFields.id.required(),
      dealId: generalValidationFields.id,
      type: generalValidationFields.type.required(),
      notes: generalValidationFields.notes,
      scheduledAt: generalValidationFields.scheduledAt,
      duration: generalValidationFields.duration,
      outcome: generalValidationFields.outcome.required(),
      outcomeNote: generalValidationFields.outcomeNote,
    })
    .required(),
};

//activities list schema
export const activitiesListSchema = {
  query: joi.object().keys({
    type: generalValidationFields.type,
    outcome: generalValidationFields.outcome,
  }),
};

//get activity by id schema
export const getActivityByIdSchema = {
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//get all activities of contact schema
export const getAllActivitiesOfContactSchema = {
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//get all activities of deal
export const getAllActivitiesOfDealSchema = {
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//update activity schema
export const updateActivitySchema = {
  body: joi
    .object()
    .keys({
      notes: generalValidationFields.notes.required(),
    })
    .required(),
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//delete activity schema
export const deleteActivitySchema = {
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};
