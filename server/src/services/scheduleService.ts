import { ScheduleModel } from "../models/index.js";
import type { ISchedule } from "../types.js";

export async function getSchedule(userId: string) {
  return ((await ScheduleModel.findOne({ userId }))?.toJSON() as unknown as ISchedule | undefined) ?? null;
}

export async function getCurrentPair(userId: string, date = new Date()) {
  const schedule = await getSchedule(userId);
  if (!schedule) {
    return null;
  }

  const day = date.getDay();
  const currentMinutes = date.getHours() * 60 + date.getMinutes();

  return (
    schedule.pairs.find((pair) => {
      const [startHour, startMinute] = pair.startTime.split(":").map(Number);
      const [endHour, endMinute] = pair.endTime.split(":").map(Number);
      const start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;
      return pair.dayOfWeek === day && currentMinutes >= start && currentMinutes <= end;
    }) ?? null
  );
}
