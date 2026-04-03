import mongoose from "mongoose";
import { DealStageEnum } from "../../common/enums/deal.enums.js";

const dealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      maxLength: [200, "title can't exceed 200 characters"],
      required: [true, "title is required"],
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      require: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    stage: {
      type: String,
      enum: Object.values(DealStageEnum),
      required: [true, "stage is required"],
    },
    value: Number,
    currency: {
      type: String,
      minLength: 3,
      maxLength: 3,
      uppercase: true,
      default: "USD",
    },
    expectedCloseDate: Date,
    probability: {
      type: Number,
      min: 0,
      max: 100,
    },
    lostReason: {
      type: String,
      required: function () {
        return this.stage == DealStageEnum.Lost;
      },
    },
    description: String,
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
dealSchema.index({ ownerId: 1 });
dealSchema.index({ title: 1 });
dealSchema.index({ stage: 1 });

//export model
export const Deal = mongoose.models.Deal || mongoose.model("Deal", dealSchema);
