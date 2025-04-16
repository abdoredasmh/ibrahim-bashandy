import { defineStore } from "../node_modules/pinia/dist/pinia.mjs";
import { navigateTo } from "../node_modules/nuxt/dist/app/composables/router.mjs";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import "vue";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
const useUserStore = defineStore("user", {
  state: () => ({
    supabaseUser: null,
    // استخدم نوع Profile مباشرة من الأن المنشأة
    profile: null,
    isFetchingProfile: false,
    fetchProfileError: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.supabaseUser,
    userEmail: (state) => {
      var _a;
      return ((_a = state.supabaseUser) == null ? void 0 : _a.email) || "";
    },
    displayName: (state) => {
      var _a, _b;
      if ((_a = state.profile) == null ? void 0 : _a.full_name) {
        return state.profile.full_name;
      }
      if ((_b = state.supabaseUser) == null ? void 0 : _b.email) {
        return state.supabaseUser.email.split("@")[0];
      }
      return "مستخدم";
    },
    userAvatar: (state) => {
      var _a;
      return (_a = state.profile) == null ? void 0 : _a.avatar_url;
    },
    isAdmin: (state) => {
      var _a;
      return ((_a = state.profile) == null ? void 0 : _a.role) === "admin";
    },
    userPoints: (state) => {
      var _a;
      return ((_a = state.profile) == null ? void 0 : _a.points) ?? 0;
    },
    userBio: (state) => {
      var _a;
      return ((_a = state.profile) == null ? void 0 : _a.bio) ?? null;
    },
    isLoadingProfile: (state) => state.isFetchingProfile,
    // Getter للتحقق من حالة إيقاف التعليق
    isCommentingSuspended: (state) => {
      if (!state.profile || !state.profile.comment_suspended_until) {
        return false;
      }
      try {
        return new Date(state.profile.comment_suspended_until) > /* @__PURE__ */ new Date();
      } catch {
        console.error("Error parsing comment_suspended_until date:", state.profile.comment_suspended_until);
        return false;
      }
    },
    // Getter للتحقق من حالة الحظر
    isBanned: (state) => {
      var _a;
      return ((_a = state.profile) == null ? void 0 : _a.is_banned) ?? false;
    }
  },
  actions: {
    setSupabaseUser(user) {
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
          console.log("[UserStore] Profile already loaded.");
          return;
        }
        if (this.isFetchingProfile) {
          console.log("[UserStore] Profile fetch already in progress.");
          return;
        }
        if (!user) {
          console.log("[UserStore] No user to fetch profile for.");
          return;
        }
      }
      this.isFetchingProfile = true;
      this.fetchProfileError = null;
      const client = useSupabaseClient();
      console.log("[UserStore] Fetching profile for user:", user.id);
      try {
        const { data, error, status } = await client.from("profiles").select(`
            id,
            full_name,
            avatar_url,
            role,
            points,
            bio,
            is_banned,
            comment_suspended_until,
            created_at,
            updated_at
          `).eq("id", user.id).single();
        if (error && status !== 406) {
          console.error("[UserStore] Supabase error fetching profile:", error);
          throw error;
        }
        if (data) {
          console.log("[UserStore] Profile fetched:", data);
          this.profile = data;
        } else {
          console.warn("[UserStore] No profile found for user (or RLS prevented fetch):", user.id);
          this.profile = null;
        }
      } catch (error) {
        console.error("[UserStore] Catch block error fetching profile:", error.message);
        this.profile = null;
        this.fetchProfileError = error.message || "Failed to fetch profile.";
      } finally {
        this.isFetchingProfile = false;
        console.log("[UserStore] Fetch profile finished. Fetching state:", this.isFetchingProfile);
      }
    },
    async logout() {
      const client = useSupabaseClient();
      console.log("[UserStore] Logging out...");
      this.profile = null;
      this.supabaseUser = null;
      this.isFetchingProfile = false;
      this.fetchProfileError = null;
      const { error } = await client.auth.signOut();
      if (error) {
        console.error("Error logging out:", error.message);
      } else {
        console.log("[UserStore] Logout successful, navigating to /");
        await navigateTo("/");
      }
    }
  }
});
export {
  useUserStore
};
//# sourceMappingURL=user.mjs.map
