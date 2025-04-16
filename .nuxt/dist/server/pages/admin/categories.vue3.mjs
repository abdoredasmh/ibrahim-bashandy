import { defineComponent, ref } from "vue";
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr } from "vue/server-renderer";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import "../../components/admin/CategoryModal.vue.mjs";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import _sfc_main$1 from "../../components/admin/CategoryModal.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "categories",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const pending = ref(true);
    const fetchError = ref(null);
    const categories = ref(null);
    const showModal = ref(false);
    const selectedCategory = ref(null);
    const isProcessing = ref(null);
    const successMessage = ref(null);
    const actionError = ref(null);
    const fetchCategories = async () => {
      pending.value = true;
      fetchError.value = null;
      try {
        const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        categories.value = data;
      } catch (err) {
        console.error("Error fetching categories:", err);
        fetchError.value = err;
        categories.value = null;
      } finally {
        pending.value = false;
      }
    };
    const closeModal = () => {
      showModal.value = false;
      selectedCategory.value = null;
    };
    const handleSave = async () => {
      closeModal();
      setSuccessMessage("تم حفظ الفئة بنجاح.");
      await fetchCategories();
    };
    const formatDate = (dateString) => {
      if (!dateString) return "-";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return "تاريخ غير صالح";
        }
        return date.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });
      } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "خطأ في التنسيق";
      }
    };
    const setSuccessMessage = (msg) => {
      successMessage.value = msg;
      actionError.value = null;
      setTimeout(() => {
        successMessage.value = null;
      }, 4e3);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-8ea16f3f><div class="flex justify-between items-center mb-6" data-v-8ea16f3f><h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200" data-v-8ea16f3f>إدارة الفئات</h1><button class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition duration-150 ease-in-out"${ssrIncludeBooleanAttr(pending.value || isProcessing.value) ? " disabled" : ""} data-v-8ea16f3f><span class="mr-2" data-v-8ea16f3f>+</span> إضافة فئة جديدة </button></div>`);
      if (pending.value) {
        _push(`<div class="text-center py-10" data-v-8ea16f3f>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-2 text-gray-500 dark:text-gray-400" data-v-8ea16f3f>جاري تحميل الفئات...</p></div>`);
      } else if (fetchError.value) {
        _push(`<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert" data-v-8ea16f3f><strong class="font-bold" data-v-8ea16f3f>خطأ!</strong><span class="block sm:inline" data-v-8ea16f3f> حدث خطأ أثناء جلب الفئات: ${ssrInterpolate(fetchError.value.message)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (successMessage.value) {
        _push(`<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert" data-v-8ea16f3f>${ssrInterpolate(successMessage.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (actionError.value) {
        _push(`<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert" data-v-8ea16f3f>${ssrInterpolate(actionError.value)}</div>`);
      } else if (categories.value && categories.value.length > 0) {
        _push(`<div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg" data-v-8ea16f3f><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" data-v-8ea16f3f><thead class="bg-gray-50 dark:bg-gray-700" data-v-8ea16f3f><tr data-v-8ea16f3f><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-8ea16f3f> الاسم </th><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-8ea16f3f> الوصف </th><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-8ea16f3f> النوع </th><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-8ea16f3f> تاريخ الإنشاء </th><th scope="col" class="relative px-6 py-3" data-v-8ea16f3f><span class="sr-only" data-v-8ea16f3f>الإجراءات</span></th></tr></thead><tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" data-v-8ea16f3f><!--[-->`);
        ssrRenderList(categories.value, (category) => {
          _push(`<tr data-v-8ea16f3f><td class="px-6 py-4 whitespace-nowrap" data-v-8ea16f3f><div class="text-sm font-medium text-gray-900 dark:text-gray-100" data-v-8ea16f3f>${ssrInterpolate(category.name)}</div></td><td class="px-6 py-4" data-v-8ea16f3f><div class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs"${ssrRenderAttr("title", category.description || "")} data-v-8ea16f3f>${ssrInterpolate(category.description || "-")}</div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-v-8ea16f3f>${ssrInterpolate(category.type || "-")}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-v-8ea16f3f>${ssrInterpolate(formatDate(category.created_at))}</td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse" data-v-8ea16f3f><button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50"${ssrIncludeBooleanAttr(isProcessing.value === category.id) ? " disabled" : ""} data-v-8ea16f3f> تعديل </button><button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"${ssrIncludeBooleanAttr(isProcessing.value === category.id) ? " disabled" : ""} data-v-8ea16f3f>`);
          if (isProcessing.value === category.id) {
            _push(`<span data-v-8ea16f3f>جاري...</span>`);
          } else {
            _push(`<span data-v-8ea16f3f>حذف</span>`);
          }
          _push(`</button></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-8ea16f3f> لا توجد فئات لعرضها حالياً. قم بإضافة فئة جديدة. </div>`);
      }
      _push(ssrRenderComponent(_sfc_main$1, {
        show: showModal.value,
        "category-data": selectedCategory.value,
        onClose: closeModal,
        onSaved: handleSave
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=categories.vue3.mjs.map
