import { defineComponent, ref, computed, watch, mergeProps, defineAsyncComponent } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderComponent } from "vue/server-renderer";
import LoadingSpinner from "../LoadingSpinner.vue.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const __nuxt_component_0_lazy = defineAsyncComponent(() => import("./ConfirmationModal.vue.mjs").then((c) => c.default || c));
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminUserActions",
  __ssrInlineRender: true,
  props: {
    userProfile: {
      type: Object,
      required: true
    },
    isLoading: {
      // Prop to disable buttons while parent page is loading
      type: Boolean,
      default: false
    }
  },
  emits: ["action-start", "action-complete", "send-message", "suspend-comments"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useSupabaseClient();
    const pendingAction = ref(null);
    const currentRole = ref(props.userProfile.role);
    const showConfirm = ref(false);
    const confirmModalConfig = ref(null);
    const isCurrentlySuspended = computed(() => {
      if (!props.userProfile.comment_suspended_until) return false;
      try {
        return new Date(props.userProfile.comment_suspended_until) > /* @__PURE__ */ new Date();
      } catch {
        return false;
      }
    });
    watch(() => props.userProfile, (newProfile) => {
      currentRole.value = newProfile.role;
    }, { deep: true });
    const executeConfirmedAction = () => {
      return;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_LazyAdminConfirmationModal = __nuxt_component_0_lazy;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 flex flex-wrap items-center justify-start gap-3" }, _attrs))} data-v-e6f72aa4><div class="flex items-center gap-2" data-v-e6f72aa4><label${ssrRenderAttr("for", `role-select-${__props.userProfile.id}`)} class="text-sm font-medium text-gray-700 dark:text-gray-300" data-v-e6f72aa4>تغيير الدور:</label><select${ssrRenderAttr("id", `role-select-${__props.userProfile.id}`)}${ssrRenderAttr("value", currentRole.value)}${ssrIncludeBooleanAttr(__props.isLoading || pendingAction.value === "role") ? " disabled" : ""} class="text-sm rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-70" data-v-e6f72aa4><option value="user" data-v-e6f72aa4>مستخدم</option><option value="admin" data-v-e6f72aa4>مشرف</option></select>`);
      if (pendingAction.value === "role") {
        _push(ssrRenderComponent(LoadingSpinner, { class: "w-4 h-4 inline-block ml-1 animate-spin text-indigo-500" }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!__props.userProfile.is_banned) {
        _push(`<button${ssrIncludeBooleanAttr(__props.isLoading || pendingAction.value === "ban") ? " disabled" : ""} class="px-3 py-1.5 text-sm rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center gap-1" data-v-e6f72aa4>`);
        if (pendingAction.value === "ban") {
          _push(ssrRenderComponent(LoadingSpinner, { class: "w-4 h-4" }, null, _parent));
        } else {
          _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-e6f72aa4><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.84-10.73a.75.75 0 1 0-1.18-.94l-1.66 2.08-.94-1.18a.75.75 0 1 0-.94 1.18l1.5 1.875a.75.75 0 0 0 1.18 0l2-2.5Z" clip-rule="evenodd" data-v-e6f72aa4></path></svg>`);
        }
        _push(` --&gt; <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-e6f72aa4><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM4.75 7.25A.75.75 0 0 1 5.5 8h5a.75.75 0 0 1 0 1.5h-5A.75.75 0 0 1 4 8.75a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" data-v-e6f72aa4></path></svg><span data-v-e6f72aa4>حظر</span></button>`);
      } else {
        _push(`<button${ssrIncludeBooleanAttr(__props.isLoading || pendingAction.value === "unban") ? " disabled" : ""} class="px-3 py-1.5 text-sm rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-1" data-v-e6f72aa4>`);
        if (pendingAction.value === "unban") {
          _push(ssrRenderComponent(LoadingSpinner, { class: "w-4 h-4" }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-e6f72aa4><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.84-10.73a.75.75 0 1 0-1.18-.94l-1.66 2.08-.94-1.18a.75.75 0 1 0-.94 1.18l1.5 1.875a.75.75 0 0 0 1.18 0l2-2.5Z" clip-rule="evenodd" data-v-e6f72aa4></path></svg><span data-v-e6f72aa4>إلغاء الحظر</span></button>`);
      }
      if (!isCurrentlySuspended.value) {
        _push(`<button${ssrIncludeBooleanAttr(__props.isLoading) ? " disabled" : ""} class="px-3 py-1.5 text-sm rounded-md text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/50 hover:bg-yellow-200 dark:hover:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 flex items-center gap-1" data-v-e6f72aa4><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-e6f72aa4><path fill-rule="evenodd" d="M4.5 6.75a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7Zm0 3.5a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5h-4Z" clip-rule="evenodd" data-v-e6f72aa4></path></svg><span data-v-e6f72aa4>إيقاف التعليق</span></button>`);
      } else {
        _push(`<button${ssrIncludeBooleanAttr(__props.isLoading || pendingAction.value === "unsuspend") ? " disabled" : ""} class="px-3 py-1.5 text-sm rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center gap-1" data-v-e6f72aa4>`);
        if (pendingAction.value === "unsuspend") {
          _push(ssrRenderComponent(LoadingSpinner, { class: "w-4 h-4" }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-e6f72aa4><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.84-10.73a.75.75 0 1 0-1.18-.94l-1.66 2.08-.94-1.18a.75.75 0 1 0-.94 1.18l1.5 1.875a.75.75 0 0 0 1.18 0l2-2.5Z" clip-rule="evenodd" data-v-e6f72aa4></path></svg><span data-v-e6f72aa4>إلغاء إيقاف التعليق</span></button>`);
      }
      _push(`<button${ssrIncludeBooleanAttr(__props.isLoading) ? " disabled" : ""} class="px-3 py-1.5 text-sm rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center gap-1" data-v-e6f72aa4><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-e6f72aa4><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11ZM2 4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v1.145l-5.426 3.05a1.75 1.75 0 0 1-1.93.066L2 5.96V4.5Zm11.5 8h-11a.5.5 0 0 1-.5-.5v-4.318l3.924 2.207a3.25 3.25 0 0 0 3.552-.122L14 7.764V11.5a.5.5 0 0 1-.5.5Z" data-v-e6f72aa4></path></svg><span data-v-e6f72aa4>إرسال رسالة</span></button>`);
      _push(ssrRenderComponent(_component_LazyAdminConfirmationModal, {
        modelValue: showConfirm.value,
        "onUpdate:modelValue": ($event) => showConfirm.value = $event,
        config: confirmModalConfig.value,
        onConfirm: executeConfirmedAction
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=AdminUserActions.vue2.mjs.map
