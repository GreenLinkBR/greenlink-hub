export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  read: boolean;
  created_at: string;
  link?: string;
}

export const notificationsService = {
  async getUnreadCount(_userId: string): Promise<number> {
    return 0;
  },
  async getNotifications(_userId: string, _limit = 10): Promise<Notification[]> {
    return [];
  },
  async markAsRead(_notificationId: string): Promise<void> {},
  async markAllAsRead(_userId: string): Promise<void> {},
  subscribeToNotifications(_userId: string, _callback: (notification: Notification) => void) {
    return () => {};
  },
};
