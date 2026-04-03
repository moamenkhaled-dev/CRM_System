import { Router } from "express";

import {
  authentication,
  authorization,
  registerLimiter,
  validate,
} from "../../middlewares/index.js";
import {
  loginSchema,
  registerSchema,
  updatePasswordSchema,
} from "./auth.validation.js";

import { authEndPoints } from "./auth.authorization.js";
import {
  login,
  logout,
  profile,
  register,
  updatePassword,
} from "./auth.service.js";
import { successResponse } from "../../common/utils/response/success.response.js";
import {
  loginLimiter,
  logoutLimiter,
  profileLimiter,
  updatePasswordLimiter,
} from "../../middlewares/rateLimit/auth.rateLimit.middleware.js";
import { del, RedisKeys } from "../../common/services/index.js";

const router = Router();

//register
router.post(
  "/register",
  authentication(),
  authorization(authEndPoints.register),
  registerLimiter,
  validate(registerSchema),
  async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const user = await register({ name, email, password, role });

    return successResponse({ res, status: 201, data: user });
  },
);

//login
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  async (req, res, next) => {
    const { email, password } = req.body;
    const token = await login({ email, password });
    const endPointKey = RedisKeys.RateLimit.IPEndPointKey({
      ip: req.ip,
      path: req.path,
    });
    await del({ keys: [endPointKey] });

    return successResponse({ res, data: { token } });
  },
);

//profile
router.get("/me", authentication(), profileLimiter, async (req, res, next) => {
  const userProfile = await profile({ user: req.user });

  return successResponse({ res, data: userProfile });
});

//logout
router.post(
  "/logout",
  authentication(),
  logoutLimiter,
  async (req, res, next) => {
    await logout({ user: req.user, decoded: req.decoded });

    return successResponse({ res });
  },
);

//update profile
router.put(
  "/me/password",
  authentication(),
  updatePasswordLimiter,
  validate(updatePasswordSchema),
  async (req, res, next) => {
    const { oldPassword, password, confirmPassword } = req.body;
    await updatePassword({
      user: req.user,
      oldPassword,
      password,
      confirmPassword,
    });

    return successResponse({ res });
  },
);

//export router
export default router;
