import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

import { EXPIRES_IN, JWT_SECRET } from "../../../../config/config.service.js";
import { get, RedisKeys } from "../../services/index.js";
import {
  NotFoundException,
  UnAuthorizedException,
} from "../response/error.response.js";
import { findOne } from "../../../DB/index.js";
import { User } from "../../../DB/models/index.js";

//generate token
export const generateToken = async ({
  payload = {},
  signature = JWT_SECRET,
  options = {},
} = {}) => {
  return jwt.sign(payload, signature, options);
};

//create login credentials
export const createLoginCredentials = async ({ user }) => {
  const jwtId = randomUUID();
  const token = await generateToken({
    payload: { sub: user._id, role: user.role },
    options: { expiresIn: EXPIRES_IN, jwtid: jwtId },
  });

  return token;
};

//verify token
export const verifyToken = async ({
  token,
  signature = JWT_SECRET,
  options = {},
} = {}) => {
  return jwt.verify(token, signature, options);
};

//decode token
export const decodeToken = async ({ token }) => {
  if (!token) {
    return BadRequestException({
      code: "LOGIN_REQUIRED",
      message: "please login first",
    });
  }
  const decoded = jwt.decode(token);
  //check if user logged out from this token
  const revokeToken = RedisKeys.Auth.RevokeTokenKey({
    userId: decoded.sub,
    jti: decoded.jti,
  });
  const isRevoked = await get({ key: revokeToken });
  if (decoded.jti && isRevoked) {
    return UnAuthorizedException({
      code: "TOKEN_REVOKED",
      message: "invalid token",
      details: "you pass revoked token please login first",
    });
  }
  //verify token
  const verifiedData = await verifyToken({ token });
  //find user
  const user = await findOne({
    model: User,
    filter: { _id: verifiedData.sub },
  });
  if (!user) {
    return NotFoundException({
      code: "USER_NOT_FOUND",
      message: "user not found",
      details: "you are not register yet please register first",
    });
  }

  return { user, decoded };
};
