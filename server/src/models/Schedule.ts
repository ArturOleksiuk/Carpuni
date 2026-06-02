import { Schema, model } from "mongoose";

const pairSchema = new Schema(
  {
    dayOfWeek: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    subject: { type: String, required: true },
    room: { type: String, required: true },
    type: { type: String, required: true },
    teacher: { type: String, required: true }
  },
  { _id: false }
);

const scheduleSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    group: { type: String, required: true },
    weekNumber: { type: Number, required: true },
    pairs: [pairSchema]
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.userId = ret.userId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const ScheduleModel = model("Schedule", scheduleSchema);
