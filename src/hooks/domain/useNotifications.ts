import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService, type Notification } from "@/services/notifications";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const QUERY_KEY = ["notifications"];

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const { data: unreadCount = 0, refetch: refetchUnreadCount } = useQuery({
    queryKey: [...QUERY_KEY, "unreadCount", userId],
    queryFn: () => (userId ? notificationsService.getUnreadCount(userId) : 0),
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: [...QUERY_KEY, "list", userId],
    queryFn: () => (userId ? notificationsService.getNotifications(userId, 10) : []),
    enabled: !!userId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, "unreadCount"] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, "list"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: (userId: string) => notificationsService.markAllAsRead(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, "unreadCount"] });
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, "list"] });
      toast.success("Todas as notificações foram marcadas como lidas");
    },
  });

  const handleNewNotification = useCallback((notification: Notification) => {
    queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, "unreadCount"] });
    queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, "list"] });

    toast.info(notification.title, {
      description: notification.message,
      action: notification.link
        ? {
            label: "Ver",
            onClick: () => (window.location.href = notification.link!),
          }
        : undefined,
    });
  }, [queryClient]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = notificationsService.subscribeToNotifications(
      userId,
      handleNewNotification
    );

    return () => {
      unsubscribe();
    };
  }, [userId, handleNewNotification]);

  return {
    unreadCount,
    notifications,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: (userId: string) => markAllAsReadMutation.mutate(userId),
    refetchUnreadCount,
    refetchNotifications,
    isLoading: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
  };
};
