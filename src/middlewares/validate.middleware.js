import { BadRequestException } from "../common/utils/response/error.response.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const keys = Object.keys(schema);
    const errors = [];
    for (const key of keys) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
        // stripUnknown: false,
        convert: false,
      });
      if (validationResult.error) {
        errors.push({
          key,
          details: validationResult.error.details?.map((d) => {
            return { message: d.message, path: d.path };
          }),
        });
      } else {
        Object.assign(req[key], validationResult.value);
      }
    }
    if (errors.length > 0) {
      return BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: errors,
      });
    }

    next();
  };
};
