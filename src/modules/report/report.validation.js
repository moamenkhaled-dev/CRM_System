import joi from "joi";
import { generalValidationFields } from "../../common/validation.js";

//get total deal values per stage schema
export const getTotalDealValuesPerStageSchema = {
  query: joi
    .object()
    .keys({
      startDate: generalValidationFields.date.required(),
      endDate: generalValidationFields.date.required(),
    })
    .required(),
};

//get won deals per sales rep schema
export const getWonDealsPerSalesRepSchema = {
  query: joi
    .object()
    .keys({
      startDate: generalValidationFields.date.required(),
      endDate: generalValidationFields.date.required(),
    })
    .required(),
};

//get contacts growth schema
export const getContactsGrowthSchema = {
  query: joi
    .object()
    .keys({
      startDate: generalValidationFields.date.required(),
      endDate: generalValidationFields.date.required(),
    })
    .required(),
};

//lead to customer conversion schema
export const leadToCustomerConversionSchema = {
  query: joi
    .object()
    .keys({
      startDate: generalValidationFields.date.required(),
      endDate: generalValidationFields.date.required(),
    })
    .required(),
};

//count of overdue tasks by rep schema
export const countOfOverdueTasksByRepSchema = {
  query: joi
    .object()
    .keys({
      startDate: generalValidationFields.date.required(),
      endDate: generalValidationFields.date.required(),
    })
    .required(),
};
