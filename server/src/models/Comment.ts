import { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    likedUserIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.postId = ret.postId?.toString();
        ret.authorId = ret.authorId?.toString();
        ret.parentCommentId = ret.parentCommentId?.toString();
        ret.likesCount = ret.likedUserIds?.length ?? 0;
        delete ret._id;
        delete ret.__v;
        delete ret.likedUserIds;
        return ret;
      }
    }
  }
);

export const CommentModel = model("Comment", commentSchema);
