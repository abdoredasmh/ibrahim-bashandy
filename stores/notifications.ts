// stores/notifications.ts
import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Database, Tables } from '~/types/database.types';

type NotificationWithState = Tables<'notifications'>;

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as NotificationWithState[],
    unreadCount: 0,
    isLoading: false,
    error: null as string | null,
    hasFetchedOnce: false,
    subscriptionChannel: null as RealtimeChannel | null,
    currentSubscribedUserId: null as string | null,
    _internalNotificationLimit: 30,
    _internalPublicNotificationDays: 10,
    _fixedChannelName: 'user_notifications_shared_channel',
  }),

  getters: {
    // Getters can be added here if needed
  },

  actions: {
    async fetchNotifications(userId: string) {
      if (this.isLoading) return;

      this.isLoading = true;
      this.error = null;
      const client = useSupabaseClient<Database>();

      try {
        // Cleanup old user notifications
        try {
          const { count: userNotificationsCount, error: countError } = await client
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

          if (countError) {
            console.error('NotificationStore: Error counting user notifications for cleanup:', countError.message);
          } else if (userNotificationsCount && userNotificationsCount > this._internalNotificationLimit) {
            const countToDelete = userNotificationsCount - this._internalNotificationLimit;
            const { data: idsToDelete, error: fetchIdsError } = await client
              .from('notifications')
              .select('id')
              .eq('user_id', userId)
              .order('created_at', { ascending: true })
              .limit(countToDelete);

            if (fetchIdsError) {
              console.error('NotificationStore: Error fetching old notification IDs for deletion:', fetchIdsError.message);
            } else if (idsToDelete && idsToDelete.length > 0) {
              const { error: deleteError } = await client
                .from('notifications')
                .delete()
                .in('id', idsToDelete.map(n => n.id));
              if (deleteError) console.error('NotificationStore: Error deleting old notifications:', deleteError.message);
              else console.log(`NotificationStore: Cleaned up ${idsToDelete.length} old notifications for user ${userId}.`);
            }
          }
        } catch (cleanupErr: any) {
          console.error('NotificationStore: Unexpected error during notification cleanup:', cleanupErr.message);
        }

        // Fetch notifications for display
        const publicNotificationCutoffDate = new Date();
        publicNotificationCutoffDate.setDate(publicNotificationCutoffDate.getDate() - this._internalPublicNotificationDays);
        const publicNotificationCutoffISOString = publicNotificationCutoffDate.toISOString();

        const userNotificationsPromise = client
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(this._internalNotificationLimit);

        const publicNotificationsPromise = client
          .from('notifications')
          .select('*')
          .is('user_id', null)
          .gte('created_at', publicNotificationCutoffISOString)
          .order('created_at', { ascending: false });

        const [
          { data: userData, error: userError },
          { data: publicData, error: publicError }
        ] = await Promise.all([userNotificationsPromise, publicNotificationsPromise]);

        if (userError) console.error('NotificationStore: Error fetching user notifications:', userError.message);
        if (publicError) console.error('NotificationStore: Error fetching public notifications:', publicError.message);
        if (userError && publicError) throw new Error("Failed to fetch both user and public notifications.");

        const combinedNotifications = [...(userData || []), ...(publicData || [])];
        combinedNotifications.sort((a, b) =>
          (b.created_at ? new Date(b.created_at).getTime() : 0) -
          (a.created_at ? new Date(a.created_at).getTime() : 0)
        );

        this.notifications = combinedNotifications;
        this.unreadCount = this.notifications.filter(n => !n.is_read).length;
        this.hasFetchedOnce = true;

      } catch (err: any) {
        console.error('NotificationStore: Failed to load notifications:', err.message);
        this.error = "فشل تحميل الإشعارات.";
      } finally {
        this.isLoading = false;
      }
    },

    async markAsRead(notificationId: number) {
      const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
      if (notificationIndex === -1 || this.notifications[notificationIndex].is_read) return;

      const originalState = this.notifications[notificationIndex].is_read;
      this.notifications[notificationIndex].is_read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);

      const client = useSupabaseClient<Database>();
      try {
        const { error } = await client.from('notifications').update({ is_read: true }).eq('id', notificationId);
        if (error) {
          console.error('NotificationStore: Error marking notification as read:', error.message);
          this.notifications[notificationIndex].is_read = originalState;
          this.unreadCount++;
        }
      } catch (err: any) {
        console.error('NotificationStore: Unexpected error marking notification as read:', err.message);
        this.notifications[notificationIndex].is_read = originalState;
        this.unreadCount++;
      }
    },

    async markAllAsRead(userId: string) {
      if (this.unreadCount === 0) return;
      const previouslyUnreadIds = this.notifications.filter(n => !n.is_read && n.user_id === userId).map(n => n.id);
      if (previouslyUnreadIds.length === 0) return;

      const oldUnreadCount = this.unreadCount;
      let actualReducedCount = 0;
      this.notifications.forEach(n => {
        if (previouslyUnreadIds.includes(n.id)) {
          n.is_read = true;
          actualReducedCount++;
        }
      });
      this.unreadCount = Math.max(0, this.unreadCount - actualReducedCount);

      const client = useSupabaseClient<Database>();
      try {
        const { error } = await client.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
        if (error) {
          console.error('NotificationStore: Error marking all notifications as read for user:', error.message);
          this.notifications.forEach(n => { if (previouslyUnreadIds.includes(n.id)) n.is_read = false; });
          this.unreadCount = oldUnreadCount;
        }
      } catch (err: any) {
        console.error('NotificationStore: Unexpected error marking all notifications as read for user:', err.message);
        this.notifications.forEach(n => { if (previouslyUnreadIds.includes(n.id)) n.is_read = false; });
        this.unreadCount = oldUnreadCount;
      }
    },

    subscribeToNotifications(userId: string) {
      // const client = useSupabaseClient<Database>(); // لا نحتاجه إذا تم تعليق الكود أدناه

      console.log(`NotificationStore: Setting active user for notifications to: ${userId}. Previous: ${this.currentSubscribedUserId}`);
      this.currentSubscribedUserId = userId;

      // ================================================================
      // === بداية التعليق: تم تعطيل اشتراك Realtime مؤقتًا للاختبار ===
      // ================================================================
      /*
      if (this.currentSubscribedUserId === userId && this.subscriptionChannel?.state === 'joined') {
          console.log(`NotificationStore: Already subscribed and processing notifications for user ${userId} on channel '${this._fixedChannelName}'.`);
          return;
      }

      if (!this.subscriptionChannel || this.subscriptionChannel.state !== 'joined') {
          if (this.subscriptionChannel) {
              console.log(`NotificationStore: Previous channel instance found (state: ${this.subscriptionChannel.state}). Attempting to remove it before creating a new one for '${this._fixedChannelName}'.`);
              client.removeChannel(this.subscriptionChannel);
          }

          console.log(`NotificationStore: Subscribing to shared channel '${this._fixedChannelName}' for all user notifications.`);
          const channel = client.channel(this._fixedChannelName);
          this.subscriptionChannel = channel;

          channel.on<Tables<'notifications'>>(
              'postgres_changes',
              {
                  event: 'INSERT',
                  schema: 'public',
                  table: 'notifications',
                  filter: `user_id=eq.${userId}`
              },
              (payload) => {
                  const newNotification = payload.new as NotificationWithState;
                  if (newNotification.user_id === this.currentSubscribedUserId) {
                      console.log(`NotificationStore: Notification (ID: ${newNotification.id}) is for current user ${this.currentSubscribedUserId}. Processing...`);
                      if (!this.notifications.some(n => n.id === newNotification.id)) {
                          this.notifications.unshift(newNotification);
                          const currentUserNotificationsInList = this.notifications.filter(n => n.user_id === this.currentSubscribedUserId);
                          if (currentUserNotificationsInList.length > this._internalNotificationLimit) {
                              const sortedCurrentUserNotifications = [...currentUserNotificationsInList].sort((a, b) =>
                                  (a.created_at ? new Date(a.created_at).getTime() : 0) -
                                  (b.created_at ? new Date(b.created_at).getTime() : 0)
                              );
                              const oldestNotificationToRemove = sortedCurrentUserNotifications[0];
                              const indexInMainArray = this.notifications.findIndex(n => n.id === oldestNotificationToRemove.id);
                              if (indexInMainArray !== -1) {
                                  this.notifications.splice(indexInMainArray, 1);
                                  console.log(`NotificationStore: Removed oldest notification (ID: ${oldestNotificationToRemove.id}) for user ${this.currentSubscribedUserId} from UI to maintain limit after realtime insert.`);
                              }
                          }
                          if (!newNotification.is_read) {
                              this.unreadCount++;
                          }
                      }
                  }
              }
          )
          .subscribe((status, err) => {
               if (status === 'SUBSCRIBED') {
                  console.log(`NotificationStore: Successfully subscribed to '${this._fixedChannelName}'. Processing for user ${this.currentSubscribedUserId}.`);
               } else if (status === 'CHANNEL_ERROR') {
                  console.error(`NotificationStore: Realtime channel error for '${this._fixedChannelName}':`, err);
                  this.error = "حدث خطأ في اتصال الإشعارات المباشرة.";
               } else if (status === 'TIMED_OUT') {
                   console.warn(`NotificationStore: Realtime subscription timed out for '${this._fixedChannelName}' for user ${this.currentSubscribedUserId}`);
               }
          });
      } else {
          console.log(`NotificationStore: Shared channel '${this._fixedChannelName}' is already active. Now processing for (new/same) user ${this.currentSubscribedUserId}.`);
      }
      */
      // ================================================================
      // === نهاية التعليق ===
      // ================================================================
      console.warn("<<<<< NotificationStore: Realtime subscription for notifications is TEMPORARILY DISABLED for testing. >>>>>");
    },

    unsubscribeFromNotifications() {
      const client = useSupabaseClient<Database>();
      if (this.subscriptionChannel) {
        const channelToUnsubscribe = this.subscriptionChannel;
        const channelName = channelToUnsubscribe.topic;
        console.log(`NotificationStore: Unsubscribing from channel '${channelName}'. Current user context was ${this.currentSubscribedUserId || 'none'}.`);
        channelToUnsubscribe.unsubscribe()
          .then((status: string) => console.log(`NotificationStore: Unsubscribe status from '${channelName}': ${status}`))
          .catch((err: Error) => console.error(`NotificationStore: Unsubscribe error from '${channelName}':`, err))
          .finally(() => {
            console.log(`NotificationStore: Removing channel '${channelName}' from client.`);
            client.removeChannel(channelToUnsubscribe)
              .then(removeStatus => console.log(`NotificationStore: removeChannel '${channelName}' status:`, removeStatus))
              .catch(removeErr => console.error(`NotificationStore: removeChannel '${channelName}' error:`, removeErr));
            if (this.subscriptionChannel === channelToUnsubscribe) this.subscriptionChannel = null;
            // لا تقم بتصفير this.currentSubscribedUserId هنا بالضرورة، فقد يتم استدعاء subscribeToNotifications لمستخدم آخر مباشرة
            // سيتم تحديثه في بداية subscribeToNotifications
          });
      } else {
        console.log('NotificationStore: No active shared subscription channel to unsubscribe from.');
      }
       // قم بتصفير المستخدم الحالي المشترك فيه عند إلغاء الاشتراك بشكل عام
       // أو اتركه ليتم التعامل معه بواسطة clearNotifications أو عند الاشتراك لمستخدم جديد
       // this.currentSubscribedUserId = null;
    },

    clearNotifications() {
      console.log('NotificationStore: Clearing notifications state and unsubscribing from any active channel.');
      this.unsubscribeFromNotifications();
      this.notifications = [];
      this.unreadCount = 0;
      this.isLoading = false;
      this.error = null;
      this.hasFetchedOnce = false;
      this.currentSubscribedUserId = null; // تأكد من تصفيره هنا
    }
  }
});