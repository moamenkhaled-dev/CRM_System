import { TaskVersionKeyEnum } from "../../common/enums/task.enums.js";
import { RoleEnum } from "../../common/enums/user.enums.js";
import { RedisKeys } from "../../common/services/redis.keys.js";
import { get, set } from "../../common/services/redis.service.js";
import {
  NotFoundException,
  UnAuthorizedException,
} from "../../common/utils/response/error.response.js";
import {
  createOne,
  find,
  findOne,
  findOneAndUpdate,
} from "../../DB/db.repository.js";
import { Contact, Deal, Task } from "../../DB/models/index.js";
import { getVersion, incrementTaskVersionKeys } from "./task.helper.js";

//create task
export const createTask = async (inputs) => {
  const { user, title, dueDate, priority, contactId, dealId, assignedTo } =
    inputs;
  if (contactId) {
    const filter = { _id: contactId, deletedAt: { $eq: null } };
    if (user.role == RoleEnum.Sales_Rep) {
      if (assignedTo !== user._id.toString()) {
        return UnAuthorizedException({
          code: "Unauthorized",
          message: "you are not authorize to assign tasks to another user",
        });
      }
      filter.ownerId = user._id;
    } else {
      filter.ownerId = assignedTo;
    }
    const contact = await findOne({ model: Contact, filter });
    if (!contact) {
      return NotFoundException({
        code: "NOT_FOUND",
        message: "contact doesn't exist",
        details: "maybe you assign contact to wrong owner",
      });
    }
  }
  if (dealId) {
    const filter = { _id: dealId, contactId, deletedAt: { $eq: null } };
    user.role == RoleEnum.Sales_Rep
      ? (filter.ownerId = user._id)
      : (filter.ownerId = assignedTo);
    const deal = await findOne({ model: Deal, filter });
    if (!deal) {
      return NotFoundException({
        code: "NOT_FOUND",
        message: "deal doesn't exist",
        details:
          "maybe you assign deal to wrong owner or deal doesn't belong to this owner",
      });
    }
  }
  const assignedUser = user.role === RoleEnum.Admin ? assignedTo : user._id;
  const task = await createOne({
    model: Task,
    data: {
      title,
      dueDate,
      priority,
      contactId,
      dealId,
      assignedTo: assignedUser,
      createdBy: user._id,
    },
  });
  await incrementTaskVersionKeys({ userId: assignedUser, list: true });

  return task;
};

//tasks list
export const tasksList = async (inputs) => {
  const {
    user,
    startDueDate,
    endDueDate,
    priority,
    startCompletedDate,
    endCompletedDate,
    isCompleted,
  } = inputs;
  let userId;
  user.role === RoleEnum.Sales_Rep ? (userId = user._id.toString()) : "all";
  const version = await getVersion({ userId, key: TaskVersionKeyEnum.List });
  const cacheListKey = RedisKeys.Task.List({
    userId,
    version,
    startDueDate,
    endDueDate,
    startCompletedDate,
    endCompletedDate,
    priority,
    isCompleted,
  });
  const cacheList = await get({ key: cacheListKey });
  if (cacheList) {
    return cacheList;
  }
  const filter = { deletedAt: null };
  if (startDueDate || endDueDate) {
    filter.dueDate = {};
    if (startDueDate) filter.dueDate.$gte = startDueDate;
    if (endDueDate) filter.dueDate.$lte = endDueDate;
  }
  if (startCompletedDate || endCompletedDate) {
    filter.completedAt = {};
    if (startCompletedDate) filter.completedAt.$gte = startCompletedDate;
    if (endCompletedDate) filter.completedAt.$lte = endCompletedDate;
  }
  if (priority) filter.priority = priority;
  if (isCompleted !== undefined) filter.isCompleted = isCompleted;
  if (user.role === RoleEnum.Sales_Rep) filter.assignedTo = user._id;
  const list = await find({
    model: Task,
    filter,
    select: "title dueDate",
    options: {
      populate: [
        { path: "contactId", select: "firstName lastName email phone" },
        { path: "dealId", select: "title expectedCloseDate" },
        { path: "assignedTo", select: "name email role" },
        { path: "createdBy", select: "name email role" },
      ],
    },
  });
  if (list.length <= 0) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "no tasks found",
    });
  }
  //! delete it
  const count = await Task.countDocuments(filter);
  await set({ key: cacheListKey, value: { ...list, count }, time: 10 * 60 });

  return { list, count };
};

//get over due tasks
export const overDueTasks = async (inputs) => {
  const { user } = inputs;
  const filter = {
    deletedAt: null,
    isCompleted: false,
    dueDate: { $lte: new Date() },
  };
  if (user.role === RoleEnum.Sales_Rep) filter.assignedTo = user._id;
  const tasks = await find({
    model: Task,
    filter,
    select: "title dueDate",
    options: {
      populate: [
        { path: "contactId", select: "firstName lastName email phone" },
        { path: "dealId", select: "title expectedCloseDate" },
        { path: "assignedTo", select: "name email role" },
        { path: "createdBy", select: "name email role" },
      ],
    },
  });
  if (tasks.length <= 0) {
    return [];
  }

  return tasks;
};

//get task by id
export const getTaskById = async (inputs) => {
  const { user, taskId } = inputs;
  const userId = user.role === RoleEnum.Sales_Rep ? user._id : "all";
  const version = await getVersion({ taskId });
  const cacheTaskKey = RedisKeys.Task.Single({ taskId, userId, version });
  const cacheTask = await get({ key: cacheTaskKey });
  if (cacheTask) {
    return cacheTask;
  }
  const filter = { _id: taskId, deletedAt: null };
  if (user.role == RoleEnum.Sales_Rep) filter.assignedTo = user._id;
  const task = await findOne({
    model: Task,
    filter,
    options: {
      populate: [
        { path: "contactId", select: "firstName lastName email phone" },
        { path: "dealId", select: "title expectedCloseDate" },
        { path: "assignedTo", select: "name email role" },
        { path: "createdBy", select: "name email role" },
      ],
    },
  });
  if (!task) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "task not found",
    });
  }
  await set({ key: cacheTaskKey, value: task, time: 10 * 60 });

  return task;
};

//update task
export const updateTask = async (inputs) => {
  const { user, taskId, title, markDone, priority, dueDate } = inputs;
  const filter = { _id: taskId, deletedAt: null };
  const updates = {};
  if (user.role == RoleEnum.Sales_Rep) filter.assignedTo = user._id;
  if (markDone) {
    updates.isCompleted = true;
    updates.completedAt = new Date();
  }
  if (priority) updates.priority = priority;
  if (dueDate && user.role == RoleEnum.Admin) updates.dueDate = dueDate;
  if (title) updates.title = title;
  const task = await findOneAndUpdate({
    model: Task,
    filter,
    updates,
    options: {
      populate: [
        { path: "contactId", select: "firstName lastName email phone" },
        { path: "dealId", select: "title expectedCloseDate" },
        { path: "assignedTo", select: "name email role" },
        { path: "createdBy", select: "name email role" },
      ],
    },
  });
  if (!task) {
    return NotFoundException({ code: "NOT_FOUND", message: "no tasks found" });
  }
  await incrementTaskVersionKeys({
    userId: task.assignedTo.toString(),
    taskId,
    list: true,
  });

  return task;
};

//delete task
export const deleteTask = async (inputs) => {
  const { taskId } = inputs;
  const task = await findOneAndUpdate({
    model: Task,
    filter: { deletedAt: null, _id: taskId },
    updates: { deletedAt: new Date() },
  });
  if (!task) {
    return NotFoundException({
      code: "NOT_FOUND",
      message: "task not found",
    });
  }
  await incrementTaskVersionKeys({
    userId: task.assignedTo,
    taskId,
    list: true,
  });

  return;
};
