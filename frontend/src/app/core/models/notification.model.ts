export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: AppNotification[];
  unreadCount: number;
}
