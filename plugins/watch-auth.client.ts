// plugins/watch-auth.client.ts
import { defineNuxtPlugin } from '#app'
import { useUserStore } from '~/stores/user' // استورد المتجر
import { useSupabaseUser } from '#imports'     // استورد useSupabaseUser

// استدعاء مباشر للدالة watch لمراقبة المستخدم
function initializeAuthWatcher() {
  const userStore = useUserStore();
  const user = useSupabaseUser(); // احصل على المستخدم هنا

  console.log('Initializing Auth Watcher. Initial user:', user.value?.id); // للتصحيح

  watch(user, (newUser) => {
    console.log("Auth Watcher: Supabase user changed:", newUser?.id); // للتصحيح
    userStore.setSupabaseUser(newUser); // حدث المتجر
    if (newUser && (!userStore.profile || userStore.profile.id !== newUser.id)) {
      console.log("Auth Watcher: Fetching profile..."); // للتصحيح
      userStore.fetchProfile(); // جلب الملف الشخصي للمستخدم الجديد أو إذا لم يكن موجودًا
    }
  }, { immediate: true }); // immediate: true لتشغيله فورًا عند تحميل الـ plugin
}

export default defineNuxtPlugin(() => {
  initializeAuthWatcher(); // شغل المراقب عند تهيئة الـ plugin
});