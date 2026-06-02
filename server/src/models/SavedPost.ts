import { Schema, model } from "mongoose";

const savedPostSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.userId = ret.userId?.toString();
        ret.postId = ret.postId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

savedPostSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const SavedPostModel = model("SavedPost", savedPostSchema);
