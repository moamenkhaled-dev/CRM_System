import { Router } from "express";

import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { DealEndPoints } from "./deal.authorization.js";
import {
  createDealSchema,
  dealsListSchema,
  deleteDealSchema,
  getDealByIdSchema,
  updateDealSchema,
} from "./deal.validation.js";
import {
  createDealLimiter,
  dealsListLimiter,
  deleteDealLimiter,
  getDealByIdLimiter,
  getDealsGroupedByStageLimiter,
  updateDealLimiter,
  validate,
} from "../../middlewares/index.js";
import {
  createDeal,
  dealsList,
  deleteDeal,
  getDealById,
  getDealsGroupedByStage,
  updateDeal,
} from "./deal.service.js";
import { successResponse } from "../../common/utils/response/success.response.js";

const router = Router();

//create deal
router.post(
  "/deals",
  authentication(),
  authorization(DealEndPoints.createDeal),
  createDealLimiter,
  validate(createDealSchema),
  async (req, res, next) => {
    const {
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
    } = req.body;
    const deal = await createDeal({
      user: req.user,
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
    });

    return successResponse({ res, status: 201, data: deal });
  },
);

//deals list
router.get(
  "/deals",
  authentication(),
  dealsListLimiter,
  validate(dealsListSchema),
  async (req, res, next) => {
    const { page, limit, search } = req.query;
    const deals = await dealsList({ user: req.user, page, limit, search });

    return successResponse({ res, data: deals });
  },
);

//update deal
router.put(
  "/deals/:id",
  authentication(),
  authorization(DealEndPoints.updateDeal),
  updateDealLimiter,
  validate(updateDealSchema),
  async (req, res, next) => {
    const { id } = req.params;
    const {
      title,
      stage,
      value,
      currency,
      expectedCloseDate,
      probability,
      lostReason,
      description,
    } = req.body;
    const deal = await updateDeal({
      user: req.user,
      dealId: id,
      title,
      stage,
      value,
      currency,
      expectedCloseDate,
      probability,
      lostReason,
      description,
    });

    return successResponse({ res, data: deal });
  },
);

//delete deal
router.delete(
  "/deals/:id",
  authentication(),
  authorization(DealEndPoints.deleteDeal),
  deleteDealLimiter,
  validate(deleteDealSchema),
  async (req, res, next) => {
    const { id } = req.params;
    await deleteDeal({ dealId: id });

    return successResponse({ res });
  },
);

//get deals grouped by stage
router.get(
  "/deals/pipeline",
  authentication(),
  getDealsGroupedByStageLimiter,
  async (req, res, next) => {
    const deals = await getDealsGroupedByStage({ user: req.user });

    return successResponse({ res, data: deals });
  },
);

//get deal by id
router.get(
  "/deals/:id",
  authentication(),
  getDealByIdLimiter,
  validate(getDealByIdSchema),
  async (req, res, next) => {
    const { id } = req.params;
    const deal = await getDealById({ user: req.user, dealId: id });

    return successResponse({ res, data: deal });
  },
);

//export router
export default router;
