import { defineComponent, ref, computed, mergeProps, nextTick } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { formatDistanceToNowStrict } from "date-fns";
import { ar } from "date-fns/locale";
import "./UserAvatar.vue.mjs";
import "./CommentActions.vue.mjs";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useSupabaseUser } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseUser.mjs";
import _sfc_main$1 from "./UserAvatar.vue2.mjs";
import _sfc_main$2 from "./CommentActions.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ReplyItem",
  __ssrInlineRender: true,
  props: {
    reply: {}
  },
  emits: ["replyUpdated", "replyDeleted"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const isEditing = ref(false);
    const editedContent = ref("");
    const isSavingEdit = ref(false);
    const isDeleting = ref(false);
    const editError = ref(null);
    const editInputRef = ref(null);
    const isOwner = computed(() => user.value && user.value.id === props.reply.user_id);
    const isEdited = computed(() => props.reply.created_at !== props.reply.updated_at);
    const formattedTimestamp = computed(() => {
      var _a;
      try {
        return formatDistanceToNowStrict(new Date(props.reply.created_at), { addSuffix: true, locale: ar });
      } catch (e) {
        console.error("Error formatting date:", e);
        return (_a = props.reply.created_at) == null ? void 0 : _a.toString();
      }
    });
    const fullTimestamp = computed(() => {
      var _a;
      try {
        return new Date(props.reply.created_at).toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" });
      } catch {
        return (_a = props.reply.created_at) == null ? void 0 : _a.toString();
      }
    });
    const startEditing = async () => {
      var _a;
      if (!isOwner.value) return;
      isEditing.value = true;
      editedContent.value = props.reply.content;
      editError.value = null;
      await nextTick();
      (_a = editInputRef.value) == null ? void 0 : _a.focus();
    };
    const requestDelete = async () => {
      if (!isOwner.value || isDeleting.value) return;
      if ((void 0).confirm("هل أنت متأكد من رغبتك في حذف هذا الرد؟")) {
        isDeleting.value = true;
        try {
          const { error } = await supabase.from("comments").delete().eq("id", props.reply.id);
          if (error) throw error;
          emit("replyDeleted", props.reply.id);
        } catch (err) {
          console.error("Error deleting reply:", err);
          alert(`فشل حذف الرد: (${err.message || "خطأ غير معروف"})`);
        } finally {
          isDeleting.value = false;
        }
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex space-x-3 rtl:space-x-reverse py-3 border-t border-gray-200 dark:border-gray-700 first:border-t-0 first:pt-0 last:pb-0" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        "avatar-url": (_a = _ctx.reply.profiles) == null ? void 0 : _a.avatar_url,
        name: (_b = _ctx.reply.profiles) == null ? void 0 : _b.full_name,
        size: "sm",
        class: "mt-1"
      }, null, _parent));
      _push(`<div class="flex-1 min-w-0"><div class="flex items-center justify-between gap-2"><span class="text-sm font-semibold text-gray-900 dark:text-white truncate">${ssrInterpolate(((_c = _ctx.reply.profiles) == null ? void 0 : _c.full_name) || "مستخدم")}</span>`);
      _push(ssrRenderComponent(_sfc_main$2, {
        item: _ctx.reply,
        "item-type": "reply",
        onEdit: startEditing,
        onDelete: requestDelete
      }, null, _parent));
      _push(`</div><div class="text-xs text-gray-500 dark:text-gray-400 mb-1"><time${ssrRenderAttr("datetime", _ctx.reply.created_at)}${ssrRenderAttr("title", fullTimestamp.value)}>${ssrInterpolate(formattedTimestamp.value)}</time>`);
      if (isEdited.value) {
        _push(`<span class="mx-1" title="تم تعديل هذا الرد">(تم التعديل)</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!isEditing.value) {
        _push(`<p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">${ssrInterpolate(_ctx.reply.content)}</p>`);
      } else {
        _push(`<div><textarea rows="2" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-70" placeholder="تعديل الرد..."${ssrIncludeBooleanAttr(isSavingEdit.value) ? " disabled" : ""} aria-label="تعديل الرد">${ssrInterpolate(editedContent.value)}</textarea><div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">`);
        if (editError.value) {
          _push(`<span class="text-xs text-red-500 flex-1 text-right">${ssrInterpolate(editError.value)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button type="button"${ssrIncludeBooleanAttr(isSavingEdit.value) ? " disabled" : ""} class="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50"> إلغاء </button><button type="button"${ssrIncludeBooleanAttr(isSavingEdit.value || !editedContent.value.trim()) ? " disabled" : ""} class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50">`);
        if (isSavingEdit.value) {
          _push(`<svg class="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span>${ssrInterpolate(isSavingEdit.value ? "جاري الحفظ..." : "حفظ")}</span></button></div></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=ReplyItem.vue2.mjs.map
