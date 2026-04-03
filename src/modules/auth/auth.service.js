import { get, RedisKeys, set } from "../../common/services/index.js";
import {
  BadRequestException,
  ConflictException,
  UnAuthorizedException,
} from "../../common/utils/response/error.response.js";
import { createLoginCredentials } from "../../common/utils/security/token.security.js";
import { createOne, findOne } from "../../DB/index.js";
import { User } from "../../DB/models/index.js";

//register
export const register = async (inputs) => {
  const { name, email, password, role } = inputs;
  const user = await findOne({
    model: User,
    filter: { email },
  });
  if (user) {
    return ConflictException({
      code: "CONFLICT_EMAIL",
      message: "invalid email",
      details: "email already exist",
    });
  }
  const newUser = await createOne({
    model: User,
    data: { name, email, password, role },
  });

  return newUser;
};

//login
export const login = async (inputs) => {
  const { email, password } = inputs;
  const user = await findOne({
    model: User,
    filter: { email },
  });
  if (!user) {
    return UnAuthorizedException({
      code: "INVALID_CREDENTIALS",
      message: "invalid login credentials",
      details: "invalid email or password",
    });
  }
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return UnAuthorizedException({
      code: "INVALID_CREDENTIALS",
      message: "invalid login credentials",
      details: "invalid email or password",
    });
  }

  return await createLoginCredentials({ user });
};

//logout
export const logout = async (inputs) => {
  const { user, decoded } = inputs;
  const revokeTokenKey = RedisKeys.Auth.RevokeTokenKey({
    userId: user._id,
    jti: decoded.jti,
  });
  await set({ key: revokeTokenKey, value: decoded.jti, time: 2 * 86400 });

  return;
};

//profile
export const profile = async (inputs) => {
  const { user } = inputs;
  const cacheKey = RedisKeys.User.Profile({ userId: user._id });
  const cacheProfile = await get({ key: cacheKey });
  if (cacheProfile) {
    return cacheProfile;
  }
  await set({ key: cacheKey, value: user, time: 5 * 60 });

  return user;
};

//update password
export const updatePassword = async (inputs) => {
  const { user, oldPassword, password } = inputs;
  const isRightPassword = await user.comparePassword(oldPassword);
  if (!isRightPassword) {
    return BadRequestException({
      code: "INVALID_PASSWORD",
      message: "old password is wrong",
    });
  }
  user.password = password;
  await user.save();

  return;
};
