import { defineComponent, ref, computed, watch, unref, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, withModifiers, createBlock, createCommentVNode, withDirectives, vModelText, vModelSelect, openBlock, Fragment, renderList } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from "vue/server-renderer";
import { TransitionRoot, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/vue";
import LoadingSpinner from "../LoadingSpinner.vue.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useNuxtApp } from "../../node_modules/nuxt/dist/app/nuxt.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AddEditQuestionModal",
  __ssrInlineRender: true,
  props: {
    modelValue: { type: Boolean, default: false },
    quizId: { type: Number, required: true },
    questionData: { type: Object, default: null }
  },
  emits: ["update:modelValue", "saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const supabase = useSupabaseClient();
    const { $toast } = useNuxtApp();
    const isOpen = ref(props.modelValue);
    const isSaving = ref(false);
    const formError = ref(null);
    const form = ref({});
    const mcqOptions = ref([]);
    const isTrueFalseCorrect = ref(null);
    const isEditing = computed(() => {
      var _a;
      return !!((_a = props.questionData) == null ? void 0 : _a.id);
    });
    let nextOptionTempId = Date.now();
    const initializeForm = () => {
      formError.value = null;
      isSaving.value = false;
      mcqOptions.value = [];
      isTrueFalseCorrect.value = null;
      nextOptionTempId = Date.now();
      if (isEditing.value && props.questionData) {
        form.value = { ...props.questionData };
        if (form.value.type === "mcq" && props.questionData.question_options) {
          mcqOptions.value = props.questionData.question_options.map((opt, index) => ({ tempId: nextOptionTempId + index, id: opt.id, option_text: opt.option_text, is_correct: opt.is_correct }));
          nextOptionTempId += props.questionData.question_options.length;
        } else if (form.value.type === "true_false" && props.questionData.question_options) {
          const correctOption = props.questionData.question_options.find((opt) => opt.is_correct);
          isTrueFalseCorrect.value = (correctOption == null ? void 0 : correctOption.option_text.toLowerCase()) === "true";
        }
      } else {
        form.value = { question_text: "", type: "mcq", points: 1, question_order: null, quiz_id: props.quizId };
        addMcqOption();
        addMcqOption();
      }
      resetOptionsBasedOnType();
    };
    watch(() => props.modelValue, (newVal) => {
      isOpen.value = newVal;
      if (newVal) initializeForm();
    });
    const addMcqOption = () => {
      if (form.value.type !== "mcq") return;
      mcqOptions.value.push({ tempId: nextOptionTempId++, option_text: "", is_correct: false });
    };
    const removeMcqOption = (tempIdToRemove) => {
      if (form.value.type !== "mcq" || mcqOptions.value.length <= 2) return;
      const indexToRemove = mcqOptions.value.findIndex((opt) => opt.tempId === tempIdToRemove);
      if (indexToRemove !== -1) {
        const wasCorrect = mcqOptions.value[indexToRemove].is_correct;
        mcqOptions.value.splice(indexToRemove, 1);
        if (wasCorrect && mcqOptions.value.length > 0 && !mcqOptions.value.some((opt) => opt.is_correct)) {
          mcqOptions.value[0].is_correct = true;
        }
      }
    };
    const setCorrectMcqOption = (correctTempId) => {
      if (form.value.type !== "mcq") return;
      mcqOptions.value = mcqOptions.value.map((opt) => ({ ...opt, is_correct: opt.tempId === correctTempId }));
    };
    const setTrueFalseCorrect = (isCorrect) => {
      isTrueFalseCorrect.value = isCorrect;
    };
    const resetOptionsBasedOnType = () => {
      if (form.value.type === "mcq") {
        if (mcqOptions.value.length < 2) {
          mcqOptions.value = [];
          addMcqOption();
          addMcqOption();
        }
        if (mcqOptions.value.length > 0 && !mcqOptions.value.some((opt) => opt.is_correct)) mcqOptions.value[0].is_correct = true;
        isTrueFalseCorrect.value = null;
      } else if (form.value.type === "true_false") {
        mcqOptions.value = [];
        if (isTrueFalseCorrect.value === null) isTrueFalseCorrect.value = true;
      } else {
        mcqOptions.value = [];
        isTrueFalseCorrect.value = null;
      }
    };
    const isFormValid = computed(() => {
      var _a;
      if (!((_a = form.value.question_text) == null ? void 0 : _a.trim()) || !form.value.type) return false;
      if (form.value.points === null || form.value.points === void 0 || form.value.points < 0) return false;
      if (form.value.type === "mcq" && (mcqOptions.value.length < 2 || !mcqOptions.value.some((opt) => opt.is_correct) || mcqOptions.value.some((opt) => !opt.option_text.trim()))) return false;
      if (form.value.type === "true_false" && isTrueFalseCorrect.value === null) return false;
      return true;
    });
    const saveQuestion = async () => {
      if (!isFormValid.value || isSaving.value) return;
      isSaving.value = true;
      formError.value = null;
      const questionPayload = { quiz_id: props.quizId, question_text: form.value.question_text, type: form.value.type, question_order: form.value.question_order || null, points: form.value.points ?? 1 };
      let optionsPayload = [];
      if (form.value.type === "mcq") optionsPayload = mcqOptions.value.map((opt) => ({ option_text: opt.option_text, is_correct: opt.is_correct, option_order: null }));
      else if (form.value.type === "true_false") optionsPayload = [{ option_text: "True", is_correct: isTrueFalseCorrect.value === true, option_order: 1 }, { option_text: "False", is_correct: isTrueFalseCorrect.value === false, option_order: 2 }];
      try {
        let savedQuestionId = null;
        if (isEditing.value && form.value.id) {
          const { error: updateQError } = await supabase.from("quiz_questions").update({ ...questionPayload, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", form.value.id);
          if (updateQError) throw updateQError;
          savedQuestionId = form.value.id;
          const { error: deleteOptError } = await supabase.from("question_options").delete().eq("question_id", form.value.id);
          if (deleteOptError) throw deleteOptError;
        } else {
          const { data: newQ, error: insertQError } = await supabase.from("quiz_questions").insert(questionPayload).select("id").single();
          if (insertQError) throw insertQError;
          if (!(newQ == null ? void 0 : newQ.id)) throw new Error("Failed to get inserted question ID.");
          savedQuestionId = newQ.id;
        }
        if (optionsPayload.length > 0 && savedQuestionId) {
          const optionsToInsert = optionsPayload.map((opt) => ({ ...opt, question_id: savedQuestionId }));
          const { error: insertOptError } = await supabase.from("question_options").insert(optionsToInsert);
          if (insertOptError) throw insertOptError;
        }
        const { data: finalQuestionData, error: finalQError } = await supabase.from("quiz_questions").select(`*, question_options (*)`).eq("id", savedQuestionId).single();
        if (finalQError) throw finalQError;
        if (!finalQuestionData) throw new Error("Failed to fetch final saved question data.");
        emit("saved", finalQuestionData);
        closeModal();
      } catch (err) {
        console.error("Error saving question:", err);
        formError.value = `فشل حفظ السؤال: (${err.message || "خطأ غير معروف"})`;
      } finally {
        isSaving.value = false;
      }
    };
    function closeModal() {
      if (isSaving.value) return;
      isOpen.value = false;
      emit("update:modelValue", false);
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
              class: "relative z-50"
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
                        _push4(`<div class="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" data-v-a8a85b8d${_scopeId3}></div>`);
                      } else {
                        return [
                          createVNode("div", {
                            class: "fixed inset-0 bg-black/50 backdrop-blur-sm",
                            "aria-hidden": "true"
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="fixed inset-0 overflow-y-auto" data-v-a8a85b8d${_scopeId2}><div class="flex min-h-full items-center justify-center p-4 text-center" data-v-a8a85b8d${_scopeId2}>`);
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
                        _push4(ssrRenderComponent(unref(DialogPanel), { class: "w-full max-w-3xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(isEditing.value ? "تعديل السؤال" : "إضافة سؤال جديد")} للاختبار `);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(isEditing.value ? "تعديل السؤال" : "إضافة سؤال جديد") + " للاختبار ", 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<form class="space-y-6" data-v-a8a85b8d${_scopeId4}><div data-v-a8a85b8d${_scopeId4}><label for="question-text" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-a8a85b8d${_scopeId4}>نص السؤال *</label><textarea id="question-text" required rows="4" class="mt-1 block w-full input-field" data-v-a8a85b8d${_scopeId4}>${ssrInterpolate(form.value.question_text)}</textarea></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4" data-v-a8a85b8d${_scopeId4}><div data-v-a8a85b8d${_scopeId4}><label for="question-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-a8a85b8d${_scopeId4}>نوع السؤال *</label><select id="question-type" required class="mt-1 block w-full input-field" data-v-a8a85b8d${_scopeId4}><option value="mcq" data-v-a8a85b8d${ssrIncludeBooleanAttr(Array.isArray(form.value.type) ? ssrLooseContain(form.value.type, "mcq") : ssrLooseEqual(form.value.type, "mcq")) ? " selected" : ""}${_scopeId4}>اختيار من متعدد (MCQ)</option><option value="true_false" data-v-a8a85b8d${ssrIncludeBooleanAttr(Array.isArray(form.value.type) ? ssrLooseContain(form.value.type, "true_false") : ssrLooseEqual(form.value.type, "true_false")) ? " selected" : ""}${_scopeId4}>صح / خطأ (T/F)</option><option value="written" data-v-a8a85b8d${ssrIncludeBooleanAttr(Array.isArray(form.value.type) ? ssrLooseContain(form.value.type, "written") : ssrLooseEqual(form.value.type, "written")) ? " selected" : ""}${_scopeId4}>كتابي (Written)</option></select></div><div data-v-a8a85b8d${_scopeId4}><label for="question-points" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-a8a85b8d${_scopeId4}>النقاط *</label><input type="number" id="question-points"${ssrRenderAttr("value", form.value.points)} required min="0" class="mt-1 block w-full input-field" data-v-a8a85b8d${_scopeId4}></div><div data-v-a8a85b8d${_scopeId4}><label for="question-order" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-a8a85b8d${_scopeId4}>ترتيب السؤال</label><input type="number" id="question-order"${ssrRenderAttr("value", form.value.question_order)} min="1" placeholder="اختياري" class="mt-1 block w-full input-field" data-v-a8a85b8d${_scopeId4}></div></div>`);
                              if (form.value.type === "mcq" || form.value.type === "true_false") {
                                _push5(`<div class="space-y-4 pt-4 border-t dark:border-gray-700" data-v-a8a85b8d${_scopeId4}><h4 class="text-md font-medium text-gray-800 dark:text-gray-200" data-v-a8a85b8d${_scopeId4}>${ssrInterpolate(form.value.type === "mcq" ? "خيارات الإجابة (MCQ)" : "تحديد الإجابة الصحيحة (صح/خطأ)")} <span class="text-red-600" data-v-a8a85b8d${_scopeId4}>*</span></h4>`);
                                if (form.value.type === "mcq") {
                                  _push5(`<div class="space-y-3" data-v-a8a85b8d${_scopeId4}><!--[-->`);
                                  ssrRenderList(mcqOptions.value, (option, index) => {
                                    _push5(`<div class="flex items-center gap-2 p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50" data-v-a8a85b8d${_scopeId4}><input${ssrRenderAttr("id", "mcq-correct-" + option.tempId)} type="radio" name="correct_mcq_option"${ssrRenderAttr("value", option.tempId)}${ssrIncludeBooleanAttr(option.is_correct) ? " checked" : ""} class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 flex-shrink-0" title="تحديد كإجابة صحيحة" data-v-a8a85b8d${_scopeId4}><input${ssrRenderAttr("id", "mcq-option-" + option.tempId)} type="text"${ssrRenderAttr("value", option.option_text)} required${ssrRenderAttr("placeholder", `نص الخيار ${index + 1}`)} class="flex-grow input-field input-sm" data-v-a8a85b8d${_scopeId4}><button type="button"${ssrIncludeBooleanAttr(mcqOptions.value.length <= 2) ? " disabled" : ""} class="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:text-red-400 flex-shrink-0" title="حذف الخيار" data-v-a8a85b8d${_scopeId4}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-a8a85b8d${_scopeId4}><path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.5-.75v.75h1V2.5h-1Z" clip-rule="evenodd" data-v-a8a85b8d${_scopeId4}></path></svg></button></div>`);
                                  });
                                  _push5(`<!--]--><button type="button" class="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1" data-v-a8a85b8d${_scopeId4}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-a8a85b8d${_scopeId4}><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z" clip-rule="evenodd" data-v-a8a85b8d${_scopeId4}></path></svg><span data-v-a8a85b8d${_scopeId4}>إضافة خيار آخر</span></button></div>`);
                                } else {
                                  _push5(`<!---->`);
                                }
                                if (form.value.type === "true_false") {
                                  _push5(`<div class="flex items-center space-x-6 rtl:space-x-reverse" data-v-a8a85b8d${_scopeId4}><span class="text-sm font-medium text-gray-700 dark:text-gray-300" data-v-a8a85b8d${_scopeId4}>الإجابة الصحيحة هي:</span><div class="flex items-center gap-4" data-v-a8a85b8d${_scopeId4}><label class="flex items-center gap-1 cursor-pointer" data-v-a8a85b8d${_scopeId4}><input type="radio" name="tf_correct"${ssrRenderAttr("value", true)}${ssrIncludeBooleanAttr(isTrueFalseCorrect.value === true) ? " checked" : ""} class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500" data-v-a8a85b8d${_scopeId4}><span class="text-sm text-green-700 dark:text-green-300 font-medium" data-v-a8a85b8d${_scopeId4}>صحيح</span></label><label class="flex items-center gap-1 cursor-pointer" data-v-a8a85b8d${_scopeId4}><input type="radio" name="tf_correct"${ssrRenderAttr("value", false)}${ssrIncludeBooleanAttr(isTrueFalseCorrect.value === false) ? " checked" : ""} class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500" data-v-a8a85b8d${_scopeId4}><span class="text-sm text-red-700 dark:text-red-300 font-medium" data-v-a8a85b8d${_scopeId4}>خطأ</span></label></div></div>`);
                                } else {
                                  _push5(`<!---->`);
                                }
                                _push5(`</div>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              if (form.value.type === "written") {
                                _push5(`<div data-v-a8a85b8d${_scopeId4}><p class="text-sm text-gray-600 dark:text-gray-400 italic" data-v-a8a85b8d${_scopeId4}>سيتم تصحيح إجابات الأسئلة الكتابية يدويًا.</p></div>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              if (formError.value) {
                                _push5(`<p class="mt-4 text-sm text-red-600 dark:text-red-400" data-v-a8a85b8d${_scopeId4}>${ssrInterpolate(formError.value)}</p>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`<div class="mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5" data-v-a8a85b8d${_scopeId4}><button type="submit"${ssrIncludeBooleanAttr(isSaving.value || !isFormValid.value) ? " disabled" : ""} class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50" data-v-a8a85b8d${_scopeId4}>`);
                              if (isSaving.value) {
                                _push5(ssrRenderComponent(LoadingSpinner, { class: "w-5 h-5 text-white -ml-1 mr-2" }, null, _parent5, _scopeId4));
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(` ${ssrInterpolate(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة السؤال")}</button><button type="button" class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"${ssrIncludeBooleanAttr(isSaving.value) ? " disabled" : ""} data-v-a8a85b8d${_scopeId4}> إلغاء </button></div></form>`);
                            } else {
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(isEditing.value ? "تعديل السؤال" : "إضافة سؤال جديد") + " للاختبار ", 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(saveQuestion, ["prevent"]),
                                  class: "space-y-6"
                                }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "question-text",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "نص السؤال *"),
                                    withDirectives(createVNode("textarea", {
                                      id: "question-text",
                                      "onUpdate:modelValue": ($event) => form.value.question_text = $event,
                                      required: "",
                                      rows: "4",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.question_text]
                                    ])
                                  ]),
                                  createVNode("div", { class: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, [
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "question-type",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "نوع السؤال *"),
                                      withDirectives(createVNode("select", {
                                        id: "question-type",
                                        "onUpdate:modelValue": ($event) => form.value.type = $event,
                                        required: "",
                                        onChange: resetOptionsBasedOnType,
                                        class: "mt-1 block w-full input-field"
                                      }, [
                                        createVNode("option", { value: "mcq" }, "اختيار من متعدد (MCQ)"),
                                        createVNode("option", { value: "true_false" }, "صح / خطأ (T/F)"),
                                        createVNode("option", { value: "written" }, "كتابي (Written)")
                                      ], 40, ["onUpdate:modelValue"]), [
                                        [vModelSelect, form.value.type]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "question-points",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "النقاط *"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "question-points",
                                        "onUpdate:modelValue": ($event) => form.value.points = $event,
                                        required: "",
                                        min: "0",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.points,
                                          void 0,
                                          { number: true }
                                        ]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "question-order",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "ترتيب السؤال"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "question-order",
                                        "onUpdate:modelValue": ($event) => form.value.question_order = $event,
                                        min: "1",
                                        placeholder: "اختياري",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.question_order,
                                          void 0,
                                          { number: true }
                                        ]
                                      ])
                                    ])
                                  ]),
                                  form.value.type === "mcq" || form.value.type === "true_false" ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "space-y-4 pt-4 border-t dark:border-gray-700"
                                  }, [
                                    createVNode("h4", { class: "text-md font-medium text-gray-800 dark:text-gray-200" }, [
                                      createTextVNode(toDisplayString(form.value.type === "mcq" ? "خيارات الإجابة (MCQ)" : "تحديد الإجابة الصحيحة (صح/خطأ)") + " ", 1),
                                      createVNode("span", { class: "text-red-600" }, "*")
                                    ]),
                                    form.value.type === "mcq" ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "space-y-3"
                                    }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(mcqOptions.value, (option, index) => {
                                        return openBlock(), createBlock("div", {
                                          key: option.tempId,
                                          class: "flex items-center gap-2 p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50"
                                        }, [
                                          createVNode("input", {
                                            id: "mcq-correct-" + option.tempId,
                                            type: "radio",
                                            name: "correct_mcq_option",
                                            value: option.tempId,
                                            checked: option.is_correct,
                                            onChange: ($event) => setCorrectMcqOption(option.tempId),
                                            class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 flex-shrink-0",
                                            title: "تحديد كإجابة صحيحة"
                                          }, null, 40, ["id", "value", "checked", "onChange"]),
                                          withDirectives(createVNode("input", {
                                            id: "mcq-option-" + option.tempId,
                                            type: "text",
                                            "onUpdate:modelValue": ($event) => option.option_text = $event,
                                            required: "",
                                            placeholder: `نص الخيار ${index + 1}`,
                                            class: "flex-grow input-field input-sm"
                                          }, null, 8, ["id", "onUpdate:modelValue", "placeholder"]), [
                                            [vModelText, option.option_text]
                                          ]),
                                          createVNode("button", {
                                            type: "button",
                                            onClick: ($event) => removeMcqOption(option.tempId),
                                            disabled: mcqOptions.value.length <= 2,
                                            class: "p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:text-red-400 flex-shrink-0",
                                            title: "حذف الخيار"
                                          }, [
                                            (openBlock(), createBlock("svg", {
                                              xmlns: "http://www.w3.org/2000/svg",
                                              viewBox: "0 0 16 16",
                                              fill: "currentColor",
                                              class: "w-4 h-4"
                                            }, [
                                              createVNode("path", {
                                                "fill-rule": "evenodd",
                                                d: "M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.5-.75v.75h1V2.5h-1Z",
                                                "clip-rule": "evenodd"
                                              })
                                            ]))
                                          ], 8, ["onClick", "disabled"])
                                        ]);
                                      }), 128)),
                                      createVNode("button", {
                                        type: "button",
                                        onClick: addMcqOption,
                                        class: "text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                                      }, [
                                        (openBlock(), createBlock("svg", {
                                          xmlns: "http://www.w3.org/2000/svg",
                                          viewBox: "0 0 16 16",
                                          fill: "currentColor",
                                          class: "w-4 h-4"
                                        }, [
                                          createVNode("path", {
                                            "fill-rule": "evenodd",
                                            d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z",
                                            "clip-rule": "evenodd"
                                          })
                                        ])),
                                        createVNode("span", null, "إضافة خيار آخر")
                                      ])
                                    ])) : createCommentVNode("", true),
                                    form.value.type === "true_false" ? (openBlock(), createBlock("div", {
                                      key: 1,
                                      class: "flex items-center space-x-6 rtl:space-x-reverse"
                                    }, [
                                      createVNode("span", { class: "text-sm font-medium text-gray-700 dark:text-gray-300" }, "الإجابة الصحيحة هي:"),
                                      createVNode("div", { class: "flex items-center gap-4" }, [
                                        createVNode("label", { class: "flex items-center gap-1 cursor-pointer" }, [
                                          createVNode("input", {
                                            type: "radio",
                                            name: "tf_correct",
                                            value: true,
                                            checked: isTrueFalseCorrect.value === true,
                                            onChange: ($event) => setTrueFalseCorrect(true),
                                            class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"
                                          }, null, 40, ["checked", "onChange"]),
                                          createVNode("span", { class: "text-sm text-green-700 dark:text-green-300 font-medium" }, "صحيح")
                                        ]),
                                        createVNode("label", { class: "flex items-center gap-1 cursor-pointer" }, [
                                          createVNode("input", {
                                            type: "radio",
                                            name: "tf_correct",
                                            value: false,
                                            checked: isTrueFalseCorrect.value === false,
                                            onChange: ($event) => setTrueFalseCorrect(false),
                                            class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"
                                          }, null, 40, ["checked", "onChange"]),
                                          createVNode("span", { class: "text-sm text-red-700 dark:text-red-300 font-medium" }, "خطأ")
                                        ])
                                      ])
                                    ])) : createCommentVNode("", true)
                                  ])) : createCommentVNode("", true),
                                  form.value.type === "written" ? (openBlock(), createBlock("div", { key: 1 }, [
                                    createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-400 italic" }, "سيتم تصحيح إجابات الأسئلة الكتابية يدويًا.")
                                  ])) : createCommentVNode("", true),
                                  formError.value ? (openBlock(), createBlock("p", {
                                    key: 2,
                                    class: "mt-4 text-sm text-red-600 dark:text-red-400"
                                  }, toDisplayString(formError.value), 1)) : createCommentVNode("", true),
                                  createVNode("div", { class: "mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5" }, [
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isSaving.value || !isFormValid.value,
                                      class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                    }, [
                                      isSaving.value ? (openBlock(), createBlock(LoadingSpinner, {
                                        key: 0,
                                        class: "w-5 h-5 text-white -ml-1 mr-2"
                                      })) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة السؤال"), 1)
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
                          createVNode(unref(DialogPanel), { class: "w-full max-w-3xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(isEditing.value ? "تعديل السؤال" : "إضافة سؤال جديد") + " للاختبار ", 1)
                                ]),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(saveQuestion, ["prevent"]),
                                class: "space-y-6"
                              }, [
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "question-text",
                                    class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                  }, "نص السؤال *"),
                                  withDirectives(createVNode("textarea", {
                                    id: "question-text",
                                    "onUpdate:modelValue": ($event) => form.value.question_text = $event,
                                    required: "",
                                    rows: "4",
                                    class: "mt-1 block w-full input-field"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.question_text]
                                  ])
                                ]),
                                createVNode("div", { class: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "question-type",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "نوع السؤال *"),
                                    withDirectives(createVNode("select", {
                                      id: "question-type",
                                      "onUpdate:modelValue": ($event) => form.value.type = $event,
                                      required: "",
                                      onChange: resetOptionsBasedOnType,
                                      class: "mt-1 block w-full input-field"
                                    }, [
                                      createVNode("option", { value: "mcq" }, "اختيار من متعدد (MCQ)"),
                                      createVNode("option", { value: "true_false" }, "صح / خطأ (T/F)"),
                                      createVNode("option", { value: "written" }, "كتابي (Written)")
                                    ], 40, ["onUpdate:modelValue"]), [
                                      [vModelSelect, form.value.type]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "question-points",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "النقاط *"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "question-points",
                                      "onUpdate:modelValue": ($event) => form.value.points = $event,
                                      required: "",
                                      min: "0",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.points,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "question-order",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "ترتيب السؤال"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "question-order",
                                      "onUpdate:modelValue": ($event) => form.value.question_order = $event,
                                      min: "1",
                                      placeholder: "اختياري",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.question_order,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ])
                                ]),
                                form.value.type === "mcq" || form.value.type === "true_false" ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "space-y-4 pt-4 border-t dark:border-gray-700"
                                }, [
                                  createVNode("h4", { class: "text-md font-medium text-gray-800 dark:text-gray-200" }, [
                                    createTextVNode(toDisplayString(form.value.type === "mcq" ? "خيارات الإجابة (MCQ)" : "تحديد الإجابة الصحيحة (صح/خطأ)") + " ", 1),
                                    createVNode("span", { class: "text-red-600" }, "*")
                                  ]),
                                  form.value.type === "mcq" ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "space-y-3"
                                  }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(mcqOptions.value, (option, index) => {
                                      return openBlock(), createBlock("div", {
                                        key: option.tempId,
                                        class: "flex items-center gap-2 p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50"
                                      }, [
                                        createVNode("input", {
                                          id: "mcq-correct-" + option.tempId,
                                          type: "radio",
                                          name: "correct_mcq_option",
                                          value: option.tempId,
                                          checked: option.is_correct,
                                          onChange: ($event) => setCorrectMcqOption(option.tempId),
                                          class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 flex-shrink-0",
                                          title: "تحديد كإجابة صحيحة"
                                        }, null, 40, ["id", "value", "checked", "onChange"]),
                                        withDirectives(createVNode("input", {
                                          id: "mcq-option-" + option.tempId,
                                          type: "text",
                                          "onUpdate:modelValue": ($event) => option.option_text = $event,
                                          required: "",
                                          placeholder: `نص الخيار ${index + 1}`,
                                          class: "flex-grow input-field input-sm"
                                        }, null, 8, ["id", "onUpdate:modelValue", "placeholder"]), [
                                          [vModelText, option.option_text]
                                        ]),
                                        createVNode("button", {
                                          type: "button",
                                          onClick: ($event) => removeMcqOption(option.tempId),
                                          disabled: mcqOptions.value.length <= 2,
                                          class: "p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:text-red-400 flex-shrink-0",
                                          title: "حذف الخيار"
                                        }, [
                                          (openBlock(), createBlock("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            viewBox: "0 0 16 16",
                                            fill: "currentColor",
                                            class: "w-4 h-4"
                                          }, [
                                            createVNode("path", {
                                              "fill-rule": "evenodd",
                                              d: "M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.5-.75v.75h1V2.5h-1Z",
                                              "clip-rule": "evenodd"
                                            })
                                          ]))
                                        ], 8, ["onClick", "disabled"])
                                      ]);
                                    }), 128)),
                                    createVNode("button", {
                                      type: "button",
                                      onClick: addMcqOption,
                                      class: "text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                                    }, [
                                      (openBlock(), createBlock("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        viewBox: "0 0 16 16",
                                        fill: "currentColor",
                                        class: "w-4 h-4"
                                      }, [
                                        createVNode("path", {
                                          "fill-rule": "evenodd",
                                          d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z",
                                          "clip-rule": "evenodd"
                                        })
                                      ])),
                                      createVNode("span", null, "إضافة خيار آخر")
                                    ])
                                  ])) : createCommentVNode("", true),
                                  form.value.type === "true_false" ? (openBlock(), createBlock("div", {
                                    key: 1,
                                    class: "flex items-center space-x-6 rtl:space-x-reverse"
                                  }, [
                                    createVNode("span", { class: "text-sm font-medium text-gray-700 dark:text-gray-300" }, "الإجابة الصحيحة هي:"),
                                    createVNode("div", { class: "flex items-center gap-4" }, [
                                      createVNode("label", { class: "flex items-center gap-1 cursor-pointer" }, [
                                        createVNode("input", {
                                          type: "radio",
                                          name: "tf_correct",
                                          value: true,
                                          checked: isTrueFalseCorrect.value === true,
                                          onChange: ($event) => setTrueFalseCorrect(true),
                                          class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"
                                        }, null, 40, ["checked", "onChange"]),
                                        createVNode("span", { class: "text-sm text-green-700 dark:text-green-300 font-medium" }, "صحيح")
                                      ]),
                                      createVNode("label", { class: "flex items-center gap-1 cursor-pointer" }, [
                                        createVNode("input", {
                                          type: "radio",
                                          name: "tf_correct",
                                          value: false,
                                          checked: isTrueFalseCorrect.value === false,
                                          onChange: ($event) => setTrueFalseCorrect(false),
                                          class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"
                                        }, null, 40, ["checked", "onChange"]),
                                        createVNode("span", { class: "text-sm text-red-700 dark:text-red-300 font-medium" }, "خطأ")
                                      ])
                                    ])
                                  ])) : createCommentVNode("", true)
                                ])) : createCommentVNode("", true),
                                form.value.type === "written" ? (openBlock(), createBlock("div", { key: 1 }, [
                                  createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-400 italic" }, "سيتم تصحيح إجابات الأسئلة الكتابية يدويًا.")
                                ])) : createCommentVNode("", true),
                                formError.value ? (openBlock(), createBlock("p", {
                                  key: 2,
                                  class: "mt-4 text-sm text-red-600 dark:text-red-400"
                                }, toDisplayString(formError.value), 1)) : createCommentVNode("", true),
                                createVNode("div", { class: "mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5" }, [
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isSaving.value || !isFormValid.value,
                                    class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                  }, [
                                    isSaving.value ? (openBlock(), createBlock(LoadingSpinner, {
                                      key: 0,
                                      class: "w-5 h-5 text-white -ml-1 mr-2"
                                    })) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة السؤال"), 1)
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
                          class: "fixed inset-0 bg-black/50 backdrop-blur-sm",
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
                            createVNode(unref(DialogPanel), { class: "w-full max-w-3xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                              default: withCtx(() => [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(isEditing.value ? "تعديل السؤال" : "إضافة سؤال جديد") + " للاختبار ", 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(saveQuestion, ["prevent"]),
                                  class: "space-y-6"
                                }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "question-text",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "نص السؤال *"),
                                    withDirectives(createVNode("textarea", {
                                      id: "question-text",
                                      "onUpdate:modelValue": ($event) => form.value.question_text = $event,
                                      required: "",
                                      rows: "4",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.question_text]
                                    ])
                                  ]),
                                  createVNode("div", { class: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, [
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "question-type",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "نوع السؤال *"),
                                      withDirectives(createVNode("select", {
                                        id: "question-type",
                                        "onUpdate:modelValue": ($event) => form.value.type = $event,
                                        required: "",
                                        onChange: resetOptionsBasedOnType,
                                        class: "mt-1 block w-full input-field"
                                      }, [
                                        createVNode("option", { value: "mcq" }, "اختيار من متعدد (MCQ)"),
                                        createVNode("option", { value: "true_false" }, "صح / خطأ (T/F)"),
                                        createVNode("option", { value: "written" }, "كتابي (Written)")
                                      ], 40, ["onUpdate:modelValue"]), [
                                        [vModelSelect, form.value.type]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "question-points",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "النقاط *"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "question-points",
                                        "onUpdate:modelValue": ($event) => form.value.points = $event,
                                        required: "",
                                        min: "0",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.points,
                                          void 0,
                                          { number: true }
                                        ]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "question-order",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "ترتيب السؤال"),
                                      withDirectives(createVNode("input", {
                                        type: "number",
                                        id: "question-order",
                                        "onUpdate:modelValue": ($event) => form.value.question_order = $event,
                                        min: "1",
                                        placeholder: "اختياري",
                                        class: "mt-1 block w-full input-field"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [
                                          vModelText,
                                          form.value.question_order,
                                          void 0,
                                          { number: true }
                                        ]
                                      ])
                                    ])
                                  ]),
                                  form.value.type === "mcq" || form.value.type === "true_false" ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "space-y-4 pt-4 border-t dark:border-gray-700"
                                  }, [
                                    createVNode("h4", { class: "text-md font-medium text-gray-800 dark:text-gray-200" }, [
                                      createTextVNode(toDisplayString(form.value.type === "mcq" ? "خيارات الإجابة (MCQ)" : "تحديد الإجابة الصحيحة (صح/خطأ)") + " ", 1),
                                      createVNode("span", { class: "text-red-600" }, "*")
                                    ]),
                                    form.value.type === "mcq" ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "space-y-3"
                                    }, [
                                      (openBlock(true), createBlock(Fragment, null, renderList(mcqOptions.value, (option, index) => {
                                        return openBlock(), createBlock("div", {
                                          key: option.tempId,
                                          class: "flex items-center gap-2 p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50"
                                        }, [
                                          createVNode("input", {
                                            id: "mcq-correct-" + option.tempId,
                                            type: "radio",
                                            name: "correct_mcq_option",
                                            value: option.tempId,
                                            checked: option.is_correct,
                                            onChange: ($event) => setCorrectMcqOption(option.tempId),
                                            class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 flex-shrink-0",
                                            title: "تحديد كإجابة صحيحة"
                                          }, null, 40, ["id", "value", "checked", "onChange"]),
                                          withDirectives(createVNode("input", {
                                            id: "mcq-option-" + option.tempId,
                                            type: "text",
                                            "onUpdate:modelValue": ($event) => option.option_text = $event,
                                            required: "",
                                            placeholder: `نص الخيار ${index + 1}`,
                                            class: "flex-grow input-field input-sm"
                                          }, null, 8, ["id", "onUpdate:modelValue", "placeholder"]), [
                                            [vModelText, option.option_text]
                                          ]),
                                          createVNode("button", {
                                            type: "button",
                                            onClick: ($event) => removeMcqOption(option.tempId),
                                            disabled: mcqOptions.value.length <= 2,
                                            class: "p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:text-red-400 flex-shrink-0",
                                            title: "حذف الخيار"
                                          }, [
                                            (openBlock(), createBlock("svg", {
                                              xmlns: "http://www.w3.org/2000/svg",
                                              viewBox: "0 0 16 16",
                                              fill: "currentColor",
                                              class: "w-4 h-4"
                                            }, [
                                              createVNode("path", {
                                                "fill-rule": "evenodd",
                                                d: "M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.5-.75v.75h1V2.5h-1Z",
                                                "clip-rule": "evenodd"
                                              })
                                            ]))
                                          ], 8, ["onClick", "disabled"])
                                        ]);
                                      }), 128)),
                                      createVNode("button", {
                                        type: "button",
                                        onClick: addMcqOption,
                                        class: "text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                                      }, [
                                        (openBlock(), createBlock("svg", {
                                          xmlns: "http://www.w3.org/2000/svg",
                                          viewBox: "0 0 16 16",
                                          fill: "currentColor",
                                          class: "w-4 h-4"
                                        }, [
                                          createVNode("path", {
                                            "fill-rule": "evenodd",
                                            d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z",
                                            "clip-rule": "evenodd"
                                          })
                                        ])),
                                        createVNode("span", null, "إضافة خيار آخر")
                                      ])
                                    ])) : createCommentVNode("", true),
                                    form.value.type === "true_false" ? (openBlock(), createBlock("div", {
                                      key: 1,
                                      class: "flex items-center space-x-6 rtl:space-x-reverse"
                                    }, [
                                      createVNode("span", { class: "text-sm font-medium text-gray-700 dark:text-gray-300" }, "الإجابة الصحيحة هي:"),
                                      createVNode("div", { class: "flex items-center gap-4" }, [
                                        createVNode("label", { class: "flex items-center gap-1 cursor-pointer" }, [
                                          createVNode("input", {
                                            type: "radio",
                                            name: "tf_correct",
                                            value: true,
                                            checked: isTrueFalseCorrect.value === true,
                                            onChange: ($event) => setTrueFalseCorrect(true),
                                            class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"
                                          }, null, 40, ["checked", "onChange"]),
                                          createVNode("span", { class: "text-sm text-green-700 dark:text-green-300 font-medium" }, "صحيح")
                                        ]),
                                        createVNode("label", { class: "flex items-center gap-1 cursor-pointer" }, [
                                          createVNode("input", {
                                            type: "radio",
                                            name: "tf_correct",
                                            value: false,
                                            checked: isTrueFalseCorrect.value === false,
                                            onChange: ($event) => setTrueFalseCorrect(false),
                                            class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"
                                          }, null, 40, ["checked", "onChange"]),
                                          createVNode("span", { class: "text-sm text-red-700 dark:text-red-300 font-medium" }, "خطأ")
                                        ])
                                      ])
                                    ])) : createCommentVNode("", true)
                                  ])) : createCommentVNode("", true),
                                  form.value.type === "written" ? (openBlock(), createBlock("div", { key: 1 }, [
                                    createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-400 italic" }, "سيتم تصحيح إجابات الأسئلة الكتابية يدويًا.")
                                  ])) : createCommentVNode("", true),
                                  formError.value ? (openBlock(), createBlock("p", {
                                    key: 2,
                                    class: "mt-4 text-sm text-red-600 dark:text-red-400"
                                  }, toDisplayString(formError.value), 1)) : createCommentVNode("", true),
                                  createVNode("div", { class: "mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5" }, [
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isSaving.value || !isFormValid.value,
                                      class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                    }, [
                                      isSaving.value ? (openBlock(), createBlock(LoadingSpinner, {
                                        key: 0,
                                        class: "w-5 h-5 text-white -ml-1 mr-2"
                                      })) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة السؤال"), 1)
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
                class: "relative z-50"
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
                        class: "fixed inset-0 bg-black/50 backdrop-blur-sm",
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
                          createVNode(unref(DialogPanel), { class: "w-full max-w-3xl transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(isEditing.value ? "تعديل السؤال" : "إضافة سؤال جديد") + " للاختبار ", 1)
                                ]),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(saveQuestion, ["prevent"]),
                                class: "space-y-6"
                              }, [
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "question-text",
                                    class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                  }, "نص السؤال *"),
                                  withDirectives(createVNode("textarea", {
                                    id: "question-text",
                                    "onUpdate:modelValue": ($event) => form.value.question_text = $event,
                                    required: "",
                                    rows: "4",
                                    class: "mt-1 block w-full input-field"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.question_text]
                                  ])
                                ]),
                                createVNode("div", { class: "grid grid-cols-1 sm:grid-cols-3 gap-4" }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "question-type",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "نوع السؤال *"),
                                    withDirectives(createVNode("select", {
                                      id: "question-type",
                                      "onUpdate:modelValue": ($event) => form.value.type = $event,
                                      required: "",
                                      onChange: resetOptionsBasedOnType,
                                      class: "mt-1 block w-full input-field"
                                    }, [
                                      createVNode("option", { value: "mcq" }, "اختيار من متعدد (MCQ)"),
                                      createVNode("option", { value: "true_false" }, "صح / خطأ (T/F)"),
                                      createVNode("option", { value: "written" }, "كتابي (Written)")
                                    ], 40, ["onUpdate:modelValue"]), [
                                      [vModelSelect, form.value.type]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "question-points",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "النقاط *"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "question-points",
                                      "onUpdate:modelValue": ($event) => form.value.points = $event,
                                      required: "",
                                      min: "0",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.points,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "question-order",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "ترتيب السؤال"),
                                    withDirectives(createVNode("input", {
                                      type: "number",
                                      id: "question-order",
                                      "onUpdate:modelValue": ($event) => form.value.question_order = $event,
                                      min: "1",
                                      placeholder: "اختياري",
                                      class: "mt-1 block w-full input-field"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [
                                        vModelText,
                                        form.value.question_order,
                                        void 0,
                                        { number: true }
                                      ]
                                    ])
                                  ])
                                ]),
                                form.value.type === "mcq" || form.value.type === "true_false" ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "space-y-4 pt-4 border-t dark:border-gray-700"
                                }, [
                                  createVNode("h4", { class: "text-md font-medium text-gray-800 dark:text-gray-200" }, [
                                    createTextVNode(toDisplayString(form.value.type === "mcq" ? "خيارات الإجابة (MCQ)" : "تحديد الإجابة الصحيحة (صح/خطأ)") + " ", 1),
                                    createVNode("span", { class: "text-red-600" }, "*")
                                  ]),
                                  form.value.type === "mcq" ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "space-y-3"
                                  }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(mcqOptions.value, (option, index) => {
                                      return openBlock(), createBlock("div", {
                                        key: option.tempId,
                                        class: "flex items-center gap-2 p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50"
                                      }, [
                                        createVNode("input", {
                                          id: "mcq-correct-" + option.tempId,
                                          type: "radio",
                                          name: "correct_mcq_option",
                                          value: option.tempId,
                                          checked: option.is_correct,
                                          onChange: ($event) => setCorrectMcqOption(option.tempId),
                                          class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500 flex-shrink-0",
                                          title: "تحديد كإجابة صحيحة"
                                        }, null, 40, ["id", "value", "checked", "onChange"]),
                                        withDirectives(createVNode("input", {
                                          id: "mcq-option-" + option.tempId,
                                          type: "text",
                                          "onUpdate:modelValue": ($event) => option.option_text = $event,
                                          required: "",
                                          placeholder: `نص الخيار ${index + 1}`,
                                          class: "flex-grow input-field input-sm"
                                        }, null, 8, ["id", "onUpdate:modelValue", "placeholder"]), [
                                          [vModelText, option.option_text]
                                        ]),
                                        createVNode("button", {
                                          type: "button",
                                          onClick: ($event) => removeMcqOption(option.tempId),
                                          disabled: mcqOptions.value.length <= 2,
                                          class: "p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:text-red-400 flex-shrink-0",
                                          title: "حذف الخيار"
                                        }, [
                                          (openBlock(), createBlock("svg", {
                                            xmlns: "http://www.w3.org/2000/svg",
                                            viewBox: "0 0 16 16",
                                            fill: "currentColor",
                                            class: "w-4 h-4"
                                          }, [
                                            createVNode("path", {
                                              "fill-rule": "evenodd",
                                              d: "M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.5-.75v.75h1V2.5h-1Z",
                                              "clip-rule": "evenodd"
                                            })
                                          ]))
                                        ], 8, ["onClick", "disabled"])
                                      ]);
                                    }), 128)),
                                    createVNode("button", {
                                      type: "button",
                                      onClick: addMcqOption,
                                      class: "text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                                    }, [
                                      (openBlock(), createBlock("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        viewBox: "0 0 16 16",
                                        fill: "currentColor",
                                        class: "w-4 h-4"
                                      }, [
                                        createVNode("path", {
                                          "fill-rule": "evenodd",
                                          d: "M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z",
                                          "clip-rule": "evenodd"
                                        })
                                      ])),
                                      createVNode("span", null, "إضافة خيار آخر")
                                    ])
                                  ])) : createCommentVNode("", true),
                                  form.value.type === "true_false" ? (openBlock(), createBlock("div", {
                                    key: 1,
                                    class: "flex items-center space-x-6 rtl:space-x-reverse"
                                  }, [
                                    createVNode("span", { class: "text-sm font-medium text-gray-700 dark:text-gray-300" }, "الإجابة الصحيحة هي:"),
                                    createVNode("div", { class: "flex items-center gap-4" }, [
                                      createVNode("label", { class: "flex items-center gap-1 cursor-pointer" }, [
                                        createVNode("input", {
                                          type: "radio",
                                          name: "tf_correct",
                                          value: true,
                                          checked: isTrueFalseCorrect.value === true,
                                          onChange: ($event) => setTrueFalseCorrect(true),
                                          class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"
                                        }, null, 40, ["checked", "onChange"]),
                                        createVNode("span", { class: "text-sm text-green-700 dark:text-green-300 font-medium" }, "صحيح")
                                      ]),
                                      createVNode("label", { class: "flex items-center gap-1 cursor-pointer" }, [
                                        createVNode("input", {
                                          type: "radio",
                                          name: "tf_correct",
                                          value: false,
                                          checked: isTrueFalseCorrect.value === false,
                                          onChange: ($event) => setTrueFalseCorrect(false),
                                          class: "h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 dark:bg-gray-600 dark:border-gray-500"
                                        }, null, 40, ["checked", "onChange"]),
                                        createVNode("span", { class: "text-sm text-red-700 dark:text-red-300 font-medium" }, "خطأ")
                                      ])
                                    ])
                                  ])) : createCommentVNode("", true)
                                ])) : createCommentVNode("", true),
                                form.value.type === "written" ? (openBlock(), createBlock("div", { key: 1 }, [
                                  createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-400 italic" }, "سيتم تصحيح إجابات الأسئلة الكتابية يدويًا.")
                                ])) : createCommentVNode("", true),
                                formError.value ? (openBlock(), createBlock("p", {
                                  key: 2,
                                  class: "mt-4 text-sm text-red-600 dark:text-red-400"
                                }, toDisplayString(formError.value), 1)) : createCommentVNode("", true),
                                createVNode("div", { class: "mt-6 flex justify-start gap-3 border-t dark:border-gray-700 pt-5" }, [
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isSaving.value || !isFormValid.value,
                                    class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                  }, [
                                    isSaving.value ? (openBlock(), createBlock(LoadingSpinner, {
                                      key: 0,
                                      class: "w-5 h-5 text-white -ml-1 mr-2"
                                    })) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة السؤال"), 1)
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
//# sourceMappingURL=AddEditQuestionModal.vue2.mjs.map
