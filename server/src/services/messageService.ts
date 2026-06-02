import { ConversationModel, MessageModel, NotificationModel } from "../models/index.js";

export async function getConversations(userId: string) {
  const conversations = await ConversationModel.find({ participantIds: userId }).sort({ lastMessageAt: -1 });
  return conversations.map((conversation) => conversation.toJSON());
}

export async function getMessages(conversationId: string) {
  const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 });
  return messages.map((message) => message.toJSON());
}

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  if (!text.trim()) {
    throw new Error("Повідомлення не може бути порожнім");
  }

  const conversation = await ConversationModel.findById(conversationId);
  if (!conversation) {
    throw new Error("Розмову не знайдено");
  }

  const message = await MessageModel.create({ conversationId, senderId, text });
  conversation.set("lastMessageAt", new Date());
  await conversation.save();

  const participantIds = (conversation.get("participantIds") as unknown[]).map(String);
  await Promise.all(
    participantIds
      .filter((participantId) => participantId !== senderId)
      .map((participantId) =>
        NotificationModel.create({
          userId: participantId,
          actorId: senderId,
          type: "MESSAGE",
          text: "Нове повідомлення",
          entityType: "MESSAGE",
          entityId: message._id
        })
      )
  );

  return message.toJSON();
}
