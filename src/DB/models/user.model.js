import mongoose from "mongoose";

import { RoleEnum } from "../../common/enums/index.js";
import { compare, hash } from "../../common/utils/security/index.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      maxLength: [150, "name can't be greater than 150 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [8, "password can't be less than 8 characters"],
      maxLength: [255, "password can't be greater than 255"],
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.Sales_Rep,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//hooks
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await hash({ plaintext: this.password });
});

//methods
userSchema.methods.comparePassword = async function (password) {
  return await compare({ plaintext: password, hashedText: this.password });
};

//toJSON
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;

    return ret;
  },
});

//toObject
userSchema.set("toObject", {
  transform: function (doc, ret) {
    delete ret.password;

    return ret;
  },
});

//export model
export const User = mongoose.models.User || mongoose.model("User", userSchema);
