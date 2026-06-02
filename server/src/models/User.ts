import { Schema, model } from "mongoose";
import { UserRole } from "../types.js";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    displayName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    faculty: { type: String, required: true },
    group: { type: String },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      }
    }
  }
);

export const UserModel = model("User", userSchema);
