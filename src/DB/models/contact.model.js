import mongoose from "mongoose";

import {
  ContactSourceEnum,
  ContactStatusEnum,
} from "../../common/enums/contact.enums.js";

const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: 3,
      maxLength: 100,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 100,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: [true, "email already exist"],
      required: true,
    },
    phone: String,
    company: {
      type: String,
      maxLength: 150,
    },
    jobTitle: String,
    status: {
      type: String,
      enum: Object.values(ContactStatusEnum),
      required: true,
    },
    source: {
      type: String,
      enum: Object.values(ContactSourceEnum),
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
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
contactSchema.index({ ownerId: 1 });
contactSchema.index({ status: 1 });

//export model
export const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);
