import bcrypt from "bcryptjs";
import {
  CommentModel,
  ComplaintModel,
  ConversationModel,
  EventModel,
  FollowModel,
  MessageModel,
  NotificationModel,
  PostModel,
  SavedPostModel,
  ScheduleModel,
  UserModel,
  WhitelistRecordModel
} from "../models/index.js";
import { EventStatus, PostType, UserRole } from "../types.js";

const demoPassword = "password";

export async function seedDatabase() {
  await seedWhitelist();

  const existingUsers = await UserModel.countDocuments();
  if (existingUsers > 0) {
    await seedSocialCollections();
    return;
  }

  const passwordHash = await bcrypt.hash(demoPassword, 10);

  const [ivan, artur, kovalenko, admin] = await UserModel.create([
    {
      email: "i.petrenko@pnu.edu.ua",
      username: "i.petrenko",
      displayName: "Іван Петренко",
      passwordHash,
      role: UserRole.Student,
      faculty: "ФМІ",
      group: "КН-21",
      followersCount: 118,
      followingCount: 74,
      isActive: true
    },
    {
      email: "a.oleksiuk@pnu.edu.ua",
      username: "a.oleksiuk",
      displayName: "Артур Олексюк",
      passwordHash,
      role: UserRole.Student,
      faculty: "ФМІ",
      group: "КН-42",
      followersCount: 118,
      followingCount: 74,
      isActive: true
    },
    {
      email: "m.kovalenko@pnu.edu.ua",
      username: "kovalenko",
      displayName: "Проф. Коваленко М.",
      passwordHash,
      role: UserRole.Teacher,
      faculty: "ФМІ",
      followersCount: 342,
      followingCount: 21,
      isActive: true
    },
    {
      email: "admin@pnu.edu.ua",
      username: "admin",
      displayName: "Адміністратор",
      passwordHash,
      role: UserRole.Admin,
      faculty: "Адміністрація",
      isActive: true
    }
  ]);

  await PostModel.create([
    {
      authorId: ivan._id,
      content: "Хто здає КПЗ з Web-технологій завтра? Діліться конспектами #Web #КН21",
      type: PostType.Text,
      hashtags: ["Web", "КН21"],
      likedUserIds: [kovalenko._id],
      repostsCount: 8
    },
    {
      authorId: kovalenko._id,
      content: "Захист лаб. роботи №3 — п'ятниця о 10:00, ауд. 211 #ФМІ",
      type: PostType.Text,
      hashtags: ["ФМІ"],
      likedUserIds: [ivan._id],
      repostsCount: 3
    }
  ]);

  await EventModel.create([
    {
      title: "Хакатон Carpuni Hack 2026",
      description: "Командне змагання для студентів ФМІ.",
      organizerId: kovalenko._id,
      location: "Студрада ФМІ, корпус A, ауд. 301",
      startDate: new Date("2026-06-20T14:00:00.000Z"),
      maxParticipants: 100,
      registeredUserIds: [ivan._id],
      status: EventStatus.Upcoming
    },
    {
      title: "Семінар ML у практиці",
      description: "Відкрита онлайн-зустріч про машинне навчання.",
      organizerId: kovalenko._id,
      location: "Онлайн",
      startDate: new Date("2026-06-25T16:00:00.000Z"),
      maxParticipants: 50,
      registeredUserIds: [],
      status: EventStatus.Upcoming
    }
  ]);

  await ScheduleModel.create({
    userId: ivan._id,
    group: "КН-21",
    weekNumber: 10,
    pairs: [
      {
        dayOfWeek: 3,
        startTime: "08:30",
        endTime: "10:05",
        subject: "Бази даних",
        room: "ауд. 105",
        type: "Лекція",
        teacher: "Проф. Мельник О.В."
      },
      {
        dayOfWeek: 3,
        startTime: "10:20",
        endTime: "11:55",
        subject: "Web-технології",
        room: "ауд. 311",
        type: "Практична",
        teacher: "Доц. Коваль М.І."
      },
      {
        dayOfWeek: 3,
        startTime: "13:10",
        endTime: "14:45",
        subject: "Математичний аналіз",
        room: "ауд. 201",
        type: "Семінар",
        teacher: "Доц. Бойко Л.С."
      }
    ]
  });

  await ComplaintModel.create({
    label: "Спам",
    author: "@user99",
    text: "Замовити реферат дешево..."
  });

  await seedSocialCollections();

  console.log("MongoDB seeded with demo Carpuni data");
}

async function seedWhitelist() {
  const records = [
    {
      email: "i.petrenko@pnu.edu.ua",
      role: UserRole.Student,
      faculty: "ФМІ",
      group: "КН-21",
      displayName: "Іван Петренко"
    },
    {
      email: "a.oleksiuk@pnu.edu.ua",
      displayName: "Артур Олексюк",
      role: UserRole.Student,
      faculty: "ФМІ",
      group: "КН-42",
    },
    {
      email: "m.kovalenko@pnu.edu.ua",
      role: UserRole.Teacher,
      faculty: "ФМІ",
      displayName: "Марія Коваленко"
    },
    {
      email: "admin@pnu.edu.ua",
      role: UserRole.Admin,
      faculty: "Адміністрація",
      displayName: "Адміністратор"
    }
  ];

  await Promise.all(
    records.map((record) =>
      WhitelistRecordModel.updateOne({ email: record.email }, { $setOnInsert: record }, { upsert: true })
    )
  );
}

async function seedSocialCollections() {
  const [ivan, kovalenko] = await Promise.all([
    UserModel.findOne({ email: "i.petrenko@pnu.edu.ua" }),
    UserModel.findOne({ email: "m.kovalenko@pnu.edu.ua" })
  ]);

  if (!ivan || !kovalenko) {
    return;
  }

  const firstPost = await PostModel.findOne({ authorId: ivan._id });
  if (firstPost && (await CommentModel.countDocuments()) === 0) {
    await CommentModel.create({
      postId: firstPost._id,
      authorId: kovalenko._id,
      content: "Занесіть питання у спільний документ, обговоримо на практичній."
    });
  }

  if ((await FollowModel.countDocuments()) === 0) {
    await FollowModel.create({ followerId: ivan._id, followingId: kovalenko._id });
  }
  await syncFollowCounters();

  if (firstPost) {
    await SavedPostModel.updateOne(
      { userId: ivan._id, postId: firstPost._id },
      { $setOnInsert: { userId: ivan._id, postId: firstPost._id } },
      { upsert: true }
    );
  }

  if ((await NotificationModel.countDocuments()) === 0) {
    await NotificationModel.create({
      userId: ivan._id,
      actorId: kovalenko._id,
      type: "COMMENT",
      text: "Проф. Коваленко М. відповіла на ваш пост",
      entityType: "POST",
      entityId: firstPost?._id
    });
  }

  if ((await ConversationModel.countDocuments()) === 0) {
    const conversation = await ConversationModel.create({
      participantIds: [ivan._id, kovalenko._id],
      lastMessageAt: new Date()
    });

    await MessageModel.create({
      conversationId: conversation._id,
      senderId: kovalenko._id,
      text: "Іване, перевірте, будь ласка, дедлайн по лабораторній."
    });
  }
}

async function syncFollowCounters() {
  const users = await UserModel.find();
  await Promise.all(
    users.map(async (user) => {
      const [followersCount, followingCount] = await Promise.all([
        FollowModel.countDocuments({ followingId: user._id }),
        FollowModel.countDocuments({ followerId: user._id })
      ]);

      await UserModel.updateOne({ _id: user._id }, { followersCount, followingCount });
    })
  );
}
