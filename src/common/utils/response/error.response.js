import { NODE_ENV } from "../../../../config/config.service.js";
import { appLogger } from "../../services/logger.service.js";

//global error handler
export const GlobalErrorHandler = (error, req, res, next) => {
  const status = error.cause?.status || 500;
  const message =
    NODE_ENV === "production" && status === 500
      ? "internal server error"
      : error.message;
  const code = error.cause?.code;
  const details = error.cause?.details;
  const stack = NODE_ENV === "development" ? error.stack : {};
  const extra = NODE_ENV === "development" ? error.cause?.extra : {};

  appLogger.error(`Error Exception`, { status, message, stack, extra });
  res.status(status).json({
    success: false,
    error: {
      code: code || "SERVER_ERROR",
      message,
      details,
    },
  });
};

//Error Exception
export const ErrorException = ({ message = "fail", cause = undefined }) => {
  throw new Error(message, { cause });
};

//Un Authorized exception
export const UnAuthorizedException = ({
  status = 401,
  message = "UnAuthorized action",
  code,
  details,
  extra = {},
} = {}) => {
  return ErrorException({
    message,
    cause: { status, code, details, extra },
  });
};

//Not Found Exception
export const NotFoundException = ({
  status = 404,
  message = "not found",
  code,
  details,
  extra = {},
} = {}) => {
  return ErrorException({
    message,
    cause: { status, code, details, extra },
  });
};

//Bad Request Exception
export const BadRequestException = ({
  status = 400,
  message = "bad request",
  code,
  details,
  extra,
} = {}) => {
  return ErrorException({ message, cause: { status, code, details, extra } });
};

//Conflict Exception
export const ConflictException = ({
  status = 409,
  message = "conflict",
  code,
  details,
  extra = {},
} = {}) => {
  return ErrorException({ message, cause: { status, code, details, extra } });
};
