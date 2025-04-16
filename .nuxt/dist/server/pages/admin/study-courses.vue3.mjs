import { defineComponent, defineAsyncComponent, ref, withAsyncContext, watch, unref } from "vue";
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from "vue/server-renderer";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useAsyncData } from "../../node_modules/nuxt/dist/app/composables/asyncData.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "study-courses",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const LazyAdminCourseAddEditModal = defineAsyncComponent(() => import("../../components/admin/CourseAddEditModal.vue.mjs"));
    const supabase = useSupabaseClient();
    const courses = ref([]);
    const filterCategories = ref([]);
    const pending = ref(true);
    const error = ref(null);
    const showCourseModal = ref(false);
    const selectedCourseForEdit = ref(null);
    const loadingFilters = ref(true);
    const { data: courseData, pending: coursePending, error: courseError, refresh: refreshCourses } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      "adminCourses",
      // Unique key
      async () => {
        console.log("Fetching courses via useAsyncData...");
        const { data, error: fetchError } = await supabase.from("study_courses").select("*").order("created_at", { ascending: false });
        if (fetchError) {
          console.error("Error fetching courses (useAsyncData):", fetchError.message);
          throw fetchError;
        }
        console.log("Courses fetched (useAsyncData):", data == null ? void 0 : data.length);
        return data || [];
      },
      {
        default: () => []
        // Provide a default empty array
        // server: false // Optional: uncomment to fetch only on client
      }
    )), __temp = await __temp, __restore(), __temp);
    const { data: categoryData, pending: catPending, error: catError, refresh: refreshCategories } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      "adminCourseCategories",
      // Unique key
      async () => {
        console.log("Fetching categories via useAsyncData...");
        const { data, error: fetchCatError } = await supabase.from("categories").select("id, name").order("name");
        if (fetchCatError) {
          console.error("Error fetching categories (useAsyncData):", fetchCatError.message);
          throw fetchCatError;
        }
        console.log("Categories fetched (useAsyncData):", data == null ? void 0 : data.length);
        return data || [];
      },
      {
        default: () => []
        // server: false
      }
    )), __temp = await __temp, __restore(), __temp);
    watch(coursePending, (newPending) => {
      pending.value = newPending;
    }, { immediate: true });
    watch(courseError, (newError) => {
      error.value = newError;
    }, { immediate: true });
    watch(courseData, (newData) => {
      courses.value = newData || [];
    }, { immediate: true });
    watch(catPending, (newPending) => {
      loadingFilters.value = newPending;
    }, { immediate: true });
    watch(categoryData, (newData) => {
      filterCategories.value = newData || [];
    }, { immediate: true });
    function getCategoryName(categoryId) {
      if (!categoryId || !Array.isArray(filterCategories.value)) return null;
      const category = filterCategories.value.find((c) => c.id === categoryId);
      return category ? category.name : `فئة #${categoryId}`;
    }
    function formatDate(dateString) {
      if (!dateString) return "-";
      try {
        return new Date(dateString).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" });
      } catch (e) {
        return "تاريخ غير صالح";
      }
    }
    function getCourseImageUrl(imageUrl) {
      return imageUrl || "/images/placeholder-course.jpg";
    }
    function closeCourseModal() {
      showCourseModal.value = false;
      selectedCourseForEdit.value = null;
    }
    async function handleCourseSaved() {
      closeCourseModal();
      await refreshCourses();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-566fa94c><div class="flex justify-between items-center mb-6" data-v-566fa94c><h1 class="text-2xl font-semibold" data-v-566fa94c>إدارة الدورات الدراسية</h1><button class="button-primary"${ssrIncludeBooleanAttr(loadingFilters.value) ? " disabled" : ""} data-v-566fa94c>`);
      if (loadingFilters.value) {
        _push(`<span data-v-566fa94c>تحميل...</span>`);
      } else {
        _push(`<span data-v-566fa94c>إضافة دورة جديدة</span>`);
      }
      _push(`</button></div>`);
      if (pending.value) {
        _push(`<div class="text-center py-10" data-v-566fa94c>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-2 text-sm text-gray-500 dark:text-gray-400" data-v-566fa94c>جارٍ تحميل قائمة الدورات...</p></div>`);
      } else if (error.value) {
        _push(`<div class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md mx-auto" data-v-566fa94c><p class="text-red-600 dark:text-red-400 font-semibold mb-2" data-v-566fa94c><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 inline-block align-middle me-1" aria-hidden="true" data-v-566fa94c><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" data-v-566fa94c></path></svg> خطأ تحميل الدورات </p><pre class="mt-1 text-xs text-left bg-red-100 dark:bg-red-800/30 p-2 rounded border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 whitespace-pre-wrap" data-v-566fa94c>${ssrInterpolate(error.value.message)}</pre><button class="mt-4 px-4 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900 transition-colors text-sm font-medium" data-v-566fa94c> إعادة المحاولة </button></div>`);
      } else if (!pending.value && Array.isArray(courses.value) && courses.value.length === 0) {
        _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-566fa94c><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto mb-2 text-gray-400" data-v-566fa94c><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" data-v-566fa94c></path></svg> لا توجد دورات دراسية مضافة حتى الآن. </div>`);
      } else if (!pending.value && Array.isArray(courses.value) && courses.value.length > 0) {
        _push(`<div class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 rounded-lg" data-v-566fa94c><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" data-v-566fa94c><thead class="bg-gray-50 dark:bg-gray-800" data-v-566fa94c><tr data-v-566fa94c><th scope="col" class="table-header" data-v-566fa94c></th><th scope="col" class="table-header" data-v-566fa94c>العنوان</th><th scope="col" class="table-header" data-v-566fa94c>الفئة</th><th scope="col" class="table-header text-center" data-v-566fa94c>الحالة</th><th scope="col" class="table-header" data-v-566fa94c>تاريخ الإضافة</th><th scope="col" class="relative px-6 py-3" data-v-566fa94c><span class="sr-only" data-v-566fa94c>إجراءات</span></th></tr></thead><tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" data-v-566fa94c><!--[-->`);
        ssrRenderList(courses.value, (course) => {
          _push(`<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50" data-v-566fa94c><td class="px-4 py-2 whitespace-nowrap" data-v-566fa94c>`);
          if (course.image_url) {
            _push(`<img${ssrRenderAttr("src", getCourseImageUrl(course.image_url))}${ssrRenderAttr("alt", course.title ?? "صورة الدورة")} class="h-10 w-16 object-cover rounded border border-gray-200 dark:border-gray-700" data-v-566fa94c>`);
          } else {
            _push(`<div class="h-10 w-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400" data-v-566fa94c><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6" data-v-566fa94c><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm16.5-5.818V18" data-v-566fa94c></path></svg></div>`);
          }
          _push(`</td><td class="table-cell font-medium text-gray-900 dark:text-white" data-v-566fa94c>${ssrInterpolate(course.title)}</td><td class="table-cell" data-v-566fa94c>${ssrInterpolate(getCategoryName(course.category_id) || "-")}</td><td class="table-cell text-center" data-v-566fa94c><button${ssrRenderAttr("title", course.is_active ? "إلغاء تفعيل الدورة" : "تفعيل الدورة")} data-v-566fa94c>`);
          if (course.is_active) {
            _push(`<span class="badge-green" data-v-566fa94c>نشط</span>`);
          } else {
            _push(`<span class="badge-red" data-v-566fa94c>غير نشط</span>`);
          }
          _push(`</button></td><td class="table-cell" data-v-566fa94c>${ssrInterpolate(formatDate(course.created_at))}</td><td class="table-cell text-right font-medium space-x-2 rtl:space-x-reverse whitespace-nowrap" data-v-566fa94c><button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" data-v-566fa94c>تعديل</button><button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" data-v-566fa94c>حذف</button></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else if (!pending.value && !error.value) {
        _push(`<div data-v-566fa94c><p class="text-center py-10 text-gray-400" data-v-566fa94c>حالة غير متوقعة.</p></div>`);
      } else {
        _push(`<!---->`);
      }
      if (showCourseModal.value) {
        _push(ssrRenderComponent(unref(LazyAdminCourseAddEditModal), {
          "course-data": selectedCourseForEdit.value,
          categories: filterCategories.value,
          onClose: closeCourseModal,
          onSaved: handleCourseSaved
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
//# sourceMappingURL=study-courses.vue3.mjs.map
