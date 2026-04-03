import { Router } from "express";

import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { ActivityEdPoints } from "./activity.authorization.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  activitiesListLimiter,
  createActivityLimiter,
  deleteActivityLimiter,
  getActivityByIdLimiter,
  getAllActivitiesOfContactLimiter,
  getAllActivitiesOfDealLimiter,
  updateActivityLimiter,
} from "../../middlewares/rateLimit/activity.rateLimit.middleware.js";
import {
  activitiesListSchema,
  createActivitySchema,
  deleteActivitySchema,
  getActivityByIdSchema,
  getAllActivitiesOfContactSchema,
  getAllActivitiesOfDealSchema,
  updateActivitySchema,
} from "./activity.validation.js";
import {
  activitiesList,
  createActivity,
  deleteActivity,
  getActivityById,
  getAllActivitiesOfContact,
  getAllActivitiesOfDeal,
  updateActivity,
} from "./activity.service.js";
import { successResponse } from "../../common/utils/response/success.response.js";

const router = Router();

//create activity
router.post(
  "/activities",
  authentication(),
  authorization(ActivityEdPoints.createActivity),
  createActivityLimiter,
  validate(createActivitySchema),
  async (req, res, next) => {
    const {
      ownerId,
      contactId,
      dealId,
      type,
      notes,
      scheduledAt,
      duration,
      outcome,
      outcomeNote,
    } = req.body;
    const activity = await createActivity({
      user: req.user,
      ownerId,
      contactId,
      dealId,
      type,
      notes,
      scheduledAt,
      duration,
      outcome,
      outcomeNote,
    });

    return successResponse({ res, data: activity });
  },
);

//list activities
router.get(
  "/activities",
  authentication(),
  activitiesListLimiter,
  validate(activitiesListSchema),
  async (req, res, next) => {
    const { type, outcome } = req.query;
    const list = await activitiesList({ user: req.user, type, outcome });

    return successResponse({ res, data: list });
  },
);

//update activity
router.put(
  "/activities/:id",
  authentication(),
  authorization(ActivityEdPoints.updateActivity),
  updateActivityLimiter,
  validate(updateActivitySchema),
  async (req, res, next) => {
    const { id } = req.params;
    const { notes } = req.body;
    const activity = await updateActivity({
      user: req.user,
      activityId: id,
      notes,
    });

    return successResponse({ res, data: activity });
  },
);

//get activity by id
router.get(
  "/activities/:id",
  authentication(),
  getActivityByIdLimiter,
  validate(getActivityByIdSchema),
  async (req, res, next) => {
    const { id } = req.params;
    const activity = await getActivityById({ user: req.user, activityId: id });

    return successResponse({ res, data: activity });
  },
);

//get all activities of contact
router.get(
  "/contacts/:id/activities",
  authentication(),
  getAllActivitiesOfContactLimiter,
  validate(getAllActivitiesOfContactSchema),
  async (req, res, next) => {
    const { id } = req.params;
    const activities = await getAllActivitiesOfContact({
      user: req.user,
      contactId: id,
    });

    return successResponse({ res, data: activities });
  },
);

//get all activities of deal
router.get(
  "/deals/:id/activities",
  authentication(),
  getAllActivitiesOfDealLimiter,
  validate(getAllActivitiesOfDealSchema),
  async (req, res, next) => {
    const { id } = req.params;
    const activities = await getAllActivitiesOfDeal({
      user: req.user,
      dealId: id,
    });

    return successResponse({ res, data: activities });
  },
);

//delete activity
router.delete(
  "/activities/:id",
  authentication(),
  authorization(ActivityEdPoints.deleteActivity),
  deleteActivityLimiter,
  validate(deleteActivitySchema),
  async (req, res, next) => {
    const { id } = req.params;
    await deleteActivity({ activityId: id });

    return successResponse({ res });
  },
);

//export router
export default router;
