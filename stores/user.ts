// stores/user.ts
import { defineStore } from 'pinia';
import { useSupabaseClient, useSupabaseUser } from '#imports';
import type { Database, Tables } from '~/types/database.types'; // تأكد من المسار الصحيح

// تعريف نوع البروفايل ليشمل الدور والحقول الجديدة
// سيتم تحديث Tables<'profiles'> تلقائياً عند إعادة إنشاء الأنواع
type Profile = Tables<'profiles'> & { role: 'user' | 'admin' };

export const useUserStore = defineStore('user', {
  state: () => ({
    supabaseUser: null as ReturnType<typeof useSupabaseUser>['value'],
    profile: null as Profile | null,
    isFetchingProfile: false,
    fetchProfileError: null as string | null,
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
    isAdmin: (state): boolean => state.profile?.role === 'admin',
    userPoints: (state): number => state.profile?.points ?? 0, // Getter للنقاط
    userBio: (state): string | null => state.profile?.bio ?? null, // Getter للنبذة
    isLoadingProfile: (state): boolean => state.isFetchingProfile,
  },

  actions: {
    setSupabaseUser(user: ReturnType<typeof useSupabaseUser>['value']) {
      this.supabaseUser = user;
      if (!user) {
        this.profile = null;
        this.fetchProfileError = null;
        this.isFetchingProfile = false;
      }
    },

    async fetchProfile() {
      const user = this.supabaseUser;
      if (!user || this.isFetchingProfile) {
         if (this.profile && !this.isFetchingProfile) {
             console.log('[UserStore] Profile already loaded.');
             return;
         }
         if (this.isFetchingProfile) {
             console.log('[UserStore] Profile fetch already in progress.');
             return;
         }
         if (!user) {
             console.log('[UserStore] No user to fetch profile for.');
             return;
         }
      }

      this.isFetchingProfile = true;
      this.fetchProfileError = null;
      const client = useSupabaseClient<Database>();
      console.log('[UserStore] Fetching profile for user:', user.id);

      try {
        const { data, error, status } = await client
          .from('profiles')
          // --- التعديل هنا: إضافة points و bio ---
          .select('id, full_name, avatar_url, role, points, bio')
          .eq('id', user.id)
          .single();

        if (error && status !== 406) throw error;

        if (data) {
          console.log('[UserStore] Profile fetched:', data);
          this.profile = data as Profile; // النوع Profile سيشمل الحقول الجديدة تلقائياً بعد تحديث الأنواع
        } else {
          console.warn('[UserStore] No profile found for user:', user.id);
          this.profile = null;
          // this.fetchProfileError = 'Profile record not found.';
        }
      } catch (error: any) {
        console.error('[UserStore] Error fetching profile:', error.message);
        this.profile = null;
        this.fetchProfileError = error.message || 'Failed to fetch profile.';
      } finally {
        this.isFetchingProfile = false;
      }
    },

    async logout() {
        const client = useSupabaseClient();
        this.isFetchingProfile = true;
        const { error } = await client.auth.signOut();
        this.isFetchingProfile = false;
        if (error) {
            console.error('Error logging out:', error.message);
        } else {
            await navigateTo('/');
        }
    }
  }
})