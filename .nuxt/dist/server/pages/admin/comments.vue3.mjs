import __nuxt_component_0 from "../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import ConfirmationModal from "../../components/ConfirmationModal.vue.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useHead } from "../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "comments",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const comments = ref([]);
    const pending = ref(false);
    const error = ref(null);
    const loadingMore = ref(false);
    const hasMore = ref(true);
    ref(0);
    ref(null);
    const showDeleteConfirm = ref(false);
    const commentToDelete = ref(null);
    const formatDate = (dateString) => {
    };
    const getPostLink = (comment) => {
      var _a, _b, _c;
      if (comment.lesson_id && ((_a = comment.lessons) == null ? void 0 : _a.title)) {
        return { to: `/lessons/${comment.lesson_id}`, text: `درس: ${comment.lessons.title}` };
      } else if (comment.book_id && ((_b = comment.books) == null ? void 0 : _b.title)) {
        return { to: `/books?open=${comment.book_id}`, text: `كتاب: ${comment.books.title}` };
      } else if (comment.study_course_id && ((_c = comment.study_courses) == null ? void 0 : _c.title)) {
        return { to: `/study/courses/${comment.study_course_id}`, text: `دورة: ${comment.study_courses.title}` };
      }
      return null;
    };
    const executeDeleteComment = async () => {
      if (!commentToDelete.value) return;
      const comment = commentToDelete.value;
      comment.isDeleting = true;
      showDeleteConfirm.value = false;
      try {
        console.log(`Deleting comment ${comment.id}...`);
        const { error: deleteError } = await supabase.from("comments").delete().eq("id", comment.id);
        if (deleteError) throw deleteError;
        console.log(`Comment ${comment.id} deleted successfully.`);
        comments.value = comments.value.filter((c) => c.id !== comment.id);
      } catch (err) {
        console.error(`Error deleting comment ${comment.id}:`, err);
        alert(`فشل حذف التعليق: ${err.message}`);
        comment.isDeleting = false;
      } finally {
        commentToDelete.value = null;
        const deletedCommentInList = comments.value.find((c) => c.id === comment.id);
        if (deletedCommentInList) deletedCommentInList.isDeleting = false;
      }
    };
    useHead({ title: "إدارة التعليقات" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-4 sm:p-6" }, _attrs))} data-v-05b8aed2><h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6" data-v-05b8aed2>إدارة التعليقات</h1>`);
      if (pending.value && comments.value.length === 0) {
        _push(`<div class="text-center py-10" data-v-05b8aed2>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-3 text-gray-500 dark:text-gray-400" data-v-05b8aed2>جارٍ تحميل التعليقات...</p></div>`);
      } else if (error.value) {
        _push(`<div class="error-box" data-v-05b8aed2><p data-v-05b8aed2>حدث خطأ أثناء تحميل التعليقات:</p><pre class="mt-2 text-sm" data-v-05b8aed2>${ssrInterpolate(error.value.message)}</pre><button class="button-secondary mt-4" data-v-05b8aed2>إعادة المحاولة</button></div>`);
      } else if (comments.value.length === 0 && !pending.value) {
        _push(`<div class="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-lg" data-v-05b8aed2><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto text-gray-400" data-v-05b8aed2><path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9.008 9.008 0 0 1-9.887 8.554c-1.197.449-2.52.696-3.888.696C3.04 21.25 0 17.556 0 13c0-4.063 2.368-7.568 5.88-9.105a.75.75 0 0 1 .92.841 8.41 8.41 0 0 0 .454 2.351 .75.75 0 0 1-.687 1.342 9.903 9.903 0 0 1-.547-1.932A8.91 8.91 0 0 0 3.04 13c0 3.54 2.468 6.5 5.88 7.105v-1.05a1.482 1.482 0 0 1 1.488-1.48l.06-.004a8.4 8.4 0 0 0 4.986-7.412 8.36 8.36 0 0 0-.085-1.113.75.75 0 0 1 1.47-.29 9.86 9.86 0 0 1 .053.516c0 2.398-1.054 4.56-2.792 6.056l-.06.004a1.482 1.482 0 0 1-1.488 1.48v1.05c0 .33.116.643.31.887.71.865 1.617 1.568 2.662 2.082A9.008 9.008 0 0 0 21 13a8.91 8.91 0 0 0-2.12-5.88.75.75 0 1 1 1.06-1.061A10.41 10.41 0 0 1 21 13Z" data-v-05b8aed2></path></svg><p class="mt-3 font-medium text-gray-700 dark:text-gray-300" data-v-05b8aed2>لا توجد تعليقات لعرضها حالياً.</p></div>`);
      } else {
        _push(`<div class="space-y-4" data-v-05b8aed2><!--[-->`);
        ssrRenderList(comments.value, (comment) => {
          var _a, _b, _c;
          _push(`<div class="${ssrRenderClass([{ "opacity-50": comment.isDeleting }, "bg-white dark:bg-gray-800 p-4 rounded-lg shadow border dark:border-gray-700 relative"])}" data-v-05b8aed2><div class="flex items-start justify-between mb-2" data-v-05b8aed2><div class="flex items-center space-x-3 rtl:space-x-reverse" data-v-05b8aed2><img${ssrRenderAttr("src", ((_a = comment.profiles) == null ? void 0 : _a.avatar_url) || "/images/default-avatar.png")} alt="صورة المستخدم" class="w-8 h-8 rounded-full object-cover bg-gray-200 dark:bg-gray-600" data-v-05b8aed2><div data-v-05b8aed2><p class="text-sm font-semibold text-gray-800 dark:text-gray-200" data-v-05b8aed2>${ssrInterpolate(((_b = comment.profiles) == null ? void 0 : _b.full_name) ?? "مستخدم غير معروف")}</p><p class="text-xs text-gray-500 dark:text-gray-400" data-v-05b8aed2>${ssrInterpolate(formatDate(comment.created_at))} `);
          if (getPostLink(comment)) {
            _push(`<span class="mx-1" data-v-05b8aed2> - على: `);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: ((_c = getPostLink(comment)) == null ? void 0 : _c.to) || "#",
              class: "text-primary hover:underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a2, _b2;
                if (_push2) {
                  _push2(`${ssrInterpolate(((_a2 = getPostLink(comment)) == null ? void 0 : _a2.text) || "منشور")}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(((_b2 = getPostLink(comment)) == null ? void 0 : _b2.text) || "منشور"), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</p></div></div><div class="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0" data-v-05b8aed2><button${ssrIncludeBooleanAttr(comment.isDeleting) ? " disabled" : ""} class="p-1 rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 transition-colors" title="حذف التعليق" data-v-05b8aed2>`);
          if (comment.isDeleting) {
            _push(ssrRenderComponent(LoadingSpinner, { class: "w-4 h-4" }, null, _parent));
          } else {
            _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" data-v-05b8aed2><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.325.418C2.38 4.97 1.5 5.647 1.5 6.5V17a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3V6.5c0-.853-.88-1.53-2.175-1.889a48.47 48.47 0 0 0-2.325-.418v-.443A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.5.66 1.5 1.5v1.5c0 .84-.66 1.5-1.5 1.5s-1.5-.66-1.5-1.5V5.5C8.5 4.66 9.16 4 10 4ZM4.5 6.5c0-.132.015-.26.043-.386a.75.75 0 0 1 .914-.551 47.14 47.14 0 0 1 8.999.171.75.75 0 0 1 .914.55c.028.127.043.255.043.386V17a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4.5 17V6.5Z" clip-rule="evenodd" data-v-05b8aed2></path></svg>`);
          }
          _push(`</button></div></div><p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap" data-v-05b8aed2>${ssrInterpolate(comment.content)}</p></div>`);
        });
        _push(`<!--]--><div class="h-10 flex justify-center items-center" data-v-05b8aed2>`);
        if (loadingMore.value) {
          _push(ssrRenderComponent(LoadingSpinner, { class: "w-6 h-6 text-primary" }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (!hasMore.value && comments.value.length > 0) {
          _push(`<span class="text-sm text-gray-500 dark:text-gray-400" data-v-05b8aed2>لا توجد تعليقات أخرى.</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(ssrRenderComponent(ConfirmationModal, {
        isOpen: showDeleteConfirm.value,
        title: "تأكيد الحذف",
        message: "هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع عن هذا الإجراء.",
        confirmButtonText: "نعم، حذف",
        cancelButtonText: "إلغاء",
        onConfirm: executeDeleteComment,
        onCancel: ($event) => showDeleteConfirm.value = false
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=comments.vue3.mjs.map
