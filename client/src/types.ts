export enum UserRole {
  Student = "STUDENT",
  Teacher = "TEACHER",
  Moderator = "MODERATOR",
  Admin = "ADMIN"
}

export enum EventStatus {
  Upcoming = "UPCOMING",
  Ongoing = "ONGOING",
  Finished = "FINISHED",
  Cancelled = "CANCELLED"
}

export interface User {
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

export interface Post {
  id: string;
  authorId: string;
  author?: User;
  content: string;
  hashtags: string[];
  likesCount: number;
  commentsCount?: number;
  repostsCount: number;
  viewerHasLiked?: boolean;
  viewerHasSaved?: boolean;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  author?: User;
  content: string;
  parentCommentId?: string;
  likesCount: number;
  isDeleted: boolean;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizer?: User;
  location: string;
  startDate: string;
  maxParticipants: number;
  registeredCount: number;
  registeredUserIds: string[];
  status: EventStatus;
}

export interface Pair {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
  type: string;
  teacher: string;
}

export interface Schedule {
  id: string;
  userId: string;
  group: string;
  weekNumber: number;
  pairs: Pair[];
  updatedAt: string;
}

export interface AdminOverview {
  stats: {
    users: number;
    usersToday: number;
    posts: number;
    postsToday: number;
    events: number;
    activeEvents: number;
    activeComplaints: number;
  };
  complaints: Array<{
    id: string;
    label: string;
    author: string;
    text: string;
    createdAt: string;
  }>;
  recentRegistrations: User[];
}

export interface Notification {
  id: string;
  userId: string;
  actorId?: string;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "EVENT" | "MESSAGE" | "SYSTEM";
  text: string;
  entityType: "POST" | "COMMENT" | "EVENT" | "USER" | "MESSAGE" | "SYSTEM";
  entityId?: string;
  readAt?: string;
  createdAt: string;
}

export interface SuggestedUser extends User {
  viewerIsFollowing: boolean;
}

export interface ProfileUser extends User {
  viewerIsFollowing: boolean;
}
