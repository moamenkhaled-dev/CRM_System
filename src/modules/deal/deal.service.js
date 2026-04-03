import mongoose from "mongoose";
import { RoleEnum } from "../../common/enums/user.enums.js";
import { del, get, keys, RedisKeys, set } from "../../common/services/index.js";
import {
  BadRequestException,
  NotFoundException,
  UnAuthorizedException,
} from "../../common/utils/response/error.response.js";
import {
  aggregate,
  createOne,
  findOne,
  findOneAndDelete,
  findOneAndUpdate,
  paginate,
  updateMany,
} from "../../DB/db.repository.js";
import { Activity, Contact, Deal, User } from "../../DB/models/index.js";

//create deal
export const createDeal = async (inputs) => {
  const {
    user,
    title,
    contactId,
    ownerId,
    stage,
    value,
    currency,
    expectedCloseDate,
    probability,
    lostReason,
    description,
  } = inputs;
  const filter = { _id: contactId, deletedAt: { $exists: false } };
  user.role == RoleEnum.Sales_Rep
    ? (filter.ownerId = user._id)
    : (filter.ownerId = ownerId);
  const contact = await findOne({
    model: Contact,
    filter,
  });
  if (!contact) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "contact or owner not found",
    });
  }
  const deal = await createOne({
    model: Deal,
    data: {
      title,
      contactId,
      ownerId: user.role == RoleEnum.Sales_Rep ? user._id : ownerId,
      stage,
      value,
      currency,
      expectedCloseDate,
      probability,
      lostReason,
      description,
    },
  });
  const allDealLists = await keys({
    pattern: `${RedisKeys.Deal.BaseList({ userId: "all", role: "all" })}*`,
  });
  const salesDealList = await keys({
    pattern: `${RedisKeys.Deal.BaseList({ userId: ownerId, role: RoleEnum.Sales_Rep })}*`,
  });
  await del({ keys: [...(allDealLists || []), ...(salesDealList || [])] });

  return deal;
};

//get deal by id
export const getDealById = async (inputs) => {
  const { user, dealId } = inputs;
  const cacheKey =
    user.role == RoleEnum.Sales_Rep
      ? RedisKeys.Deal.SingleDeal({
          dealId,
          userId: user._id,
        })
      : await keys({ pattern: `${RedisKeys.Deal.BaseSingle({ dealId })}*` });
  const cacheDeal = await get({ key: cacheKey.toString() });
  if (cacheDeal) {
    return cacheDeal;
  }
  const filter = { _id: dealId };
  if (user.role == RoleEnum.Sales_Rep) filter.ownerId = user._id;
  const deal = await findOne({
    model: Deal,
    filter,
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
      ],
    },
  });
  if (!deal) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "deal not found",
    });
  }
  await set({
    key: RedisKeys.Deal.SingleDeal({
      dealId,
      userId: deal.ownerId._id.toString(),
    }),
    value: deal,
    time: 15 * 60,
  });

  return deal;
};

//list deals
export const dealsList = async (inputs) => {
  const { user, page, limit, search } = inputs;
  const cacheKey =
    user.role == RoleEnum.Sales_Rep
      ? RedisKeys.Deal.List({
          userId: user._id,
          role: user.role,
          page,
          limit: limit || 5,
          search,
        })
      : RedisKeys.Deal.List({ page, limit, search });
  const cacheList = await get({ key: cacheKey });
  if (cacheList) {
    return cacheList;
  }
  const filter = {};
  if (search) filter.title = { $regex: search, $options: "i" };
  if (user.role == RoleEnum.Sales_Rep) filter.ownerId = user._id;
  const deals = await paginate({
    model: Deal,
    filter,
    page,
    limit,
    options: {
      populate: [
        {
          path: "ownerId",
          select: "name email",
        },
        {
          path: "contactId",
          select: "firstName lastName email",
        },
      ],
    },
  });
  if (deals.data.length <= 0) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "no deals found",
    });
  }
  await set({ key: cacheKey, value: deals, time: 15 * 60 });

  return deals;
};

//update deal
export const updateDeal = async (inputs) => {
  const {
    user,
    dealId,
    title,
    stage,
    value,
    currency,
    expectedCloseDate,
    probability,
    lostReason,
    description,
  } = inputs;
  const updates = {};
  if (title) updates.title = title;
  if (stage) updates.stage = stage;
  if (value) updates.value;
  if (currency) updates.currency;
  if (expectedCloseDate) updates.expectedCloseDate = expectedCloseDate;
  if (probability) updates.probability;
  if (lostReason) updates.lostReason;
  if (description) updates.description;
  if (Object.keys(updates).length <= 0) {
    return BadRequestException({
      code: "BAD_REQUEST",
      message: "please provide data to update",
    });
  }
  const filter = { _id: dealId };
  if (user.role == RoleEnum.Sales_Rep) filter.ownerId = user._id;
  const deal = await findOneAndUpdate({
    model: Deal,
    filter,
    updates,
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
      ],
    },
  });
  if (!deal) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "deal not found",
    });
  }
  const allDealLists = await keys({
    pattern: `${RedisKeys.Deal.BaseList({ userId: "all", role: "all" })}*`,
  });
  const salesDealList = await keys({
    pattern: `${RedisKeys.Deal.BaseList({ userId: deal.ownerId._id.toString(), role: RoleEnum.Sales_Rep })}*`,
  });
  const singleDeal = RedisKeys.Deal.SingleDeal({
    dealId,
    userId: deal.ownerId._id.toString(),
  });
  await del({
    keys: [...(allDealLists || []), ...(salesDealList || []), singleDeal],
  });

  return deal;
};

//delete deal
export const deleteDeal = async (inputs) => {
  const { dealId } = inputs;
  const session = await mongoose.startSession();
  session.startTransaction();
  let deal;
  try {
    deal = await findOneAndUpdate({
      model: Deal,
      filter: { _id: dealId, deletedAt: { $eq: null } },
      updates: { deletedAt: new Date() },
      session,
    });
    if (!deal) {
      return NotFoundException({
        code: "NOT_FOUND",
        message: "deal not found may be already deleted",
      });
    }
    await updateMany({
      model: Activity,
      filter: { dealId, deletedAt: { $eq: null } },
      updates: { deletedAt: new Date() },
      session,
    });
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    return BadRequestException({
      code: "BAD_REQUEST",
      message: "something went wrong try again later",
    });
  } finally {
    await session.endSession();
  }
  const allDealLists = await keys({
    pattern: `${RedisKeys.Deal.BaseList({ userId: "all", role: "all" })}*`,
  });
  const salesDealList = await keys({
    pattern: `${RedisKeys.Deal.BaseList({ userId: deal.ownerId, role: RoleEnum.Sales_Rep })}*`,
  });
  const singleDeal = RedisKeys.Deal.SingleDeal({
    dealId,
    userId: deal.ownerId._id.toString(),
  });
  await del({
    keys: [...(allDealLists || []), ...(salesDealList || []), singleDeal],
  });

  return deal;
};

//get deals grouped by stage
export const getDealsGroupedByStage = async (inputs) => {
  const { user } = inputs;
  const matchStage = {};
  if (user.role == RoleEnum.Sales_Rep) matchStage.ownerId = user._id;
  const deals = await aggregate({
    model: Deal,
    matchStage,
    pipeline: [
      {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      {
        $lookup: {
          from: "contacts",
          localField: "contactId",
          foreignField: "_id",
          as: "contact",
        },
      },
      { $unwind: "$contact" },
      {
        $project: {
          title: 1,
          stage: 1,
          value: 1,
          expectedCloseDate: 1,
          owner: { _id: 1, name: 1, email: 1 },
          contact: { _id: 1, firstName: 1, lastName: 1, email: 1, phone: 1 },
        },
      },
      {
        $group: {
          _id: "$stage",
          deals: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ],
  });
  const convertedDeals = deals.map((item) => ({
    stage: item._id,
    count: item.count,
    deals: item.deals,
  }));

  return convertedDeals;
};
