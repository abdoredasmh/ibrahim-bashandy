import { executeAsync } from "D:/programing/ibrahim-bashandy/node_modules/unctx/dist/index.mjs";
import { useUserStore } from "../stores/user.mjs";
import { storeToRefs } from "../node_modules/pinia/dist/pinia.mjs";
import { watch } from "vue";
import { defineNuxtRouteMiddleware, navigateTo } from "../node_modules/nuxt/dist/app/composables/router.mjs";
import { useSupabaseUser } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseUser.mjs";
const admin = defineNuxtRouteMiddleware(async (to, from) => {
  let __temp, __restore;
  console.log(`[Admin Middleware] Running for route: ${to.path} (from: ${from.path})`);
  const user = useSupabaseUser();
  if (!user.value) {
    console.log("[Admin Middleware] No user logged in, redirecting to login.");
    return navigateTo("/login", { replace: true });
  }
  const userStore = useUserStore();
  const { profile, isFetchingProfile } = storeToRefs(userStore);
  if (profile.value && profile.value.role === "admin") {
    console.log("[Admin Middleware] Existing profile is admin. Access granted immediately.");
    return;
  }
  if (!profile.value && isFetchingProfile.value) {
    console.log("[Admin Middleware] Profile missing or fetch in progress, waiting...");
    try {
      ;
      [__temp, __restore] = executeAsync(() => new Promise((resolve, reject) => {
        const unwatch = watch(isFetchingProfile, (newValue) => {
          if (!newValue) {
            console.log("[Admin Middleware] Profile fetch finished during wait.");
            unwatch();
            resolve();
          }
        });
        const timeoutId = setTimeout(() => {
          console.warn("[Admin Middleware] Waiting for profile timed out.");
          unwatch();
          resolve();
        }, 15e3);
      })), await __temp, __restore();
      ;
    } catch (waitError) {
      console.error("[Admin Middleware] Unexpected error while waiting for profile:", waitError.message);
      return navigateTo("/", { replace: true });
    }
  }
  if (!profile.value) {
    console.error("[Admin Middleware] Final check: Profile data still unavailable.");
    if (userStore.fetchProfileError) {
      console.error("[Admin Middleware] Profile fetch error was:", userStore.fetchProfileError);
    }
    return navigateTo("/", { replace: true });
  }
  if (profile.value.role !== "admin") {
    console.warn(`[Admin Middleware] Final check: User role is '${profile.value.role}', access denied.`);
    return navigateTo("/", { replace: true });
  }
  console.log("[Admin Middleware] Final check: Admin access granted.");
});
export {
  admin as default
};
//# sourceMappingURL=admin.mjs.map
