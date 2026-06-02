import { Schema, model } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    readAt: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.conversationId = ret.conversationId?.toString();
        ret.senderId = ret.senderId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const MessageModel = model("Message", messageSchema);
