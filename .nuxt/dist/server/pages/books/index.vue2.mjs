import { defineComponent, ref, computed, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderList, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import BookCard from "../../components/BookCard.vue.mjs";
import LazyPdfViewerModal from "../../components/PdfViewerModal.vue.mjs";
import { useHead } from "../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const books = ref([]);
    const filterCategories = ref([]);
    const selectedCategoryId = ref(null);
    const searchQuery = ref("");
    ref("");
    ref(null);
    ref(1);
    const totalBooksCount = ref(0);
    const noMoreBooks = ref(false);
    const pending = ref(true);
    const loadingMore = ref(false);
    const error = ref(null);
    const loadingFilters = ref(false);
    const filterError = ref(null);
    const showPdfModal = ref(false);
    const selectedPdfPath = ref(null);
    const selectedBookTitle = ref(null);
    ref(null);
    computed(() => totalBooksCount.value);
    function openPdfModal(book) {
      if (book.storage_path) {
        selectedPdfPath.value = book.storage_path;
        selectedBookTitle.value = book.title ?? "مستند PDF";
        showPdfModal.value = true;
      } else {
        console.warn(`Book "${book.title}" does not have a storage path.`);
        alert(`عذرًا، لا يوجد ملف مرتبط بهذا الكتاب (${book.title}).`);
      }
    }
    function closePdfModal() {
      showPdfModal.value = false;
    }
    useHead({
      title: "المكتبة الرقمية - موقع الشيخ إبراهيم بشندي",
      meta: [
        { name: "description", content: "تصفح وحمل كتب وأبحاث وتفريغات محاضرات ودروس الشيخ إبراهيم بشندي في مختلف العلوم الشرعية." }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4" }, _attrs))} data-v-aac0eec2><h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-6 border-b-2 border-olive-green pb-2" data-v-aac0eec2> المكتبة الرقمية </h1><div class="mb-8 space-y-4" data-v-aac0eec2><div data-v-aac0eec2><label for="library-search" class="sr-only" data-v-aac0eec2>ابحث في المكتبة</label><div class="relative" data-v-aac0eec2><div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-500 dark:text-gray-400" data-v-aac0eec2><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" data-v-aac0eec2><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" data-v-aac0eec2></path></svg></div><input type="search" id="library-search"${ssrRenderAttr("value", searchQuery.value)} class="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-olive-green focus:border-olive-green dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-olive-green/70 dark:focus:border-olive-green/70" placeholder="ابحث في الكتب والأبحاث والتفريغات..." aria-label="بحث في المكتبة" data-v-aac0eec2></div></div><div class="flex flex-wrap items-center gap-2 pt-2" data-v-aac0eec2><span class="text-sm font-medium text-gray-700 dark:text-gray-300 ms-2 hidden sm:inline" data-v-aac0eec2>تصفية حسب الفئة:</span><button${ssrIncludeBooleanAttr(pending.value || loadingMore.value) ? " disabled" : ""} class="${ssrRenderClass([
        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-olive-green disabled:opacity-50 disabled:cursor-not-allowed",
        selectedCategoryId.value === null ? "bg-olive-green text-white shadow" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      ])}" data-v-aac0eec2> كل الفئات </button><!--[-->`);
      ssrRenderList(filterCategories.value, (filterCat) => {
        _push(`<button${ssrIncludeBooleanAttr(pending.value || loadingMore.value) ? " disabled" : ""} class="${ssrRenderClass([
          "px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-olive-green disabled:opacity-50 disabled:cursor-not-allowed",
          selectedCategoryId.value === filterCat.id ? "bg-olive-green text-white shadow" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        ])}" data-v-aac0eec2>${ssrInterpolate(filterCat.name)}</button>`);
      });
      _push(`<!--]-->`);
      if (loadingFilters.value) {
        _push(`<div class="text-xs text-gray-500" data-v-aac0eec2>جار تحميل الفئات...</div>`);
      } else {
        _push(`<!---->`);
      }
      if (filterError.value) {
        _push(`<div class="text-xs text-red-500" data-v-aac0eec2>خطأ تحميل الفئات.</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (pending.value) {
        _push(`<div class="text-center py-20" data-v-aac0eec2><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive-green" data-v-aac0eec2></div><p class="mt-4 text-gray-600 dark:text-gray-400" data-v-aac0eec2>جارٍ تحميل الكتب...</p></div>`);
      } else if (error.value && books.value.length === 0) {
        _push(`<div class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-2xl mx-auto" data-v-aac0eec2><p class="text-red-600 dark:text-red-400 font-semibold mb-2 text-lg" data-v-aac0eec2><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 inline-block align-middle me-1" aria-hidden="true" data-v-aac0eec2><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" data-v-aac0eec2></path></svg> حدث خطأ أثناء تحميل المكتبة. </p>`);
        if (error.value.message) {
          _push(`<pre class="mt-1 text-xs text-left bg-red-100 dark:bg-red-800/30 p-2 rounded border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 whitespace-pre-wrap" data-v-aac0eec2>${ssrInterpolate(error.value.message)}</pre>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="mt-6 px-5 py-2 bg-olive-green text-white rounded hover:bg-opacity-80 transition-colors text-sm font-medium" data-v-aac0eec2><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block align-middle me-1" data-v-aac0eec2><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" data-v-aac0eec2></path></svg> إعادة المحاولة </button></div>`);
      } else if (!pending.value && books.value.length === 0) {
        _push(`<div class="text-center py-16 text-gray-500 dark:text-gray-400" data-v-aac0eec2>`);
        if (searchQuery.value || selectedCategoryId.value !== null) {
          _push(`<div data-v-aac0eec2><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mb-4 mx-auto text-gray-400 dark:text-gray-500" data-v-aac0eec2><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" data-v-aac0eec2></path></svg><p class="text-lg" data-v-aac0eec2>لم يتم العثور على نتائج تطابق بحثك أو الفلتر المطبق.</p>`);
          if (searchQuery.value) {
            _push(`<p class="text-sm mt-1" data-v-aac0eec2>حاول تبسيط كلمات البحث أو تغيير الفئة.</p>`);
          } else {
            _push(`<!---->`);
          }
          if (selectedCategoryId.value !== null || searchQuery.value) {
            _push(`<button class="mt-4 text-sm text-olive-green hover:underline" data-v-aac0eec2> عرض كل الكتب </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div data-v-aac0eec2><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mb-4 mx-auto text-gray-400 dark:text-gray-500" aria-hidden="true" data-v-aac0eec2><path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.27a.75.75 0 0 0-.624-.744A8.25 8.25 0 0 1 6 18.75a8.25 8.25 0 0 1-5.25-2.268v-2.156a.75.75 0 0 0 .51-.698A8.217 8.217 0 0 1 6 13.5a8.182 8.182 0 0 1 5.25 1.406v-1.406a8.182 8.182 0 0 1-5.25 1.406 8.217 8.217 0 0 1-4.74-.954.75.75 0 0 0-.51-.698V9.732a8.25 8.25 0 0 1 5.25-2.268 8.25 8.25 0 0 1 5.25 2.268V9.376a.75.75 0 0 0 .624.744v1.27ZM12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533v-1.27a.75.75 0 0 1 .624-.744A8.25 8.25 0 0 0 18 18.75a8.25 8.25 0 0 0 5.25-2.268v-2.156a.75.75 0 0 1-.51-.698A8.217 8.217 0 0 0 18 13.5a8.182 8.182 0 0 0-5.25 1.406v-1.406a8.182 8.182 0 0 0 5.25 1.406 8.217 8.217 0 0 0 4.74-.954.75.75 0 0 1 .51-.698V9.732a8.25 8.25 0 0 0-5.25-2.268 8.25 8.25 0 0 0-5.25 2.268V9.376a.75.75 0 0 1-.624.744v1.27Z" data-v-aac0eec2></path></svg><p class="text-lg" data-v-aac0eec2>المكتبة فارغة حاليًا.</p></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-v-aac0eec2><!--[-->`);
        ssrRenderList(books.value, (book) => {
          _push(ssrRenderComponent(BookCard, {
            key: book.id,
            book,
            onOpenPdf: openPdfModal
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`<div class="h-10 flex justify-center items-center mt-10" data-v-aac0eec2>`);
      if (loadingMore.value) {
        _push(`<div class="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-400" data-v-aac0eec2><svg class="animate-spin h-5 w-5 text-olive-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-aac0eec2><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-aac0eec2></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-aac0eec2></path></svg><span data-v-aac0eec2>جارٍ تحميل المزيد...</span></div>`);
      } else if (!pending.value && books.value.length > 0 && noMoreBooks.value) {
        _push(`<div class="text-sm text-gray-500 dark:text-gray-400" data-v-aac0eec2> ~ نهاية القائمة ~ </div>`);
      } else if (error.value && books.value.length > 0) {
        _push(`<div class="text-sm text-red-600 dark:text-red-400" data-v-aac0eec2> حدث خطأ أثناء تحميل المزيد. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(LazyPdfViewerModal, {
        show: showPdfModal.value,
        "storage-path": selectedPdfPath.value,
        "book-title": selectedBookTitle.value,
        onClose: closePdfModal
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=index.vue2.mjs.map
