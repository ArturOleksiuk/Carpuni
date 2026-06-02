import { Schema, model } from "mongoose";
import { UserRole } from "../types.js";

const whitelistRecordSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
    faculty: { type: String, required: true },
    group: { type: String },
    displayName: { type: String, required: true },
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
        return ret;
      }
    }
  }
);

export const WhitelistRecordModel = model("WhitelistRecord", whitelistRecordSchema);
