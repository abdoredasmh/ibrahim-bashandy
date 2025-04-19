// stores/notifications.ts
import { defineStore } from 'pinia';
import { useSupabaseClient } from '#imports';
import type { Database, Tables } from '~/types/database.types';

// تعريف نوع الإشعار
// لا نحتاج isUpdating هنا حاليًا، لكن يمكن إضافته إذا احتجت حالة تحميل لكل إشعار
type NotificationWithState = Tables<'notifications'>;

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as NotificationWithState[], // قائمة الإشعارات النهائية المعروضة
    unreadCount: 0,                         // عدد الإشعارات غير المقروءة
    isLoading: false,                       // هل يتم جلب الإشعارات حاليًا؟
    error: null as string | null,           // رسالة الخطأ إن وجدت
    hasFetchedOnce: false,                  // هل تم الجلب مرة واحدة على الأقل؟
    subscriptionChannel: null as any,       // لتخزين قناة Realtime للمستخدم
    _internalNotificationLimit: 30, // حد الإشعارات الخاصة بالمستخدم للعرض والحذف
    _internalPublicNotificationDays: 10, // حد أيام الإشعارات العامة
  }),

  getters: {
    // يمكنك إضافة getters أخرى إذا احتجت
  },

  actions: {
    // --- دالة جلب الإشعارات (معدلة) ---
    async fetchNotifications(userId: string) {
      if (this.isLoading) return; // منع الجلب المتعدد

      this.isLoading = true;
      this.error = null;
      const client = useSupabaseClient<Database>();

      try {
        // --- الخطوة 1: تنظيف الإشعارات القديمة للمستخدم (قبل الجلب) ---
        // هذا يضمن أن قاعدة البيانات لا تحتوي على أكثر من الحد المسموح به للمستخدم
        try {
          const { count: userNotificationsCount, error: countError } = await client
            .from('notifications')
            .select('id', { count: 'exact', head: true }) // فقط نحتاج العدد
            .eq('user_id', userId);

          if (countError) {
            
            // لا نوقف العملية الرئيسية هنا، لكن نسجل الخطأ
          } else if (userNotificationsCount && userNotificationsCount > this._internalNotificationLimit) {
            const limit = this._internalNotificationLimit;
            const countToDelete = userNotificationsCount - limit;

            // جلب IDs أقدم الإشعارات التي تتجاوز الحد للمستخدم
            const { data: idsToDelete, error: fetchIdsError } = await client
              .from('notifications')
              .select('id')
              .eq('user_id', userId)
              .order('created_at', { ascending: true }) // الأقدم أولاً
              .limit(countToDelete);

            if (fetchIdsError) {
              
            } else if (idsToDelete && idsToDelete.length > 0) {
              // تنفيذ الحذف
              const { error: deleteError } = await client
                .from('notifications')
                .delete()
                .in('id', idsToDelete.map(n => n.id));

              if (deleteError) {
                
              } else {
                
              }
            }
          }
        } catch (cleanupErr: any) {
          // التقاط أي أخطاء غير متوقعة أثناء التنظيف
          
        }
        // --- نهاية خطوة التنظيف ---


        // --- الخطوة 2: جلب الإشعارات المطلوبة للعرض ---

        // حساب التاريخ قبل X أيام للإشعارات العامة
        const publicNotificationCutoffDate = new Date();
        publicNotificationCutoffDate.setDate(publicNotificationCutoffDate.getDate() - this._internalPublicNotificationDays);
        const publicNotificationCutoffISOString = publicNotificationCutoffDate.toISOString();

        // جلب أحدث 'limit' إشعار للمستخدم
        const userNotificationsPromise = client
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(this._internalNotificationLimit);

        // جلب الإشعارات العامة الأحدث من التاريخ المحدد
        const publicNotificationsPromise = client
          .from('notifications')
          .select('*')
          .is('user_id', null) // الإشعارات العامة
          .gte('created_at', publicNotificationCutoffISOString) // أحدث من التاريخ المحدد
          .order('created_at', { ascending: false }); // الأحدث أولاً (للاتساق)

        // تنفيذ الاستعلامين بالتوازي
        const [
          { data: userData, error: userError },
          { data: publicData, error: publicError }
        ] = await Promise.all([userNotificationsPromise, publicNotificationsPromise]);

        // التعامل مع الأخطاء المحتملة في الجلب
        if (userError) {
           
           // يمكنك اختيار إظهار خطأ جزئي
        }
        if (publicError) {
           
           // يمكنك اختيار إظهار خطأ جزئي
        }

        // إذا فشل كلا الاستعلامين، أظهر خطأ عام
        if (userError && publicError) {
             throw new Error("Failed to fetch both user and public notifications.");
        }

        // دمج النتائج (تأكد من أنها ليست null أو undefined)
        const combinedNotifications = [
            ...(userData || []),
            ...(publicData || [])
        ];

        // فرز القائمة المدمجة حسب تاريخ الإنشاء (الأحدث أولاً)
        // معالجة حالة created_at قد يكون null
        combinedNotifications.sort((a, b) => {
            // إذا كان created_at هو null، اعتبره أقدم تاريخ ممكن (0)
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            // الفرز التنازلي (الأحدث أولاً)
            return timeB - timeA;
        });

        // تحديث الحالة
        this.notifications = combinedNotifications;
        this.unreadCount = this.notifications.filter(n => !n.is_read).length;
        this.hasFetchedOnce = true;

      } catch (err: any) {
        
        this.error = "فشل تحميل الإشعارات.";
        // يمكن اختيار عدم مسح الإشعارات الحالية عند حدوث خطأ مؤقت
        // this.notifications = [];
        // this.unreadCount = 0;
      } finally {
        this.isLoading = false;
      }
    },

    // --- دالة تعليم إشعار كمقروء (بدون تغيير جوهري) ---
    async markAsRead(notificationId: number) {
        const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);

        if (notificationIndex === -1 || this.notifications[notificationIndex].is_read) {
            // الإشعار غير موجود أو مقروء بالفعل
            return;
        }

        // Optimistic Update
        const originalState = this.notifications[notificationIndex].is_read;
        this.notifications[notificationIndex].is_read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);

        const client = useSupabaseClient<Database>();
        try {
            const { error } = await client
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) {
                
                // Rollback Optimistic Update
                this.notifications[notificationIndex].is_read = originalState;
                this.unreadCount++;
                // TODO: Show error to user
            }
        } catch (err: any) {
            
            // Rollback on unexpected errors too
            this.notifications[notificationIndex].is_read = originalState;
            this.unreadCount++;
             // TODO: Show error to user
        }
    },

    // --- دالة تعليم كل الإشعارات كمقروءة (بدون تغيير جوهري) ---
    async markAllAsRead(userId: string) {
       if (this.unreadCount === 0) return;

       // Optimistic Update
       const previouslyUnreadIds = this.notifications
            .filter(n => !n.is_read && n.user_id === userId) // تأكد من تحديث إشعارات المستخدم فقط
            .map(n => n.id);
       if(previouslyUnreadIds.length === 0) return; // لا يوجد شيء لتحديثه لهذا المستخدم

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
           const { error } = await client
               .from('notifications')
               .update({ is_read: true })
               .eq('user_id', userId) // تحديث الخاص بالمستخدم فقط
               .eq('is_read', false); // فقط غير المقروءة

           if (error) {
               
               // Rollback Optimistic Update
               this.notifications.forEach(n => {
                   if (previouslyUnreadIds.includes(n.id)) {
                       n.is_read = false;
                   }
               });
               this.unreadCount = oldUnreadCount; // استعادة العدد الأصلي
               // TODO: Show error to user
           }
       } catch (err: any) {
           
           // Rollback on unexpected errors too
           this.notifications.forEach(n => { if (previouslyUnreadIds.includes(n.id)) n.is_read = false; });
           this.unreadCount = oldUnreadCount;
            // TODO: Show error to user
       }
    },

    // --- إعداد Realtime (لإشعارات المستخدم فقط) ---
    subscribeToNotifications(userId: string) {
        if (this.subscriptionChannel) {
            
            return;
        }

        
        const client = useSupabaseClient<Database>();
        this.subscriptionChannel = client
            .channel(`public:notifications:user_id=eq.${userId}`) // قناة خاصة بإشعارات هذا المستخدم
            .on<Tables<'notifications'>>( // تحديد النوع يساعد TypeScript
                'postgres_changes',
                {
                    event: 'INSERT', // الاستماع لإضافة سجلات جديدة فقط
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}` // فلتر إضافي للتأكيد (جيد)
                },
                (payload) => {
                    
                    const newNotification = payload.new as NotificationWithState;

                    // التأكد من عدم وجود الإشعار بالفعل (لتجنب التكرار مع الجلب الأولي)
                     if (!this.notifications.some(n => n.id === newNotification.id)) {
                        // إضافة الإشعار الجديد في بداية القائمة (تجربة مستخدم شائعة)
                        this.notifications.unshift(newNotification);

                        // --- إدارة الحد الأقصى في الواجهة (اختياري) ---
                        // إذا أردت تطبيق الحد الأقصى (30) بشكل صارم حتى مع Realtime
                        const userNotificationsInList = this.notifications.filter(n => n.user_id === userId);
                        if (userNotificationsInList.length > this._internalNotificationLimit) {
                            // ابحث عن أقدم إشعار للمستخدم في القائمة الحالية واحذفه
                            let oldestUserIndex = -1;
                            let oldestTime = Infinity;
                            for (let i = 0; i < this.notifications.length; i++) {
                                if (this.notifications[i].user_id === userId) {
                                    const time = this.notifications[i].created_at ? new Date(this.notifications[i].created_at!).getTime() : 0;
                                    if (time < oldestTime) {
                                        oldestTime = time;
                                        oldestUserIndex = i;
                                    }
                                }
                            }
                            if (oldestUserIndex !== -1) {
                                this.notifications.splice(oldestUserIndex, 1);
                            }
                        }
                         // -------------------------------------------


                        // زيادة العدد غير المقروء إذا كان الإشعار جديدًا وغير مقروء
                        if (!newNotification.is_read) {
                            this.unreadCount++;
                        }

                        // إعادة فرز القائمة للحفاظ على الترتيب الصحيح تمامًا (بديل لـ unshift)
                        // قد يكون أكثر دقة ولكنه قد يسبب "قفزة" إذا كان المستخدم ينظر إلى القائمة
                        // this.notifications.sort((a, b) => ... نفس دالة الفرز المستخدمة في fetch ... );

                        // TODO: يمكنك هنا إظهار إشعار Toast للمستخدم
                        // مثال: useToast().add({ title: 'إشعار جديد!', description: newNotification.message });
                    }
                }
            )
            .subscribe((status, err) => {
                 if (status === 'SUBSCRIBED') {
                    
                 } else if (status === 'CHANNEL_ERROR') {
                    
                    this.error = "حدث خطأ في اتصال الإشعارات المباشرة.";
                 } else if (status === 'TIMED_OUT') {
                     
                 } else {
                    
                 }
            });
    },

    // --- إلغاء اشتراك Realtime ---
    unsubscribeFromNotifications() {
        if (this.subscriptionChannel) {
            
            this.subscriptionChannel.unsubscribe()
                .then((status: string) => console.log('Unsubscribe status:', status))
                .catch((err: Error) => console.error('Unsubscribe error:', err))
                .finally(() => {
                    this.subscriptionChannel = null;
                });
        }
    },

     // --- دالة لمسح الحالة عند تسجيل الخروج ---
     clearNotifications() {
        
        this.unsubscribeFromNotifications(); // أولاً إلغاء الاشتراك
        this.notifications = [];
        this.unreadCount = 0;
        this.isLoading = false;
        this.error = null;
        this.hasFetchedOnce = false;
     }

  }
});