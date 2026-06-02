export enum UserRole {
  Student = "STUDENT",
  Teacher = "TEACHER",
  Moderator = "MODERATOR",
  Admin = "ADMIN"
}

export enum PostType {
  Text = "TEXT",
  Media = "MEDIA",
  EventRef = "EVENT_REF"
}

export enum EventStatus {
  Upcoming = "UPCOMING",
  Ongoing = "ONGOING",
  Finished = "FINISHED",
  Cancelled = "CANCELLED"
}

export interface IUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  faculty: string;
  group?: string;
  followersCount: number;
  followingCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface IPost {
  id: string;
  authorId: string;
  author?: IUser;
  content: string;
  type: PostType;
  mediaUrls?: string[];
  hashtags: string[];
  parentPostId?: string;
  likesCount: number;
  commentsCount?: number;
  repostsCount: number;
  viewerHasLiked?: boolean;
  viewerHasSaved?: boolean;
  createdAt: string;
}

export interface IEvent {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  location: string;
  startDate: string;
  maxParticipants: number;
  registeredCount: number;
  registeredUserIds: string[];
  status: EventStatus;
  createdAt: string;
}

export interface IPair {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  type: string;
  teacher: string;
}

export interface ISchedule {
  id: string;
  userId: string;
  group: string;
  weekNumber: number;
  pairs: IPair[];
  updatedAt: string;
}

export interface WhitelistRecord {
  email: string;
  role: UserRole;
  faculty: string;
  group?: string;
  displayName: string;
}

export interface AuthResult {
  token: string;
  user: IUser;
}
