import { defineComponent, defineAsyncComponent, ref, unref } from "vue";
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderList, ssrInterpolate } from "vue/server-renderer";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "books",
  __ssrInlineRender: true,
  setup(__props) {
    const LazyAdminBookAddModal = defineAsyncComponent(() => import("../../components/admin/BookAddModal.vue.mjs"));
    const LazyAdminBookEditModal = defineAsyncComponent(() => import("../../components/admin/BookEditModal.vue.mjs"));
    const supabase = useSupabaseClient();
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const selectedBookForEdit = ref(null);
    const books = ref([]);
    const loadingList = ref(true);
    const lessons = ref([]);
    const loadingRelated = ref(true);
    async function fetchBooks() {
      loadingList.value = true;
      try {
        const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        books.value = data || [];
      } catch (err) {
        console.error("Error fetching books:", err.message);
        alert(`فشل تحميل قائمة الكتب: ${err.message}`);
      } finally {
        loadingList.value = false;
      }
    }
    function getLessonTitle(lessonId) {
      if (!lessonId) return null;
      const lesson = lessons.value.find((l) => l.id === lessonId);
      return lesson ? lesson.title : `درس #${lessonId}`;
    }
    function formatDate(dateString) {
      if (!dateString) return "-";
      try {
        return new Date(dateString).toLocaleDateString("ar-EG", {
          day: "numeric",
          month: "short",
          year: "numeric"
        });
      } catch (e) {
        return "تاريخ غير صالح";
      }
    }
    function closeAddModal() {
      showAddModal.value = false;
    }
    function handleBookAdded() {
      closeAddModal();
      fetchBooks();
    }
    function closeEditModal() {
      showEditModal.value = false;
      selectedBookForEdit.value = null;
    }
    function handleBookUpdated() {
      closeEditModal();
      fetchBooks();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-051e6a69><div class="flex justify-between items-center mb-6" data-v-051e6a69><h1 class="text-2xl font-semibold" data-v-051e6a69>إدارة الكتب والأبحاث</h1><button class="button-primary"${ssrIncludeBooleanAttr(loadingRelated.value) ? " disabled" : ""} data-v-051e6a69>`);
      if (loadingRelated.value) {
        _push(`<span data-v-051e6a69>تحميل البيانات...</span>`);
      } else {
        _push(`<span data-v-051e6a69>إضافة كتاب/بحث جديد</span>`);
      }
      _push(`</button></div>`);
      if (loadingList.value) {
        _push(`<div class="text-center py-10" data-v-051e6a69>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-2 text-sm text-gray-500 dark:text-gray-400" data-v-051e6a69>جارٍ تحميل قائمة الكتب...</p></div>`);
      } else if (books.value.length === 0) {
        _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-051e6a69> لا توجد كتب أو أبحاث مضافة حتى الآن. </div>`);
      } else {
        _push(`<div class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 rounded-lg" data-v-051e6a69><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" data-v-051e6a69><thead class="bg-gray-50 dark:bg-gray-800" data-v-051e6a69><tr data-v-051e6a69><th scope="col" class="table-header" data-v-051e6a69>العنوان</th><th scope="col" class="table-header" data-v-051e6a69>النوع</th><th scope="col" class="table-header" data-v-051e6a69>مرتبط بدرس</th><th scope="col" class="table-header" data-v-051e6a69>تاريخ الإضافة</th><th scope="col" class="relative px-6 py-3" data-v-051e6a69><span class="sr-only" data-v-051e6a69>إجراءات</span></th></tr></thead><tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" data-v-051e6a69><!--[-->`);
        ssrRenderList(books.value, (book) => {
          _push(`<tr data-v-051e6a69><td class="table-cell font-medium text-gray-900 dark:text-white" data-v-051e6a69>${ssrInterpolate(book.title)}</td><td class="table-cell" data-v-051e6a69>`);
          if (book.is_research) {
            _push(`<span class="badge-blue" data-v-051e6a69>بحث</span>`);
          } else if (book.is_transcript) {
            _push(`<span class="badge-yellow" data-v-051e6a69>تفريغ</span>`);
          } else {
            _push(`<span class="badge-green" data-v-051e6a69>كتاب</span>`);
          }
          _push(`</td><td class="table-cell" data-v-051e6a69>${ssrInterpolate(getLessonTitle(book.linked_lesson_id) || "غير مرتبط")}</td><td class="table-cell" data-v-051e6a69>${ssrInterpolate(formatDate(book.created_at))}</td><td class="table-cell text-right font-medium space-x-2 rtl:space-x-reverse" data-v-051e6a69><button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" data-v-051e6a69>تعديل</button><button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" data-v-051e6a69>حذف</button></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      if (showAddModal.value) {
        _push(ssrRenderComponent(unref(LazyAdminBookAddModal), {
          lessons: lessons.value,
          onClose: closeAddModal,
          onBookAdded: handleBookAdded
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      if (showEditModal.value && selectedBookForEdit.value) {
        _push(ssrRenderComponent(unref(LazyAdminBookEditModal), {
          book: selectedBookForEdit.value,
          lessons: lessons.value,
          onClose: closeEditModal,
          onBookUpdated: handleBookUpdated
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=books.vue3.mjs.map
