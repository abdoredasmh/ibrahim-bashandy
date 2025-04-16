import { defineComponent, ref, reactive, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from "vue/server-renderer";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BookAddModal",
  __ssrInlineRender: true,
  props: {
    lessons: {}
  },
  emits: ["close", "book-added"],
  setup(__props, { emit: __emit }) {
    useSupabaseClient();
    const formLoading = ref(false);
    const errorMessage = ref("");
    const bookFile = ref(null);
    const formData = reactive({
      // Omit storage_path as it comes from upload
      title: "",
      description: "",
      is_research: false,
      is_transcript: false,
      linked_lesson_id: null,
      cover_image_url: null
      // يجب إضافة حقل رفع صورة الغلاف إذا أردت استخدامه
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" }, _attrs))} data-v-59f59fb0><div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-v-59f59fb0><div class="p-6" data-v-59f59fb0><div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700" data-v-59f59fb0><h3 class="text-xl font-semibold text-gray-900 dark:text-white" data-v-59f59fb0>إضافة كتاب/بحث جديد</h3><button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" data-v-59f59fb0><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-v-59f59fb0><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-59f59fb0></path></svg></button></div><form class="mt-6 space-y-4" data-v-59f59fb0><div data-v-59f59fb0><label for="book-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-59f59fb0>العنوان *</label><input type="text" id="book-title"${ssrRenderAttr("value", formData.title)} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" data-v-59f59fb0></div><div data-v-59f59fb0><label for="book-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-59f59fb0>الوصف</label><textarea id="book-description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" data-v-59f59fb0>${ssrInterpolate(formData.description)}</textarea></div><div class="flex space-x-4 rtl:space-x-reverse" data-v-59f59fb0><div class="flex items-center" data-v-59f59fb0><input id="is_research"${ssrIncludeBooleanAttr(Array.isArray(formData.is_research) ? ssrLooseContain(formData.is_research, null) : formData.is_research) ? " checked" : ""} type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" data-v-59f59fb0><label for="is_research" class="ms-2 block text-sm text-gray-900 dark:text-gray-300" data-v-59f59fb0>هل هو بحث؟</label></div><div class="flex items-center" data-v-59f59fb0><input id="is_transcript"${ssrIncludeBooleanAttr(Array.isArray(formData.is_transcript) ? ssrLooseContain(formData.is_transcript, null) : formData.is_transcript) ? " checked" : ""} type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" data-v-59f59fb0><label for="is_transcript" class="ms-2 block text-sm text-gray-900 dark:text-gray-300" data-v-59f59fb0>هل هو تفريغ؟</label></div></div><div data-v-59f59fb0><label for="linked-lesson" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-59f59fb0>ربط بدرس (اختياري)</label><select id="linked-lesson" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm" data-v-59f59fb0><option${ssrRenderAttr("value", null)} data-v-59f59fb0${ssrIncludeBooleanAttr(Array.isArray(formData.linked_lesson_id) ? ssrLooseContain(formData.linked_lesson_id, null) : ssrLooseEqual(formData.linked_lesson_id, null)) ? " selected" : ""}>-- لا يوجد ربط --</option><!--[-->`);
      ssrRenderList(_ctx.lessons, (lesson) => {
        _push(`<option${ssrRenderAttr("value", lesson.id)} data-v-59f59fb0${ssrIncludeBooleanAttr(Array.isArray(formData.linked_lesson_id) ? ssrLooseContain(formData.linked_lesson_id, lesson.id) : ssrLooseEqual(formData.linked_lesson_id, lesson.id)) ? " selected" : ""}>${ssrInterpolate(lesson.title)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (!_ctx.lessons || _ctx.lessons.length === 0) {
        _push(`<p class="mt-1 text-xs text-yellow-600 dark:text-yellow-400" data-v-59f59fb0> لا توجد دروس متاحة للربط حاليًا. </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div data-v-59f59fb0><label for="book-file" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-59f59fb0>ملف الكتاب (PDF) *</label><input type="file" id="book-file" accept=".pdf" required class="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-600 dark:file:text-gray-200 dark:hover:file:bg-gray-500" data-v-59f59fb0>`);
      if (bookFile.value) {
        _push(`<p class="mt-1 text-xs text-gray-500 dark:text-gray-400" data-v-59f59fb0>الملف المختار: ${ssrInterpolate(bookFile.value.name)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (errorMessage.value) {
        _push(`<div class="text-red-600 dark:text-red-400 text-sm" data-v-59f59fb0>${ssrInterpolate(errorMessage.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="pt-4 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700" data-v-59f59fb0><button type="button"${ssrIncludeBooleanAttr(formLoading.value) ? " disabled" : ""} class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500" data-v-59f59fb0> إلغاء </button><button type="submit"${ssrIncludeBooleanAttr(formLoading.value || !bookFile.value) ? " disabled" : ""} class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50" data-v-59f59fb0>`);
      if (formLoading.value) {
        _push(`<span data-v-59f59fb0>جاري الحفظ...</span>`);
      } else {
        _push(`<span data-v-59f59fb0>حفظ الكتاب</span>`);
      }
      _push(`</button></div></form></div></div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=BookAddModal.vue2.mjs.map
