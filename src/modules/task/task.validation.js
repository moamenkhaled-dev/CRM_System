import joi from "joi";

import { generalValidationFields } from "../../common/validation.js";
import { TaskPriorityEnum } from "../../common/enums/task.enums.js";

//create task schema
export const createTaskSchema = {
  body: joi
    .object()
    .keys({
      title: generalValidationFields.taskTitle.required(),
      dueDate: generalValidationFields.dueDate.required(),
      priority: generalValidationFields.priority.default(
        TaskPriorityEnum.Medium,
      ),
      contactId: generalValidationFields.id.when("dealId", {
        is: joi.exist(),
        then: joi.optional(),
        otherwise: joi.required(),
      }),
      dealId: generalValidationFields.id,
      assignedTo: generalValidationFields.id.required(),
    })
    .required(),
};

//tasks list schema
export const tasksListSchema = {
  query: joi
    .object()
    .keys({
      startDueDate: generalValidationFields.date,
      endDueDate: generalValidationFields.date,
      priority: generalValidationFields.priority,
      startCompletedDate: generalValidationFields.date,
      endCompletedDate: generalValidationFields.date,
      isCompleted: generalValidationFields.isCompleted,
    })
    .required(),
};

//get task by id schema
export const getTaskByIdSchema = {
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//delete task schema
export const deleteTaskSchema = {
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};

//update task schema
export const updateTaskSchema = {
  body: joi
    .object()
    .keys({
      markDone: joi.boolean().strict(false),
      priority: generalValidationFields.priority,
      dueDate: generalValidationFields.dueDate,
      title: generalValidationFields.title,
    })
    .min(1)
    .required(),
  params: joi
    .object()
    .keys({
      id: generalValidationFields.id.required(),
    })
    .required(),
};
