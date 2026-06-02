import { Schema, model } from "mongoose";
import { EventStatus } from "../types.js";

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, required: true },
    startDate: { type: Date, required: true },
    maxParticipants: { type: Number, required: true },
    registeredUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, enum: Object.values(EventStatus), default: EventStatus.Upcoming }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.organizerId = ret.organizerId?.toString();
        ret.registeredCount = ret.registeredUserIds?.length ?? 0;
        ret.registeredUserIds = ret.registeredUserIds?.map((id: unknown) => String(id)) ?? [];
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const EventModel = model("Event", eventSchema);
