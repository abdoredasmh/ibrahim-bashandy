import { defineComponent, ref, reactive, computed, watch, unref, mergeProps, withCtx, createTextVNode, toDisplayString, createVNode, withModifiers, createBlock, createCommentVNode, withDirectives, vModelText, openBlock, Fragment, renderList, vModelSelect } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from "vue/server-renderer";
import { TransitionRoot, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/vue";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminLessonModal",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean },
    lessonData: {},
    preselectedCourseId: {}
  },
  emits: ["close", "saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const supabase = useSupabaseClient();
    const isSaving = ref(false);
    const errorMessage = ref(null);
    const validationErrors = reactive({ title: "", youtube_url: "" });
    const form = ref({
      title: "",
      description: null,
      youtube_url: "",
      category_id: null,
      course_id: null,
      module_number: null,
      lesson_order: null
    });
    const categories = ref([]);
    const courses = ref([]);
    const courseModules = ref([]);
    const loadingCategories = ref(false);
    const loadingCourses = ref(false);
    const loadingModules = ref(false);
    const modulesError = ref(null);
    const isEditing = computed(() => {
      var _a;
      return !!((_a = props.lessonData) == null ? void 0 : _a.id);
    });
    async function fetchCourseModules(courseId) {
      if (!courseId) {
        courseModules.value = [];
        loadingModules.value = false;
        modulesError.value = null;
        console.log("No course ID provided, clearing modules.");
        return;
      }
      console.log(`Fetching modules for course ID: ${courseId}`);
      loadingModules.value = true;
      modulesError.value = null;
      courseModules.value = [];
      try {
        const { data, error } = await supabase.from("course_modules").select("id, title, module_number").eq("course_id", courseId).order("module_number", { ascending: true });
        if (error) throw error;
        courseModules.value = data || [];
        console.log(`Fetched ${courseModules.value.length} modules for course ${courseId}`);
      } catch (err) {
        console.error(`Error fetching modules for course ${courseId}:`, err);
        modulesError.value = err.message || "فشل تحميل وحدات الدورة.";
      } finally {
        loadingModules.value = false;
      }
    }
    const resetForm = (initialCourseId = null) => {
      console.log("Resetting form. Initial Course ID:", initialCourseId);
      form.value = {
        title: "",
        description: null,
        youtube_url: "",
        category_id: null,
        course_id: initialCourseId,
        // Use the passed or default null
        module_number: null,
        lesson_order: null
      };
      errorMessage.value = null;
      validationErrors.title = "";
      validationErrors.youtube_url = "";
      courseModules.value = [];
      loadingModules.value = false;
      modulesError.value = null;
      if (initialCourseId) {
        fetchCourseModules(initialCourseId);
      }
    };
    async function fetchStaticDropdownData() {
      if (categories.value.length > 0 && courses.value.length > 0 || loadingCategories.value || loadingCourses.value) {
        console.log("[fetchStaticDropdownData] Skipping fetch (already loaded or loading).");
        return;
      }
      console.log("[fetchStaticDropdownData] Starting...");
      loadingCategories.value = true;
      loadingCourses.value = true;
      errorMessage.value = null;
      try {
        const [catResult, courseResult] = await Promise.all([
          supabase.from("categories").select("id, name").order("name"),
          supabase.from("study_courses").select("id, title").order("title")
        ]);
        if (catResult.error) throw new Error(`فشل تحميل الفئات: ${catResult.error.message}`);
        categories.value = catResult.data ?? [];
        if (courseResult.error) throw new Error(`فشل تحميل الدورات: ${courseResult.error.message}`);
        courses.value = courseResult.data ?? [];
        console.log(`[fetchStaticDropdownData] ${categories.value.length} categories, ${courses.value.length} courses loaded.`);
      } catch (err) {
        console.error("Error in fetchStaticDropdownData:", err);
        categories.value = [];
        courses.value = [];
        errorMessage.value = err.message || "فشل تحميل بيانات القوائم.";
      } finally {
        loadingCategories.value = false;
        loadingCourses.value = false;
      }
    }
    function handleCourseChange() {
      const selectedCourseId = form.value.course_id;
      console.log("Course changed to:", selectedCourseId);
      form.value.module_number = null;
      form.value.lesson_order = null;
      fetchCourseModules(selectedCourseId);
    }
    watch(() => props.show, (newVal, oldVal) => {
      var _a;
      if (newVal && !oldVal) {
        console.log("Modal opened. Fetching static data and initializing form.");
        fetchStaticDropdownData();
        if ((_a = props.lessonData) == null ? void 0 : _a.id) {
          console.log("Watcher (show=true): Initializing for edit");
          const { id, title, description, youtube_url, category_id, course_id, module_number, lesson_order } = props.lessonData;
          form.value = { id, title, description, youtube_url, category_id, course_id, module_number, lesson_order };
          if (course_id) {
            fetchCourseModules(course_id);
          } else {
            courseModules.value = [];
          }
        } else {
          console.log("Watcher (show=true): Initializing for add with preselected:", props.preselectedCourseId);
          resetForm(props.preselectedCourseId ?? null);
        }
        errorMessage.value = null;
        validationErrors.title = "";
        validationErrors.youtube_url = "";
      } else if (!newVal && oldVal) {
        console.log("Modal closed.");
      }
    }, { immediate: true });
    function closeModal() {
      if (!isSaving.value) emit("close");
    }
    const validateForm = () => {
      var _a, _b;
      let isValid = true;
      validationErrors.title = "";
      validationErrors.youtube_url = "";
      errorMessage.value = null;
      if (!((_a = form.value.title) == null ? void 0 : _a.trim())) {
        validationErrors.title = "حقل العنوان مطلوب.";
        isValid = false;
      }
      if (!((_b = form.value.youtube_url) == null ? void 0 : _b.trim())) {
        validationErrors.youtube_url = "حقل رابط يوتيوب مطلوب.";
        isValid = false;
      } else {
        try {
          const url = new URL(form.value.youtube_url);
          if (!["www.youtube.com", "youtube.com", "youtu.be"].includes(url.hostname)) {
            validationErrors.youtube_url = "رابط يوتيوب غير صالح.";
            isValid = false;
          }
        } catch (_) {
          validationErrors.youtube_url = "صيغة الرابط غير صحيحة.";
          isValid = false;
        }
      }
      return isValid;
    };
    async function saveLesson() {
      var _a, _b;
      console.log("Attempting to save lesson...");
      if (!validateForm()) {
        console.log("Validation failed.");
        return;
      }
      isSaving.value = true;
      errorMessage.value = null;
      const lessonPayload = {
        title: form.value.title,
        description: ((_a = form.value.description) == null ? void 0 : _a.trim()) || null,
        youtube_url: form.value.youtube_url,
        category_id: form.value.category_id ? Number(form.value.category_id) : null,
        course_id: form.value.course_id ? Number(form.value.course_id) : null,
        // Only include module/order if a course is selected
        module_number: form.value.course_id ? form.value.module_number ? Number(form.value.module_number) : null : null,
        lesson_order: form.value.course_id ? form.value.lesson_order ? Number(form.value.lesson_order) : null : null
      };
      if (lessonPayload.course_id === null) {
        lessonPayload.module_number = null;
        lessonPayload.lesson_order = null;
      }
      console.log("Payload to send:", JSON.stringify(lessonPayload, null, 2));
      try {
        let error = null;
        let data = null;
        if (isEditing.value && form.value.id) {
          console.log(`Attempting UPDATE for lesson ID: ${form.value.id}`);
          const { id, ...updateData } = lessonPayload;
          const result = await supabase.from("lessons").update(updateData).eq("id", form.value.id).select();
          error = result.error;
          data = result.data;
        } else {
          console.log("Attempting INSERT for new lesson");
          const result = await supabase.from("lessons").insert(lessonPayload).select();
          error = result.error;
          data = result.data;
        }
        console.log("Supabase response error:", JSON.stringify(error, null, 2));
        console.log("Supabase response data:", JSON.stringify(data, null, 2));
        if (error) throw error;
        console.log("Save successful, emitting saved event.");
        emit("saved");
        closeModal();
      } catch (err) {
        console.error("Error during save operation:", JSON.stringify(err, null, 2));
        if ((_b = err.message) == null ? void 0 : _b.includes("violates foreign key constraint")) {
          errorMessage.value = "فشل الحفظ: الفئة أو الدورة المحددة غير موجودة.";
        } else if (err.code === "23505") {
          errorMessage.value = `فشل الحفظ: ${err.message}`;
        } else {
          errorMessage.value = `فشل حفظ الدرس: ${err.message || "خطأ غير متوقع"}`;
        }
      } finally {
        isSaving.value = false;
        console.log("saveLesson finished.");
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TransitionRoot), mergeProps({
        appear: "",
        show: _ctx.show,
        as: "template"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Dialog), {
              as: "div",
              onClose: closeModal,
              class: "relative z-50"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(TransitionChild), {
                    as: "div",
                    class: "fixed inset-0 bg-black/30 backdrop-blur-sm",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }, null, _parent3, _scopeId2));
                  _push3(`<div class="fixed inset-0 overflow-y-auto" data-v-e95ed032${_scopeId2}><div class="flex min-h-full items-center justify-center p-4 text-center" data-v-e95ed032${_scopeId2}>`);
                  _push3(ssrRenderComponent(unref(TransitionChild), {
                    as: "template",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0 scale-95",
                    "enter-to": "opacity-100 scale-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100 scale-100",
                    "leave-to": "opacity-0 scale-95"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(unref(DialogTitle), {
                                as: "h3",
                                class: "admin-modal-title"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(isEditing.value ? "تعديل الدرس" : "إضافة درس جديد")}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(isEditing.value ? "تعديل الدرس" : "إضافة درس جديد"), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<form class="space-y-4" data-v-e95ed032${_scopeId4}><div data-v-e95ed032${_scopeId4}><label for="title" class="admin-label" data-v-e95ed032${_scopeId4}>العنوان *</label><input type="text" id="title"${ssrRenderAttr("value", form.value.title)} required class="admin-input" aria-describedby="title-error" data-v-e95ed032${_scopeId4}>`);
                              if (validationErrors.title) {
                                _push5(`<p class="form-error" id="title-error" data-v-e95ed032${_scopeId4}>${ssrInterpolate(validationErrors.title)}</p>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`</div><div data-v-e95ed032${_scopeId4}><label for="description" class="admin-label" data-v-e95ed032${_scopeId4}>الوصف</label><textarea id="description" rows="4" class="admin-textarea" data-v-e95ed032${_scopeId4}>${ssrInterpolate(form.value.description)}</textarea></div><div data-v-e95ed032${_scopeId4}><label for="youtube_url" class="admin-label" data-v-e95ed032${_scopeId4}>رابط يوتيوب *</label><input type="url" id="youtube_url"${ssrRenderAttr("value", form.value.youtube_url)} required placeholder="https://..." class="admin-input" aria-describedby="youtube-error" data-v-e95ed032${_scopeId4}>`);
                              if (validationErrors.youtube_url) {
                                _push5(`<p class="form-error" id="youtube-error" data-v-e95ed032${_scopeId4}>${ssrInterpolate(validationErrors.youtube_url)}</p>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`</div><div data-v-e95ed032${_scopeId4}><label for="category_id" class="admin-label" data-v-e95ed032${_scopeId4}>الفئة</label>`);
                              if (loadingCategories.value) {
                                _push5(`<div class="form-loading-text" data-v-e95ed032${_scopeId4}>جار تحميل الفئات...</div>`);
                              } else {
                                _push5(`<select id="category_id" class="admin-select" data-v-e95ed032${_scopeId4}><option${ssrRenderAttr("value", null)} data-v-e95ed032${ssrIncludeBooleanAttr(Array.isArray(form.value.category_id) ? ssrLooseContain(form.value.category_id, null) : ssrLooseEqual(form.value.category_id, null)) ? " selected" : ""}${_scopeId4}>-- اختر فئة (اختياري) --</option><!--[-->`);
                                ssrRenderList(categories.value, (cat) => {
                                  _push5(`<option${ssrRenderAttr("value", cat.id)} data-v-e95ed032${ssrIncludeBooleanAttr(Array.isArray(form.value.category_id) ? ssrLooseContain(form.value.category_id, cat.id) : ssrLooseEqual(form.value.category_id, cat.id)) ? " selected" : ""}${_scopeId4}>${ssrInterpolate(cat.name)}</option>`);
                                });
                                _push5(`<!--]-->`);
                                if (!loadingCategories.value && categories.value.length === 0) {
                                  _push5(`<option disabled data-v-e95ed032${ssrIncludeBooleanAttr(Array.isArray(form.value.category_id) ? ssrLooseContain(form.value.category_id, null) : ssrLooseEqual(form.value.category_id, null)) ? " selected" : ""}${_scopeId4}>-- لا توجد فئات متاحة --</option>`);
                                } else {
                                  _push5(`<!---->`);
                                }
                                _push5(`</select>`);
                              }
                              _push5(`</div><div data-v-e95ed032${_scopeId4}><label for="course_id" class="admin-label" data-v-e95ed032${_scopeId4}>الدورة الدراسية (اختياري)</label>`);
                              if (loadingCourses.value) {
                                _push5(`<div class="form-loading-text" data-v-e95ed032${_scopeId4}>جار تحميل الدورات...</div>`);
                              } else {
                                _push5(`<select id="course_id" class="admin-select" data-v-e95ed032${_scopeId4}><option${ssrRenderAttr("value", null)} data-v-e95ed032${ssrIncludeBooleanAttr(Array.isArray(form.value.course_id) ? ssrLooseContain(form.value.course_id, null) : ssrLooseEqual(form.value.course_id, null)) ? " selected" : ""}${_scopeId4}>-- درس عام (لا يتبع دورة) --</option><!--[-->`);
                                ssrRenderList(courses.value, (course) => {
                                  _push5(`<option${ssrRenderAttr("value", course.id)} data-v-e95ed032${ssrIncludeBooleanAttr(Array.isArray(form.value.course_id) ? ssrLooseContain(form.value.course_id, course.id) : ssrLooseEqual(form.value.course_id, course.id)) ? " selected" : ""}${_scopeId4}>${ssrInterpolate(course.title)}</option>`);
                                });
                                _push5(`<!--]-->`);
                                if (!loadingCourses.value && courses.value.length === 0) {
                                  _push5(`<option disabled data-v-e95ed032${ssrIncludeBooleanAttr(Array.isArray(form.value.course_id) ? ssrLooseContain(form.value.course_id, null) : ssrLooseEqual(form.value.course_id, null)) ? " selected" : ""}${_scopeId4}>-- لا توجد دورات متاحة --</option>`);
                                } else {
                                  _push5(`<!---->`);
                                }
                                _push5(`</select>`);
                              }
                              _push5(`</div>`);
                              if (form.value.course_id) {
                                _push5(`<div class="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700" data-v-e95ed032${_scopeId4}><div data-v-e95ed032${_scopeId4}><label for="module_number" class="admin-label" data-v-e95ed032${_scopeId4}>الوحدة داخل الدورة</label>`);
                                if (loadingModules.value) {
                                  _push5(`<div class="form-loading-text" data-v-e95ed032${_scopeId4}>جار تحميل الوحدات...</div>`);
                                } else if (!loadingModules.value && courseModules.value.length === 0 && !modulesError.value) {
                                  _push5(`<p class="form-hint bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-700" data-v-e95ed032${_scopeId4}> لم يتم تعريف وحدات لهذه الدورة بعد. يمكنك إضافتها من شاشة &quot;تعديل الدورة&quot;. </p>`);
                                } else if (modulesError.value) {
                                  _push5(`<p class="form-error bg-red-100 dark:bg-red-900/30 p-2 rounded" data-v-e95ed032${_scopeId4}>خطأ تحميل الوحدات: ${ssrInterpolate(modulesError.value)}</p>`);
                                } else if (courseModules.value.length > 0) {
                                  _push5(`<select id="module_number" class="admin-select" data-v-e95ed032${_scopeId4}><option${ssrRenderAttr("value", null)} data-v-e95ed032${ssrIncludeBooleanAttr(Array.isArray(form.value.module_number) ? ssrLooseContain(form.value.module_number, null) : ssrLooseEqual(form.value.module_number, null)) ? " selected" : ""}${_scopeId4}>-- درس بدون وحدة (عام داخل الدورة) --</option><!--[-->`);
                                  ssrRenderList(courseModules.value, (module) => {
                                    _push5(`<option${ssrRenderAttr("value", module.module_number)} data-v-e95ed032${ssrIncludeBooleanAttr(Array.isArray(form.value.module_number) ? ssrLooseContain(form.value.module_number, module.module_number) : ssrLooseEqual(form.value.module_number, module.module_number)) ? " selected" : ""}${_scopeId4}> #${ssrInterpolate(module.module_number)} - ${ssrInterpolate(module.title)}</option>`);
                                  });
                                  _push5(`<!--]--></select>`);
                                } else if (!loadingModules.value && courseModules.value.length === 0) {
                                  _push5(`<div class="admin-input bg-gray-100 dark:bg-gray-600 cursor-not-allowed italic text-gray-500 dark:text-gray-400" data-v-e95ed032${_scopeId4}>لا توجد وحدات</div>`);
                                } else {
                                  _push5(`<!---->`);
                                }
                                _push5(`</div><div data-v-e95ed032${_scopeId4}><label for="lesson_order" class="admin-label" data-v-e95ed032${_scopeId4}>ترتيب الدرس</label><input type="number" id="lesson_order"${ssrRenderAttr("value", form.value.lesson_order)} min="1" class="admin-input" placeholder="اتركه فارغًا للترتيب التلقائي/الأخير" data-v-e95ed032${_scopeId4}><p class="form-hint" data-v-e95ed032${_scopeId4}> ترتيب الدرس ${ssrInterpolate(form.value.module_number ? `داخل الوحدة #${form.value.module_number}` : "العام داخل الدورة")}. (مثال: 1 هو الأول) </p></div></div>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              if (errorMessage.value) {
                                _push5(`<p class="form-error p-2 bg-red-100 dark:bg-red-900/30 rounded" data-v-e95ed032${_scopeId4}> خطأ: ${ssrInterpolate(errorMessage.value)}</p>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`<div class="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse" data-v-e95ed032${_scopeId4}><button type="button" class="button-secondary" data-v-e95ed032${_scopeId4}>إلغاء</button><button type="submit"${ssrIncludeBooleanAttr(isSaving.value || loadingCategories.value || loadingCourses.value || loadingModules.value) ? " disabled" : ""} class="button-primary" data-v-e95ed032${_scopeId4}>`);
                              if (isSaving.value) {
                                _push5(`<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-e95ed032${_scopeId4}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-e95ed032${_scopeId4}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-e95ed032${_scopeId4}></path></svg>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(` ${ssrInterpolate(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة الدرس")}</button></div></form>`);
                            } else {
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "admin-modal-title"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(isEditing.value ? "تعديل الدرس" : "إضافة درس جديد"), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(saveLesson, ["prevent"]),
                                  class: "space-y-4"
                                }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "title",
                                      class: "admin-label"
                                    }, "العنوان *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "title",
                                      "onUpdate:modelValue": ($event) => form.value.title = $event,
                                      required: "",
                                      class: "admin-input",
                                      "aria-describedby": "title-error"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.title]
                                    ]),
                                    validationErrors.title ? (openBlock(), createBlock("p", {
                                      key: 0,
                                      class: "form-error",
                                      id: "title-error"
                                    }, toDisplayString(validationErrors.title), 1)) : createCommentVNode("", true)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "description",
                                      class: "admin-label"
                                    }, "الوصف"),
                                    withDirectives(createVNode("textarea", {
                                      id: "description",
                                      rows: "4",
                                      "onUpdate:modelValue": ($event) => form.value.description = $event,
                                      class: "admin-textarea"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.description]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "youtube_url",
                                      class: "admin-label"
                                    }, "رابط يوتيوب *"),
                                    withDirectives(createVNode("input", {
                                      type: "url",
                                      id: "youtube_url",
                                      "onUpdate:modelValue": ($event) => form.value.youtube_url = $event,
                                      required: "",
                                      placeholder: "https://...",
                                      class: "admin-input",
                                      "aria-describedby": "youtube-error"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.youtube_url]
                                    ]),
                                    validationErrors.youtube_url ? (openBlock(), createBlock("p", {
                                      key: 0,
                                      class: "form-error",
                                      id: "youtube-error"
                                    }, toDisplayString(validationErrors.youtube_url), 1)) : createCommentVNode("", true)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "category_id",
                                      class: "admin-label"
                                    }, "الفئة"),
                                    loadingCategories.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "form-loading-text"
                                    }, "جار تحميل الفئات...")) : withDirectives((openBlock(), createBlock("select", {
                                      key: 1,
                                      id: "category_id",
                                      "onUpdate:modelValue": ($event) => form.value.category_id = $event,
                                      class: "admin-select"
                                    }, [
                                      createVNode("option", { value: null }, "-- اختر فئة (اختياري) --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(categories.value, (cat) => {
                                        return openBlock(), createBlock("option", {
                                          key: cat.id,
                                          value: cat.id
                                        }, toDisplayString(cat.name), 9, ["value"]);
                                      }), 128)),
                                      !loadingCategories.value && categories.value.length === 0 ? (openBlock(), createBlock("option", {
                                        key: 0,
                                        disabled: ""
                                      }, "-- لا توجد فئات متاحة --")) : createCommentVNode("", true)
                                    ], 8, ["onUpdate:modelValue"])), [
                                      [vModelSelect, form.value.category_id]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "course_id",
                                      class: "admin-label"
                                    }, "الدورة الدراسية (اختياري)"),
                                    loadingCourses.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "form-loading-text"
                                    }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                      key: 1,
                                      id: "course_id",
                                      "onUpdate:modelValue": ($event) => form.value.course_id = $event,
                                      onChange: handleCourseChange,
                                      class: "admin-select"
                                    }, [
                                      createVNode("option", { value: null }, "-- درس عام (لا يتبع دورة) --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                        return openBlock(), createBlock("option", {
                                          key: course.id,
                                          value: course.id
                                        }, toDisplayString(course.title), 9, ["value"]);
                                      }), 128)),
                                      !loadingCourses.value && courses.value.length === 0 ? (openBlock(), createBlock("option", {
                                        key: 0,
                                        disabled: ""
                                      }, "-- لا توجد دورات متاحة --")) : createCommentVNode("", true)
                                    ], 40, ["onUpdate:modelValue"])), [
                                      [vModelSelect, form.value.course_id]
                                    ])
                                  ]),
                                  form.value.course_id ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                  }, [
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "module_number",
                                        class: "admin-label"
                                      }, "الوحدة داخل الدورة"),
                                      loadingModules.value ? (openBlock(), createBlock("div", {
                                        key: 0,
                                        class: "form-loading-text"
                                      }, "جار تحميل الوحدات...")) : !loadingModules.value && courseModules.value.length === 0 && !modulesError.value ? (openBlock(), createBlock("p", {
                                        key: 1,
                                        class: "form-hint bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-700"
                                      }, ' لم يتم تعريف وحدات لهذه الدورة بعد. يمكنك إضافتها من شاشة "تعديل الدورة". ')) : modulesError.value ? (openBlock(), createBlock("p", {
                                        key: 2,
                                        class: "form-error bg-red-100 dark:bg-red-900/30 p-2 rounded"
                                      }, "خطأ تحميل الوحدات: " + toDisplayString(modulesError.value), 1)) : courseModules.value.length > 0 ? withDirectives((openBlock(), createBlock("select", {
                                        key: 3,
                                        id: "module_number",
                                        "onUpdate:modelValue": ($event) => form.value.module_number = $event,
                                        class: "admin-select"
                                      }, [
                                        createVNode("option", { value: null }, "-- درس بدون وحدة (عام داخل الدورة) --"),
                                        (openBlock(true), createBlock(Fragment, null, renderList(courseModules.value, (module) => {
                                          return openBlock(), createBlock("option", {
                                            key: module.module_number,
                                            value: module.module_number
                                          }, " #" + toDisplayString(module.module_number) + " - " + toDisplayString(module.title), 9, ["value"]);
                                        }), 128))
                                      ], 8, ["onUpdate:modelValue"])), [
                                        [
                                          vModelSelect,
                                          form.value.module_number,
                                          void 0,
                                          { number: true }
                                        ]
                                      ]) : !loadingModules.value && courseModules.value.length === 0 ? (openBlock(), createBlock("div", {
                                        key: 4,
                                        class: "admin-input bg-gray-100 dark:bg-gray-600 cursor-not-allowed italic text-gray-500 dark:text-gray-400"
                                      }, "لا توجد وحدات")) : createCommentVNode("", true)
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "lesson_order",
                                        class: "admin-label"
                                      }, "ترتيب الدرس"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "lesson_order",
                                        "onUpdate:modelValue": ($event) => form.value.lesson_order = $event,
                                        min: "1",
                                        class: "admin-input",
                                        placeholder: "اتركه فارغًا للترتيب التلقائي/الأخير"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.lesson_order,
                                          void 0,
                                          { number: true }
                                        ]
                                      ]),
                                      createVNode("p", { class: "form-hint" }, " ترتيب الدرس " + toDisplayString(form.value.module_number ? `داخل الوحدة #${form.value.module_number}` : "العام داخل الدورة") + ". (مثال: 1 هو الأول) ", 1)
                                    ])
                                  ])) : createCommentVNode("", true),
                                  errorMessage.value ? (openBlock(), createBlock("p", {
                                    key: 1,
                                    class: "form-error p-2 bg-red-100 dark:bg-red-900/30 rounded"
                                  }, " خطأ: " + toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                  createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse" }, [
                                    createVNode("button", {
                                      type: "button",
                                      onClick: closeModal,
                                      class: "button-secondary"
                                    }, "إلغاء"),
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isSaving.value || loadingCategories.value || loadingCourses.value || loadingModules.value,
                                      class: "button-primary"
                                    }, [
                                      isSaving.value ? (openBlock(), createBlock("svg", {
                                        key: 0,
                                        class: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24"
                                      }, [
                                        createVNode("circle", {
                                          class: "opacity-25",
                                          cx: "12",
                                          cy: "12",
                                          r: "10",
                                          stroke: "currentColor",
                                          "stroke-width": "4"
                                        }),
                                        createVNode("path", {
                                          class: "opacity-75",
                                          fill: "currentColor",
                                          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        })
                                      ])) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة الدرس"), 1)
                                    ], 8, ["disabled"])
                                  ])
                                ], 32)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "admin-modal-title"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(isEditing.value ? "تعديل الدرس" : "إضافة درس جديد"), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(saveLesson, ["prevent"]),
                                class: "space-y-4"
                              }, [
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "title",
                                    class: "admin-label"
                                  }, "العنوان *"),
                                  withDirectives(createVNode("input", {
                                    type: "text",
                                    id: "title",
                                    "onUpdate:modelValue": ($event) => form.value.title = $event,
                                    required: "",
                                    class: "admin-input",
                                    "aria-describedby": "title-error"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.title]
                                  ]),
                                  validationErrors.title ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "form-error",
                                    id: "title-error"
                                  }, toDisplayString(validationErrors.title), 1)) : createCommentVNode("", true)
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "description",
                                    class: "admin-label"
                                  }, "الوصف"),
                                  withDirectives(createVNode("textarea", {
                                    id: "description",
                                    rows: "4",
                                    "onUpdate:modelValue": ($event) => form.value.description = $event,
                                    class: "admin-textarea"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.description]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "youtube_url",
                                    class: "admin-label"
                                  }, "رابط يوتيوب *"),
                                  withDirectives(createVNode("input", {
                                    type: "url",
                                    id: "youtube_url",
                                    "onUpdate:modelValue": ($event) => form.value.youtube_url = $event,
                                    required: "",
                                    placeholder: "https://...",
                                    class: "admin-input",
                                    "aria-describedby": "youtube-error"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.youtube_url]
                                  ]),
                                  validationErrors.youtube_url ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "form-error",
                                    id: "youtube-error"
                                  }, toDisplayString(validationErrors.youtube_url), 1)) : createCommentVNode("", true)
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "category_id",
                                    class: "admin-label"
                                  }, "الفئة"),
                                  loadingCategories.value ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "form-loading-text"
                                  }, "جار تحميل الفئات...")) : withDirectives((openBlock(), createBlock("select", {
                                    key: 1,
                                    id: "category_id",
                                    "onUpdate:modelValue": ($event) => form.value.category_id = $event,
                                    class: "admin-select"
                                  }, [
                                    createVNode("option", { value: null }, "-- اختر فئة (اختياري) --"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(categories.value, (cat) => {
                                      return openBlock(), createBlock("option", {
                                        key: cat.id,
                                        value: cat.id
                                      }, toDisplayString(cat.name), 9, ["value"]);
                                    }), 128)),
                                    !loadingCategories.value && categories.value.length === 0 ? (openBlock(), createBlock("option", {
                                      key: 0,
                                      disabled: ""
                                    }, "-- لا توجد فئات متاحة --")) : createCommentVNode("", true)
                                  ], 8, ["onUpdate:modelValue"])), [
                                    [vModelSelect, form.value.category_id]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "course_id",
                                    class: "admin-label"
                                  }, "الدورة الدراسية (اختياري)"),
                                  loadingCourses.value ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "form-loading-text"
                                  }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                    key: 1,
                                    id: "course_id",
                                    "onUpdate:modelValue": ($event) => form.value.course_id = $event,
                                    onChange: handleCourseChange,
                                    class: "admin-select"
                                  }, [
                                    createVNode("option", { value: null }, "-- درس عام (لا يتبع دورة) --"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                      return openBlock(), createBlock("option", {
                                        key: course.id,
                                        value: course.id
                                      }, toDisplayString(course.title), 9, ["value"]);
                                    }), 128)),
                                    !loadingCourses.value && courses.value.length === 0 ? (openBlock(), createBlock("option", {
                                      key: 0,
                                      disabled: ""
                                    }, "-- لا توجد دورات متاحة --")) : createCommentVNode("", true)
                                  ], 40, ["onUpdate:modelValue"])), [
                                    [vModelSelect, form.value.course_id]
                                  ])
                                ]),
                                form.value.course_id ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "module_number",
                                      class: "admin-label"
                                    }, "الوحدة داخل الدورة"),
                                    loadingModules.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "form-loading-text"
                                    }, "جار تحميل الوحدات...")) : !loadingModules.value && courseModules.value.length === 0 && !modulesError.value ? (openBlock(), createBlock("p", {
                                      key: 1,
                                      class: "form-hint bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-700"
                                    }, ' لم يتم تعريف وحدات لهذه الدورة بعد. يمكنك إضافتها من شاشة "تعديل الدورة". ')) : modulesError.value ? (openBlock(), createBlock("p", {
                                      key: 2,
                                      class: "form-error bg-red-100 dark:bg-red-900/30 p-2 rounded"
                                    }, "خطأ تحميل الوحدات: " + toDisplayString(modulesError.value), 1)) : courseModules.value.length > 0 ? withDirectives((openBlock(), createBlock("select", {
                                      key: 3,
                                      id: "module_number",
                                      "onUpdate:modelValue": ($event) => form.value.module_number = $event,
                                      class: "admin-select"
                                    }, [
                                      createVNode("option", { value: null }, "-- درس بدون وحدة (عام داخل الدورة) --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(courseModules.value, (module) => {
                                        return openBlock(), createBlock("option", {
                                          key: module.module_number,
                                          value: module.module_number
                                        }, " #" + toDisplayString(module.module_number) + " - " + toDisplayString(module.title), 9, ["value"]);
                                      }), 128))
                                    ], 8, ["onUpdate:modelValue"])), [
                                      [
                                        vModelSelect,
                                        form.value.module_number,
                                        void 0,
                                        { number: true }
                                      ]
                                    ]) : !loadingModules.value && courseModules.value.length === 0 ? (openBlock(), createBlock("div", {
                                      key: 4,
                                      class: "admin-input bg-gray-100 dark:bg-gray-600 cursor-not-allowed italic text-gray-500 dark:text-gray-400"
                                    }, "لا توجد وحدات")) : createCommentVNode("", true)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "lesson_order",
                                      class: "admin-label"
                                    }, "ترتيب الدرس"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "lesson_order",
                                      "onUpdate:modelValue": ($event) => form.value.lesson_order = $event,
                                      min: "1",
                                      class: "admin-input",
                                      placeholder: "اتركه فارغًا للترتيب التلقائي/الأخير"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.lesson_order,
                                        void 0,
                                        { number: true }
                                      ]
                                    ]),
                                    createVNode("p", { class: "form-hint" }, " ترتيب الدرس " + toDisplayString(form.value.module_number ? `داخل الوحدة #${form.value.module_number}` : "العام داخل الدورة") + ". (مثال: 1 هو الأول) ", 1)
                                  ])
                                ])) : createCommentVNode("", true),
                                errorMessage.value ? (openBlock(), createBlock("p", {
                                  key: 1,
                                  class: "form-error p-2 bg-red-100 dark:bg-red-900/30 rounded"
                                }, " خطأ: " + toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse" }, [
                                  createVNode("button", {
                                    type: "button",
                                    onClick: closeModal,
                                    class: "button-secondary"
                                  }, "إلغاء"),
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isSaving.value || loadingCategories.value || loadingCourses.value || loadingModules.value,
                                    class: "button-primary"
                                  }, [
                                    isSaving.value ? (openBlock(), createBlock("svg", {
                                      key: 0,
                                      class: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                      xmlns: "http://www.w3.org/2000/svg",
                                      fill: "none",
                                      viewBox: "0 0 24 24"
                                    }, [
                                      createVNode("circle", {
                                        class: "opacity-25",
                                        cx: "12",
                                        cy: "12",
                                        r: "10",
                                        stroke: "currentColor",
                                        "stroke-width": "4"
                                      }),
                                      createVNode("path", {
                                        class: "opacity-75",
                                        fill: "currentColor",
                                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      })
                                    ])) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة الدرس"), 1)
                                  ], 8, ["disabled"])
                                ])
                              ], 32)
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div></div>`);
                } else {
                  return [
                    createVNode(unref(TransitionChild), {
                      as: "div",
                      class: "fixed inset-0 bg-black/30 backdrop-blur-sm",
                      enter: "duration-300 ease-out",
                      "enter-from": "opacity-0",
                      "enter-to": "opacity-100",
                      leave: "duration-200 ease-in",
                      "leave-from": "opacity-100",
                      "leave-to": "opacity-0"
                    }),
                    createVNode("div", { class: "fixed inset-0 overflow-y-auto" }, [
                      createVNode("div", { class: "flex min-h-full items-center justify-center p-4 text-center" }, [
                        createVNode(unref(TransitionChild), {
                          as: "template",
                          enter: "duration-300 ease-out",
                          "enter-from": "opacity-0 scale-95",
                          "enter-to": "opacity-100 scale-100",
                          leave: "duration-200 ease-in",
                          "leave-from": "opacity-100 scale-100",
                          "leave-to": "opacity-0 scale-95"
                        }, {
                          default: withCtx(() => [
                            createVNode(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                              default: withCtx(() => [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "admin-modal-title"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(isEditing.value ? "تعديل الدرس" : "إضافة درس جديد"), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(saveLesson, ["prevent"]),
                                  class: "space-y-4"
                                }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "title",
                                      class: "admin-label"
                                    }, "العنوان *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "title",
                                      "onUpdate:modelValue": ($event) => form.value.title = $event,
                                      required: "",
                                      class: "admin-input",
                                      "aria-describedby": "title-error"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.title]
                                    ]),
                                    validationErrors.title ? (openBlock(), createBlock("p", {
                                      key: 0,
                                      class: "form-error",
                                      id: "title-error"
                                    }, toDisplayString(validationErrors.title), 1)) : createCommentVNode("", true)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "description",
                                      class: "admin-label"
                                    }, "الوصف"),
                                    withDirectives(createVNode("textarea", {
                                      id: "description",
                                      rows: "4",
                                      "onUpdate:modelValue": ($event) => form.value.description = $event,
                                      class: "admin-textarea"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.description]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "youtube_url",
                                      class: "admin-label"
                                    }, "رابط يوتيوب *"),
                                    withDirectives(createVNode("input", {
                                      type: "url",
                                      id: "youtube_url",
                                      "onUpdate:modelValue": ($event) => form.value.youtube_url = $event,
                                      required: "",
                                      placeholder: "https://...",
                                      class: "admin-input",
                                      "aria-describedby": "youtube-error"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.youtube_url]
                                    ]),
                                    validationErrors.youtube_url ? (openBlock(), createBlock("p", {
                                      key: 0,
                                      class: "form-error",
                                      id: "youtube-error"
                                    }, toDisplayString(validationErrors.youtube_url), 1)) : createCommentVNode("", true)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "category_id",
                                      class: "admin-label"
                                    }, "الفئة"),
                                    loadingCategories.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "form-loading-text"
                                    }, "جار تحميل الفئات...")) : withDirectives((openBlock(), createBlock("select", {
                                      key: 1,
                                      id: "category_id",
                                      "onUpdate:modelValue": ($event) => form.value.category_id = $event,
                                      class: "admin-select"
                                    }, [
                                      createVNode("option", { value: null }, "-- اختر فئة (اختياري) --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(categories.value, (cat) => {
                                        return openBlock(), createBlock("option", {
                                          key: cat.id,
                                          value: cat.id
                                        }, toDisplayString(cat.name), 9, ["value"]);
                                      }), 128)),
                                      !loadingCategories.value && categories.value.length === 0 ? (openBlock(), createBlock("option", {
                                        key: 0,
                                        disabled: ""
                                      }, "-- لا توجد فئات متاحة --")) : createCommentVNode("", true)
                                    ], 8, ["onUpdate:modelValue"])), [
                                      [vModelSelect, form.value.category_id]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "course_id",
                                      class: "admin-label"
                                    }, "الدورة الدراسية (اختياري)"),
                                    loadingCourses.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "form-loading-text"
                                    }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                      key: 1,
                                      id: "course_id",
                                      "onUpdate:modelValue": ($event) => form.value.course_id = $event,
                                      onChange: handleCourseChange,
                                      class: "admin-select"
                                    }, [
                                      createVNode("option", { value: null }, "-- درس عام (لا يتبع دورة) --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                        return openBlock(), createBlock("option", {
                                          key: course.id,
                                          value: course.id
                                        }, toDisplayString(course.title), 9, ["value"]);
                                      }), 128)),
                                      !loadingCourses.value && courses.value.length === 0 ? (openBlock(), createBlock("option", {
                                        key: 0,
                                        disabled: ""
                                      }, "-- لا توجد دورات متاحة --")) : createCommentVNode("", true)
                                    ], 40, ["onUpdate:modelValue"])), [
                                      [vModelSelect, form.value.course_id]
                                    ])
                                  ]),
                                  form.value.course_id ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                  }, [
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "module_number",
                                        class: "admin-label"
                                      }, "الوحدة داخل الدورة"),
                                      loadingModules.value ? (openBlock(), createBlock("div", {
                                        key: 0,
                                        class: "form-loading-text"
                                      }, "جار تحميل الوحدات...")) : !loadingModules.value && courseModules.value.length === 0 && !modulesError.value ? (openBlock(), createBlock("p", {
                                        key: 1,
                                        class: "form-hint bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-700"
                                      }, ' لم يتم تعريف وحدات لهذه الدورة بعد. يمكنك إضافتها من شاشة "تعديل الدورة". ')) : modulesError.value ? (openBlock(), createBlock("p", {
                                        key: 2,
                                        class: "form-error bg-red-100 dark:bg-red-900/30 p-2 rounded"
                                      }, "خطأ تحميل الوحدات: " + toDisplayString(modulesError.value), 1)) : courseModules.value.length > 0 ? withDirectives((openBlock(), createBlock("select", {
                                        key: 3,
                                        id: "module_number",
                                        "onUpdate:modelValue": ($event) => form.value.module_number = $event,
                                        class: "admin-select"
                                      }, [
                                        createVNode("option", { value: null }, "-- درس بدون وحدة (عام داخل الدورة) --"),
                                        (openBlock(true), createBlock(Fragment, null, renderList(courseModules.value, (module) => {
                                          return openBlock(), createBlock("option", {
                                            key: module.module_number,
                                            value: module.module_number
                                          }, " #" + toDisplayString(module.module_number) + " - " + toDisplayString(module.title), 9, ["value"]);
                                        }), 128))
                                      ], 8, ["onUpdate:modelValue"])), [
                                        [
                                          vModelSelect,
                                          form.value.module_number,
                                          void 0,
                                          { number: true }
                                        ]
                                      ]) : !loadingModules.value && courseModules.value.length === 0 ? (openBlock(), createBlock("div", {
                                        key: 4,
                                        class: "admin-input bg-gray-100 dark:bg-gray-600 cursor-not-allowed italic text-gray-500 dark:text-gray-400"
                                      }, "لا توجد وحدات")) : createCommentVNode("", true)
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "lesson_order",
                                        class: "admin-label"
                                      }, "ترتيب الدرس"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "lesson_order",
                                        "onUpdate:modelValue": ($event) => form.value.lesson_order = $event,
                                        min: "1",
                                        class: "admin-input",
                                        placeholder: "اتركه فارغًا للترتيب التلقائي/الأخير"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.lesson_order,
                                          void 0,
                                          { number: true }
                                        ]
                                      ]),
                                      createVNode("p", { class: "form-hint" }, " ترتيب الدرس " + toDisplayString(form.value.module_number ? `داخل الوحدة #${form.value.module_number}` : "العام داخل الدورة") + ". (مثال: 1 هو الأول) ", 1)
                                    ])
                                  ])) : createCommentVNode("", true),
                                  errorMessage.value ? (openBlock(), createBlock("p", {
                                    key: 1,
                                    class: "form-error p-2 bg-red-100 dark:bg-red-900/30 rounded"
                                  }, " خطأ: " + toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                  createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse" }, [
                                    createVNode("button", {
                                      type: "button",
                                      onClick: closeModal,
                                      class: "button-secondary"
                                    }, "إلغاء"),
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isSaving.value || loadingCategories.value || loadingCourses.value || loadingModules.value,
                                      class: "button-primary"
                                    }, [
                                      isSaving.value ? (openBlock(), createBlock("svg", {
                                        key: 0,
                                        class: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24"
                                      }, [
                                        createVNode("circle", {
                                          class: "opacity-25",
                                          cx: "12",
                                          cy: "12",
                                          r: "10",
                                          stroke: "currentColor",
                                          "stroke-width": "4"
                                        }),
                                        createVNode("path", {
                                          class: "opacity-75",
                                          fill: "currentColor",
                                          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        })
                                      ])) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة الدرس"), 1)
                                    ], 8, ["disabled"])
                                  ])
                                ], 32)
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(Dialog), {
                as: "div",
                onClose: closeModal,
                class: "relative z-50"
              }, {
                default: withCtx(() => [
                  createVNode(unref(TransitionChild), {
                    as: "div",
                    class: "fixed inset-0 bg-black/30 backdrop-blur-sm",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }),
                  createVNode("div", { class: "fixed inset-0 overflow-y-auto" }, [
                    createVNode("div", { class: "flex min-h-full items-center justify-center p-4 text-center" }, [
                      createVNode(unref(TransitionChild), {
                        as: "template",
                        enter: "duration-300 ease-out",
                        "enter-from": "opacity-0 scale-95",
                        "enter-to": "opacity-100 scale-100",
                        leave: "duration-200 ease-in",
                        "leave-from": "opacity-100 scale-100",
                        "leave-to": "opacity-0 scale-95"
                      }, {
                        default: withCtx(() => [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "admin-modal-title"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(isEditing.value ? "تعديل الدرس" : "إضافة درس جديد"), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(saveLesson, ["prevent"]),
                                class: "space-y-4"
                              }, [
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "title",
                                    class: "admin-label"
                                  }, "العنوان *"),
                                  withDirectives(createVNode("input", {
                                    type: "text",
                                    id: "title",
                                    "onUpdate:modelValue": ($event) => form.value.title = $event,
                                    required: "",
                                    class: "admin-input",
                                    "aria-describedby": "title-error"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.title]
                                  ]),
                                  validationErrors.title ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "form-error",
                                    id: "title-error"
                                  }, toDisplayString(validationErrors.title), 1)) : createCommentVNode("", true)
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "description",
                                    class: "admin-label"
                                  }, "الوصف"),
                                  withDirectives(createVNode("textarea", {
                                    id: "description",
                                    rows: "4",
                                    "onUpdate:modelValue": ($event) => form.value.description = $event,
                                    class: "admin-textarea"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.description]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "youtube_url",
                                    class: "admin-label"
                                  }, "رابط يوتيوب *"),
                                  withDirectives(createVNode("input", {
                                    type: "url",
                                    id: "youtube_url",
                                    "onUpdate:modelValue": ($event) => form.value.youtube_url = $event,
                                    required: "",
                                    placeholder: "https://...",
                                    class: "admin-input",
                                    "aria-describedby": "youtube-error"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.youtube_url]
                                  ]),
                                  validationErrors.youtube_url ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "form-error",
                                    id: "youtube-error"
                                  }, toDisplayString(validationErrors.youtube_url), 1)) : createCommentVNode("", true)
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "category_id",
                                    class: "admin-label"
                                  }, "الفئة"),
                                  loadingCategories.value ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "form-loading-text"
                                  }, "جار تحميل الفئات...")) : withDirectives((openBlock(), createBlock("select", {
                                    key: 1,
                                    id: "category_id",
                                    "onUpdate:modelValue": ($event) => form.value.category_id = $event,
                                    class: "admin-select"
                                  }, [
                                    createVNode("option", { value: null }, "-- اختر فئة (اختياري) --"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(categories.value, (cat) => {
                                      return openBlock(), createBlock("option", {
                                        key: cat.id,
                                        value: cat.id
                                      }, toDisplayString(cat.name), 9, ["value"]);
                                    }), 128)),
                                    !loadingCategories.value && categories.value.length === 0 ? (openBlock(), createBlock("option", {
                                      key: 0,
                                      disabled: ""
                                    }, "-- لا توجد فئات متاحة --")) : createCommentVNode("", true)
                                  ], 8, ["onUpdate:modelValue"])), [
                                    [vModelSelect, form.value.category_id]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "course_id",
                                    class: "admin-label"
                                  }, "الدورة الدراسية (اختياري)"),
                                  loadingCourses.value ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "form-loading-text"
                                  }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                    key: 1,
                                    id: "course_id",
                                    "onUpdate:modelValue": ($event) => form.value.course_id = $event,
                                    onChange: handleCourseChange,
                                    class: "admin-select"
                                  }, [
                                    createVNode("option", { value: null }, "-- درس عام (لا يتبع دورة) --"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                      return openBlock(), createBlock("option", {
                                        key: course.id,
                                        value: course.id
                                      }, toDisplayString(course.title), 9, ["value"]);
                                    }), 128)),
                                    !loadingCourses.value && courses.value.length === 0 ? (openBlock(), createBlock("option", {
                                      key: 0,
                                      disabled: ""
                                    }, "-- لا توجد دورات متاحة --")) : createCommentVNode("", true)
                                  ], 40, ["onUpdate:modelValue"])), [
                                    [vModelSelect, form.value.course_id]
                                  ])
                                ]),
                                form.value.course_id ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                                }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "module_number",
                                      class: "admin-label"
                                    }, "الوحدة داخل الدورة"),
                                    loadingModules.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "form-loading-text"
                                    }, "جار تحميل الوحدات...")) : !loadingModules.value && courseModules.value.length === 0 && !modulesError.value ? (openBlock(), createBlock("p", {
                                      key: 1,
                                      class: "form-hint bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-700"
                                    }, ' لم يتم تعريف وحدات لهذه الدورة بعد. يمكنك إضافتها من شاشة "تعديل الدورة". ')) : modulesError.value ? (openBlock(), createBlock("p", {
                                      key: 2,
                                      class: "form-error bg-red-100 dark:bg-red-900/30 p-2 rounded"
                                    }, "خطأ تحميل الوحدات: " + toDisplayString(modulesError.value), 1)) : courseModules.value.length > 0 ? withDirectives((openBlock(), createBlock("select", {
                                      key: 3,
                                      id: "module_number",
                                      "onUpdate:modelValue": ($event) => form.value.module_number = $event,
                                      class: "admin-select"
                                    }, [
                                      createVNode("option", { value: null }, "-- درس بدون وحدة (عام داخل الدورة) --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(courseModules.value, (module) => {
                                        return openBlock(), createBlock("option", {
                                          key: module.module_number,
                                          value: module.module_number
                                        }, " #" + toDisplayString(module.module_number) + " - " + toDisplayString(module.title), 9, ["value"]);
                                      }), 128))
                                    ], 8, ["onUpdate:modelValue"])), [
                                      [
                                        vModelSelect,
                                        form.value.module_number,
                                        void 0,
                                        { number: true }
                                      ]
                                    ]) : !loadingModules.value && courseModules.value.length === 0 ? (openBlock(), createBlock("div", {
                                      key: 4,
                                      class: "admin-input bg-gray-100 dark:bg-gray-600 cursor-not-allowed italic text-gray-500 dark:text-gray-400"
                                    }, "لا توجد وحدات")) : createCommentVNode("", true)
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "lesson_order",
                                      class: "admin-label"
                                    }, "ترتيب الدرس"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "lesson_order",
                                      "onUpdate:modelValue": ($event) => form.value.lesson_order = $event,
                                      min: "1",
                                      class: "admin-input",
                                      placeholder: "اتركه فارغًا للترتيب التلقائي/الأخير"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.lesson_order,
                                        void 0,
                                        { number: true }
                                      ]
                                    ]),
                                    createVNode("p", { class: "form-hint" }, " ترتيب الدرس " + toDisplayString(form.value.module_number ? `داخل الوحدة #${form.value.module_number}` : "العام داخل الدورة") + ". (مثال: 1 هو الأول) ", 1)
                                  ])
                                ])) : createCommentVNode("", true),
                                errorMessage.value ? (openBlock(), createBlock("p", {
                                  key: 1,
                                  class: "form-error p-2 bg-red-100 dark:bg-red-900/30 rounded"
                                }, " خطأ: " + toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse" }, [
                                  createVNode("button", {
                                    type: "button",
                                    onClick: closeModal,
                                    class: "button-secondary"
                                  }, "إلغاء"),
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isSaving.value || loadingCategories.value || loadingCourses.value || loadingModules.value,
                                    class: "button-primary"
                                  }, [
                                    isSaving.value ? (openBlock(), createBlock("svg", {
                                      key: 0,
                                      class: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                      xmlns: "http://www.w3.org/2000/svg",
                                      fill: "none",
                                      viewBox: "0 0 24 24"
                                    }, [
                                      createVNode("circle", {
                                        class: "opacity-25",
                                        cx: "12",
                                        cy: "12",
                                        r: "10",
                                        stroke: "currentColor",
                                        "stroke-width": "4"
                                      }),
                                      createVNode("path", {
                                        class: "opacity-75",
                                        fill: "currentColor",
                                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      })
                                    ])) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة الدرس"), 1)
                                  ], 8, ["disabled"])
                                ])
                              ], 32)
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=AdminLessonModal.vue2.mjs.map
