import joi from "joi";
import { generalValidationFields } from "../../common/validation.js";

//create contact
export const createContactSchema = {
  body: joi
    .object()
    .keys({
      firstName: generalValidationFields.name.required(),
      lastName: generalValidationFields.name.required(),
      email: generalValidationFields.email.required(),
      phone: generalValidationFields.phone,
      countryCode: generalValidationFields.countryCode,
      company: generalValidationFields.company,
      jobTitle: generalValidationFields.jobTitle,
      status: generalValidationFields.status.required(),
      source: generalValidationFields.source,
      notes: generalValidationFields.notes,
    })
    .required(),
};

//contact list
export const contactsListSchema = {
  query: joi
    .object()
    .keys({
      page: generalValidationFields.page,
      limit: generalValidationFields.limit,
      status: generalValidationFields.status,
      search: generalValidationFields.key,
    })
    .required(),
};

//get contact by id
export const getContactByIdSchema = {
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//update contact
export const updateContactSchema = {
  body: joi
    .object()
    .keys({
      firstName: generalValidationFields.name,
      lastName: generalValidationFields.name,
      email: generalValidationFields.email,
      phone: generalValidationFields.phone,
      countryCode: generalValidationFields.countryCode,
      company: generalValidationFields.company,
      jobTitle: generalValidationFields.jobTitle,
      status: generalValidationFields.statusNoDefault,
      source: generalValidationFields.source,
      notes: generalValidationFields.notes,
    })
    .or(
      "firstName",
      "lastName",
      "email",
      "phone",
      "countryCode",
      "company",
      "jobTitle",
      "status",
      "source",
      "notes",
    )
    // .unknown(false)
    .required(),
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//delete contact
export const deleteContactSchema = {
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//contact search schema
export const contactSearchSchema = {
  query: joi
    .object()
    .keys({
      key: generalValidationFields.key.required(),
    })
    .required(),
};
