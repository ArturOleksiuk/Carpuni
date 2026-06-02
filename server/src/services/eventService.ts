import { EventModel } from "../models/index.js";
import type { IEvent } from "../types.js";

export async function getEvents(filter = "all", userId?: string) {
  const today = new Date().toISOString().slice(0, 10);

  const eventDocs = await EventModel.find().sort({ startDate: 1 }).populate("organizerId");
  return eventDocs
    .filter((event) => {
      const json = event.toJSON() as unknown as IEvent;
      if (filter === "today") {
        return new Date(json.startDate).toISOString().slice(0, 10) === today;
      }
      if (filter === "mine" && userId) {
        return json.registeredUserIds.includes(userId);
      }
      return true;
    })
    .map((event) => ({
      ...(event.toJSON() as unknown as object),
      organizerId: String((event.get("organizerId") as { _id?: unknown })?._id ?? ""),
      organizer:
        typeof (event.get("organizerId") as { toJSON?: () => unknown } | null)?.toJSON === "function"
          ? (event.get("organizerId") as { toJSON: () => unknown }).toJSON()
          : undefined
    }));
}

export async function registerEvent(eventId: string, userId: string) {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new Error("Подію не знайдено");
  }

  const registeredUserIds = event.get("registeredUserIds") as unknown[];
  if (!registeredUserIds.some((id) => String(id) === userId)) {
    registeredUserIds.push(userId);
    event.set("registeredUserIds", registeredUserIds);
    await event.save();
  }
  return event.toJSON();
}

export async function cancelEventRegistration(eventId: string, userId: string) {
  const event = await EventModel.findById(eventId);
  if (!event) {
    throw new Error("Подію не знайдено");
  }

  const registeredUserIds = event.get("registeredUserIds") as unknown[];
  event.set(
    "registeredUserIds",
    registeredUserIds.filter((id) => String(id) !== userId)
  );
  await event.save();
  return event.toJSON();
}
