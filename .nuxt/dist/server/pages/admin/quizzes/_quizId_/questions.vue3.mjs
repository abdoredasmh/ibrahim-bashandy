import __nuxt_component_0 from "../../../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import __nuxt_component_1 from "../../../../components/admin/AddEditQuestionModal.vue.mjs";
import "../../../../components/admin/ConfirmationModal.vue.mjs";
import { defineComponent, computed, ref, watch, mergeProps, withCtx, createTextVNode, createBlock, createVNode, openBlock } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
import LoadingSpinner from "../../../../components/LoadingSpinner.vue.mjs";
import { useSupabaseClient } from "../../../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useNuxtApp } from "../../../../node_modules/nuxt/dist/app/nuxt.mjs";
import { useRoute } from "../../../../node_modules/nuxt/dist/app/composables/router.mjs";
import _sfc_main$1 from "../../../../components/admin/ConfirmationModal.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "questions",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const { $toast } = useNuxtApp();
    const route = useRoute();
    const quizId = computed(() => route.params.quizId);
    const quizIdNumber = computed(() => {
      const id = parseInt(quizId.value, 10);
      return isNaN(id) ? null : id;
    });
    const pendingQuiz = ref(true);
    const pendingQuestions = ref(true);
    const fetchErrorQuiz = ref(null);
    const fetchErrorQuestions = ref(null);
    const quiz = ref(null);
    const questions = ref([]);
    const showQuestionModal = ref(false);
    const selectedQuestionForEdit = ref(null);
    const showDeleteQuestionConfirm = ref(false);
    const questionToDelete = ref(null);
    const deleteQuestionConfirmConfig = ref(null);
    const actionMessage = ref(null);
    const actionMessageType = ref("success");
    const fetchQuizDetails = async () => {
      pendingQuiz.value = true;
      fetchErrorQuiz.value = null;
      quiz.value = null;
      if (quizIdNumber.value === null) {
        fetchErrorQuiz.value = { message: "معرف الاختبار في الرابط غير صالح." };
        pendingQuiz.value = false;
        return;
      }
      try {
        const { data, error } = await supabase.from("quizzes").select(`*, lessons (title), study_courses (title)`).eq("id", quizIdNumber.value).single();
        if (error) throw error;
        if (!data) throw new Error("لم يتم العثور على الاختبار.");
        quiz.value = data;
      } catch (err) {
        console.error("Error fetching quiz details:", err);
        fetchErrorQuiz.value = err ?? { message: "خطأ غير معروف." };
      } finally {
        pendingQuiz.value = false;
      }
    };
    const fetchQuestions = async () => {
      pendingQuestions.value = true;
      fetchErrorQuestions.value = null;
      questions.value = [];
      if (quizIdNumber.value === null) {
        fetchErrorQuestions.value = { message: "معرف الاختبار غير صالح لتحميل الأسئلة." };
        pendingQuestions.value = false;
        return;
      }
      try {
        const { data, error } = await supabase.from("quiz_questions").select(`*, question_options (*)`).eq("quiz_id", quizIdNumber.value).order("question_order", { ascending: true, nulls: "last" }).order("created_at", { ascending: true });
        if (error) throw error;
        questions.value = data || [];
      } catch (err) {
        console.error("Error fetching questions:", err);
        fetchErrorQuestions.value = err;
      } finally {
        pendingQuestions.value = false;
      }
    };
    const handleQuestionSaved = (savedQuestion) => {
      showToast("تم حفظ السؤال بنجاح!", "success");
      showQuestionModal.value = false;
      refreshQuestions();
    };
    const deleteQuestion = async () => {
      if (!questionToDelete.value) return;
      const idToDelete = questionToDelete.value.id;
      const textToDelete = questionToDelete.value.question_text.substring(0, 30);
      try {
        const { error } = await supabase.from("quiz_questions").delete().eq("id", idToDelete);
        if (error) throw error;
        questions.value = questions.value.filter((q) => q.id !== idToDelete);
        showToast(`تم حذف السؤال "${textToDelete}..." بنجاح.`, "success");
      } catch (err) {
        console.error("Error deleting question:", err);
        showActionMessage(`فشل حذف السؤال: ${err.message}`, "error");
      } finally {
        questionToDelete.value = null;
        showDeleteQuestionConfirm.value = false;
      }
    };
    const formatQuizType = (type) => {
      switch (type) {
        case "lesson":
          return "اختبار درس";
        case "module":
          return "اختبار وحدة";
        case "final":
          return "اختبار نهائي";
        case "practice":
          return "اختبار تدريبي";
        default:
          return "غير محدد";
      }
    };
    const formatQuestionType = (type) => {
      switch (type) {
        case "mcq":
          return "اختيار من متعدد";
        case "true_false":
          return "صح / خطأ";
        case "written":
          return "كتابي";
        default:
          return "غير محدد";
      }
    };
    const showToast = (message, type = "info") => {
      if ($toast == null ? void 0 : $toast[type]) $toast[type](message);
      else console.log(`[${type.toUpperCase()}] ${message}`);
    };
    const showActionMessage = (msg, type) => {
      actionMessage.value = msg;
      actionMessageType.value = type;
      setTimeout(() => {
        actionMessage.value = null;
      }, 5e3);
    };
    const refreshQuestions = () => {
      fetchQuestions();
    };
    watch(quizIdNumber, (newId) => {
      if (newId !== null) {
        fetchQuizDetails();
        fetchQuestions();
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminAddEditQuestionModal = __nuxt_component_1;
      const _component_AdminConfirmationModal = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-6" }, _attrs))} data-v-4af25bc6>`);
      if (pendingQuiz.value || pendingQuestions.value) {
        _push(`<div class="text-center py-10" data-v-4af25bc6>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-2 text-gray-500 dark:text-gray-400" data-v-4af25bc6>جارٍ تحميل بيانات الاختبار والأسئلة...</p></div>`);
      } else if (fetchErrorQuiz.value || fetchErrorQuestions.value) {
        _push(`<div class="my-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded" data-v-4af25bc6><strong class="font-bold" data-v-4af25bc6>خطأ!</strong><p data-v-4af25bc6>حدث خطأ أثناء تحميل البيانات:</p><ul class="list-disc list-inside mt-1 text-sm" data-v-4af25bc6>`);
        if (fetchErrorQuiz.value) {
          _push(`<li data-v-4af25bc6>فشل تحميل بيانات الاختبار: ${ssrInterpolate(fetchErrorQuiz.value.message)}</li>`);
        } else {
          _push(`<!---->`);
        }
        if (fetchErrorQuestions.value) {
          _push(`<li data-v-4af25bc6>فشل تحميل الأسئلة: ${ssrInterpolate(fetchErrorQuestions.value.message)}</li>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</ul>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/quizzes",
          class: "mt-3 inline-block text-indigo-600 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`العودة لقائمة الاختبارات`);
            } else {
              return [
                createTextVNode("العودة لقائمة الاختبارات")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (!quiz.value) {
        _push(`<div class="my-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-center" data-v-4af25bc6> لم يتم العثور على الاختبار المطلوب (ID: ${ssrInterpolate(quizId.value)}). `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/quizzes",
          class: "mt-3 block text-indigo-600 hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`العودة لقائمة الاختبارات`);
            } else {
              return [
                createTextVNode("العودة لقائمة الاختبارات")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div data-v-4af25bc6><div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 pb-4 border-b dark:border-gray-700" data-v-4af25bc6><div data-v-4af25bc6>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/quizzes",
          class: "text-sm text-gray-500 dark:text-gray-400 hover:underline flex items-center gap-1 mb-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-4af25bc6${_scopeId}><path fill-rule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z" clip-rule="evenodd" data-v-4af25bc6${_scopeId}></path></svg><span data-v-4af25bc6${_scopeId}>الاختبارات</span>`);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 16 16",
                  fill: "currentColor",
                  class: "w-4 h-4"
                }, [
                  createVNode("path", {
                    "fill-rule": "evenodd",
                    d: "M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z",
                    "clip-rule": "evenodd"
                  })
                ])),
                createVNode("span", null, "الاختبارات")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200" data-v-4af25bc6>إدارة أسئلة الاختبار: ${ssrInterpolate(quiz.value.title)}</h1><p class="text-sm text-gray-500 dark:text-gray-400 mt-1" data-v-4af25bc6>${ssrInterpolate(formatQuizType(quiz.value.type))} `);
        if (quiz.value.type === "lesson") {
          _push(`<span data-v-4af25bc6> للدرس: ${ssrInterpolate((_a = quiz.value.lessons) == null ? void 0 : _a.title)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (quiz.value.type === "module") {
          _push(`<span data-v-4af25bc6> للوحدة ${ssrInterpolate(quiz.value.module_number)} في دورة: ${ssrInterpolate((_b = quiz.value.study_courses) == null ? void 0 : _b.title)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (quiz.value.type === "final") {
          _push(`<span data-v-4af25bc6> لدورة: ${ssrInterpolate((_c = quiz.value.study_courses) == null ? void 0 : _c.title)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</p></div><button class="flex-shrink-0 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800" data-v-4af25bc6><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 -ml-1 mr-2 rtl:ml-2 rtl:-mr-1" data-v-4af25bc6><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z" clip-rule="evenodd" data-v-4af25bc6></path></svg> إضافة سؤال جديد </button></div>`);
        if (actionMessage.value) {
          _push(`<div class="${ssrRenderClass(["mb-4 p-3 border rounded text-sm", actionMessageType.value === "success" ? "bg-green-100 border-green-300 text-green-700" : "bg-red-100 border-red-300 text-red-700"])}" data-v-4af25bc6>${ssrInterpolate(actionMessage.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (questions.value && questions.value.length > 0) {
          _push(`<div class="space-y-4" data-v-4af25bc6><!--[-->`);
          ssrRenderList(questions.value, (question, index) => {
            _push(`<div class="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start gap-4" data-v-4af25bc6><div class="flex-1 min-w-0" data-v-4af25bc6><p class="text-xs text-gray-500 dark:text-gray-400 mb-1" data-v-4af25bc6> السؤال ${ssrInterpolate(index + 1)} (${ssrInterpolate(formatQuestionType(question.type))} - ${ssrInterpolate(question.points)} ${ssrInterpolate(question.points === 1 ? "نقطة" : "نقاط")}) </p><p class="text-sm font-medium text-gray-900 dark:text-gray-100 break-words mb-2" data-v-4af25bc6>${ssrInterpolate(question.question_text)}</p>`);
            if ((question.type === "mcq" || question.type === "true_false") && question.question_options && question.question_options.length > 0) {
              _push(`<div class="mt-2 space-y-1 text-xs pl-4 rtl:pr-4 border-t dark:border-gray-700 pt-2" data-v-4af25bc6><h5 class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1" data-v-4af25bc6>الخيارات:</h5><!--[-->`);
              ssrRenderList(question.question_options, (option) => {
                _push(`<div class="${ssrRenderClass(["flex items-center gap-2", option.is_correct ? "text-green-700 dark:text-green-300 font-medium" : "text-gray-600 dark:text-gray-400"])}" data-v-4af25bc6><span class="flex-shrink-0 w-3 h-3" data-v-4af25bc6>`);
                if (option.is_correct) {
                  _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" data-v-4af25bc6><path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.35 2.35 4.492-6.738a.75.75 0 0 1 1.04-.208Z" clip-rule="evenodd" data-v-4af25bc6></path></svg>`);
                } else {
                  _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" data-v-4af25bc6><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14Zm2.78-4.22a.75.75 0 0 0-1.06-1.06L8 11.44l-1.72-1.72a.75.75 0 0 0-1.06 1.06L6.94 12.5l-1.72 1.72a.75.75 0 1 0 1.06 1.06L8 13.56l1.72 1.72a.75.75 0 1 0 1.06-1.06L9.06 12.5l1.72-1.72Z" data-v-4af25bc6></path></svg>`);
                }
                _push(`</span><span data-v-4af25bc6>${ssrInterpolate(option.option_text)}</span></div>`);
              });
              _push(`<!--]--></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="flex-shrink-0 flex flex-col sm:flex-row gap-2 items-end sm:items-center mt-2 sm:mt-0" data-v-4af25bc6><button class="text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-1" data-v-4af25bc6><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3" data-v-4af25bc6><path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774v2.475h2.475l4.263-4.262a1.75 1.75 0 0 0 0-2.474Z" data-v-4af25bc6></path><path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9.81a.75.75 0 0 0-1.5 0v1.44c0 .138-.112.25-.25.25h-6.5a.25.25 0 0 1-.25-.25v-6.5c0-.138.112-.25.25-.25h1.44a.75.75 0 0 0 0-1.5H4.75Z" data-v-4af25bc6></path></svg><span data-v-4af25bc6>تعديل</span></button><button class="text-xs text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-1" data-v-4af25bc6><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3" data-v-4af25bc6><path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.5-.75v.75h1V2.5h-1Z" clip-rule="evenodd" data-v-4af25bc6></path></svg><span data-v-4af25bc6>حذف</span></button></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else if (!pendingQuestions.value) {
          _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-4af25bc6> لم يتم إضافة أي أسئلة لهذا الاختبار بعد. <button class="ml-2 text-indigo-600 hover:underline" data-v-4af25bc6>إضافة أول سؤال</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_AdminAddEditQuestionModal, {
          modelValue: showQuestionModal.value,
          "onUpdate:modelValue": ($event) => showQuestionModal.value = $event,
          "quiz-id": quizIdNumber.value,
          "question-data": selectedQuestionForEdit.value,
          onSaved: handleQuestionSaved
        }, null, _parent));
        _push(ssrRenderComponent(_component_AdminConfirmationModal, {
          modelValue: showDeleteQuestionConfirm.value,
          "onUpdate:modelValue": ($event) => showDeleteQuestionConfirm.value = $event,
          config: deleteQuestionConfirmConfig.value,
          onConfirm: deleteQuestion,
          onClose: ($event) => questionToDelete.value = null
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=questions.vue3.mjs.map
