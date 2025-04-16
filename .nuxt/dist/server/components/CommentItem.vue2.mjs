import { defineComponent, ref, computed, watch, mergeProps, unref, nextTick } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderStyle, ssrRenderList } from "vue/server-renderer";
import { formatDistanceToNowStrict } from "date-fns";
import { ar } from "date-fns/locale";
import "./UserAvatar.vue.mjs";
import "./ReplyItem.vue.mjs";
import "./CommentActions.vue.mjs";
import { storeToRefs } from "../node_modules/pinia/dist/pinia.mjs";
import { useUserStore } from "../stores/user.mjs";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useSupabaseUser } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseUser.mjs";
import _sfc_main$1 from "./UserAvatar.vue2.mjs";
import _sfc_main$2 from "./CommentActions.vue2.mjs";
import _sfc_main$3 from "./ReplyItem.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CommentItem",
  __ssrInlineRender: true,
  props: {
    comment: {
      type: Object,
      required: true
    },
    replies: {
      type: Array,
      default: () => []
    },
    contentId: {
      type: Object,
      required: true
    },
    isCommentingSuspended: {
      // Receive suspension status from parent
      type: Boolean,
      default: false
    }
  },
  emits: ["commentUpdated", "commentDeleted", "replyAdded"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const { profile: userProfile } = storeToRefs(useUserStore());
    const localReplies = ref([]);
    const repliesVisible = ref(true);
    const isEditingComment = ref(false);
    const editedCommentContent = ref("");
    const isSavingCommentEdit = ref(false);
    const editCommentError = ref(null);
    const editCommentInputRef = ref(null);
    const showReplyForm = ref(false);
    const newReplyContent = ref("");
    const isSubmittingReply = ref(false);
    const replyError = ref(null);
    const replyInputRef = ref(null);
    const isOwner = computed(() => user.value && user.value.id === props.comment.user_id);
    const isCommentEdited = computed(() => props.comment.created_at !== props.comment.updated_at);
    const formattedTimestamp = computed(() => {
      var _a;
      try {
        return formatDistanceToNowStrict(new Date(props.comment.created_at), { addSuffix: true, locale: ar });
      } catch (e) {
        console.error("Error formatting date:", e);
        return (_a = props.comment.created_at) == null ? void 0 : _a.toString();
      }
    });
    const fullTimestamp = computed(() => {
      var _a;
      try {
        return new Date(props.comment.created_at).toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" });
      } catch {
        return (_a = props.comment.created_at) == null ? void 0 : _a.toString();
      }
    });
    const sortedReplies = computed(() => {
      return [...localReplies.value].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });
    watch(() => props.replies, (newReplies) => {
      localReplies.value = [...newReplies];
    }, { deep: true, immediate: true });
    const startEditingComment = async () => {
      var _a;
      if (!isOwner.value) return;
      isEditingComment.value = true;
      editedCommentContent.value = props.comment.content;
      editCommentError.value = null;
      showReplyForm.value = false;
      await nextTick();
      (_a = editCommentInputRef.value) == null ? void 0 : _a.focus();
    };
    const requestDeleteComment = async () => {
      if (!isOwner.value) return;
      if ((void 0).confirm("هل أنت متأكد من حذف هذا التعليق وكل ردوده؟")) {
        try {
          const { error } = await supabase.from("comments").delete().eq("id", props.comment.id);
          if (error) throw error;
          emit("commentDeleted", props.comment.id);
        } catch (err) {
          console.error("Error deleting comment:", err);
          alert(`فشل حذف التعليق: (${err.message || "خطأ غير معروف"})`);
        }
      }
    };
    const toggleReplyForm = async () => {
      var _a;
      if (!user.value || props.isCommentingSuspended) return;
      showReplyForm.value = !showReplyForm.value;
      newReplyContent.value = "";
      replyError.value = null;
      if (showReplyForm.value) {
        isEditingComment.value = false;
        await nextTick();
        (_a = replyInputRef.value) == null ? void 0 : _a.focus();
      }
    };
    const handleReplyUpdate = (updatedReply) => {
      const index = localReplies.value.findIndex((r) => r.id === updatedReply.id);
      if (index !== -1) {
        localReplies.value.splice(index, 1, updatedReply);
      }
    };
    const handleReplyDelete = (deletedReplyId) => {
      localReplies.value = localReplies.value.filter((r) => r.id !== deletedReplyId);
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "py-4" }, _attrs))} data-v-81392211><div class="flex space-x-3 rtl:space-x-reverse" data-v-81392211>`);
      _push(ssrRenderComponent(_sfc_main$1, {
        "avatar-url": (_a = __props.comment.profiles) == null ? void 0 : _a.avatar_url,
        name: (_b = __props.comment.profiles) == null ? void 0 : _b.full_name,
        size: "md",
        class: "mt-1"
      }, null, _parent));
      _push(`<div class="flex-1 min-w-0" data-v-81392211><div class="flex items-center justify-between gap-2" data-v-81392211><span class="text-sm font-semibold text-gray-900 dark:text-white truncate" data-v-81392211>${ssrInterpolate(((_c = __props.comment.profiles) == null ? void 0 : _c.full_name) || "مستخدم")}</span>`);
      _push(ssrRenderComponent(_sfc_main$2, {
        item: __props.comment,
        "item-type": "comment",
        "is-commenting-suspended": __props.isCommentingSuspended,
        onReply: toggleReplyForm,
        onEdit: startEditingComment,
        onDelete: requestDeleteComment,
        class: "flex-shrink-0"
      }, null, _parent));
      _push(`</div><div class="text-xs text-gray-500 dark:text-gray-400 mb-1" data-v-81392211><time${ssrRenderAttr("datetime", __props.comment.created_at)}${ssrRenderAttr("title", fullTimestamp.value)} data-v-81392211>${ssrInterpolate(formattedTimestamp.value)}</time>`);
      if (isCommentEdited.value) {
        _push(`<span class="mx-1" title="تم تعديل هذا التعليق" data-v-81392211>(تم التعديل)</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (!isEditingComment.value) {
        _push(`<p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words" data-v-81392211>${ssrInterpolate(__props.comment.content)}</p>`);
      } else {
        _push(`<div data-v-81392211><textarea rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-70" placeholder="تعديل التعليق..."${ssrIncludeBooleanAttr(isSavingCommentEdit.value) ? " disabled" : ""} aria-label="تعديل التعليق" data-v-81392211>${ssrInterpolate(editedCommentContent.value)}</textarea><div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse" data-v-81392211>`);
        if (editCommentError.value) {
          _push(`<span class="text-xs text-red-500 flex-1 text-right" data-v-81392211>${ssrInterpolate(editCommentError.value)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button type="button"${ssrIncludeBooleanAttr(isSavingCommentEdit.value) ? " disabled" : ""} class="px-3 py-1 text-xs ..." data-v-81392211>إلغاء</button><button type="button"${ssrIncludeBooleanAttr(isSavingCommentEdit.value || !editedCommentContent.value.trim()) ? " disabled" : ""} class="inline-flex ..." data-v-81392211>`);
        if (isSavingCommentEdit.value) {
          _push(`<svg class="animate-spin ..." data-v-81392211></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span data-v-81392211>${ssrInterpolate(isSavingCommentEdit.value ? "جاري الحفظ..." : "حفظ")}</span></button></div></div>`);
      }
      if (!isEditingComment.value) {
        _push(`<div class="mt-2 flex items-center space-x-4 rtl:space-x-reverse text-xs" data-v-81392211>`);
        if (unref(user)) {
          _push(`<button type="button" class="font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"${ssrIncludeBooleanAttr(__props.isCommentingSuspended) ? " disabled" : ""} aria-controls="reply-form-{{ comment.id }}"${ssrRenderAttr("aria-expanded", showReplyForm.value.toString())} data-v-81392211>`);
          if (!showReplyForm.value) {
            _push(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" data-v-81392211><path fill-rule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" data-v-81392211></path></svg>`);
          } else {
            _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-v-81392211><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" data-v-81392211></path></svg>`);
          }
          _push(`<span data-v-81392211>${ssrInterpolate(showReplyForm.value ? "إلغاء الرد" : __props.isCommentingSuspended ? "الرد موقوف" : "رد")}</span></button>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.isCommentingSuspended && unref(user)) {
          _push(`<span class="text-yellow-600 dark:text-yellow-400" data-v-81392211>(لا يمكنك الرد حاليًا)</span>`);
        } else {
          _push(`<!---->`);
        }
        if (localReplies.value.length > 0) {
          _push(`<button type="button" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center gap-1"${ssrRenderAttr("aria-expanded", repliesVisible.value.toString())} aria-controls="replies-list-{{ comment.id }}" data-v-81392211>`);
          if (repliesVisible.value) {
            _push(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" data-v-81392211><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd" data-v-81392211></path></svg>`);
          } else {
            _push(`<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" data-v-81392211><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" data-v-81392211></path></svg>`);
          }
          _push(`<span data-v-81392211>${ssrInterpolate(localReplies.value.length)} ${ssrInterpolate(localReplies.value.length === 1 ? "رد" : localReplies.value.length === 2 ? "ردان" : localReplies.value.length <= 10 ? "ردود" : "ردًا")}</span></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="mt-3 ml-10 rtl:mr-10 rtl:ml-0 pl-3 rtl:pr-3 border-l-2 border-gray-200 dark:border-gray-700 rtl:border-l-0 rtl:border-r-2" data-v-81392211>`);
      if (showReplyForm.value) {
        _push(`<div${ssrRenderAttr("id", "reply-form-" + __props.comment.id)} class="mb-4" data-v-81392211><div class="flex space-x-3 rtl:space-x-reverse" data-v-81392211>`);
        _push(ssrRenderComponent(_sfc_main$1, {
          "avatar-url": (_d = unref(userProfile)) == null ? void 0 : _d.avatar_url,
          name: (_e = unref(userProfile)) == null ? void 0 : _e.full_name,
          size: "sm",
          class: "mt-1"
        }, null, _parent));
        _push(`<div class="flex-1 min-w-0" data-v-81392211><textarea rows="2" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-70" placeholder="إضافة رد عام..."${ssrIncludeBooleanAttr(isSubmittingReply.value || __props.isCommentingSuspended) ? " disabled" : ""} aria-label="إضافة رد جديد" data-v-81392211>${ssrInterpolate(newReplyContent.value)}</textarea>`);
        if (__props.isCommentingSuspended) {
          _push(`<p class="mt-1 text-xs text-yellow-600 dark:text-yellow-400" data-v-81392211> لا يمكنك إضافة رد حاليًا بسبب الإيقاف. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse" data-v-81392211>`);
        if (replyError.value) {
          _push(`<span class="text-xs text-red-500 flex-1 text-right" data-v-81392211>${ssrInterpolate(replyError.value)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button type="button"${ssrIncludeBooleanAttr(isSubmittingReply.value) ? " disabled" : ""} class="px-3 py-1 text-xs ..." data-v-81392211>إلغاء</button><button type="button"${ssrIncludeBooleanAttr(isSubmittingReply.value || !newReplyContent.value.trim() || __props.isCommentingSuspended) ? " disabled" : ""} class="inline-flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50" data-v-81392211>`);
        if (isSubmittingReply.value) {
          _push(`<svg class="animate-spin ..." data-v-81392211></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span data-v-81392211>${ssrInterpolate(isSubmittingReply.value ? "جاري الرد..." : "رد")}</span></button></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div style="${ssrRenderStyle(localReplies.value.length > 0 && repliesVisible.value ? null : { display: "none" })}"${ssrRenderAttr("id", "replies-list-" + __props.comment.id)} class="space-y-0" data-v-81392211><!--[-->`);
      ssrRenderList(sortedReplies.value, (reply) => {
        _push(ssrRenderComponent(_sfc_main$3, {
          key: reply.id,
          reply,
          onReplyUpdated: handleReplyUpdate,
          onReplyDeleted: handleReplyDelete
        }, null, _parent));
      });
      _push(`<!--]--></div></div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=CommentItem.vue2.mjs.map
