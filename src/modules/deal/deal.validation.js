import joi from "joi";
import { generalValidationFields } from "../../common/validation.js";
import { DealStageEnum } from "../../common/enums/deal.enums.js";

//create deal
export const createDealSchema = {
  body: joi
    .object()
    .keys({
      title: generalValidationFields.title.required(),
      contactId: generalValidationFields.id.required(),
      ownerId: generalValidationFields.id,
      stage: generalValidationFields.stage.required(),
      value: generalValidationFields.value,
      currency: generalValidationFields.currency,
      expectedCloseDate: generalValidationFields.expectedCloseDate,
      probability: generalValidationFields.probability,
      lostReason: generalValidationFields.lostReason,
      description: generalValidationFields.description,
    })
    .required(),
};

//get deal by id schema
export const getDealByIdSchema = {
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//deals list schema
export const dealsListSchema = {
  params: joi
    .object()
    .keys({
      page: generalValidationFields.page,
      limit: generalValidationFields.limit,
      search: generalValidationFields.key,
    })
    .required(),
};

//update deal schema
export const updateDealSchema = {
  body: joi
    .object()
    .keys({
      title: generalValidationFields.title,
      stage: generalValidationFields.stage,
      value: generalValidationFields.value,
      currency: generalValidationFields.currencyUpdate,
      expectedCloseDate: generalValidationFields.expectedCloseDate,
      probability: generalValidationFields.probability,
      lostReason: generalValidationFields.lostReason,
      description: generalValidationFields.description,
    })
    .min(1)
    .required(),
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//delete deal schema
export const deleteDealSchema = {
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};
