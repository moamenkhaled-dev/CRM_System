import mongoose from "mongoose";
import { TaskPriorityEnum } from "../../common/enums/task.enums.js";
import { BadRequestException } from "../../common/utils/response/error.response.js";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxLength: 255,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      required: function () {
        return this.isCompleted == true;
      },
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriorityEnum),
      default: TaskPriorityEnum.Medium,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
    },
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    autoIndex: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//hooks
taskSchema.pre("save", function () {
  if (!this.contactId && !this.dealId) {
    return BadRequestException({
      code: "BAD_REQUEST",
      message: "you must pass contact or deal",
    });
  }
});

//indexes
taskSchema.index({
  dueDate: 1,
  priority: 1,
  isCompleted: 1,
  completedAt: 1,
});
taskSchema.index({ assignedTo: 1 });

//export model
export const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
