import { EventStatus, IEvent, IPost, ISchedule, IUser, PostType, UserRole, WhitelistRecord } from "../types.js";

export const whitelist: WhitelistRecord[] = [
  {
    email: "i.petrenko@pnu.edu.ua",
    role: UserRole.Student,
    faculty: "ФМІ",
    group: "КН-21",
    displayName: "Іван Петренко"
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

export const users: IUser[] = [
  {
    id: "user-ivan",
    email: "i.petrenko@pnu.edu.ua",
    username: "i.petrenko",
    displayName: "Іван Петренко",
    role: UserRole.Student,
    faculty: "ФМІ",
    group: "КН-21",
    followersCount: 118,
    followingCount: 74,
    isActive: true,
    createdAt: "2026-05-19T08:00:00.000Z"
  },
  {
    id: "user-kovalenko",
    email: "m.kovalenko@pnu.edu.ua",
    username: "kovalenko",
    displayName: "Проф. Коваленко М.",
    role: UserRole.Teacher,
    faculty: "ФМІ",
    followersCount: 342,
    followingCount: 21,
    isActive: true,
    createdAt: "2026-04-20T08:00:00.000Z"
  },
  {
    id: "user-admin",
    email: "admin@pnu.edu.ua",
    username: "admin",
    displayName: "Адміністратор",
    role: UserRole.Admin,
    faculty: "Адміністрація",
    followersCount: 0,
    followingCount: 0,
    isActive: true,
    createdAt: "2026-04-01T08:00:00.000Z"
  }
];

export const posts: IPost[] = [
  {
    id: "post-1",
    authorId: "user-ivan",
    content: "Хто здає КПЗ з Web-технологій завтра? Діліться конспектами",
    type: PostType.Text,
    hashtags: ["Web", "КН21", "КПЗ"],
    likesCount: 34,
    repostsCount: 8,
    createdAt: "2026-06-02T09:40:00.000Z"
  },
  {
    id: "post-2",
    authorId: "user-kovalenko",
    content: "Захист лаб. роботи №3 — п'ятниця о 10:00, ауд. 211",
    type: PostType.Text,
    hashtags: ["Лабораторна", "ФМІ"],
    likesCount: 47,
    repostsCount: 3,
    createdAt: "2026-06-01T12:15:00.000Z"
  }
];

export const events: IEvent[] = [
  {
    id: "event-1",
    title: "Хакатон Carpuni Hack 2026",
    description: "Командне змагання для студентів ФМІ.",
    organizerId: "user-kovalenko",
    location: "Студрада ФМІ, корпус A, ауд. 301",
    startDate: "2026-06-20T14:00:00.000Z",
    maxParticipants: 100,
    registeredCount: 67,
    registeredUserIds: ["user-ivan"],
    status: EventStatus.Upcoming,
    createdAt: "2026-05-29T08:00:00.000Z"
  },
  {
    id: "event-2",
    title: "Семінар ML у практиці",
    description: "Відкрита онлайн-зустріч про машинне навчання.",
    organizerId: "user-kovalenko",
    location: "Онлайн",
    startDate: "2026-06-25T16:00:00.000Z",
    maxParticipants: 50,
    registeredCount: 28,
    registeredUserIds: [],
    status: EventStatus.Upcoming,
    createdAt: "2026-05-30T09:00:00.000Z"
  }
];

export const schedules: ISchedule[] = [
  {
    id: "schedule-ivan",
    userId: "user-ivan",
    group: "КН-21",
    weekNumber: 10,
    updatedAt: "2026-06-02T08:00:00.000Z",
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
  }
];

export const complaints = [
  {
    id: "complaint-1",
    label: "Спам",
    author: "@user99",
    text: "Замовити реферат дешево...",
    createdAt: "2026-06-02T10:05:00.000Z"
  }
];
