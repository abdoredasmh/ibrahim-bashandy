import { defineComponent, ref, computed, reactive, watch, mergeProps } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import LoadingSpinner from "../LoadingSpinner.vue.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CourseAddEditModal",
  __ssrInlineRender: true,
  props: {
    courseData: {},
    categories: {}
  },
  emits: ["close", "saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const supabase = useSupabaseClient();
    const formLoading = ref(false);
    const errorMessage = ref("");
    const isEditing = computed(() => {
      var _a;
      return !!((_a = props.courseData) == null ? void 0 : _a.id);
    });
    const formData = reactive({
      title: "",
      description: null,
      category_id: null,
      youtube_playlist_url: null,
      image_url: null,
      is_active: false
    });
    const courseModules = ref([]);
    const modulesLoading = ref(false);
    const modulesError = ref(null);
    const showAddModuleForm = ref(false);
    const editingModule = ref(null);
    const moduleActionLoading = ref(false);
    const moduleFormError = ref(null);
    const moduleFormData = reactive({
      module_number: null,
      title: "",
      description: null
    });
    watch(() => props.courseData, (newCourse) => {
      console.log("Course data prop changed:", newCourse);
      if (newCourse == null ? void 0 : newCourse.id) {
        console.log("Populating form for editing course ID:", newCourse.id);
        Object.assign(formData, {
          /* ... populate formData ... */
          title: newCourse.title,
          description: newCourse.description,
          category_id: newCourse.category_id,
          youtube_playlist_url: newCourse.youtube_playlist_url,
          image_url: newCourse.image_url,
          is_active: newCourse.is_active ?? false
        });
        fetchModules();
      } else {
        console.log("Resetting form for adding new course");
        Object.assign(formData, {
          /* ... reset formData ... */
          title: "",
          description: null,
          category_id: null,
          youtube_playlist_url: null,
          image_url: null,
          is_active: false
        });
        courseModules.value = [];
      }
      errorMessage.value = "";
      resetModuleForm();
    }, { immediate: true, deep: true });
    async function fetchModules() {
      var _a;
      if (!isEditing.value || !((_a = props.courseData) == null ? void 0 : _a.id)) {
        console.log("Skipping module fetch: Not editing or no course ID.");
        courseModules.value = [];
        return;
      }
      const currentCourseId = props.courseData.id;
      console.log(`Fetching modules for course ID: ${currentCourseId}`);
      modulesLoading.value = true;
      modulesError.value = null;
      try {
        const { data, error } = await supabase.from("course_modules").select("*").eq("course_id", currentCourseId).order("module_number", { ascending: true });
        if (error) throw error;
        courseModules.value = data || [];
        console.log("Modules fetched:", courseModules.value.length);
      } catch (err) {
        console.error("Error fetching modules:", err);
        modulesError.value = err.message || "Unknown error";
        courseModules.value = [];
      } finally {
        modulesLoading.value = false;
      }
    }
    function resetModuleForm() {
      showAddModuleForm.value = false;
      editingModule.value = null;
      moduleFormData.module_number = null;
      moduleFormData.title = "";
      moduleFormData.description = null;
      moduleFormError.value = null;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" }, _attrs))} data-v-7feb0fe3><div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" data-v-7feb0fe3><div class="p-6" data-v-7feb0fe3><div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700" data-v-7feb0fe3><h3 class="text-xl font-semibold text-gray-900 dark:text-white" data-v-7feb0fe3>${ssrInterpolate(isEditing.value ? "تعديل الدورة" : "إضافة دورة جديدة")}</h3><button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" data-v-7feb0fe3><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" data-v-7feb0fe3><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-7feb0fe3></path></svg></button></div><div class="mt-6 space-y-6" data-v-7feb0fe3><section data-v-7feb0fe3><h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3" data-v-7feb0fe3>تفاصيل الدورة الأساسية</h4><form class="space-y-4" id="course-details-form" data-v-7feb0fe3><div data-v-7feb0fe3><label for="course-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-7feb0fe3>العنوان *</label><input type="text" id="course-title"${ssrRenderAttr("value", formData.title)} required class="admin-input" data-v-7feb0fe3></div><div data-v-7feb0fe3><label for="course-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-7feb0fe3>الوصف</label><textarea id="course-description" rows="4" class="admin-input" data-v-7feb0fe3>${ssrInterpolate(formData.description)}</textarea></div><div data-v-7feb0fe3><label for="course-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-7feb0fe3>الفئة (اختياري)</label><select id="course-category" class="admin-select" data-v-7feb0fe3><option${ssrRenderAttr("value", null)} data-v-7feb0fe3${ssrIncludeBooleanAttr(Array.isArray(formData.category_id) ? ssrLooseContain(formData.category_id, null) : ssrLooseEqual(formData.category_id, null)) ? " selected" : ""}>-- اختر فئة --</option><!--[-->`);
      ssrRenderList(_ctx.categories, (cat) => {
        _push(`<option${ssrRenderAttr("value", cat.id)} data-v-7feb0fe3${ssrIncludeBooleanAttr(Array.isArray(formData.category_id) ? ssrLooseContain(formData.category_id, cat.id) : ssrLooseEqual(formData.category_id, cat.id)) ? " selected" : ""}>${ssrInterpolate(cat.name)}</option>`);
      });
      _push(`<!--]--></select></div><div data-v-7feb0fe3><label for="course-youtube-playlist" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-7feb0fe3>رابط قائمة تشغيل يوتيوب (اختياري)</label><input type="url" id="course-youtube-playlist"${ssrRenderAttr("value", formData.youtube_playlist_url)} class="admin-input" placeholder="https://www.youtube.com/playlist?list=..." data-v-7feb0fe3></div><div data-v-7feb0fe3><label for="course-image-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-7feb0fe3>رابط صورة الغلاف (اختياري)</label><input type="url" id="course-image-url"${ssrRenderAttr("value", formData.image_url)} class="admin-input" placeholder="https://..." data-v-7feb0fe3><p class="form-hint" data-v-7feb0fe3>أدخل رابطًا مباشرًا للصورة أو اترك الحقل فارغًا.</p></div><div class="flex items-center" data-v-7feb0fe3><input id="is_active"${ssrIncludeBooleanAttr(Array.isArray(formData.is_active) ? ssrLooseContain(formData.is_active, null) : formData.is_active) ? " checked" : ""} type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600" data-v-7feb0fe3><label for="is_active" class="ms-2 block text-sm text-gray-900 dark:text-gray-300" data-v-7feb0fe3>نشر الدورة (مرئية للطلاب)</label></div></form></section>`);
      if (isEditing.value && ((_a = props.courseData) == null ? void 0 : _a.id)) {
        _push(`<section class="pt-6 border-t border-gray-200 dark:border-gray-700" data-v-7feb0fe3><h4 class="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4" data-v-7feb0fe3>إدارة وحدات الدورة</h4>`);
        if (modulesLoading.value) {
          _push(`<div class="text-center py-4" data-v-7feb0fe3>`);
          _push(ssrRenderComponent(LoadingSpinner, { small: "" }, null, _parent));
          _push(`<p class="text-sm text-gray-500 dark:text-gray-400 mt-2" data-v-7feb0fe3>جاري تحميل الوحدات...</p></div>`);
        } else if (modulesError.value) {
          _push(`<div class="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-md text-sm" data-v-7feb0fe3> حدث خطأ أثناء تحميل الوحدات: ${ssrInterpolate(modulesError.value)} <button class="ms-2 underline font-semibold" data-v-7feb0fe3>إعادة المحاولة</button></div>`);
        } else {
          _push(`<div class="space-y-3" data-v-7feb0fe3>`);
          if (courseModules.value.length === 0 && !showAddModuleForm.value) {
            _push(`<div class="text-center text-sm text-gray-500 dark:text-gray-400 py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-md" data-v-7feb0fe3> لم يتم إضافة وحدات لهذه الدورة بعد. </div>`);
          } else {
            _push(`<ul class="space-y-2" data-v-7feb0fe3><!--[-->`);
            ssrRenderList(courseModules.value, (module) => {
              _push(`<li class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600" data-v-7feb0fe3><div class="flex items-center space-x-3 rtl:space-x-reverse flex-grow min-w-0" data-v-7feb0fe3><span class="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded flex-shrink-0" data-v-7feb0fe3>#${ssrInterpolate(module.module_number)}</span><span class="font-medium text-gray-800 dark:text-gray-200 truncate"${ssrRenderAttr("title", module.title)} data-v-7feb0fe3>${ssrInterpolate(module.title)}</span>`);
              if (module.description) {
                _push(`<span class="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:inline-block"${ssrRenderAttr("title", module.description)} data-v-7feb0fe3> - ${ssrInterpolate(module.description)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div><div class="flex items-center space-x-2 rtl:space-x-reverse flex-shrink-0" data-v-7feb0fe3><button type="button"${ssrIncludeBooleanAttr(moduleActionLoading.value) ? " disabled" : ""} class="button-icon text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="تعديل الوحدة" data-v-7feb0fe3><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" data-v-7feb0fe3><path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" data-v-7feb0fe3></path></svg></button><button type="button"${ssrIncludeBooleanAttr(moduleActionLoading.value) ? " disabled" : ""} class="button-icon text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="حذف الوحدة" data-v-7feb0fe3><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" data-v-7feb0fe3><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd" data-v-7feb0fe3></path></svg></button></div></li>`);
            });
            _push(`<!--]--></ul>`);
          }
          if (showAddModuleForm.value || editingModule.value) {
            _push(`<div class="mt-4 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700/30" data-v-7feb0fe3><h5 class="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300" data-v-7feb0fe3>${ssrInterpolate(editingModule.value ? `تعديل الوحدة #${editingModule.value.module_number}` : "إضافة وحدة جديدة")}</h5><form class="space-y-3" data-v-7feb0fe3><div class="grid grid-cols-1 sm:grid-cols-3 gap-3" data-v-7feb0fe3><div data-v-7feb0fe3><label${ssrRenderAttr("for", `module-number-${((_b = editingModule.value) == null ? void 0 : _b.id) ?? "new"}`)} class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-7feb0fe3>رقم الوحدة *</label><input type="number"${ssrRenderAttr("id", `module-number-${((_c = editingModule.value) == null ? void 0 : _c.id) ?? "new"}`)}${ssrRenderAttr("value", moduleFormData.module_number)} required min="1" class="admin-input mt-1" data-v-7feb0fe3></div><div class="sm:col-span-2" data-v-7feb0fe3><label${ssrRenderAttr("for", `module-title-${((_d = editingModule.value) == null ? void 0 : _d.id) ?? "new"}`)} class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-7feb0fe3>اسم الوحدة *</label><input type="text"${ssrRenderAttr("id", `module-title-${((_e = editingModule.value) == null ? void 0 : _e.id) ?? "new"}`)}${ssrRenderAttr("value", moduleFormData.title)} required class="admin-input mt-1" data-v-7feb0fe3></div></div><div data-v-7feb0fe3><label${ssrRenderAttr("for", `module-description-${((_f = editingModule.value) == null ? void 0 : _f.id) ?? "new"}`)} class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-7feb0fe3>وصف الوحدة (اختياري)</label><textarea${ssrRenderAttr("id", `module-description-${((_g = editingModule.value) == null ? void 0 : _g.id) ?? "new"}`)} rows="2" class="admin-textarea mt-1" data-v-7feb0fe3>${ssrInterpolate(moduleFormData.description)}</textarea></div>`);
            if (moduleFormError.value) {
              _push(`<div class="text-red-500 text-xs p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700" data-v-7feb0fe3>${ssrInterpolate(moduleFormError.value)}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="flex justify-end space-x-2 rtl:space-x-reverse pt-2" data-v-7feb0fe3><button type="button"${ssrIncludeBooleanAttr(moduleActionLoading.value) ? " disabled" : ""} class="button-secondary-small" data-v-7feb0fe3>إلغاء</button><button type="submit"${ssrIncludeBooleanAttr(moduleActionLoading.value) ? " disabled" : ""} class="button-primary-small" data-v-7feb0fe3>`);
            if (moduleActionLoading.value) {
              _push(`<span data-v-7feb0fe3>جاري الحفظ...</span>`);
            } else {
              _push(`<span data-v-7feb0fe3>${ssrInterpolate(editingModule.value ? "حفظ التعديل" : "إضافة الوحدة")}</span>`);
            }
            _push(`</button></div></form></div>`);
          } else {
            _push(`<!---->`);
          }
          if (!showAddModuleForm.value && !editingModule.value) {
            _push(`<div class="mt-4" data-v-7feb0fe3><button type="button" class="button-outline w-full sm:w-auto" data-v-7feb0fe3><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1" data-v-7feb0fe3><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" data-v-7feb0fe3></path></svg> إضافة وحدة جديدة </button></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      if (errorMessage.value) {
        _push(`<div class="text-red-600 dark:text-red-400 text-sm p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700" data-v-7feb0fe3>${ssrInterpolate(errorMessage.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="pt-6 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700" data-v-7feb0fe3><button type="button"${ssrIncludeBooleanAttr(formLoading.value || moduleActionLoading.value) ? " disabled" : ""} class="button-secondary" data-v-7feb0fe3>إغلاق</button><button type="submit" form="course-details-form"${ssrIncludeBooleanAttr(formLoading.value || moduleActionLoading.value) ? " disabled" : ""} class="button-primary" data-v-7feb0fe3>`);
      if (formLoading.value) {
        _push(`<span data-v-7feb0fe3>جاري حفظ التفاصيل...</span>`);
      } else {
        _push(`<span data-v-7feb0fe3>${ssrInterpolate(isEditing.value ? "حفظ تفاصيل الدورة" : "إضافة الدورة")}</span>`);
      }
      _push(`</button></div></div></div></div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=CourseAddEditModal.vue2.mjs.map
