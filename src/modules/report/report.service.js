import { ContactStatusEnum } from "../../common/enums/contact.enums.js";
import { DealStageEnum } from "../../common/enums/deal.enums.js";
import { RoleEnum } from "../../common/enums/user.enums.js";
import { aggregate, countDocuments } from "../../DB/db.repository.js";
import { Contact } from "../../DB/models/contact.model.js";
import { Deal } from "../../DB/models/deal.model.js";
import { Task } from "../../DB/models/task.model.js";

//get total deal values per stage
export const getTotalDealValuePerStage = async (inputs) => {
  const { user, startDate, endDate } = inputs;
  const matchStage = {
    deletedAt: null,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };
  if (user.role === RoleEnum.Sales_Rep) matchStage.ownerId = user._id;
  const totalValues = await aggregate({
    model: Deal,
    matchStage,
    pipeline: [
      {
        $group: {
          _id: "$stage",
          totalValue: { $sum: "$value" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ],
  });

  return totalValues;
};

//get won deals per sales rep
export const getWonDealsPerSalesRep = async (inputs) => {
  const { startDate, endDate } = inputs;
  const matchStage = {
    stage: DealStageEnum.Won,
    deletedAt: null,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };
  const wonDeals = await aggregate({
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
          _id: 1,
          ownerId: 1,
          contactId: 1,
          title: 1,
          stage: 1,
          value: 1,
          owner: { _id: 1, name: 1, email: 1 },
          contact: { _id: 1, firstName: 1, lastName: 1, email: 1, phone: 1 },
        },
      },
      {
        $group: {
          _id: "$ownerId",
          count: { $sum: 1 },
          owner: { $first: "$owner" },
          contact: { $first: "$contact" },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ],
  });
  if (wonDeals.length <= 0) return [];

  return wonDeals;
};

//get new contacts per month
export const getContactsGrowth = async (inputs) => {
  const { user, startDate, endDate } = inputs;
  const matchStage = {
    deletedAt: null,
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };
  if (user.role == RoleEnum.Sales_Rep) matchStage.ownerId = user._id;
  const contactsPerMonth = await aggregate({
    model: Contact,
    matchStage,
    pipeline: [
      {
        $project: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ],
  });

  return contactsPerMonth.map((item) => ({
    year: item._id.year,
    month: item._id.month,
    count: item.count,
  }));
};

//lead to customer conversion
export const leadToCustomerConversion = async (inputs) => {
  const { user, startDate, endDate } = inputs;
  const filter = {
    deletedAt: null,
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };
  if (user.role === RoleEnum.Sales_Rep) filter.ownerId = user._id;
  const allContacts = await countDocuments({ model: Contact, filter });
  if (allContacts === 0) return "0%";
  filter.status = ContactStatusEnum.Customer;
  const customerContacts = await countDocuments({ model: Contact, filter });
  const percentage = (customerContacts / allContacts) * 100;

  return `${percentage.toFixed(2)}%`;
};

//count of overdue tasks by rep
export const countOfOverdueTasksByRep = async (inputs) => {
  const { startDate, endDate } = inputs;
  const matchStage = {
    isCompleted: false,
    deletedAt: null,
    dueDate: { $lt: new Date(endDate) },
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const tasks = await aggregate({
    model: Task,
    matchStage,
    pipeline: [
      { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "rep",
        },
      },
      { $unwind: "$rep" },
      {
        $project: {
          _id: 1,
          count: 1,
          rep: { _id: 1, name: 1, email: 1 },
        },
      },
      { $sort: { count: -1 } },
    ],
  });

  return tasks;
};
