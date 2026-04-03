import {
  BadRequestException,
  UnAuthorizedException,
} from "../common/utils/response/error.response.js";
import { decodeToken } from "../common/utils/security/index.js";

//authentication
export const authentication = () => {
  return async (req, res, next) => {
    if (!req.headers?.authorization) {
      return BadRequestException({
        code: "TOKEN_REQUIRED",
        message: "no token passed",
      });
    }
    const [flag, token] = req.headers.authorization.split(" ");
    const { user, decoded } = await decodeToken({ token });
    req.user = user;
    req.decoded = decoded;

    next();
  };
};

//authorization
export const authorization = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return UnAuthorizedException({
        code: "Unauthorized",
        message: "forbidden",
        details: "you are not authorized",
      });
    }

    next();
  };
};
