import { defineComponent, ref, computed, watch, unref, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, withModifiers, createBlock, createCommentVNode, withDirectives, vModelText, vModelSelect, openBlock, Fragment, renderList, vModelCheckbox } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from "vue/server-renderer";
import { TransitionRoot, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/vue";
import LoadingSpinner from "../LoadingSpinner.vue.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useNuxtApp } from "../../node_modules/nuxt/dist/app/nuxt.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "QuizCreateEditModal",
  __ssrInlineRender: true,
  props: {
    modelValue: {
      // For v-model on parent
      type: Boolean,
      default: false
    },
    quizData: {
      // Existing quiz data for editing, null for creation
      type: Object,
      default: null
    }
  },
  emits: ["update:modelValue", "saved", "closed"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const supabase = useSupabaseClient();
    const { $toast } = useNuxtApp();
    const isOpen = ref(props.modelValue);
    const isSaving = ref(false);
    const formError = ref(null);
    const form = ref({});
    const courses = ref([]);
    const lessons = ref([]);
    const isLoadingCourses = ref(false);
    const isLoadingLessons = ref(false);
    const selectedCourseForLesson = ref(null);
    const isEditing = computed(() => {
      var _a;
      return !!((_a = props.quizData) == null ? void 0 : _a.id);
    });
    const formatDateForInput = (dateString) => {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
      } catch {
        return "";
      }
    };
    watch(() => props.modelValue, (newVal) => {
      isOpen.value = newVal;
      if (newVal) {
        resetForm();
        fetchCourses();
      }
    });
    watch(() => props.quizData, (newQuiz) => {
      resetForm();
    }, { deep: true });
    const resetForm = () => {
      formError.value = null;
      isSaving.value = false;
      if (isEditing.value && props.quizData) {
        form.value = {
          ...props.quizData,
          // Format due_date for the input field
          due_date: formatDateForInput(props.quizData.due_date),
          // Ensure max_attempts is null if undefined/null from DB
          max_attempts: props.quizData.max_attempts ?? null,
          // Ensure time_limit is null if undefined/null
          time_limit_minutes: props.quizData.time_limit_minutes ?? null,
          // Ensure module_number is null if undefined/null
          module_number: props.quizData.module_number ?? null
        };
        if (form.value.type === "lesson" && form.value.lesson_id) {
          findCourseForLesson(form.value.lesson_id);
        } else {
          selectedCourseForLesson.value = null;
          lessons.value = [];
        }
      } else {
        form.value = {
          title: "",
          description: null,
          type: null,
          course_id: null,
          lesson_id: null,
          module_number: null,
          pass_mark_percentage: 50,
          max_attempts: null,
          time_limit_minutes: null,
          due_date: null,
          is_active: true
        };
        selectedCourseForLesson.value = null;
        lessons.value = [];
      }
    };
    const findCourseForLesson = async (lessonId) => {
      isLoadingLessons.value = true;
      try {
        const { data, error } = await supabase.from("lessons").select("course_id").eq("id", lessonId).single();
        if (error || !(data == null ? void 0 : data.course_id)) {
          console.error("Could not find course for lesson:", lessonId, error);
          selectedCourseForLesson.value = null;
          lessons.value = [];
        } else {
          selectedCourseForLesson.value = data.course_id;
          await fetchLessonsForCourse();
        }
      } catch (err) {
        console.error("Error in findCourseForLesson:", err);
        selectedCourseForLesson.value = null;
        lessons.value = [];
      } finally {
      }
    };
    const fetchCourses = async () => {
      if (courses.value.length > 0) return;
      isLoadingCourses.value = true;
      try {
        const { data, error } = await supabase.from("study_courses").select("id, title").order("title");
        if (error) throw error;
        courses.value = data || [];
      } catch (err) {
        console.error("Error fetching courses:", err);
        formError.value = "فشل تحميل قائمة الدورات.";
      } finally {
        isLoadingCourses.value = false;
      }
    };
    const fetchLessonsForCourse = async () => {
      var _a;
      lessons.value = [];
      form.value.lesson_id = null;
      if (!selectedCourseForLesson.value || form.value.type !== "lesson") return;
      isLoadingLessons.value = true;
      try {
        const { data, error } = await supabase.from("lessons").select("id, title").eq("course_id", selectedCourseForLesson.value).order("lesson_order", { nulls: "last" }).order("title");
        if (error) throw error;
        lessons.value = data || [];
        if (isEditing.value && ((_a = props.quizData) == null ? void 0 : _a.lesson_id)) {
          form.value.lesson_id = props.quizData.lesson_id;
        }
      } catch (err) {
        console.error("Error fetching lessons:", err);
        formError.value = "فشل تحميل قائمة الدروس لهذه الدورة.";
      } finally {
        isLoadingLessons.value = false;
      }
    };
    const handleTypeChange = () => {
      form.value.course_id = null;
      form.value.lesson_id = null;
      form.value.module_number = null;
      selectedCourseForLesson.value = null;
      lessons.value = [];
    };
    const handleCourseChange = () => {
      form.value.lesson_id = null;
    };
    const saveQuiz = async () => {
      var _a;
      isSaving.value = true;
      formError.value = null;
      if (!((_a = form.value.title) == null ? void 0 : _a.trim())) {
        formError.value = "عنوان الاختبار مطلوب.";
        isSaving.value = false;
        return;
      }
      if (!form.value.type) {
        formError.value = "نوع الاختبار مطلوب.";
        isSaving.value = false;
        return;
      }
      if (form.value.type === "lesson" && !form.value.lesson_id) {
        formError.value = "يجب اختيار درس لاختبار الدرس.";
        isSaving.value = false;
        return;
      }
      if ((form.value.type === "module" || form.value.type === "final") && !form.value.course_id) {
        formError.value = "يجب اختيار دورة لاختبار الوحدة أو الاختبار النهائي.";
        isSaving.value = false;
        return;
      }
      if (form.value.type === "module" && (!form.value.module_number || form.value.module_number < 1)) {
        formError.value = "رقم الوحدة مطلوب وصحيح لاختبار الوحدة.";
        isSaving.value = false;
        return;
      }
      if (form.value.pass_mark_percentage === null || form.value.pass_mark_percentage === void 0 || form.value.pass_mark_percentage < 0 || form.value.pass_mark_percentage > 100) {
        formError.value = "درجة النجاح يجب أن تكون بين 0 و 100.";
        isSaving.value = false;
        return;
      }
      if (form.value.max_attempts !== null && form.value.max_attempts < 1) {
        formError.value = "عدد المحاولات يجب أن يكون 1 أو أكثر (أو يترك فارغًا).";
        isSaving.value = false;
        return;
      }
      if (form.value.time_limit_minutes !== null && form.value.time_limit_minutes < 1) {
        formError.value = "الوقت المحدد يجب أن يكون دقيقة واحدة أو أكثر.";
        isSaving.value = false;
        return;
      }
      const quizPayload = {
        title: form.value.title,
        description: form.value.description || null,
        type: form.value.type,
        course_id: form.value.type === "module" || form.value.type === "final" ? form.value.course_id : null,
        lesson_id: form.value.type === "lesson" ? form.value.lesson_id : null,
        module_number: form.value.type === "module" ? form.value.module_number : null,
        pass_mark_percentage: form.value.pass_mark_percentage ?? 50,
        // Default if somehow null
        max_attempts: form.value.max_attempts || null,
        // Ensure empty string becomes null
        time_limit_minutes: form.value.time_limit_minutes || null,
        // Convert datetime-local string back to ISO string or null
        due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null,
        is_active: form.value.is_active ?? true
      };
      try {
        let savedData = null;
        let error = null;
        if (isEditing.value && form.value.id) {
          const { data, error: updateError } = await supabase.from("quizzes").update({ ...quizPayload, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", form.value.id).select().single();
          savedData = data;
          error = updateError;
        } else {
          const { data, error: insertError } = await supabase.from("quizzes").insert(quizPayload).select().single();
          savedData = data;
          error = insertError;
        }
        if (error) throw error;
        if (!savedData) throw new Error("لم يتم إرجاع بيانات الاختبار المحفوظة.");
        emit("saved", savedData);
      } catch (err) {
        console.error("Error saving quiz:", err);
        formError.value = `فشل حفظ الاختبار: (${err.message || "خطأ غير معروف"})`;
      } finally {
        isSaving.value = false;
      }
    };
    function closeModal() {
      if (isSaving.value) return;
      isOpen.value = false;
      emit("update:modelValue", false);
      emit("closed");
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TransitionRoot), mergeProps({
        appear: "",
        show: isOpen.value,
        as: "template"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Dialog), {
              as: "div",
              onClose: closeModal,
              class: "relative z-40"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(TransitionChild), {
                    as: "template",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" data-v-60ba606a${_scopeId3}></div>`);
                      } else {
                        return [
                          createVNode("div", {
                            class: "fixed inset-0 bg-black/40 backdrop-blur-sm",
                            "aria-hidden": "true"
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="fixed inset-0 overflow-y-auto" data-v-60ba606a${_scopeId2}><div class="flex min-h-full items-center justify-center p-4 text-center" data-v-60ba606a${_scopeId2}>`);
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
                        _push4(ssrRenderComponent(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(isEditing.value ? "تعديل الاختبار" : "إنشاء اختبار جديد")}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(isEditing.value ? "تعديل الاختبار" : "إنشاء اختبار جديد"), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<form data-v-60ba606a${_scopeId4}><div class="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2" data-v-60ba606a${_scopeId4}><div class="sm:col-span-2" data-v-60ba606a${_scopeId4}><label for="quiz-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>عنوان الاختبار *</label><input type="text" id="quiz-title"${ssrRenderAttr("value", form.value.title)} required class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}></div><div class="sm:col-span-2" data-v-60ba606a${_scopeId4}><label for="quiz-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>الوصف (اختياري)</label><textarea id="quiz-description" rows="3" class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}>${ssrInterpolate(form.value.description)}</textarea></div><div data-v-60ba606a${_scopeId4}><label for="quiz-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>نوع الاختبار *</label><select id="quiz-type" required class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}><option${ssrRenderAttr("value", null)} disabled data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.type) ? ssrLooseContain(form.value.type, null) : ssrLooseEqual(form.value.type, null)) ? " selected" : ""}${_scopeId4}>-- اختر النوع --</option><option value="lesson" data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.type) ? ssrLooseContain(form.value.type, "lesson") : ssrLooseEqual(form.value.type, "lesson")) ? " selected" : ""}${_scopeId4}>اختبار درس</option><option value="module" data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.type) ? ssrLooseContain(form.value.type, "module") : ssrLooseEqual(form.value.type, "module")) ? " selected" : ""}${_scopeId4}>اختبار وحدة</option><option value="final" data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.type) ? ssrLooseContain(form.value.type, "final") : ssrLooseEqual(form.value.type, "final")) ? " selected" : ""}${_scopeId4}>اختبار نهائي</option></select></div>`);
                              if (form.value.type === "module" || form.value.type === "final") {
                                _push5(`<div data-v-60ba606a${_scopeId4}><label for="quiz-course" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>الدورة الدراسية *</label>`);
                                if (isLoadingCourses.value) {
                                  _push5(`<div class="mt-1 text-sm text-gray-500" data-v-60ba606a${_scopeId4}>جار تحميل الدورات...</div>`);
                                } else {
                                  _push5(`<select id="quiz-course" required class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}><option${ssrRenderAttr("value", null)} disabled data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.course_id) ? ssrLooseContain(form.value.course_id, null) : ssrLooseEqual(form.value.course_id, null)) ? " selected" : ""}${_scopeId4}>-- اختر الدورة --</option><!--[-->`);
                                  ssrRenderList(courses.value, (course) => {
                                    _push5(`<option${ssrRenderAttr("value", course.id)} data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.course_id) ? ssrLooseContain(form.value.course_id, course.id) : ssrLooseEqual(form.value.course_id, course.id)) ? " selected" : ""}${_scopeId4}>${ssrInterpolate(course.title)}</option>`);
                                  });
                                  _push5(`<!--]-->`);
                                  if (!isLoadingCourses.value && courses.value.length === 0) {
                                    _push5(`<option disabled data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.course_id) ? ssrLooseContain(form.value.course_id, null) : ssrLooseEqual(form.value.course_id, null)) ? " selected" : ""}${_scopeId4}>-- لا توجد دورات --</option>`);
                                  } else {
                                    _push5(`<!---->`);
                                  }
                                  _push5(`</select>`);
                                }
                                _push5(`</div>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              if (form.value.type === "lesson") {
                                _push5(`<div data-v-60ba606a${_scopeId4}><label for="quiz-lesson-course" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>الدورة (لتحديد الدرس) *</label>`);
                                if (isLoadingCourses.value) {
                                  _push5(`<div class="mt-1 text-sm text-gray-500" data-v-60ba606a${_scopeId4}>جار تحميل الدورات...</div>`);
                                } else {
                                  _push5(`<select id="quiz-lesson-course" required class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}><option${ssrRenderAttr("value", null)} disabled data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(selectedCourseForLesson.value) ? ssrLooseContain(selectedCourseForLesson.value, null) : ssrLooseEqual(selectedCourseForLesson.value, null)) ? " selected" : ""}${_scopeId4}>-- اختر دورة لعرض دروسها --</option><!--[-->`);
                                  ssrRenderList(courses.value, (course) => {
                                    _push5(`<option${ssrRenderAttr("value", course.id)} data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(selectedCourseForLesson.value) ? ssrLooseContain(selectedCourseForLesson.value, course.id) : ssrLooseEqual(selectedCourseForLesson.value, course.id)) ? " selected" : ""}${_scopeId4}>${ssrInterpolate(course.title)}</option>`);
                                  });
                                  _push5(`<!--]--></select>`);
                                }
                                _push5(`</div>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              if (form.value.type === "lesson") {
                                _push5(`<div data-v-60ba606a${_scopeId4}><label for="quiz-lesson" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>الدرس *</label>`);
                                if (isLoadingLessons.value) {
                                  _push5(`<div class="mt-1 text-sm text-gray-500" data-v-60ba606a${_scopeId4}>جار تحميل الدروس...</div>`);
                                } else {
                                  _push5(`<select id="quiz-lesson" required${ssrIncludeBooleanAttr(!selectedCourseForLesson.value || lessons.value.length === 0) ? " disabled" : ""} class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}><option${ssrRenderAttr("value", null)} disabled data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.lesson_id) ? ssrLooseContain(form.value.lesson_id, null) : ssrLooseEqual(form.value.lesson_id, null)) ? " selected" : ""}${_scopeId4}>-- اختر الدرس --</option><!--[-->`);
                                  ssrRenderList(lessons.value, (lesson) => {
                                    _push5(`<option${ssrRenderAttr("value", lesson.id)} data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.lesson_id) ? ssrLooseContain(form.value.lesson_id, lesson.id) : ssrLooseEqual(form.value.lesson_id, lesson.id)) ? " selected" : ""}${_scopeId4}>${ssrInterpolate(lesson.title)}</option>`);
                                  });
                                  _push5(`<!--]-->`);
                                  if (!isLoadingLessons.value && lessons.value.length === 0 && selectedCourseForLesson.value) {
                                    _push5(`<option disabled data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.lesson_id) ? ssrLooseContain(form.value.lesson_id, null) : ssrLooseEqual(form.value.lesson_id, null)) ? " selected" : ""}${_scopeId4}>-- لا توجد دروس لهذه الدورة --</option>`);
                                  } else {
                                    _push5(`<!---->`);
                                  }
                                  if (!selectedCourseForLesson.value) {
                                    _push5(`<option disabled data-v-60ba606a${ssrIncludeBooleanAttr(Array.isArray(form.value.lesson_id) ? ssrLooseContain(form.value.lesson_id, null) : ssrLooseEqual(form.value.lesson_id, null)) ? " selected" : ""}${_scopeId4}>-- اختر دورة أولاً --</option>`);
                                  } else {
                                    _push5(`<!---->`);
                                  }
                                  _push5(`</select>`);
                                }
                                _push5(`</div>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              if (form.value.type === "module") {
                                _push5(`<div data-v-60ba606a${_scopeId4}><label for="quiz-module" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>رقم الوحدة *</label><input type="number" id="quiz-module"${ssrRenderAttr("value", form.value.module_number)} required min="1" class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}></div>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`<div data-v-60ba606a${_scopeId4}><label for="quiz-pass-mark" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>درجة النجاح (%) *</label><input type="number" id="quiz-pass-mark"${ssrRenderAttr("value", form.value.pass_mark_percentage)} required min="0" max="100" class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}></div><div data-v-60ba606a${_scopeId4}><label for="quiz-max-attempts" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>أقصى عدد محاولات</label><input type="number" id="quiz-max-attempts"${ssrRenderAttr("value", form.value.max_attempts)} min="1" placeholder="غير محدود" class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}><p class="mt-1 text-xs text-gray-500 dark:text-gray-400" data-v-60ba606a${_scopeId4}>اتركه فارغًا لمحاولات غير محدودة.</p></div><div data-v-60ba606a${_scopeId4}><label for="quiz-time-limit" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>الوقت المحدد (بالدقائق)</label><input type="number" id="quiz-time-limit"${ssrRenderAttr("value", form.value.time_limit_minutes)} min="1" class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}></div><div data-v-60ba606a${_scopeId4}><label for="quiz-due-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-60ba606a${_scopeId4}>تاريخ الاستحقاق (اختياري)</label><input type="datetime-local" id="quiz-due-date"${ssrRenderAttr("value", form.value.due_date)} class="mt-1 block w-full input-field" data-v-60ba606a${_scopeId4}></div><div class="sm:col-span-2" data-v-60ba606a${_scopeId4}><div class="flex items-center" data-v-60ba606a${_scopeId4}><input id="quiz-is-active" type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(form.value.is_active) ? ssrLooseContain(form.value.is_active, null) : form.value.is_active) ? " checked" : ""} class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" data-v-60ba606a${_scopeId4}><label for="quiz-is-active" class="ml-2 block text-sm text-gray-900 dark:text-gray-300" data-v-60ba606a${_scopeId4}>الاختبار نشط ومتاح للطلاب؟</label></div></div></div>`);
                              if (formError.value) {
                                _push5(`<p class="mt-4 text-sm text-red-600 dark:text-red-400" data-v-60ba606a${_scopeId4}>${ssrInterpolate(formError.value)}</p>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`<div class="mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5" data-v-60ba606a${_scopeId4}><button type="submit"${ssrIncludeBooleanAttr(isSaving.value) ? " disabled" : ""} class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50" data-v-60ba606a${_scopeId4}>`);
                              if (isSaving.value) {
                                _push5(ssrRenderComponent(LoadingSpinner, { class: "w-5 h-5 text-white -ml-1 mr-2" }, null, _parent5, _scopeId4));
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(` ${ssrInterpolate(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إنشاء الاختبار")}</button><button type="button" class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"${ssrIncludeBooleanAttr(isSaving.value) ? " disabled" : ""} data-v-60ba606a${_scopeId4}> إلغاء </button></div></form>`);
                            } else {
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(isEditing.value ? "تعديل الاختبار" : "إنشاء اختبار جديد"), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(saveQuiz, ["prevent"])
                                }, [
                                  createVNode("div", { class: "mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2" }, [
                                    createVNode("div", { class: "sm:col-span-2" }, [
                                      createVNode("label", {
                                        for: "quiz-title",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "عنوان الاختبار *"),
                                      withDirectives(createVNode("input", {
                                        type: "text",
                                        id: "quiz-title",
                                        "onUpdate:modelValue": ($event) => form.value.title = $event,
                                        required: "",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelText, form.value.title]
                                      ])
                                    ]),
                                    createVNode("div", { class: "sm:col-span-2" }, [
                                      createVNode("label", {
                                        for: "quiz-description",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "الوصف (اختياري)"),
                                      withDirectives(createVNode("textarea", {
                                        id: "quiz-description",
                                        "onUpdate:modelValue": ($event) => form.value.description = $event,
                                        rows: "3",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelText, form.value.description]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "quiz-type",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "نوع الاختبار *"),
                                      withDirectives(createVNode("select", {
                                        id: "quiz-type",
                                        "onUpdate:modelValue": ($event) => form.value.type = $event,
                                        required: "",
                                        onChange: handleTypeChange,
                                        class: "mt-1 block w-full input-field"
                                      }, [
                                        createVNode("option", {
                                          value: null,
                                          disabled: ""
                                        }, "-- اختر النوع --"),
                                        createVNode("option", { value: "lesson" }, "اختبار درس"),
                                        createVNode("option", { value: "module" }, "اختبار وحدة"),
                                        createVNode("option", { value: "final" }, "اختبار نهائي")
                                      ], 40, ["onUpdate:modelValue"]), [
                                        [vModelSelect, form.value.type]
                                      ])
                                    ]),
                                    form.value.type === "module" || form.value.type === "final" ? (openBlock(), createBlock("div", { key: 0 }, [
                                      createVNode("label", {
                                        for: "quiz-course",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "الدورة الدراسية *"),
                                      isLoadingCourses.value ? (openBlock(), createBlock("div", {
                                        key: 0,
                                        class: "mt-1 text-sm text-gray-500"
                                      }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                        key: 1,
                                        id: "quiz-course",
                                        "onUpdate:modelValue": ($event) => form.value.course_id = $event,
                                        required: "",
                                        onChange: handleCourseChange,
                                        class: "mt-1 block w-full input-field"
                                      }, [
                                        createVNode("option", {
                                          value: null,
                                          disabled: ""
                                        }, "-- اختر الدورة --"),
                                        (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                          return openBlock(), createBlock("option", {
                                            key: course.id,
                                            value: course.id
                                          }, toDisplayString(course.title), 9, ["value"]);
                                        }), 128)),
                                        !isLoadingCourses.value && courses.value.length === 0 ? (openBlock(), createBlock("option", {
                                          key: 0,
                                          disabled: ""
                                        }, "-- لا توجد دورات --")) : createCommentVNode("", true)
                                      ], 40, ["onUpdate:modelValue"])), [
                                        [vModelSelect, form.value.course_id]
                                      ])
                                    ])) : createCommentVNode("", true),
                                    form.value.type === "lesson" ? (openBlock(), createBlock("div", { key: 1 }, [
                                      createVNode("label", {
                                        for: "quiz-lesson-course",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "الدورة (لتحديد الدرس) *"),
                                      isLoadingCourses.value ? (openBlock(), createBlock("div", {
                                        key: 0,
                                        class: "mt-1 text-sm text-gray-500"
                                      }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                        key: 1,
                                        id: "quiz-lesson-course",
                                        "onUpdate:modelValue": ($event) => selectedCourseForLesson.value = $event,
                                        required: "",
                                        onChange: fetchLessonsForCourse,
                                        class: "mt-1 block w-full input-field"
                                      }, [
                                        createVNode("option", {
                                          value: null,
                                          disabled: ""
                                        }, "-- اختر دورة لعرض دروسها --"),
                                        (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                          return openBlock(), createBlock("option", {
                                            key: course.id,
                                            value: course.id
                                          }, toDisplayString(course.title), 9, ["value"]);
                                        }), 128))
                                      ], 40, ["onUpdate:modelValue"])), [
                                        [vModelSelect, selectedCourseForLesson.value]
                                      ])
                                    ])) : createCommentVNode("", true),
                                    form.value.type === "lesson" ? (openBlock(), createBlock("div", { key: 2 }, [
                                      createVNode("label", {
                                        for: "quiz-lesson",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "الدرس *"),
                                      isLoadingLessons.value ? (openBlock(), createBlock("div", {
                                        key: 0,
                                        class: "mt-1 text-sm text-gray-500"
                                      }, "جار تحميل الدروس...")) : withDirectives((openBlock(), createBlock("select", {
                                        key: 1,
                                        id: "quiz-lesson",
                                        "onUpdate:modelValue": ($event) => form.value.lesson_id = $event,
                                        required: "",
                                        disabled: !selectedCourseForLesson.value || lessons.value.length === 0,
                                        class: "mt-1 block w-full input-field"
                                      }, [
                                        createVNode("option", {
                                          value: null,
                                          disabled: ""
                                        }, "-- اختر الدرس --"),
                                        (openBlock(true), createBlock(Fragment, null, renderList(lessons.value, (lesson) => {
                                          return openBlock(), createBlock("option", {
                                            key: lesson.id,
                                            value: lesson.id
                                          }, toDisplayString(lesson.title), 9, ["value"]);
                                        }), 128)),
                                        !isLoadingLessons.value && lessons.value.length === 0 && selectedCourseForLesson.value ? (openBlock(), createBlock("option", {
                                          key: 0,
                                          disabled: ""
                                        }, "-- لا توجد دروس لهذه الدورة --")) : createCommentVNode("", true),
                                        !selectedCourseForLesson.value ? (openBlock(), createBlock("option", {
                                          key: 1,
                                          disabled: ""
                                        }, "-- اختر دورة أولاً --")) : createCommentVNode("", true)
                                      ], 8, ["onUpdate:modelValue", "disabled"])), [
                                        [vModelSelect, form.value.lesson_id]
                                      ])
                                    ])) : createCommentVNode("", true),
                                    form.value.type === "module" ? (openBlock(), createBlock("div", { key: 3 }, [
                                      createVNode("label", {
                                        for: "quiz-module",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "رقم الوحدة *"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "quiz-module",
                                        "onUpdate:modelValue": ($event) => form.value.module_number = $event,
                                        required: "",
                                        min: "1",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.module_number,
                                          void 0,
                                          { number: true }
                                        ]
                                      ])
                                    ])) : createCommentVNode("", true),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "quiz-pass-mark",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "درجة النجاح (%) *"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "quiz-pass-mark",
                                        "onUpdate:modelValue": ($event) => form.value.pass_mark_percentage = $event,
                                        required: "",
                                        min: "0",
                                        max: "100",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.pass_mark_percentage,
                                          void 0,
                                          { number: true }
                                        ]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "quiz-max-attempts",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "أقصى عدد محاولات"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "quiz-max-attempts",
                                        "onUpdate:modelValue": ($event) => form.value.max_attempts = $event,
                                        min: "1",
                                        placeholder: "غير محدود",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.max_attempts,
                                          void 0,
                                          { number: true }
                                        ]
                                      ]),
                                      createVNode("p", { class: "mt-1 text-xs text-gray-500 dark:text-gray-400" }, "اتركه فارغًا لمحاولات غير محدودة.")
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "quiz-time-limit",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "الوقت المحدد (بالدقائق)"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "quiz-time-limit",
                                        "onUpdate:modelValue": ($event) => form.value.time_limit_minutes = $event,
                                        min: "1",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.time_limit_minutes,
                                          void 0,
                                          { number: true }
                                        ]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "quiz-due-date",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "تاريخ الاستحقاق (اختياري)"),
                                      withDirectives(createVNode("input", {
                                        type: "datetime-local",
                                        id: "quiz-due-date",
                                        "onUpdate:modelValue": ($event) => form.value.due_date = $event,
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelText, form.value.due_date]
                                      ])
                                    ]),
                                    createVNode("div", { class: "sm:col-span-2" }, [
                                      createVNode("div", { class: "flex items-center" }, [
                                        withDirectives(createVNode("input", {
                                          id: "quiz-is-active",
                                          type: "checkbox",
                                          "onUpdate:modelValue": ($event) => form.value.is_active = $event,
                                          class: "h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                        }, null, 8, ["onUpdate:modelValue"]), [
                                          [vModelCheckbox, form.value.is_active]
                                        ]),
                                        createVNode("label", {
                                          for: "quiz-is-active",
                                          class: "ml-2 block text-sm text-gray-900 dark:text-gray-300"
                                        }, "الاختبار نشط ومتاح للطلاب؟")
                                      ])
                                    ])
                                  ]),
                                  formError.value ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "mt-4 text-sm text-red-600 dark:text-red-400"
                                  }, toDisplayString(formError.value), 1)) : createCommentVNode("", true),
                                  createVNode("div", { class: "mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5" }, [
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isSaving.value,
                                      class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                    }, [
                                      isSaving.value ? (openBlock(), createBlock(LoadingSpinner, {
                                        key: 0,
                                        class: "w-5 h-5 text-white -ml-1 mr-2"
                                      })) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إنشاء الاختبار"), 1)
                                    ], 8, ["disabled"]),
                                    createVNode("button", {
                                      type: "button",
                                      class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                      onClick: closeModal,
                                      disabled: isSaving.value
                                    }, " إلغاء ", 8, ["disabled"])
                                  ])
                                ], 32)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(isEditing.value ? "تعديل الاختبار" : "إنشاء اختبار جديد"), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(saveQuiz, ["prevent"])
                              }, [
                                createVNode("div", { class: "mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2" }, [
                                  createVNode("div", { class: "sm:col-span-2" }, [
                                    createVNode("label", {
                                      for: "quiz-title",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "عنوان الاختبار *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "quiz-title",
                                      "onUpdate:modelValue": ($event) => form.value.title = $event,
                                      required: "",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.title]
                                    ])
                                  ]),
                                  createVNode("div", { class: "sm:col-span-2" }, [
                                    createVNode("label", {
                                      for: "quiz-description",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الوصف (اختياري)"),
                                    withDirectives(createVNode("textarea", {
                                      id: "quiz-description",
                                      "onUpdate:modelValue": ($event) => form.value.description = $event,
                                      rows: "3",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.description]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "quiz-type",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "نوع الاختبار *"),
                                    withDirectives(createVNode("select", {
                                      id: "quiz-type",
                                      "onUpdate:modelValue": ($event) => form.value.type = $event,
                                      required: "",
                                      onChange: handleTypeChange,
                                      class: "mt-1 block w-full input-field"
                                    }, [
                                      createVNode("option", {
                                        value: null,
                                        disabled: ""
                                      }, "-- اختر النوع --"),
                                      createVNode("option", { value: "lesson" }, "اختبار درس"),
                                      createVNode("option", { value: "module" }, "اختبار وحدة"),
                                      createVNode("option", { value: "final" }, "اختبار نهائي")
                                    ], 40, ["onUpdate:modelValue"]), [
                                      [vModelSelect, form.value.type]
                                    ])
                                  ]),
                                  form.value.type === "module" || form.value.type === "final" ? (openBlock(), createBlock("div", { key: 0 }, [
                                    createVNode("label", {
                                      for: "quiz-course",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الدورة الدراسية *"),
                                    isLoadingCourses.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "mt-1 text-sm text-gray-500"
                                    }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                      key: 1,
                                      id: "quiz-course",
                                      "onUpdate:modelValue": ($event) => form.value.course_id = $event,
                                      required: "",
                                      onChange: handleCourseChange,
                                      class: "mt-1 block w-full input-field"
                                    }, [
                                      createVNode("option", {
                                        value: null,
                                        disabled: ""
                                      }, "-- اختر الدورة --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                        return openBlock(), createBlock("option", {
                                          key: course.id,
                                          value: course.id
                                        }, toDisplayString(course.title), 9, ["value"]);
                                      }), 128)),
                                      !isLoadingCourses.value && courses.value.length === 0 ? (openBlock(), createBlock("option", {
                                        key: 0,
                                        disabled: ""
                                      }, "-- لا توجد دورات --")) : createCommentVNode("", true)
                                    ], 40, ["onUpdate:modelValue"])), [
                                      [vModelSelect, form.value.course_id]
                                    ])
                                  ])) : createCommentVNode("", true),
                                  form.value.type === "lesson" ? (openBlock(), createBlock("div", { key: 1 }, [
                                    createVNode("label", {
                                      for: "quiz-lesson-course",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الدورة (لتحديد الدرس) *"),
                                    isLoadingCourses.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "mt-1 text-sm text-gray-500"
                                    }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                      key: 1,
                                      id: "quiz-lesson-course",
                                      "onUpdate:modelValue": ($event) => selectedCourseForLesson.value = $event,
                                      required: "",
                                      onChange: fetchLessonsForCourse,
                                      class: "mt-1 block w-full input-field"
                                    }, [
                                      createVNode("option", {
                                        value: null,
                                        disabled: ""
                                      }, "-- اختر دورة لعرض دروسها --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                        return openBlock(), createBlock("option", {
                                          key: course.id,
                                          value: course.id
                                        }, toDisplayString(course.title), 9, ["value"]);
                                      }), 128))
                                    ], 40, ["onUpdate:modelValue"])), [
                                      [vModelSelect, selectedCourseForLesson.value]
                                    ])
                                  ])) : createCommentVNode("", true),
                                  form.value.type === "lesson" ? (openBlock(), createBlock("div", { key: 2 }, [
                                    createVNode("label", {
                                      for: "quiz-lesson",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الدرس *"),
                                    isLoadingLessons.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "mt-1 text-sm text-gray-500"
                                    }, "جار تحميل الدروس...")) : withDirectives((openBlock(), createBlock("select", {
                                      key: 1,
                                      id: "quiz-lesson",
                                      "onUpdate:modelValue": ($event) => form.value.lesson_id = $event,
                                      required: "",
                                      disabled: !selectedCourseForLesson.value || lessons.value.length === 0,
                                      class: "mt-1 block w-full input-field"
                                    }, [
                                      createVNode("option", {
                                        value: null,
                                        disabled: ""
                                      }, "-- اختر الدرس --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(lessons.value, (lesson) => {
                                        return openBlock(), createBlock("option", {
                                          key: lesson.id,
                                          value: lesson.id
                                        }, toDisplayString(lesson.title), 9, ["value"]);
                                      }), 128)),
                                      !isLoadingLessons.value && lessons.value.length === 0 && selectedCourseForLesson.value ? (openBlock(), createBlock("option", {
                                        key: 0,
                                        disabled: ""
                                      }, "-- لا توجد دروس لهذه الدورة --")) : createCommentVNode("", true),
                                      !selectedCourseForLesson.value ? (openBlock(), createBlock("option", {
                                        key: 1,
                                        disabled: ""
                                      }, "-- اختر دورة أولاً --")) : createCommentVNode("", true)
                                    ], 8, ["onUpdate:modelValue", "disabled"])), [
                                      [vModelSelect, form.value.lesson_id]
                                    ])
                                  ])) : createCommentVNode("", true),
                                  form.value.type === "module" ? (openBlock(), createBlock("div", { key: 3 }, [
                                    createVNode("label", {
                                      for: "quiz-module",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "رقم الوحدة *"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "quiz-module",
                                      "onUpdate:modelValue": ($event) => form.value.module_number = $event,
                                      required: "",
                                      min: "1",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.module_number,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ])) : createCommentVNode("", true),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "quiz-pass-mark",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "درجة النجاح (%) *"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "quiz-pass-mark",
                                      "onUpdate:modelValue": ($event) => form.value.pass_mark_percentage = $event,
                                      required: "",
                                      min: "0",
                                      max: "100",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.pass_mark_percentage,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "quiz-max-attempts",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "أقصى عدد محاولات"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "quiz-max-attempts",
                                      "onUpdate:modelValue": ($event) => form.value.max_attempts = $event,
                                      min: "1",
                                      placeholder: "غير محدود",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.max_attempts,
                                        void 0,
                                        { number: true }
                                      ]
                                    ]),
                                    createVNode("p", { class: "mt-1 text-xs text-gray-500 dark:text-gray-400" }, "اتركه فارغًا لمحاولات غير محدودة.")
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "quiz-time-limit",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الوقت المحدد (بالدقائق)"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "quiz-time-limit",
                                      "onUpdate:modelValue": ($event) => form.value.time_limit_minutes = $event,
                                      min: "1",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.time_limit_minutes,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "quiz-due-date",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "تاريخ الاستحقاق (اختياري)"),
                                    withDirectives(createVNode("input", {
                                      type: "datetime-local",
                                      id: "quiz-due-date",
                                      "onUpdate:modelValue": ($event) => form.value.due_date = $event,
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.due_date]
                                    ])
                                  ]),
                                  createVNode("div", { class: "sm:col-span-2" }, [
                                    createVNode("div", { class: "flex items-center" }, [
                                      withDirectives(createVNode("input", {
                                        id: "quiz-is-active",
                                        type: "checkbox",
                                        "onUpdate:modelValue": ($event) => form.value.is_active = $event,
                                        class: "h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelCheckbox, form.value.is_active]
                                      ]),
                                      createVNode("label", {
                                        for: "quiz-is-active",
                                        class: "ml-2 block text-sm text-gray-900 dark:text-gray-300"
                                      }, "الاختبار نشط ومتاح للطلاب؟")
                                    ])
                                  ])
                                ]),
                                formError.value ? (openBlock(), createBlock("p", {
                                  key: 0,
                                  class: "mt-4 text-sm text-red-600 dark:text-red-400"
                                }, toDisplayString(formError.value), 1)) : createCommentVNode("", true),
                                createVNode("div", { class: "mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5" }, [
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isSaving.value,
                                    class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                  }, [
                                    isSaving.value ? (openBlock(), createBlock(LoadingSpinner, {
                                      key: 0,
                                      class: "w-5 h-5 text-white -ml-1 mr-2"
                                    })) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إنشاء الاختبار"), 1)
                                  ], 8, ["disabled"]),
                                  createVNode("button", {
                                    type: "button",
                                    class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                    onClick: closeModal,
                                    disabled: isSaving.value
                                  }, " إلغاء ", 8, ["disabled"])
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
                      as: "template",
                      enter: "duration-300 ease-out",
                      "enter-from": "opacity-0",
                      "enter-to": "opacity-100",
                      leave: "duration-200 ease-in",
                      "leave-from": "opacity-100",
                      "leave-to": "opacity-0"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", {
                          class: "fixed inset-0 bg-black/40 backdrop-blur-sm",
                          "aria-hidden": "true"
                        })
                      ]),
                      _: 1
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
                            createVNode(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                              default: withCtx(() => [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(isEditing.value ? "تعديل الاختبار" : "إنشاء اختبار جديد"), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(saveQuiz, ["prevent"])
                                }, [
                                  createVNode("div", { class: "mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2" }, [
                                    createVNode("div", { class: "sm:col-span-2" }, [
                                      createVNode("label", {
                                        for: "quiz-title",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "عنوان الاختبار *"),
                                      withDirectives(createVNode("input", {
                                        type: "text",
                                        id: "quiz-title",
                                        "onUpdate:modelValue": ($event) => form.value.title = $event,
                                        required: "",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelText, form.value.title]
                                      ])
                                    ]),
                                    createVNode("div", { class: "sm:col-span-2" }, [
                                      createVNode("label", {
                                        for: "quiz-description",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "الوصف (اختياري)"),
                                      withDirectives(createVNode("textarea", {
                                        id: "quiz-description",
                                        "onUpdate:modelValue": ($event) => form.value.description = $event,
                                        rows: "3",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelText, form.value.description]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "quiz-type",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "نوع الاختبار *"),
                                      withDirectives(createVNode("select", {
                                        id: "quiz-type",
                                        "onUpdate:modelValue": ($event) => form.value.type = $event,
                                        required: "",
                                        onChange: handleTypeChange,
                                        class: "mt-1 block w-full input-field"
                                      }, [
                                        createVNode("option", {
                                          value: null,
                                          disabled: ""
                                        }, "-- اختر النوع --"),
                                        createVNode("option", { value: "lesson" }, "اختبار درس"),
                                        createVNode("option", { value: "module" }, "اختبار وحدة"),
                                        createVNode("option", { value: "final" }, "اختبار نهائي")
                                      ], 40, ["onUpdate:modelValue"]), [
                                        [vModelSelect, form.value.type]
                                      ])
                                    ]),
                                    form.value.type === "module" || form.value.type === "final" ? (openBlock(), createBlock("div", { key: 0 }, [
                                      createVNode("label", {
                                        for: "quiz-course",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "الدورة الدراسية *"),
                                      isLoadingCourses.value ? (openBlock(), createBlock("div", {
                                        key: 0,
                                        class: "mt-1 text-sm text-gray-500"
                                      }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                        key: 1,
                                        id: "quiz-course",
                                        "onUpdate:modelValue": ($event) => form.value.course_id = $event,
                                        required: "",
                                        onChange: handleCourseChange,
                                        class: "mt-1 block w-full input-field"
                                      }, [
                                        createVNode("option", {
                                          value: null,
                                          disabled: ""
                                        }, "-- اختر الدورة --"),
                                        (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                          return openBlock(), createBlock("option", {
                                            key: course.id,
                                            value: course.id
                                          }, toDisplayString(course.title), 9, ["value"]);
                                        }), 128)),
                                        !isLoadingCourses.value && courses.value.length === 0 ? (openBlock(), createBlock("option", {
                                          key: 0,
                                          disabled: ""
                                        }, "-- لا توجد دورات --")) : createCommentVNode("", true)
                                      ], 40, ["onUpdate:modelValue"])), [
                                        [vModelSelect, form.value.course_id]
                                      ])
                                    ])) : createCommentVNode("", true),
                                    form.value.type === "lesson" ? (openBlock(), createBlock("div", { key: 1 }, [
                                      createVNode("label", {
                                        for: "quiz-lesson-course",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "الدورة (لتحديد الدرس) *"),
                                      isLoadingCourses.value ? (openBlock(), createBlock("div", {
                                        key: 0,
                                        class: "mt-1 text-sm text-gray-500"
                                      }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                        key: 1,
                                        id: "quiz-lesson-course",
                                        "onUpdate:modelValue": ($event) => selectedCourseForLesson.value = $event,
                                        required: "",
                                        onChange: fetchLessonsForCourse,
                                        class: "mt-1 block w-full input-field"
                                      }, [
                                        createVNode("option", {
                                          value: null,
                                          disabled: ""
                                        }, "-- اختر دورة لعرض دروسها --"),
                                        (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                          return openBlock(), createBlock("option", {
                                            key: course.id,
                                            value: course.id
                                          }, toDisplayString(course.title), 9, ["value"]);
                                        }), 128))
                                      ], 40, ["onUpdate:modelValue"])), [
                                        [vModelSelect, selectedCourseForLesson.value]
                                      ])
                                    ])) : createCommentVNode("", true),
                                    form.value.type === "lesson" ? (openBlock(), createBlock("div", { key: 2 }, [
                                      createVNode("label", {
                                        for: "quiz-lesson",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "الدرس *"),
                                      isLoadingLessons.value ? (openBlock(), createBlock("div", {
                                        key: 0,
                                        class: "mt-1 text-sm text-gray-500"
                                      }, "جار تحميل الدروس...")) : withDirectives((openBlock(), createBlock("select", {
                                        key: 1,
                                        id: "quiz-lesson",
                                        "onUpdate:modelValue": ($event) => form.value.lesson_id = $event,
                                        required: "",
                                        disabled: !selectedCourseForLesson.value || lessons.value.length === 0,
                                        class: "mt-1 block w-full input-field"
                                      }, [
                                        createVNode("option", {
                                          value: null,
                                          disabled: ""
                                        }, "-- اختر الدرس --"),
                                        (openBlock(true), createBlock(Fragment, null, renderList(lessons.value, (lesson) => {
                                          return openBlock(), createBlock("option", {
                                            key: lesson.id,
                                            value: lesson.id
                                          }, toDisplayString(lesson.title), 9, ["value"]);
                                        }), 128)),
                                        !isLoadingLessons.value && lessons.value.length === 0 && selectedCourseForLesson.value ? (openBlock(), createBlock("option", {
                                          key: 0,
                                          disabled: ""
                                        }, "-- لا توجد دروس لهذه الدورة --")) : createCommentVNode("", true),
                                        !selectedCourseForLesson.value ? (openBlock(), createBlock("option", {
                                          key: 1,
                                          disabled: ""
                                        }, "-- اختر دورة أولاً --")) : createCommentVNode("", true)
                                      ], 8, ["onUpdate:modelValue", "disabled"])), [
                                        [vModelSelect, form.value.lesson_id]
                                      ])
                                    ])) : createCommentVNode("", true),
                                    form.value.type === "module" ? (openBlock(), createBlock("div", { key: 3 }, [
                                      createVNode("label", {
                                        for: "quiz-module",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "رقم الوحدة *"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "quiz-module",
                                        "onUpdate:modelValue": ($event) => form.value.module_number = $event,
                                        required: "",
                                        min: "1",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.module_number,
                                          void 0,
                                          { number: true }
                                        ]
                                      ])
                                    ])) : createCommentVNode("", true),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "quiz-pass-mark",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "درجة النجاح (%) *"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "quiz-pass-mark",
                                        "onUpdate:modelValue": ($event) => form.value.pass_mark_percentage = $event,
                                        required: "",
                                        min: "0",
                                        max: "100",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.pass_mark_percentage,
                                          void 0,
                                          { number: true }
                                        ]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "quiz-max-attempts",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "أقصى عدد محاولات"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "quiz-max-attempts",
                                        "onUpdate:modelValue": ($event) => form.value.max_attempts = $event,
                                        min: "1",
                                        placeholder: "غير محدود",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.max_attempts,
                                          void 0,
                                          { number: true }
                                        ]
                                      ]),
                                      createVNode("p", { class: "mt-1 text-xs text-gray-500 dark:text-gray-400" }, "اتركه فارغًا لمحاولات غير محدودة.")
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "quiz-time-limit",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "الوقت المحدد (بالدقائق)"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "quiz-time-limit",
                                        "onUpdate:modelValue": ($event) => form.value.time_limit_minutes = $event,
                                        min: "1",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.time_limit_minutes,
                                          void 0,
                                          { number: true }
                                        ]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "quiz-due-date",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "تاريخ الاستحقاق (اختياري)"),
                                      withDirectives(createVNode("input", {
                                        type: "datetime-local",
                                        id: "quiz-due-date",
                                        "onUpdate:modelValue": ($event) => form.value.due_date = $event,
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelText, form.value.due_date]
                                      ])
                                    ]),
                                    createVNode("div", { class: "sm:col-span-2" }, [
                                      createVNode("div", { class: "flex items-center" }, [
                                        withDirectives(createVNode("input", {
                                          id: "quiz-is-active",
                                          type: "checkbox",
                                          "onUpdate:modelValue": ($event) => form.value.is_active = $event,
                                          class: "h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                        }, null, 8, ["onUpdate:modelValue"]), [
                                          [vModelCheckbox, form.value.is_active]
                                        ]),
                                        createVNode("label", {
                                          for: "quiz-is-active",
                                          class: "ml-2 block text-sm text-gray-900 dark:text-gray-300"
                                        }, "الاختبار نشط ومتاح للطلاب؟")
                                      ])
                                    ])
                                  ]),
                                  formError.value ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "mt-4 text-sm text-red-600 dark:text-red-400"
                                  }, toDisplayString(formError.value), 1)) : createCommentVNode("", true),
                                  createVNode("div", { class: "mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5" }, [
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isSaving.value,
                                      class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                    }, [
                                      isSaving.value ? (openBlock(), createBlock(LoadingSpinner, {
                                        key: 0,
                                        class: "w-5 h-5 text-white -ml-1 mr-2"
                                      })) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إنشاء الاختبار"), 1)
                                    ], 8, ["disabled"]),
                                    createVNode("button", {
                                      type: "button",
                                      class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                      onClick: closeModal,
                                      disabled: isSaving.value
                                    }, " إلغاء ", 8, ["disabled"])
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
                class: "relative z-40"
              }, {
                default: withCtx(() => [
                  createVNode(unref(TransitionChild), {
                    as: "template",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", {
                        class: "fixed inset-0 bg-black/40 backdrop-blur-sm",
                        "aria-hidden": "true"
                      })
                    ]),
                    _: 1
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
                          createVNode(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(isEditing.value ? "تعديل الاختبار" : "إنشاء اختبار جديد"), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(saveQuiz, ["prevent"])
                              }, [
                                createVNode("div", { class: "mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2" }, [
                                  createVNode("div", { class: "sm:col-span-2" }, [
                                    createVNode("label", {
                                      for: "quiz-title",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "عنوان الاختبار *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "quiz-title",
                                      "onUpdate:modelValue": ($event) => form.value.title = $event,
                                      required: "",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.title]
                                    ])
                                  ]),
                                  createVNode("div", { class: "sm:col-span-2" }, [
                                    createVNode("label", {
                                      for: "quiz-description",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الوصف (اختياري)"),
                                    withDirectives(createVNode("textarea", {
                                      id: "quiz-description",
                                      "onUpdate:modelValue": ($event) => form.value.description = $event,
                                      rows: "3",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.description]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "quiz-type",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "نوع الاختبار *"),
                                    withDirectives(createVNode("select", {
                                      id: "quiz-type",
                                      "onUpdate:modelValue": ($event) => form.value.type = $event,
                                      required: "",
                                      onChange: handleTypeChange,
                                      class: "mt-1 block w-full input-field"
                                    }, [
                                      createVNode("option", {
                                        value: null,
                                        disabled: ""
                                      }, "-- اختر النوع --"),
                                      createVNode("option", { value: "lesson" }, "اختبار درس"),
                                      createVNode("option", { value: "module" }, "اختبار وحدة"),
                                      createVNode("option", { value: "final" }, "اختبار نهائي")
                                    ], 40, ["onUpdate:modelValue"]), [
                                      [vModelSelect, form.value.type]
                                    ])
                                  ]),
                                  form.value.type === "module" || form.value.type === "final" ? (openBlock(), createBlock("div", { key: 0 }, [
                                    createVNode("label", {
                                      for: "quiz-course",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الدورة الدراسية *"),
                                    isLoadingCourses.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "mt-1 text-sm text-gray-500"
                                    }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                      key: 1,
                                      id: "quiz-course",
                                      "onUpdate:modelValue": ($event) => form.value.course_id = $event,
                                      required: "",
                                      onChange: handleCourseChange,
                                      class: "mt-1 block w-full input-field"
                                    }, [
                                      createVNode("option", {
                                        value: null,
                                        disabled: ""
                                      }, "-- اختر الدورة --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                        return openBlock(), createBlock("option", {
                                          key: course.id,
                                          value: course.id
                                        }, toDisplayString(course.title), 9, ["value"]);
                                      }), 128)),
                                      !isLoadingCourses.value && courses.value.length === 0 ? (openBlock(), createBlock("option", {
                                        key: 0,
                                        disabled: ""
                                      }, "-- لا توجد دورات --")) : createCommentVNode("", true)
                                    ], 40, ["onUpdate:modelValue"])), [
                                      [vModelSelect, form.value.course_id]
                                    ])
                                  ])) : createCommentVNode("", true),
                                  form.value.type === "lesson" ? (openBlock(), createBlock("div", { key: 1 }, [
                                    createVNode("label", {
                                      for: "quiz-lesson-course",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الدورة (لتحديد الدرس) *"),
                                    isLoadingCourses.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "mt-1 text-sm text-gray-500"
                                    }, "جار تحميل الدورات...")) : withDirectives((openBlock(), createBlock("select", {
                                      key: 1,
                                      id: "quiz-lesson-course",
                                      "onUpdate:modelValue": ($event) => selectedCourseForLesson.value = $event,
                                      required: "",
                                      onChange: fetchLessonsForCourse,
                                      class: "mt-1 block w-full input-field"
                                    }, [
                                      createVNode("option", {
                                        value: null,
                                        disabled: ""
                                      }, "-- اختر دورة لعرض دروسها --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(courses.value, (course) => {
                                        return openBlock(), createBlock("option", {
                                          key: course.id,
                                          value: course.id
                                        }, toDisplayString(course.title), 9, ["value"]);
                                      }), 128))
                                    ], 40, ["onUpdate:modelValue"])), [
                                      [vModelSelect, selectedCourseForLesson.value]
                                    ])
                                  ])) : createCommentVNode("", true),
                                  form.value.type === "lesson" ? (openBlock(), createBlock("div", { key: 2 }, [
                                    createVNode("label", {
                                      for: "quiz-lesson",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الدرس *"),
                                    isLoadingLessons.value ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "mt-1 text-sm text-gray-500"
                                    }, "جار تحميل الدروس...")) : withDirectives((openBlock(), createBlock("select", {
                                      key: 1,
                                      id: "quiz-lesson",
                                      "onUpdate:modelValue": ($event) => form.value.lesson_id = $event,
                                      required: "",
                                      disabled: !selectedCourseForLesson.value || lessons.value.length === 0,
                                      class: "mt-1 block w-full input-field"
                                    }, [
                                      createVNode("option", {
                                        value: null,
                                        disabled: ""
                                      }, "-- اختر الدرس --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(lessons.value, (lesson) => {
                                        return openBlock(), createBlock("option", {
                                          key: lesson.id,
                                          value: lesson.id
                                        }, toDisplayString(lesson.title), 9, ["value"]);
                                      }), 128)),
                                      !isLoadingLessons.value && lessons.value.length === 0 && selectedCourseForLesson.value ? (openBlock(), createBlock("option", {
                                        key: 0,
                                        disabled: ""
                                      }, "-- لا توجد دروس لهذه الدورة --")) : createCommentVNode("", true),
                                      !selectedCourseForLesson.value ? (openBlock(), createBlock("option", {
                                        key: 1,
                                        disabled: ""
                                      }, "-- اختر دورة أولاً --")) : createCommentVNode("", true)
                                    ], 8, ["onUpdate:modelValue", "disabled"])), [
                                      [vModelSelect, form.value.lesson_id]
                                    ])
                                  ])) : createCommentVNode("", true),
                                  form.value.type === "module" ? (openBlock(), createBlock("div", { key: 3 }, [
                                    createVNode("label", {
                                      for: "quiz-module",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "رقم الوحدة *"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "quiz-module",
                                      "onUpdate:modelValue": ($event) => form.value.module_number = $event,
                                      required: "",
                                      min: "1",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.module_number,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ])) : createCommentVNode("", true),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "quiz-pass-mark",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "درجة النجاح (%) *"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "quiz-pass-mark",
                                      "onUpdate:modelValue": ($event) => form.value.pass_mark_percentage = $event,
                                      required: "",
                                      min: "0",
                                      max: "100",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.pass_mark_percentage,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "quiz-max-attempts",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "أقصى عدد محاولات"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "quiz-max-attempts",
                                      "onUpdate:modelValue": ($event) => form.value.max_attempts = $event,
                                      min: "1",
                                      placeholder: "غير محدود",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.max_attempts,
                                        void 0,
                                        { number: true }
                                      ]
                                    ]),
                                    createVNode("p", { class: "mt-1 text-xs text-gray-500 dark:text-gray-400" }, "اتركه فارغًا لمحاولات غير محدودة.")
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "quiz-time-limit",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الوقت المحدد (بالدقائق)"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "quiz-time-limit",
                                      "onUpdate:modelValue": ($event) => form.value.time_limit_minutes = $event,
                                      min: "1",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.time_limit_minutes,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "quiz-due-date",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "تاريخ الاستحقاق (اختياري)"),
                                    withDirectives(createVNode("input", {
                                      type: "datetime-local",
                                      id: "quiz-due-date",
                                      "onUpdate:modelValue": ($event) => form.value.due_date = $event,
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.due_date]
                                    ])
                                  ]),
                                  createVNode("div", { class: "sm:col-span-2" }, [
                                    createVNode("div", { class: "flex items-center" }, [
                                      withDirectives(createVNode("input", {
                                        id: "quiz-is-active",
                                        type: "checkbox",
                                        "onUpdate:modelValue": ($event) => form.value.is_active = $event,
                                        class: "h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelCheckbox, form.value.is_active]
                                      ]),
                                      createVNode("label", {
                                        for: "quiz-is-active",
                                        class: "ml-2 block text-sm text-gray-900 dark:text-gray-300"
                                      }, "الاختبار نشط ومتاح للطلاب؟")
                                    ])
                                  ])
                                ]),
                                formError.value ? (openBlock(), createBlock("p", {
                                  key: 0,
                                  class: "mt-4 text-sm text-red-600 dark:text-red-400"
                                }, toDisplayString(formError.value), 1)) : createCommentVNode("", true),
                                createVNode("div", { class: "mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5" }, [
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isSaving.value,
                                    class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                  }, [
                                    isSaving.value ? (openBlock(), createBlock(LoadingSpinner, {
                                      key: 0,
                                      class: "w-5 h-5 text-white -ml-1 mr-2"
                                    })) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إنشاء الاختبار"), 1)
                                  ], 8, ["disabled"]),
                                  createVNode("button", {
                                    type: "button",
                                    class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                    onClick: closeModal,
                                    disabled: isSaving.value
                                  }, " إلغاء ", 8, ["disabled"])
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
//# sourceMappingURL=QuizCreateEditModal.vue2.mjs.map
