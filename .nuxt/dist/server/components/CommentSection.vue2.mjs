import __nuxt_component_0 from "../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderList } from "vue/server-renderer";
import "./UserAvatar.vue.mjs";
import CommentItem from "./CommentItem.vue.mjs";
import LoadingSpinner from "./LoadingSpinner.vue.mjs";
import { storeToRefs } from "../node_modules/pinia/dist/pinia.mjs";
import { useUserStore } from "../stores/user.mjs";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useSupabaseUser } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseUser.mjs";
import _sfc_main$1 from "./UserAvatar.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CommentSection",
  __ssrInlineRender: true,
  props: {
    lessonId: {},
    bookId: {},
    courseId: {}
  },
  setup(__props) {
    const localePath = (path) => path;
    const props = __props;
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const userStore = useUserStore();
    const { profile: userProfile } = storeToRefs(userStore);
    const allComments = ref([]);
    const totalCommentsCount = ref(null);
    const isLoadingInitial = ref(true);
    const isLoadingMore = ref(false);
    const fetchError = ref(null);
    const fetchMoreError = ref(null);
    const commentsPerPage = ref(10);
    const currentPage = ref(1);
    const hasMoreComments = ref(true);
    const newCommentContent = ref("");
    const isSubmittingComment = ref(false);
    const commentSubmitError = ref(null);
    const contentInfo = computed(() => {
      if (props.lessonId !== void 0) return { column: "lesson_id", value: Number(props.lessonId) };
      if (props.bookId !== void 0) return { column: "book_id", value: Number(props.bookId) };
      if (props.courseId !== void 0) return { column: "study_course_id", value: Number(props.courseId) };
      return null;
    });
    const contentIdentifier = computed(() => ({
      lesson_id: props.lessonId,
      book_id: props.bookId,
      study_course_id: props.courseId
    }));
    const isSuspended = computed(() => {
      const profile = userStore.profile;
      if (!profile || !profile.comment_suspended_until) {
        return false;
      }
      try {
        return new Date(profile.comment_suspended_until) > /* @__PURE__ */ new Date();
      } catch {
        return false;
      }
    });
    const topLevelComments = computed(() => {
      return allComments.value.filter((c) => c.parent_comment_id === null).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    });
    const getRepliesForComment = (commentId) => {
      return allComments.value.filter((c) => c.parent_comment_id === commentId);
    };
    const fetchTotalCount = async (column, value) => {
      try {
        const { count, error } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq(column, value).eq("is_approved", true);
        if (error) throw error;
        return count ?? 0;
      } catch (err) {
        console.error("Error fetching total comments count:", err);
        fetchError.value = "فشل في جلب عدد التعليقات.";
        return null;
      }
    };
    const fetchCommentsBatch = async (column, value, page = 1) => {
      const from = (page - 1) * commentsPerPage.value;
      const to = from + commentsPerPage.value - 1;
      const { data: topLevelData, error: topLevelError } = await supabase.from("comments").select(`
      *,
      profiles!inner (id, full_name, avatar_url)
    `).eq(column, value).eq("is_approved", true).is("parent_comment_id", null).order("created_at", { ascending: false }).range(from, to);
      if (topLevelError) throw topLevelError;
      const newTopLevelComments = (topLevelData || []).filter((c) => c.profiles !== null);
      const parentIds = newTopLevelComments.map((c) => c.id);
      let repliesData = [];
      if (parentIds.length > 0) {
        const { data, error: repliesError } = await supabase.from("comments").select(`
        *,
        profiles!inner (id, full_name, avatar_url)
      `).in("parent_comment_id", parentIds).eq("is_approved", true).order("created_at", { ascending: true });
        if (repliesError) {
          console.error("Error fetching replies:", repliesError);
          fetchMoreError.value = "حدث خطأ أثناء تحميل بعض الردود.";
        } else {
          repliesData = (data || []).filter((c) => c.profiles !== null);
        }
      }
      return { newTopLevelComments, repliesData };
    };
    const fetchInitialComments = async () => {
      isLoadingInitial.value = true;
      fetchError.value = null;
      allComments.value = [];
      currentPage.value = 1;
      hasMoreComments.value = true;
      totalCommentsCount.value = null;
      const providedPropsCount = [props.lessonId, props.bookId, props.courseId].filter((p) => p !== void 0).length;
      if (providedPropsCount !== 1 || !contentInfo.value) {
        fetchError.value = "خطأ في إعداد المكون: يجب تحديد معرف محتوى واحد فقط.";
        isLoadingInitial.value = false;
        hasMoreComments.value = false;
        return;
      }
      const { column, value } = contentInfo.value;
      try {
        const count = await fetchTotalCount(column, value);
        if (count === null) {
          isLoadingInitial.value = false;
          hasMoreComments.value = false;
          return;
        }
        totalCommentsCount.value = count;
        if (totalCommentsCount.value === 0) {
          hasMoreComments.value = false;
          allComments.value = [];
        } else {
          const { newTopLevelComments, repliesData } = await fetchCommentsBatch(column, value, 1);
          const newComments = [...newTopLevelComments, ...repliesData];
          const existingIds = /* @__PURE__ */ new Set();
          newComments.forEach((comment) => {
            if (!existingIds.has(comment.id)) {
              allComments.value.push(comment);
              existingIds.add(comment.id);
            }
          });
          hasMoreComments.value = newTopLevelComments.length === commentsPerPage.value;
        }
      } catch (err) {
        console.error("Error fetching initial comments:", err);
        fetchError.value = `فشل تحميل التعليقات: (${err.message || "خطأ غير معروف"})`;
        allComments.value = [];
        totalCommentsCount.value = 0;
        hasMoreComments.value = false;
      } finally {
        isLoadingInitial.value = false;
      }
    };
    const handleCommentUpdate = (updatedComment) => {
      const index = allComments.value.findIndex((c) => c.id === updatedComment.id);
      if (index !== -1) {
        allComments.value.splice(index, 1, updatedComment);
      }
    };
    const handleCommentDelete = (deletedCommentId) => {
      const idsToDelete = /* @__PURE__ */ new Set([deletedCommentId]);
      const findReplies = (parentId) => {
        allComments.value.forEach((c) => {
          if (c.parent_comment_id === parentId) {
            idsToDelete.add(c.id);
            findReplies(c.id);
          }
        });
      };
      findReplies(deletedCommentId);
      const initialLength = allComments.value.length;
      allComments.value = allComments.value.filter((c) => !idsToDelete.has(c.id));
      const deletedCount = initialLength - allComments.value.length;
      if (totalCommentsCount.value !== null && deletedCount > 0) {
        totalCommentsCount.value = Math.max(0, totalCommentsCount.value - deletedCount);
      }
    };
    const handleReplyAdded = (newReply) => {
      if (!allComments.value.some((c) => c.id === newReply.id)) {
        allComments.value.push(newReply);
        if (totalCommentsCount.value !== null) totalCommentsCount.value++;
      }
    };
    const formatDate = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short", hour12: true });
      } catch {
        return "";
      }
    };
    watch(contentInfo, (newVal, oldVal) => {
      if ((newVal == null ? void 0 : newVal.value) !== (oldVal == null ? void 0 : oldVal.value) || (newVal == null ? void 0 : newVal.column) !== (oldVal == null ? void 0 : oldVal.column)) {
        if (newVal) {
          fetchInitialComments();
        } else {
          allComments.value = [];
          totalCommentsCount.value = 0;
          fetchError.value = "خطأ في إعداد المكون: لم يتم تحديد معرف محتوى.";
          isLoadingInitial.value = false;
          hasMoreComments.value = false;
        }
      }
    }, { immediate: false });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "mt-8 py-6 border-t border-gray-200 dark:border-gray-700" }, _attrs))}><h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white"> التعليقات (${ssrInterpolate(totalCommentsCount.value ?? "...")}) </h2>`);
      if (unref(user)) {
        _push(`<div class="mb-6"><div class="flex space-x-3 rtl:space-x-reverse">`);
        _push(ssrRenderComponent(_sfc_main$1, {
          "avatar-url": (_a = unref(userProfile)) == null ? void 0 : _a.avatar_url,
          name: (_b = unref(userProfile)) == null ? void 0 : _b.full_name,
          size: "md",
          class: "flex-shrink-0 mt-1"
        }, null, _parent));
        _push(`<div class="flex-1 min-w-0"><textarea rows="3" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-70" placeholder="إضافة تعليق عام..."${ssrIncludeBooleanAttr(isSubmittingComment.value || isSuspended.value) ? " disabled" : ""} aria-label="إضافة تعليق جديد">${ssrInterpolate(newCommentContent.value)}</textarea>`);
        if (isSuspended.value) {
          _push(`<p class="mt-1 text-xs text-yellow-600 dark:text-yellow-400"> التعليق موقوف حاليًا حتى ${ssrInterpolate(formatDate((_c = unref(userStore).profile) == null ? void 0 : _c.comment_suspended_until))}. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">`);
        if (commentSubmitError.value) {
          _push(`<span class="text-xs text-red-500 flex-1 text-right">${ssrInterpolate(commentSubmitError.value)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button type="button"${ssrIncludeBooleanAttr(isSubmittingComment.value || !newCommentContent.value.trim() || isSuspended.value) ? " disabled" : ""} class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">`);
        if (isSubmittingComment.value) {
          _push(`<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span>${ssrInterpolate(isSubmittingComment.value ? "جاري الإضافة..." : isSuspended.value ? "التعليق موقوف" : "إضافة تعليق")}</span></button></div></div></div></div>`);
      } else {
        _push(`<div class="mb-6 p-4 text-center bg-gray-100 dark:bg-gray-800 rounded-md"><p class="text-sm text-gray-700 dark:text-gray-300"> يرجى `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: localePath("/login"),
          class: "text-primary-600 hover:underline dark:text-primary-400 font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`تسجيل الدخول`);
            } else {
              return [
                createTextVNode("تسجيل الدخول")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` أو `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: localePath("/signup"),
          class: "text-primary-600 hover:underline dark:text-primary-400 font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`إنشاء حساب`);
            } else {
              return [
                createTextVNode("إنشاء حساب")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` للتعليق. </p></div>`);
      }
      if (isLoadingInitial.value) {
        _push(`<div class="text-center py-10">`);
        _push(ssrRenderComponent(LoadingSpinner, { class: "mx-auto h-8 w-8 text-gray-500 dark:text-gray-400" }, null, _parent));
        _push(`<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">جاري تحميل التعليقات...</p></div>`);
      } else if (fetchError.value) {
        _push(`<div class="text-center py-6 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md p-4"><svg class="w-6 h-6 inline-block mb-1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg><p>${ssrInterpolate(fetchError.value)}</p>`);
        if (!fetchError.value.includes("إعداد المكون")) {
          _push(`<button class="mt-2 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-300 hover:underline">إعادة المحاولة</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else if (allComments.value.length === 0 && totalCommentsCount.value === 0) {
        _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400"><svg class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg><p class="text-lg font-medium">لا توجد تعليقات بعد</p><p class="text-sm mt-1">كن أول من يترك تعليقاً!</p></div>`);
      } else {
        _push(`<div class="space-y-4"><!--[-->`);
        ssrRenderList(topLevelComments.value, (comment) => {
          _push(ssrRenderComponent(CommentItem, {
            key: comment.id,
            comment,
            replies: getRepliesForComment(comment.id),
            "content-id": contentIdentifier.value,
            "is-commenting-suspended": isSuspended.value,
            onCommentUpdated: handleCommentUpdate,
            onCommentDeleted: handleCommentDelete,
            onReplyAdded: handleReplyAdded,
            class: "border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4"
          }, null, _parent));
        });
        _push(`<!--]-->`);
        if (hasMoreComments.value) {
          _push(`<div class="text-center pt-4"><button${ssrIncludeBooleanAttr(isLoadingMore.value) ? " disabled" : ""} class="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 border border-transparent rounded-md hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">`);
          if (isLoadingMore.value) {
            _push(`<svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<span>${ssrInterpolate(isLoadingMore.value ? "جاري التحميل..." : "تحميل المزيد من التعليقات")}</span></button>`);
          if (fetchMoreError.value) {
            _push(`<p class="mt-2 text-xs text-red-500">${ssrInterpolate(fetchMoreError.value)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</section>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=CommentSection.vue2.mjs.map
