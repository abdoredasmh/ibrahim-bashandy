import __nuxt_component_1 from "../node_modules/nuxt/dist/app/components/client-only.mjs";
import { defineComponent, ref, watch, mergeProps, withCtx, createVNode } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { useUserStore } from "../stores/user.mjs";
import LoadingSpinner from "../components/LoadingSpinner.vue.mjs";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useSupabaseUser } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseUser.mjs";
import { useAsyncData } from "../node_modules/nuxt/dist/app/composables/asyncData.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "profile",
  __ssrInlineRender: true,
  setup(__props) {
    const userStore = useUserStore();
    const client = useSupabaseClient();
    const user = useSupabaseUser();
    const newFullName = ref("");
    const newBio = ref("");
    ref("");
    ref("");
    ref("");
    ref(null);
    ref(false);
    ref(null);
    ref(null);
    ref(false);
    ref(null);
    ref(false);
    ref(null);
    ref(null);
    ref(false);
    ref(null);
    ref(null);
    ref(false);
    ref(null);
    ref("");
    ref(false);
    ref(null);
    ref(null);
    const { data: myCourses, pending: pendingCourses, error: errorCourses, refresh: refreshCourses } = useAsyncData(
      "myCourses",
      () => $fetch("/api/my-courses"),
      { lazy: true, server: false }
    );
    const { data: privateMessages, pending: pendingMessages, error: errorMessages, refresh: refreshMessages } = useAsyncData(
      "privateMessages",
      async () => {
        if (!user.value) return [];
        const { data, error } = await client.from("user_private_messages").select("*").eq("user_id", user.value.id).order("created_at", { ascending: false });
        if (error) {
          console.error("Error fetching private messages:", error);
          throw error;
        }
        return data || [];
      },
      { lazy: true, server: false, watch: [user] }
    );
    watch(
      () => userStore.profile,
      (newProfile) => {
        if (newProfile) {
          newFullName.value = newProfile.full_name || "";
          newBio.value = newProfile.bio || "";
        }
      },
      { immediate: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8" }, _attrs))} data-v-c3c817cc><h1 class="text-3xl font-bold mb-8 text-center text-[color:var(--color-brown-dark)] dark:text-[color:var(--color-beige-light)]" data-v-c3c817cc>الملف الشخصي</h1>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {
        fallback: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex justify-center items-center h-64" data-v-c3c817cc${_scopeId}>`);
            _push2(ssrRenderComponent(LoadingSpinner, null, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex justify-center items-center h-64" }, [
                createVNode(LoadingSpinner)
              ])
            ];
          }
        })
      }, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=profile.vue3.mjs.map
