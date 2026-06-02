import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["LIKE", "COMMENT", "FOLLOW", "EVENT", "MESSAGE", "SYSTEM"], required: true },
    text: { type: String, required: true },
    entityType: { type: String, enum: ["POST", "COMMENT", "EVENT", "USER", "MESSAGE", "SYSTEM"], required: true },
    entityId: { type: Schema.Types.ObjectId },
    readAt: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.userId = ret.userId?.toString();
        ret.actorId = ret.actorId?.toString();
        ret.entityId = ret.entityId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const NotificationModel = model("Notification", notificationSchema);
