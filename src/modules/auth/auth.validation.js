import joi from "joi";
import { generalValidationFields } from "../../common/validation.js";

//login schema
export const loginSchema = {
  body: joi
    .object()
    .keys({
      email: generalValidationFields.email.required(),
      password: generalValidationFields.password.required(),
    })
    .required(),
};

//register schema
export const registerSchema = {
  body: loginSchema.body
    .append({
      name: generalValidationFields.name.required(),
      role: generalValidationFields.role,
    })
    .required(),
};

//update password schema
export const updatePasswordSchema = {
  body: joi
    .object()
    .keys({
      password: generalValidationFields.password.required(),
      oldPassword: generalValidationFields.password.required(),
      confirmPassword: generalValidationFields.confirmPassword("password"),
    })
    .required(),
};
