// middleware/admin.ts
import { useUserStore } from '~/stores/user'; // تأكد من المسار الصحيح
import { storeToRefs } from 'pinia'; // نحتاج storeToRefs لجعل isFetchingProfile تفاعلية للمراقب
import { watch } from 'vue'; // استيراد watch

export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser();

  // 1. التحقق من تسجيل الدخول
  if (!user.value) {
    console.log('[Admin Middleware] No user logged in, redirecting to login.');
    return navigateTo('/login', { replace: true });
  }

  const userStore = useUserStore();
  // استخدم storeToRefs للحصول على refs تفاعلية للحالة
  const { profile, isFetchingProfile } = storeToRefs(userStore);

  // 2. التحقق من تحميل البروفايل والانتظار إذا لزم الأمر
  // إذا لم يكن البروفايل موجوداً وكان الجلب جارياً، انتظر
  if (!profile.value && isFetchingProfile.value) {
    console.log('[Admin Middleware] Profile fetch in progress, waiting...');
    try {
        await new Promise<void>((resolve, reject) => {
            // مراقبة isFetchingProfile
            const unwatch = watch(isFetchingProfile, (newValue) => {
            if (!newValue) { // عندما ينتهي الجلب
                console.log('[Admin Middleware] Profile fetch finished, proceeding check.');
                unwatch(); // أوقف المراقبة
                resolve();   // أكمل الـ Promise
            }
            });

            // إضافة مهلة زمنية (اختياري ولكن موصى به) لمنع الانتظار اللانهائي
            const timeoutId = setTimeout(() => {
                console.warn('[Admin Middleware] Waiting for profile timed out.');
                unwatch(); // أوقف المراقبة عند انتهاء المهلة
                reject(new Error('Profile fetch timed out')); // رفض الـ Promise
            }, 5000); // مثال: انتظر 5 ثوانٍ كحد أقصى

            // تنظيف المهلة إذا تم حل الـ Promise قبل انتهاء المهلة
             // (هذا الجزء غير ضروري مباشرة لأن reject/resolve يوقفان التنفيذ)
        });
    } catch (waitError: any) {
         console.error('[Admin Middleware] Error while waiting for profile:', waitError.message);
         // إذا فشل الانتظار (timeout)، تعامل معه كأن البروفايل غير متاح
          return navigateTo('/', { replace: true });
    }
  }

  // 3. التحقق من وجود البروفايل بعد الانتظار المحتمل
  // هذا الشرط سيلتقط الحالات التالية:
  // - الجلب لم يبدأ والبروفايل null (خطأ في الـ plugin؟)
  // - الجلب انتهى ولكن البروفايل ما زال null (المستخدم ليس له بروفايل أو خطأ في الجلب)
  // - الانتظار انتهى بسبب timeout والبروفايل ما زال null
  if (!profile.value) {
    console.error('[Admin Middleware] Profile data unavailable after wait/check.');
     // يمكنك إضافة تحقق من fetchProfileError هنا لعرض رسالة أدق
     if (userStore.fetchProfileError) {
        console.error('[Admin Middleware] Profile fetch error was:', userStore.fetchProfileError);
     }
    return navigateTo('/', { replace: true }); // توجيه للصفحة الرئيسية
  }

  // 4. التحقق من دور المستخدم
  if (profile.value.role !== 'admin') {
    console.warn(`[Admin Middleware] User role is '${profile.value.role}', access denied.`);
    return navigateTo('/', { replace: true });
  }

  // 5. السماح بالمرور للمشرف
  console.log('[Admin Middleware] Admin access granted.');
  // لا حاجة لـ return هنا، سيستمر التنقل تلقائياً
});