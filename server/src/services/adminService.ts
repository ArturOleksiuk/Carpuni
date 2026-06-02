import { ComplaintModel, EventModel, PostModel, UserModel } from "../models/index.js";
import { EventStatus } from "../types.js";

export async function getAdminOverview() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    users,
    usersToday,
    posts,
    postsToday,
    events,
    activeEvents,
    activeComplaints,
    complaints,
    recentRegistrations
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ createdAt: { $gte: todayStart } }),
    PostModel.countDocuments(),
    PostModel.countDocuments({ createdAt: { $gte: todayStart } }),
    EventModel.countDocuments(),
    EventModel.countDocuments({ status: { $in: [EventStatus.Upcoming, EventStatus.Ongoing] } }),
    ComplaintModel.countDocuments({ status: "ACTIVE" }),
    ComplaintModel.find({ status: "ACTIVE" }).sort({ createdAt: -1 }),
    UserModel.find().sort({ createdAt: -1 }).limit(5)
  ]);

  return {
    stats: {
      users,
      usersToday,
      posts,
      postsToday,
      events,
      activeEvents,
      activeComplaints
    },
    complaints: complaints.map((complaint) => complaint.toJSON()),
    recentRegistrations: recentRegistrations.map((user) => user.toJSON())
  };
}

export async function resolveComplaint(complaintId: string, action: "delete" | "block" | "ignore") {
  const statusByAction = {
    delete: "DELETED",
    block: "BLOCKED",
    ignore: "IGNORED"
  } as const;

  const complaint = await ComplaintModel.findByIdAndUpdate(
    complaintId,
    { status: statusByAction[action] },
    { new: true }
  );

  if (!complaint) {
    throw new Error("Скаргу не знайдено");
  }

  return complaint.toJSON();
}
