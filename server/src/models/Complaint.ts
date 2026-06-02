import { Schema, model } from "mongoose";

const complaintSchema = new Schema(
  {
    label: { type: String, required: true },
    author: { type: String, required: true },
    text: { type: String, required: true },
    status: { type: String, enum: ["ACTIVE", "DELETED", "BLOCKED", "IGNORED"], default: "ACTIVE" }
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

export const ComplaintModel = model("Complaint", complaintSchema);
