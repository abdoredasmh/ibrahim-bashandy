import { defineComponent, ref, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderClass, ssrRenderList, ssrInterpolate, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderStyle } from "vue/server-renderer";
import LessonCard from "../../components/LessonCard.vue.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useHead } from "../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const filterCategories = ref([]);
    const loadingFilters = ref(false);
    const filterError = ref(null);
    const selectedCategoryId = ref(null);
    const allCategoriesWithLessons = ref([]);
    const pending = ref(true);
    const error = ref(null);
    const currentPage = ref(1);
    const loadingMoreCategories = ref(false);
    const noMoreCategories = ref(false);
    ref(null);
    useHead({
      title: "سلاسل الدروس - موقع الشيخ إبراهيم بشندي",
      meta: [
        { name: "description", content: "تصفح واستمع إلى سلاسل الدروس والمحاضرات العامة للشيخ إبراهيم بشندي في مختلف العلوم الشرعية." }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-10" }, _attrs))} data-v-bb633b8c><div class="mb-8" data-v-bb633b8c><div class="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4" data-v-bb633b8c><span class="text-sm font-medium text-gray-700 dark:text-gray-300 ms-2" data-v-bb633b8c>تصفية حسب السلسلة:</span><button class="${ssrRenderClass([
        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-olive-green",
        selectedCategoryId.value === null ? "bg-olive-green text-white shadow" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
      ])}" data-v-bb633b8c> الكل </button><!--[-->`);
      ssrRenderList(filterCategories.value, (filterCat) => {
        _push(`<button class="${ssrRenderClass([
          "px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-olive-green",
          selectedCategoryId.value === filterCat.id ? "bg-olive-green text-white shadow" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        ])}" data-v-bb633b8c>${ssrInterpolate(filterCat.name)}</button>`);
      });
      _push(`<!--]-->`);
      if (loadingFilters.value) {
        _push(`<div class="text-sm text-gray-500" data-v-bb633b8c>جار تحميل الفلاتر...</div>`);
      } else {
        _push(`<!---->`);
      }
      if (filterError.value) {
        _push(`<div class="text-sm text-red-500" data-v-bb633b8c>خطأ تحميل الفلاتر.</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (pending.value) {
        _push(`<div class="text-center py-10" data-v-bb633b8c><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive-green" data-v-bb633b8c></div><p class="mt-4 text-gray-600 dark:text-gray-400" data-v-bb633b8c>${ssrInterpolate(selectedCategoryId.value ? "جارٍ تحميل دروس السلسلة المختارة..." : "جارٍ تحميل السلاسل والدروس...")}</p></div>`);
      } else if (error.value) {
        _push(`<div class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-2xl mx-auto" data-v-bb633b8c><p class="text-red-600 dark:text-red-400 font-semibold mb-2 text-lg" data-v-bb633b8c><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 inline-block align-middle me-1" aria-hidden="true" data-v-bb633b8c><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" data-v-bb633b8c></path></svg> ${ssrInterpolate(selectedCategoryId.value ? "عذرًا، حدث خطأ أثناء تحميل دروس السلسلة." : "عذرًا، حدث خطأ أثناء التحميل الأولي.")}</p>`);
        if (error.value.message) {
          _push(`<pre class="mt-1 text-xs text-left bg-red-100 dark:bg-red-800/30 p-2 rounded border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 whitespace-pre-wrap" data-v-bb633b8c>${ssrInterpolate(error.value.message)}</pre>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="mt-6 px-5 py-2 bg-olive-green text-white rounded hover:bg-opacity-80 transition-colors text-sm font-medium" data-v-bb633b8c><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block align-middle me-1" data-v-bb633b8c><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" data-v-bb633b8c></path></svg> ${ssrInterpolate(selectedCategoryId.value ? "إعادة تحميل السلسلة" : "إعادة المحاولة")}</button></div>`);
      } else if (allCategoriesWithLessons.value && allCategoriesWithLessons.value.length > 0) {
        _push(`<div class="space-y-12" data-v-bb633b8c><!--[-->`);
        ssrRenderList(allCategoriesWithLessons.value, (category) => {
          _push(`<div class="category-section" data-v-bb633b8c><h2 class="text-2xl font-semibold mb-4 text-brown-dark dark:text-beige-light border-b border-gray-300 dark:border-gray-700 pb-2" data-v-bb633b8c>${ssrInterpolate(category.name)} <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ms-2" data-v-bb633b8c>(${ssrInterpolate(category.totalLessonsCount)} درس)</span></h2>`);
          if (category.lessons && category.lessons.length > 0) {
            _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6" data-v-bb633b8c><!--[-->`);
            ssrRenderList(category.lessons, (lesson) => {
              _push(ssrRenderComponent(LessonCard, {
                key: lesson.id,
                lesson
              }, null, _parent));
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<p class="text-gray-500 dark:text-gray-400 mt-4" data-v-bb633b8c>لا توجد دروس متاحة حاليًا في هذه السلسلة.</p>`);
          }
          if (category.loadedLessonsCount < category.totalLessonsCount) {
            _push(`<div class="mt-6 text-center" data-v-bb633b8c><button${ssrIncludeBooleanAttr(category.isLoadingMoreLessons) ? " disabled" : ""} class="text-olive-green hover:underline font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed" data-v-bb633b8c>`);
            if (!category.isLoadingMoreLessons) {
              _push(`<span data-v-bb633b8c> تحميل المزيد من الدروس <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 inline-block align-middle ms-1" data-v-bb633b8c><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" data-v-bb633b8c></path></svg></span>`);
            } else {
              _push(`<span data-v-bb633b8c><div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-olive-green me-1 align-middle" data-v-bb633b8c></div> جارٍ التحميل... </span>`);
            }
            _push(`</button></div>`);
          } else {
            _push(`<!---->`);
          }
          if (category.errorLoadingMore) {
            _push(`<p class="mt-2 text-center text-sm text-red-600 dark:text-red-400" data-v-bb633b8c> حدث خطأ أثناء تحميل المزيد من الدروس. </p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--><div style="${ssrRenderStyle(selectedCategoryId.value === null ? null : { display: "none" })}" class="h-10 flex justify-center items-center" data-v-bb633b8c>`);
        if (loadingMoreCategories.value && !noMoreCategories.value) {
          _push(`<div class="text-center py-6" data-v-bb633b8c><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-olive-green" data-v-bb633b8c></div><p class="text-sm text-gray-500 dark:text-gray-400 mt-2" data-v-bb633b8c>جارٍ تحميل المزيد من السلاسل...</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (noMoreCategories.value && selectedCategoryId.value === null && !pending.value && !loadingMoreCategories.value) {
          _push(`<div class="text-center py-6 text-gray-500 dark:text-gray-400" data-v-bb633b8c> ~ نهاية قائمة السلاسل ~ </div>`);
        } else {
          _push(`<!---->`);
        }
        if (error.value && currentPage.value > 1 && selectedCategoryId.value === null) {
          _push(`<div class="text-center py-6 text-red-600 dark:text-red-400" data-v-bb633b8c> حدث خطأ أثناء تحميل المزيد من السلاسل. حاول التمرير للأسفل مرة أخرى. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else if (!pending.value && (!allCategoriesWithLessons.value || allCategoriesWithLessons.value.length === 0)) {
        _push(`<div class="text-center py-16 text-gray-500 dark:text-gray-400" data-v-bb633b8c><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mb-4 mx-auto text-gray-400 dark:text-gray-500" aria-hidden="true" data-v-bb633b8c><path d="M3.41 1.86L2 3.27l4.22 4.22c-.15.19-.22.44-.22.71v10c0 .55.45 1 1 1h12c.34 0 .65-.17.83-.42L20.73 21l1.41-1.41L3.41 1.86M7 18V9.54l8.46 8.46H7m5-8l-2-2H7V8l3.18 3.18L12 10m5 0v-.73L15.27 7.54C15.61 7.2 16.09 7 16.63 7H17v-.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5V7h.5a.5.5 0 0 1 .5.5V12h-2v-2z" data-v-bb633b8c></path></svg><p class="text-lg" data-v-bb633b8c>${ssrInterpolate(selectedCategoryId.value ? "لا توجد دروس متاحة حاليًا في هذه السلسلة." : "لا توجد سلاسل دروس متاحة حاليًا.")}</p>`);
        if (selectedCategoryId.value) {
          _push(`<button class="mt-4 text-sm text-olive-green hover:underline" data-v-bb633b8c> عرض كل السلاسل </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
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
//# sourceMappingURL=index.vue2.mjs.map
