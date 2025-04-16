import { defineComponent, ref, computed, watch, mergeProps, unref } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { useSupabaseUser } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseUser.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CommentActions",
  __ssrInlineRender: true,
  props: {
    item: {
      type: Object,
      required: true
    },
    itemType: {
      type: String,
      required: true
    },
    isCommentingSuspended: {
      // Add the new prop
      type: Boolean,
      default: false
    }
  },
  emits: ["edit", "delete", "reply"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const user = useSupabaseUser();
    const isOpen = ref(false);
    const dropdownMenuRef = ref(null);
    const isOwner = computed(() => user.value && user.value.id === props.item.user_id);
    const canShowActions = computed(() => {
      if (!user.value && !isOwner.value) return false;
      if (isOwner.value) return true;
      if (user.value && props.itemType === "comment" && !props.isCommentingSuspended) {
        return true;
      }
      return false;
    });
    const handleClickOutside = (event) => {
      var _a;
      if (dropdownMenuRef.value && !dropdownMenuRef.value.contains(event.target)) {
        const toggleButton = (_a = dropdownMenuRef.value.parentElement) == null ? void 0 : _a.querySelector("button");
        if (!toggleButton || !toggleButton.contains(event.target)) {
          isOpen.value = false;
        }
      }
    };
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        isOpen.value = false;
      }
    };
    watch(isOpen, (newValue) => {
      if (newValue) {
        (void 0).addEventListener("click", handleClickOutside, true);
        (void 0).addEventListener("keydown", handleEscapeKey);
      } else {
        (void 0).removeEventListener("click", handleClickOutside, true);
        (void 0).removeEventListener("keydown", handleEscapeKey);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (canShowActions.value) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))}><button${ssrRenderAttr("aria-label", `إجراءات ${__props.itemType === "comment" ? "التعليق" : "الرد"}`)} aria-haspopup="true"${ssrRenderAttr("aria-expanded", isOpen.value.toString())} class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white focus:outline-none p-1 -m-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 11.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM10 17a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"></path></svg></button>`);
        if (isOpen.value) {
          _push(`<div class="origin-top-right rtl:origin-top-left absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700 z-20"><div class="py-1" role="menu" aria-orientation="vertical">`);
          if (__props.itemType === "comment" && unref(user)) {
            _push(`<button${ssrIncludeBooleanAttr(__props.isCommentingSuspended) ? " disabled" : ""} class="flex items-center gap-2 w-full text-right rtl:text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" role="menuitem"${ssrRenderAttr("title", __props.isCommentingSuspended ? "التعليق موقوف حاليًا" : "الرد على هذا التعليق")}><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg><span>رد</span></button>`);
          } else {
            _push(`<!---->`);
          }
          if (isOwner.value) {
            _push(`<!--[--><button class="flex items-center gap-2 w-full text-right rtl:text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-200 dark:hover:bg-gray-700" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg><span>تعديل</span></button><button class="flex items-center gap-2 w-full text-right rtl:text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/50 dark:hover:text-red-300" role="menuitem"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg><span>حذف</span></button><!--]-->`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=CommentActions.vue2.mjs.map
