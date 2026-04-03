import { Router } from "express";

import {
  authentication,
  authorization,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { TaskEndPoints } from "./task.authorization.js";
import {
  createTaskLimiter,
  deleteTaskLimiter,
  getTaskByIdLimiter,
  overDueTasksLimiter,
  tasksListLimiter,
  updateTaskLimiter,
} from "../../middlewares/rateLimit/task.rateLimit.middleware.js";
import {
  createTaskSchema,
  deleteTaskSchema,
  getTaskByIdSchema,
  tasksListSchema,
  updateTaskSchema,
} from "./task.validation.js";
import {
  createTask,
  deleteTask,
  getTaskById,
  overDueTasks,
  tasksList,
  updateTask,
} from "./task.service.js";
import { successResponse } from "../../common/utils/response/success.response.js";

const router = Router();

//create task
router.post(
  "/tasks",
  authentication(),
  authorization(TaskEndPoints.createTask),
  createTaskLimiter,
  validate(createTaskSchema),
  async (req, res, next) => {
    const { title, dueDate, priority, contactId, dealId, assignedTo } =
      req.body;
    const task = await createTask({
      user: req.user,
      title,
      dueDate,
      priority,
      contactId,
      dealId,
      assignedTo,
    });

    return successResponse({ res, status: 201, data: task });
  },
);

//tasks list
router.get(
  "/tasks",
  authentication(),
  tasksListLimiter,
  validate(tasksListSchema),
  async (req, res, next) => {
    const {
      startDueDate,
      endDueDate,
      priority,
      startCompletedDate,
      endCompletedDate,
      isCompleted,
    } = req.query;
    const list = await tasksList({
      user: req.user,
      startDueDate,
      endDueDate,
      priority,
      startCompletedDate,
      endCompletedDate,
      isCompleted,
    });

    return successResponse({ res, data: list });
  },
);

//get over due tasks
router.get(
  "/tasks/overdue",
  authentication(),
  overDueTasksLimiter,
  async (req, res, next) => {
    const getOverDueTasks = await overDueTasks({ user: req.user });

    return successResponse({ res, data: getOverDueTasks });
  },
);

//update task
router.put(
  "/tasks/:id",
  authentication(),
  authorization(TaskEndPoints.updateTask),
  updateTaskLimiter,
  validate(updateTaskSchema),
  async (req, res, next) => {
    const { id } = req.params;
    const { title, markDone, priority, dueDate } = req.body;
    const task = await updateTask({
      user: req.user,
      taskId: id,
      title,
      markDone,
      priority,
      dueDate,
    });

    return successResponse({ res, data: task });
  },
);

//get task by id
router.get(
  "/tasks/:id",
  authentication(),
  getTaskByIdLimiter,
  validate(getTaskByIdSchema),
  async (req, res, next) => {
    const { id } = req.params;
    const task = await getTaskById({ user: req.user, taskId: id });

    return successResponse({ res, data: task });
  },
);

//delete task
router.delete(
  "/tasks/:id",
  authentication(),
  authorization(TaskEndPoints.deleteTask),
  deleteTaskLimiter,
  validate(deleteTaskSchema),
  async (req, res, next) => {
    const { id } = req.params;
    await deleteTask({ taskId: id });

    return successResponse({ res });
  },
);

//export router
export default router;
