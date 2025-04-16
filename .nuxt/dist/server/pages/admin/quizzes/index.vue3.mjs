import { defineComponent, ref, mergeProps, withCtx, createTextVNode, defineAsyncComponent } from "vue";
import __nuxt_component_0 from "../../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
import LoadingSpinner from "../../../components/LoadingSpinner.vue.mjs";
import { useSupabaseClient } from "../../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useNuxtApp } from "../../../node_modules/nuxt/dist/app/nuxt.mjs";
const __nuxt_component_0_lazy = defineAsyncComponent(() => import("../../../components/admin/QuizCreateEditModal.vue.mjs").then((c) => c.default || c));
const __nuxt_component_1_lazy = defineAsyncComponent(() => import("../../../components/admin/ConfirmationModal.vue.mjs").then((c) => c.default || c));
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const { $toast } = useNuxtApp();
    const pending = ref(true);
    const fetchError = ref(null);
    const quizzes = ref([]);
    const showModal = ref(false);
    const selectedQuizForEdit = ref(null);
    const showDeleteConfirm = ref(false);
    const quizToDelete = ref(null);
    const deleteConfirmConfig = ref(null);
    const actionMessage = ref(null);
    const actionMessageType = ref("success");
    const fetchQuizzes = async () => {
      pending.value = true;
      fetchError.value = null;
      clearActionMessage();
      try {
        const { data, error } = await supabase.from("quizzes").select(`
        *,
        lessons ( title ),
        study_courses ( title )
      `).order("created_at", { ascending: false });
        if (error) throw error;
        quizzes.value = data || [];
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        fetchError.value = err;
        quizzes.value = [];
      } finally {
        pending.value = false;
      }
    };
    const handleModalClosed = () => {
      selectedQuizForEdit.value = null;
    };
    const handleQuizSaved = (savedQuiz) => {
      showToast("تم حفظ الاختبار بنجاح!", "success");
      showModal.value = false;
      refresh();
    };
    const deleteQuiz = async () => {
      if (!quizToDelete.value) return;
      const idToDelete = quizToDelete.value.id;
      const titleToDelete = quizToDelete.value.title;
      try {
        const { error } = await supabase.from("quizzes").delete().eq("id", idToDelete);
        if (error) throw error;
        quizzes.value = quizzes.value.filter((q) => q.id !== idToDelete);
        showToast(`تم حذف الاختبار "${titleToDelete}" بنجاح.`, "success");
      } catch (err) {
        console.error("Error deleting quiz:", err);
        showActionMessage(`فشل حذف الاختبار: ${err.message}`, "error");
      } finally {
        quizToDelete.value = null;
        showDeleteConfirm.value = false;
      }
    };
    const formatDate = (dateString) => {
      if (!dateString) return "--";
      try {
        const date = new Date(dateString);
        return date.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
      } catch {
        return "تاريخ غير صالح";
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
    const showToast = (message, type = "info") => {
      if ($toast && typeof $toast[type] === "function") $toast[type](message);
      else console.log(`[${type.toUpperCase()}] ${message}`);
    };
    const showActionMessage = (msg, type) => {
      actionMessage.value = msg;
      actionMessageType.value = type;
      setTimeout(() => {
        actionMessage.value = null;
      }, 5e3);
    };
    const clearActionMessage = () => {
      actionMessage.value = null;
    };
    const refresh = () => {
      fetchQuizzes();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_LazyAdminQuizCreateEditModal = __nuxt_component_0_lazy;
      const _component_LazyAdminConfirmationModal = __nuxt_component_1_lazy;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-6" }, _attrs))} data-v-575d39c0><div class="flex justify-between items-center mb-6" data-v-575d39c0><h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200" data-v-575d39c0>إدارة الاختبارات</h1><button class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800" data-v-575d39c0><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 -ml-1 mr-2 rtl:ml-2 rtl:-mr-1" data-v-575d39c0><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z" clip-rule="evenodd" data-v-575d39c0></path></svg> إنشاء اختبار جديد </button></div>`);
      if (pending.value) {
        _push(`<div class="text-center py-10" data-v-575d39c0>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-2 text-gray-500 dark:text-gray-400" data-v-575d39c0>جارٍ تحميل الاختبارات...</p></div>`);
      } else {
        _push(`<!---->`);
      }
      if (fetchError.value) {
        _push(`<div class="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert" data-v-575d39c0><strong class="font-bold" data-v-575d39c0>خطأ!</strong><span class="block sm:inline" data-v-575d39c0> حدث خطأ أثناء جلب الاختبارات. (${ssrInterpolate(fetchError.value.message)})</span><button class="ml-4 text-red-800 underline" data-v-575d39c0>إعادة المحاولة</button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (actionMessage.value) {
        _push(`<div class="${ssrRenderClass(["my-4 p-3 border rounded text-sm", actionMessageType.value === "success" ? "bg-green-100 border-green-300 text-green-700" : "bg-red-100 border-red-300 text-red-700"])}" data-v-575d39c0>${ssrInterpolate(actionMessage.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (quizzes.value && quizzes.value.length > 0) {
        _push(`<div class="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg" data-v-575d39c0><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" data-v-575d39c0><thead class="bg-gray-50 dark:bg-gray-700" data-v-575d39c0><tr data-v-575d39c0><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-575d39c0>العنوان</th><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-575d39c0>النوع</th><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-575d39c0>مرتبط بـ</th><th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-575d39c0>الحالة</th><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-575d39c0>تاريخ الإنشاء</th><th scope="col" class="relative px-6 py-3" data-v-575d39c0><span class="sr-only" data-v-575d39c0>الإجراءات</span></th></tr></thead><tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" data-v-575d39c0><!--[-->`);
        ssrRenderList(quizzes.value, (quiz) => {
          var _a, _b, _c;
          _push(`<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50" data-v-575d39c0><td class="px-6 py-4 whitespace-nowrap" data-v-575d39c0><div class="text-sm font-medium text-gray-900 dark:text-gray-100" data-v-575d39c0>${ssrInterpolate(quiz.title)}</div><div class="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs" data-v-575d39c0>${ssrInterpolate(quiz.description)}</div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-v-575d39c0>${ssrInterpolate(formatQuizType(quiz.type))}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-v-575d39c0>`);
          if (quiz.type === "lesson") {
            _push(`<span data-v-575d39c0>درس: ${ssrInterpolate(((_a = quiz.lessons) == null ? void 0 : _a.title) || quiz.lesson_id)}</span>`);
          } else if (quiz.type === "module") {
            _push(`<span data-v-575d39c0>وحدة ${ssrInterpolate(quiz.module_number)} في دورة: ${ssrInterpolate(((_b = quiz.study_courses) == null ? void 0 : _b.title) || quiz.course_id)}</span>`);
          } else if (quiz.type === "final") {
            _push(`<span data-v-575d39c0>دورة: ${ssrInterpolate(((_c = quiz.study_courses) == null ? void 0 : _c.title) || quiz.course_id)}</span>`);
          } else if (quiz.type === "practice") {
            _push(`<span data-v-575d39c0>تدريبي</span>`);
          } else {
            _push(`<span data-v-575d39c0>--</span>`);
          }
          _push(`</td><td class="px-6 py-4 whitespace-nowrap text-center" data-v-575d39c0><span class="${ssrRenderClass(["px-2 inline-flex text-xs leading-5 font-semibold rounded-full", quiz.is_active ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300"])}" data-v-575d39c0>${ssrInterpolate(quiz.is_active ? "نشط" : "غير نشط")}</span></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-v-575d39c0>${ssrInterpolate(formatDate(quiz.created_at))}</td><td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium rtl:text-right space-x-2 rtl:space-x-reverse" data-v-575d39c0>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/quizzes/${quiz.id}/questions`,
            class: "text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300",
            title: "إدارة الأسئلة"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`الأسئلة`);
              } else {
                return [
                  createTextVNode("الأسئلة")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="تعديل الاختبار" data-v-575d39c0>تعديل</button><button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="حذف الاختبار" data-v-575d39c0>حذف</button></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      } else if (!pending.value) {
        _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-575d39c0> لا توجد اختبارات تم إنشاؤها بعد. <button class="ml-2 text-indigo-600 hover:underline" data-v-575d39c0>إنشاء أول اختبار</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_LazyAdminQuizCreateEditModal, {
        modelValue: showModal.value,
        "onUpdate:modelValue": ($event) => showModal.value = $event,
        "quiz-data": selectedQuizForEdit.value,
        onSaved: handleQuizSaved,
        onClosed: handleModalClosed
      }, null, _parent));
      _push(ssrRenderComponent(_component_LazyAdminConfirmationModal, {
        modelValue: showDeleteConfirm.value,
        "onUpdate:modelValue": ($event) => showDeleteConfirm.value = $event,
        config: deleteConfirmConfig.value,
        onConfirm: deleteQuiz,
        onClose: ($event) => quizToDelete.value = null
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=index.vue3.mjs.map
