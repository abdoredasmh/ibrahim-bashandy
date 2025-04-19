// stores/notifications.ts
import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import type { Database, Tables } from '~/types/database.types';
import { useUserStore } from './user'; // لاستخدام معرف المستخدم

// تعريف نوع الإشعار مع إضافة حالة الواجهة (اختياري)
type NotificationWithState = Tables<'notifications'> & { isUpdating?: boolean };

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as NotificationWithState[], // قائمة الإشعارات المحملة
    unreadCount: 0,                         // عدد الإشعارات غير المقروءة
    isLoading: false,                       // هل يتم جلب الإشعارات حاليًا؟
    error: null as string | null,           // رسالة الخطأ إن وجدت
    hasFetchedOnce: false,                  // هل تم الجلب مرة واحدة على الأقل؟
    subscriptionChannel: null as any,       // لتخزين قناة Realtime
  }),

  getters: {
    // يمكنك إضافة getters أخرى إذا احتجت (مثل أحدث إشعار)
  },

  actions: {
    // --- دالة جلب الإشعارات ---
    async fetchNotifications(userId: string, limit = 15) { // جلب آخر 15 افتراضيًا
      if (this.isLoading) return; // منع الجلب المتعدد
      
      this.isLoading = true;
      this.error = null;
      const client = useSupabaseClient<Database>();

      try {
        // جلب الإشعارات الخاصة بالمستخدم والإشعارات العامة (user_id is null)
        // مرتبة بالأحدث أولاً
        const { data, error, count } = await client
          .from('notifications')
          .select('*', { count: 'exact' }) // جلب العدد الإجمالي غير المقروء
          .or(`user_id.eq.${userId},user_id.is.null`) // للمستخدم أو عام
          .order('created_at', { ascending: false })
          .limit(limit); // تحديد العدد المطلوب

        if (error) throw error;

        this.notifications = data || [];

        // حساب العدد غير المقروء من البيانات المجلوبة
        this.unreadCount = this.notifications.filter(n => !n.is_read).length;
        // ملاحظة: الـ count من Supabase قد لا يكون دقيقًا للـ unread count إذا لم نفلتر بـ is_read=false في الاستعلام

        this.hasFetchedOnce = true;
        

      } catch (err: any) {

        this.error = "فشل تحميل الإشعارات.";
        this.notifications = [];
        this.unreadCount = 0;
      } finally {
        this.isLoading = false;
      }
    },

    // --- دالة تعليم إشعار كمقروء ---
    async markAsRead(notificationId: number) {
      const notification = this.notifications.find(n => n.id === notificationId);
      // تحديث الواجهة فورًا لتحسين التجربة (Optimistic Update)
      if (notification && !notification.is_read) {
        notification.is_read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1); // إنقاص العدد
      } else {
         // إذا كان مقروءًا بالفعل أو غير موجود في القائمة الحالية، لا تفعل شيئًا
         return;
      }

      const client = useSupabaseClient<Database>();
      try {
        const { error } = await client
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);
          // يمكنك إضافة .eq('user_id', userId) إذا كانت الإشعارات دائمًا خاصة بالمستخدم

        if (error) {

          // إعادة الحالة الأصلية في حالة الفشل (Rollback Optimistic Update)
          if (notification) {
            notification.is_read = false;
            this.unreadCount++;
          }
          // TODO: Show error notification
        } else {
             
        }
      } catch (err) {

         if (notification) { // Rollback on unexpected errors too
            notification.is_read = false;
            this.unreadCount++;
          }
         // TODO: Show error notification
      }
    },

    // --- دالة تعليم كل الإشعارات كمقروءة ---
    async markAllAsRead(userId: string) {
       if (this.unreadCount === 0) return; // لا تفعل شيئًا إذا لم يكن هناك إشعارات غير مقروءة

       // تحديث الواجهة فورًا
       const previouslyUnreadIds = this.notifications.filter(n => !n.is_read).map(n => n.id);
       this.notifications.forEach(n => { if (!n.is_read) n.is_read = true; });
       const oldUnreadCount = this.unreadCount;
       this.unreadCount = 0;

      const client = useSupabaseClient<Database>();
      try {
        const { error } = await client
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', userId) // تعليم الخاص بالمستخدم فقط
          .eq('is_read', false); // فقط غير المقروءة

        if (error) {

          // إعادة الحالة الأصلية في حالة الفشل
           this.notifications.forEach(n => { if (previouslyUnreadIds.includes(n.id)) n.is_read = false; });
           this.unreadCount = oldUnreadCount;
           // TODO: Show error notification
        } else {
             
        }
      } catch (err) {

         this.notifications.forEach(n => { if (previouslyUnreadIds.includes(n.id)) n.is_read = false; });
         this.unreadCount = oldUnreadCount;
         // TODO: Show error notification
      }
    },

    // --- (اختياري) إعداد Realtime ---
    subscribeToNotifications(userId: string) {
        // التأكد من عدم وجود اشتراك قائم
        if (this.subscriptionChannel) {
             
            return;
        }

        
        const client = useSupabaseClient<Database>();
        this.subscriptionChannel = client
            .channel(`public:notifications:user_id=eq.${userId}`) // قناة خاصة بإشعارات هذا المستخدم
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', // الاستماع لإضافة سجلات جديدة فقط
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}` // فلتر إضافي للتأكيد
                },
                (payload) => {
                    
                    const newNotification = payload.new as NotificationWithState;
                    // إضافة الإشعار الجديد في بداية القائمة
                    this.notifications.unshift(newNotification);
                    // زيادة العدد غير المقروء إذا كان الإشعار جديدًا وغير مقروء
                    if (!newNotification.is_read) {
                        this.unreadCount++;
                    }
                    // TODO: يمكنك هنا إظهار إشعار Toast للمستخدم
                    // this.showRealtimeNotificationToast(newNotification);
                }
            )
            .subscribe((status, err) => {
                 if (status === 'SUBSCRIBED') {
                    
                 }
                 if (status === 'CHANNEL_ERROR' || err) {

                 }
                  if (status === 'TIMED_OUT') {

                  }
            });
    },

    // --- (اختياري) إلغاء اشتراك Realtime ---
    unsubscribeFromNotifications() {
        if (this.subscriptionChannel) {
            
            this.subscriptionChannel.unsubscribe();
            this.subscriptionChannel = null;
        }
    },

     // --- دالة لمسح الحالة عند تسجيل الخروج ---
     clearNotifications() {
        this.unsubscribeFromNotifications(); // إلغاء الاشتراك
        this.notifications = [];
        this.unreadCount = 0;
        this.isLoading = false;
        this.error = null;
        this.hasFetchedOnce = false;
         
     }

  }
});