import { Schema, model } from "mongoose";
import { PostType } from "../types.js";

const postSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: Object.values(PostType), required: true },
    mediaUrls: [{ type: String }],
    hashtags: [{ type: String }],
    parentPostId: { type: Schema.Types.ObjectId, ref: "Post" },
    likedUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    repostsCount: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.likesCount = ret.likedUserIds?.length ?? 0;
        ret.authorId = ret.authorId?.toString();
        ret.parentPostId = ret.parentPostId?.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.likedUserIds;
        return ret;
      }
    }
  }
);

export const PostModel = model("Post", postSchema);
