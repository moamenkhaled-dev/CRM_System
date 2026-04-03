import { RoleEnum } from "../../common/enums/user.enums.js";
import {
  createOne,
  find,
  findOne,
  findOneAndDelete,
  findOneAndUpdate,
} from "../../DB/index.js";
import { Activity } from "../../DB/models/index.js";
import {
  checkVersionKey,
  incrVersionKeys,
  validateOwnership,
} from "./activity.helper.js";
import { NotFoundException } from "../../common/utils/response/error.response.js";
import { RedisKeys } from "../../common/services/redis.keys.js";
import { get, incr, set } from "../../common/services/redis.service.js";

//create new activity
export const createActivity = async (inputs) => {
  const {
    user,
    ownerId,
    contactId,
    dealId,
    type,
    notes,
    scheduledAt,
    duration,
    outcome,
    outcomeNote,
  } = inputs;
  await validateOwnership({ user, ownerId, contactId, dealId });
  const finalOwnerId = user.role === RoleEnum.Sales_Rep ? user._id : ownerId;
  const activity = await createOne({
    model: Activity,
    data: {
      ownerId: finalOwnerId,
      contactId,
      dealId,
      type,
      notes,
      scheduledAt,
      duration,
      outcome,
      outcomeNote,
    },
  });
  await incrVersionKeys({ userId: finalOwnerId, contactId, dealId });

  return activity;
};

//activities list
export const activitiesList = async (inputs) => {
  const { user, type, outcome } = inputs;
  const userId = user.role === RoleEnum.Sales_Rep ? user._id : "all";
  const version = await checkVersionKey({ userId });
  const cacheKey = RedisKeys.Activity.List({
    userId,
    version,
    type,
    outcome,
  });
  const cached = await get({ key: cacheKey });
  if (cached) return cached;
  const filter = {};
  if (user.role === RoleEnum.Sales_Rep) filter.ownerId = user._id;
  if (type) filter.type = type;
  if (outcome) filter.outcome = outcome;
  const list = await find({
    model: Activity,
    filter,
    select: "type outcome scheduledAt duration notes",
    options: {
      populate: [
        { path: "ownerId", select: "name email" },
        { path: "contactId", select: "firstName lastName email phone" },
        { path: "dealId", select: "title stage" },
      ],
    },
  });
  if (!list.length) throw NotFoundException({ message: "no activities" });
  await set({ key: cacheKey, value: list, time: 15 * 60 });

  return list;
};

//get activity by id
export const getActivityById = async (inputs) => {
  const { user, activityId } = inputs;
  const userId = user.role == RoleEnum.Sales_Rep ? user._id : "all";
  const version = await checkVersionKey({ userId });
  const cacheKey = RedisKeys.Activity.Single({ activityId, userId, version });
  const cacheActivity = await get({ key: cacheKey });
  if (cacheActivity) return cacheActivity;
  const filter = { _id: activityId };
  if (user.role == RoleEnum.Sales_Rep) filter.ownerId = user._id;
  const activity = await findOne({
    model: Activity,
    filter,
    options: {
      populate: [
        {
          path: "ownerId",
          select: "name email notes",
        },
        {
          path: "contactId",
          select: "firstName lastName email phone",
        },
        {
          path: "dealId",
          select: "title stage",
        },
      ],
    },
  });
  if (!activity) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "activity not found",
      details: "may be deleted or you are not the owner of it",
    });
  }
  await set({
    key: RedisKeys.Activity.Single({ activityId, userId, version }),
    value: activity,
    time: 10 * 60,
  });

  return activity;
};

//get all activities of contact
export const getAllActivitiesOfContact = async (inputs) => {
  const { user, contactId } = inputs;
  const userId = user.role === RoleEnum.Sales_Rep ? user._id : "all";
  const version = await checkVersionKey({ userId });
  const cacheKey = RedisKeys.Activity.List({
    userId,
    version,
    contactId,
  });
  const cached = await get({ key: cacheKey });
  if (cached) return cached;
  const filter = { contactId };
  if (user.role === RoleEnum.Sales_Rep) filter.ownerId = user._id;
  const activities = await find({
    model: Activity,
    filter,
    select: "type outcome scheduledAt duration contactId dealId",
    options: {
      populate: [
        { path: "ownerId", select: "name email" },
        { path: "contactId", select: "firstName lastName email phone" },
        { path: "dealId", select: "title stage" },
      ],
    },
  });
  if (!activities.length) throw NotFoundException({ message: "no activities" });
  await set({ key: cacheKey, value: activities, time: 10 * 60 });

  return activities;
};

//get all activities of deal
export const getAllActivitiesOfDeal = async (inputs) => {
  const { user, dealId } = inputs;
  const userId = user.role === RoleEnum.Sales_Rep ? user._id : "all";
  const version = await checkVersionKey({ userId });
  const cacheKey = RedisKeys.Activity.List({ userId, version, dealId });
  const cacheList = await get({ key: cacheKey });
  if (cacheList) {
    console.log("redis");

    return cacheList;
  }
  const filter = { dealId };
  if (user.role === RoleEnum.Sales_Rep) filter.ownerId = user._id;
  const activities = await find({
    model: Activity,
    filter,
    select: "type scheduledAt duration",
    options: {
      populate: [
        { path: "ownerId", select: "name email" },
        { path: "contactId", select: "firstName lastName email phone" },
        { path: "dealId", select: "title stage" },
      ],
    },
  });
  if (activities.length <= 0) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "no activities found",
    });
  }
  await set({ key: cacheKey, value: activities, time: 10 * 60 });

  return activities;
};

//update activity
export const updateActivity = async (inputs) => {
  const { user, activityId, notes } = inputs;
  const filter = { _id: activityId };
  if (user.role === RoleEnum.Sales_Rep) filter.ownerId = user._id;
  const activity = await findOneAndUpdate({
    model: Activity,
    filter,
    updates: { notes },
    options: {
      populate: [
        {
          path: "ownerId",
          select: "name email",
        },
        {
          path: "contactId",
          select: "firstName lastName email phone",
        },
        {
          path: "dealId",
          select: "title stage",
        },
      ],
    },
  });
  if (!activity) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "activity not found",
    });
  }
  const userId = activity.ownerId._id.toString();
  await incrVersionKeys({
    userId,
    contactId: activity.contactId._id,
    dealId: activity.dealId._id,
  });

  return activity;
};

//delete activity
export const deleteActivity = async (inputs) => {
  const { activityId } = inputs;
  const activity = await findOneAndDelete({
    model: Activity,
    filter: { _id: activityId },
  });
  if (!activity) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "activity didn't deleted may be already deleted or _id is wrong",
    });
  }
  await incrVersionKeys({
    userId: activity.ownerId,
    contactId: activity.contactId,
    dealId: activity.dealId,
  });

  return;
};
