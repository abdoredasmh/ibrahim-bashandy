import { defineComponent, ref, mergeProps } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useSupabaseClient } from "../../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const announcements = ref([]);
    const isLoadingList = ref(false);
    const listError = ref(null);
    const isModalOpen = ref(false);
    const editingAnnouncement = ref(null);
    const isSaving = ref(false);
    const successMessage = ref(null);
    const errorMessage = ref(null);
    const initialFormData = {
      title: "",
      details: "",
      type: "announcement",
      date: "",
      link: "",
      is_published: false
    };
    const formData = ref({ ...initialFormData });
    function formatDate(dateString) {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true });
      } catch (e) {
        console.error("Error formatting date:", e);
        return "تاريخ غير صالح";
      }
    }
    function getTypeText(type) {
      switch (type) {
        case "lecture":
          return "محاضرة/درس";
        case "announcement":
          return "إعلان عام";
        case "live":
          return "بث مباشر";
        default:
          return String(type);
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-4 md:p-6 lg:p-8" }, _attrs))} data-v-8f013c71><div class="flex justify-between items-center mb-6 border-b border-cream-gray dark:border-gray-700 pb-3" data-v-8f013c71><h1 class="text-2xl font-bold text-brown-dark dark:text-beige-light" data-v-8f013c71> إدارة المواعيد والإعلانات </h1><button class="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800" data-v-8f013c71><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-v-8f013c71><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" data-v-8f013c71></path></svg> إضافة جديد </button></div>`);
      if (isLoadingList.value) {
        _push(`<div class="text-center py-10" data-v-8f013c71><p class="text-gray-500 dark:text-gray-400 mb-3" data-v-8f013c71>جاري تحميل الإعلانات...</p><div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status" data-v-8f013c71><span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]" data-v-8f013c71>Loading...</span></div></div>`);
      } else if (listError.value) {
        _push(`<div class="text-center py-10 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-md" data-v-8f013c71><p data-v-8f013c71>خطأ في تحميل القائمة: ${ssrInterpolate(listError.value)}</p><button class="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700" data-v-8f013c71> إعادة المحاولة </button></div>`);
      } else if (announcements.value.length > 0) {
        _push(`<div class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700" data-v-8f013c71><table class="min-w-full divide-y divide-cream-gray dark:divide-gray-700" data-v-8f013c71><thead class="bg-gray-50 dark:bg-gray-700/50" data-v-8f013c71><tr data-v-8f013c71><th scope="col" class="table-th" data-v-8f013c71>العنوان</th><th scope="col" class="table-th" data-v-8f013c71>النوع</th><th scope="col" class="table-th" data-v-8f013c71>التاريخ</th><th scope="col" class="table-th text-center" data-v-8f013c71>منشور؟</th><th scope="col" class="table-th text-left" data-v-8f013c71>إجراءات</th></tr></thead><tbody class="bg-white dark:bg-gray-800 divide-y divide-cream-gray dark:divide-gray-700" data-v-8f013c71><!--[-->`);
        ssrRenderList(announcements.value, (announcement) => {
          _push(`<tr class="table-tr" data-v-8f013c71><td class="table-td font-medium text-brown-dark dark:text-beige-light" data-v-8f013c71>${ssrInterpolate(announcement.title)}</td><td class="table-td" data-v-8f013c71><span class="${ssrRenderClass([
            "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
            announcement.type === "lecture" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200" : announcement.type === "live" ? "bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200 animate-pulse" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200"
          ])}" data-v-8f013c71>${ssrInterpolate(getTypeText(announcement.type))}</span></td><td class="table-td text-gray-700 dark:text-gray-300" data-v-8f013c71>${ssrInterpolate(formatDate(announcement.date) || "غير محدد")}</td><td class="table-td text-center" data-v-8f013c71><button class="${ssrRenderClass([
            "p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-150",
            announcement.is_published ? "bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800/60" : "bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800/60"
          ])}" data-v-8f013c71>`);
          if (announcement.is_published) {
            _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" data-v-8f013c71><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" data-v-8f013c71></path></svg>`);
          } else {
            _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" data-v-8f013c71><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" data-v-8f013c71></path></svg>`);
          }
          _push(`<span class="sr-only" data-v-8f013c71>${ssrInterpolate(announcement.is_published ? "إلغاء النشر" : "نشر")}</span></button></td><td class="table-td text-left font-medium space-x-reverse space-x-2" data-v-8f013c71><button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" data-v-8f013c71>تعديل</button><button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" data-v-8f013c71>حذف</button></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else {
        _push(`<div class="text-center py-10" data-v-8f013c71><p class="text-gray-500 dark:text-gray-400" data-v-8f013c71>لا توجد إعلانات أو مواعيد حاليًا.</p></div>`);
      }
      if (isModalOpen.value) {
        _push(`<div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true" data-v-8f013c71><div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" data-v-8f013c71><div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-80" aria-hidden="true" data-v-8f013c71></div><span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true" data-v-8f013c71>​</span><div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full" data-v-8f013c71><div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4" data-v-8f013c71><div class="sm:flex sm:items-start w-full" data-v-8f013c71><div class="mt-3 text-center sm:mt-0 sm:text-right w-full" data-v-8f013c71><h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-5" id="modal-title" data-v-8f013c71>${ssrInterpolate(editingAnnouncement.value ? "تعديل" : "إضافة جديد")}</h3><form data-v-8f013c71><div class="space-y-5" data-v-8f013c71><div data-v-8f013c71><label for="modal-title-input" class="form-label" data-v-8f013c71>العنوان <span class="text-red-500" data-v-8f013c71>*</span></label><input${ssrRenderAttr("value", formData.value.title)} type="text" id="modal-title-input" required class="form-input" data-v-8f013c71></div><div data-v-8f013c71><label for="modal-details" class="form-label" data-v-8f013c71>التفاصيل</label><textarea id="modal-details" rows="4" class="form-textarea" data-v-8f013c71>${ssrInterpolate(formData.value.details)}</textarea></div><div data-v-8f013c71><label for="modal-type" class="form-label" data-v-8f013c71>النوع <span class="text-red-500" data-v-8f013c71>*</span></label><select id="modal-type" required class="form-select" data-v-8f013c71><option value="lecture" data-v-8f013c71${ssrIncludeBooleanAttr(Array.isArray(formData.value.type) ? ssrLooseContain(formData.value.type, "lecture") : ssrLooseEqual(formData.value.type, "lecture")) ? " selected" : ""}>محاضرة / درس</option><option value="announcement" data-v-8f013c71${ssrIncludeBooleanAttr(Array.isArray(formData.value.type) ? ssrLooseContain(formData.value.type, "announcement") : ssrLooseEqual(formData.value.type, "announcement")) ? " selected" : ""}>إعلان عام</option><option value="live" data-v-8f013c71${ssrIncludeBooleanAttr(Array.isArray(formData.value.type) ? ssrLooseContain(formData.value.type, "live") : ssrLooseEqual(formData.value.type, "live")) ? " selected" : ""}>بث مباشر</option></select></div><div data-v-8f013c71><label for="modal-date" class="form-label" data-v-8f013c71>التاريخ والوقت</label><input${ssrRenderAttr("value", formData.value.date)} type="datetime-local" id="modal-date" class="form-input" data-v-8f013c71><p class="form-help-text" data-v-8f013c71>مهم للمحاضرات والبث المباشر لتحديد وقت البدء.</p></div><div data-v-8f013c71><label for="modal-link" class="form-label" data-v-8f013c71>الرابط `);
        if (formData.value.type === "live" || formData.value.type === "lecture") {
          _push(`<span class="text-red-500" data-v-8f013c71>*</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</label><input${ssrRenderAttr("value", formData.value.link)} type="url" id="modal-link"${ssrIncludeBooleanAttr(formData.value.type === "live" || formData.value.type === "lecture") ? " required" : ""} class="form-input" placeholder="https://..." data-v-8f013c71><p class="form-help-text" data-v-8f013c71>رابط البث (يوتيوب، فيسبوك، إلخ) أو رابط تفاصيل الإعلان.</p></div><div class="flex items-center" data-v-8f013c71><input${ssrIncludeBooleanAttr(Array.isArray(formData.value.is_published) ? ssrLooseContain(formData.value.is_published, null) : formData.value.is_published) ? " checked" : ""} id="modal-is_published" type="checkbox" class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-600 dark:border-gray-500" data-v-8f013c71><label for="modal-is_published" class="ms-2 block text-sm text-gray-900 dark:text-gray-300" data-v-8f013c71>نشر (جعله مرئياً للعامة)</label></div></div>`);
        if (successMessage.value) {
          _push(`<div class="mt-4 p-3 form-success-message" data-v-8f013c71>${ssrInterpolate(successMessage.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (errorMessage.value) {
          _push(`<div class="mt-4 p-3 form-error-message" data-v-8f013c71>خطأ: ${ssrInterpolate(errorMessage.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</form></div></div></div><div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse" data-v-8f013c71><button${ssrIncludeBooleanAttr(isSaving.value) ? " disabled" : ""} type="button" class="modal-button-primary" data-v-8f013c71>`);
        if (isSaving.value) {
          _push(`<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-8f013c71><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-8f013c71></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-8f013c71></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(isSaving.value ? "جاري الحفظ..." : editingAnnouncement.value ? "حفظ التعديلات" : "إضافة")}</button><button type="button" class="modal-button-secondary" data-v-8f013c71>إلغاء</button></div></div></div></div>`);
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
//# sourceMappingURL=index.vue3.mjs.map
