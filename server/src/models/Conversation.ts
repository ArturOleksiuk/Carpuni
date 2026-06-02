import { Schema, model } from "mongoose";

const conversationSchema = new Schema(
  {
    participantIds: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    lastMessageAt: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: any) {
        ret.id = ret._id.toString();
        ret.participantIds = ret.participantIds?.map((id: unknown) => String(id)) ?? [];
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

conversationSchema.index({ participantIds: 1 });

export const ConversationModel = model("Conversation", conversationSchema);
