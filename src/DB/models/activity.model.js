import mongoose from "mongoose";
import {
  ActivityOutComeEnum,
  ActivityTypeEnum,
} from "../../common/enums/activity.enums.js";

const activitySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
    },
    type: {
      type: String,
      enum: Object.values(ActivityTypeEnum),
      required: true,
    },
    notes: {
      type: String,
      maxLength: 2000,
    },
    scheduledAt: {
      type: Date,
      required: function () {
        return (
          this.type == ActivityTypeEnum.Call ||
          this.type == ActivityTypeEnum.Meeting
        );
      },
    },
    duration: {
      type: Number,
      required: function () {
        return (
          this.type == ActivityTypeEnum.Call ||
          this.type == ActivityTypeEnum.Meeting
        );
      },
    },
    outcome: {
      type: String,
      enum: Object.values(ActivityOutComeEnum),
      required: true,
    },
    outcomeNote: {
      type: String,
      maxLength: 2000,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//indexes
activitySchema.index({ ownerId: 1, type: 1, outcome: 1 });
activitySchema.index({ contactId: 1 });
activitySchema.index({ scheduledAt: 1 });
activitySchema.index({ deletedAt: 1 });

//export model
export const Activity =
  mongoose.models.Activity || mongoose.model("Activity", activitySchema);
