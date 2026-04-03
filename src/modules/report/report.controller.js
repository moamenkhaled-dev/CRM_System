import { Router } from "express";
import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import {
  countOfOverdueTasksByRep,
  getContactsGrowth,
  getTotalDealValuePerStage,
  getWonDealsPerSalesRep,
  leadToCustomerConversion,
} from "./report.service.js";
import { successResponse } from "../../common/utils/response/success.response.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  countOfOverdueTasksByRepSchema,
  getContactsGrowthSchema,
  getTotalDealValuesPerStageSchema,
  getWonDealsPerSalesRepSchema,
  leadToCustomerConversionSchema,
} from "./report.validation.js";
import {
  countOfOverdueTasksByRepLimiter,
  getContactsGrowthLimiter,
  getTotalDealValuesPerStageLimiter,
  getWonDealsPerSalesRepLimiter,
  leadToCustomerConversionLimiter,
} from "../../middlewares/rateLimit/report.rateLimit.middleware.js";
import { ReportEndPoints } from "./report.authorization.js";

const router = Router();

//get total deal values per stage
router.get(
  "/reports/pipeline-summary",
  authentication(),
  getTotalDealValuesPerStageLimiter,
  validate(getTotalDealValuesPerStageSchema),
  async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const totalValues = await getTotalDealValuePerStage({
      user: req.user,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return successResponse({ res, data: totalValues });
  },
);

//get won deals per sales rep
router.get(
  "/reports/sales-by-rep",
  authentication(),
  authorization(ReportEndPoints.getWonDealsPerSalesRep),
  getWonDealsPerSalesRepLimiter,
  validate(getWonDealsPerSalesRepSchema),
  async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const deals = await getWonDealsPerSalesRep({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return successResponse({ res, data: deals });
  },
);

//get contacts growth
router.get(
  "/reports/contacts-growth",
  authentication(),
  getContactsGrowthLimiter,
  validate(getContactsGrowthSchema),
  async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const contacts = await getContactsGrowth({
      user: req.user,
      startDate,
      endDate,
    });

    return successResponse({ res, data: contacts });
  },
);

//lead to customer conversion
router.get(
  "/reports/conversion-rate",
  authentication(),
  leadToCustomerConversionLimiter,
  validate(leadToCustomerConversionSchema),
  async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const percentage = await leadToCustomerConversion({
      user: req.user,
      startDate,
      endDate,
    });

    return successResponse({ res, data: percentage });
  },
);

//count of overdue tasks by rep
router.get(
  "/reports/overdue-tasks",
  authentication(),
  authorization(ReportEndPoints.countOfOverdueTasksByRep),
  countOfOverdueTasksByRepLimiter,
  validate(countOfOverdueTasksByRepSchema),
  async (req, res, next) => {
    const { startDate, endDate } = req.query;
    const count = await countOfOverdueTasksByRep({
      user: req.user,
      startDate,
      endDate,
    });

    return successResponse({ res, data: count });
  },
);

//export router
export default router;
