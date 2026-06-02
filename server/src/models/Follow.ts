import { Schema, model } from "mongoose";

const followSchema = new Schema(
  {
    followerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    followingId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.followerId = ret.followerId?.toString();
        ret.followingId = ret.followingId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const FollowModel = model("Follow", followSchema);
