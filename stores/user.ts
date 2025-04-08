// stores/user.ts
import { defineStore } from 'pinia'
import { useSupabaseClient, useSupabaseUser } from '#imports'
// استورد الأنواع المولدة أو اليدوية
import type { Database } from '~/types/database.types' // أو استورد Profile من ملفك اليدوي

// استخدم النوع المولد إذا كان متاحًا، أو الواجهة اليدوية
type Profile = Database['public']['Tables']['profiles']['Row'] // للأنواع المولدة
// type Profile = YourManualProfileInterface // إذا استخدمت واجهة يدوية

export const useUserStore = defineStore('user', {
  state: () => ({
    supabaseUser: null as ReturnType<typeof useSupabaseUser>['value'], // نوع المستخدم الصحيح
    profile: null as Profile | null,
    loadingProfile: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.supabaseUser,
    userEmail: (state) => state.supabaseUser?.email || '',
    displayName: (state): string => {
         if (state.profile?.full_name) {
            return state.profile.full_name;
         }
         if (state.supabaseUser?.email) {
            return state.supabaseUser.email.split('@')[0];
         }
         return 'مستخدم';
    },
    userAvatar: (state) => state.profile?.avatar_url,
    isAdmin: (state) => state.profile?.role === 'admin',
  },

  actions: {
    setSupabaseUser(user: ReturnType<typeof useSupabaseUser>['value']) {
      this.supabaseUser = user;
      if (!user) {
        this.profile = null;
      }
    },

    async fetchProfile() {
      if (!this.supabaseUser || this.profile || this.loadingProfile) return;

      this.loadingProfile = true;
      const client = useSupabaseClient<Database>(); // استخدم الأنواع هنا أيضًا

      try {
        const { data, error, status } = await client
          .from('profiles')
          .select('id, full_name, avatar_url, role') // حدد الأعمدة بدقة
          .eq('id', this.supabaseUser.id)
          .single();

        // تجاهل خطأ 406 (Not Found) بهدوء، قد يحدث إذا كان التريجر لم يعمل بعد
        if (error && status !== 406) throw error;

        if (data) {
          this.profile = data as Profile; // تأكيد النوع
        } else {
          console.warn('Profile not found for user:', this.supabaseUser.id);
          this.profile = null;
          // يمكنك محاولة إعادة الجلب بعد فترة قصيرة إذا أردت
          // setTimeout(() => this.fetchProfile(), 2000);
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error.message);
        this.profile = null;
      } finally {
        this.loadingProfile = false;
      }
    },

    // دالة لتحديث الملف الشخصي (سنستخدمها لاحقًا)
    async updateProfile(updates: Partial<Profile>) {
        // ... (الكود من الرد السابق) ...
    },

    // دالة تسجيل الخروج
    async logout() {
        const client = useSupabaseClient();
        this.loadingProfile = true; // إظهار مؤشر تحميل مؤقت
        const { error } = await client.auth.signOut();
        this.loadingProfile = false; // إخفاء المؤشر
        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            // لا حاجة لمسح الحالة يدويًا هنا لأن setSupabaseUser(null) ستُستدعى
            await navigateTo('/');
        }
    }
  }
})

// ---- المراقب الخارجي ----
// هذا الكود يجب أن يكون في ملف plugin ليعمل عند بدء التطبيق
// أنشئ ملف plugins/watch-auth.client.ts إذا لم يكن موجودًا

function watchSupabaseUser() {
    const userStore = useUserStore();
    const user = useSupabaseUser();

    watch(user, (newUser) => {
        console.log("Supabase user changed:", newUser?.id); // للتصحيح
        userStore.setSupabaseUser(newUser);
        if (newUser) {
            console.log("Fetching profile for new user..."); // للتصحيح
            userStore.fetchProfile(); // جلب الملف الشخصي عند تسجيل الدخول
        }
    }, { immediate: true }); // immediate: true لتشغيله فورًا
}

// تأكد من استدعاء watchSupabaseUser() من ملف plugin
// export default defineNuxtPlugin(() => { watchSupabaseUser(); });