import __nuxt_component_0 from "../../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, shallowRef, computed, mergeProps, withCtx, createTextVNode, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate, ssrRenderComponent, ssrRenderClass } from "vue/server-renderer";
import LoadingSpinner from "../../../components/LoadingSpinner.vue.mjs";
import { debounce } from "lodash-es";
import { useSupabaseClient } from "../../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useHead } from "../../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
import { useRouter, useRoute } from "../../../node_modules/nuxt/dist/app/composables/router.mjs";
const DEFAULT_STATUS_FILTER = "pending_manual";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    useRouter();
    const route = useRoute();
    const selectedStatus = ref(route.query.status || DEFAULT_STATUS_FILTER);
    const selectedCourseId = ref(route.query.courseId ? Number(route.query.courseId) : null);
    const selectedQuizId = ref(route.query.quizId ? Number(route.query.quizId) : null);
    const selectedStudentId = ref(route.query.studentId || null);
    const selectedStudentName = ref(null);
    const studentSearchTerm = ref("");
    const showStudentDropdown = ref(false);
    const coursesList = ref([]);
    const quizzesListBasedOnCourse = ref([]);
    const filteredStudentsList = ref([]);
    const loadingCourses = ref(false);
    const loadingQuizzes = ref(false);
    const loadingStudents = ref(false);
    const attempts = shallowRef([]);
    ref(0);
    const loadingMore = ref(false);
    const hasMoreAttempts = ref(true);
    const pending = ref(false);
    const error = ref(null);
    ref(null);
    const fetchStudentsDebounced = async (searchTerm) => {
      if (!searchTerm || searchTerm.trim().length < 2) {
        filteredStudentsList.value = [];
        loadingStudents.value = false;
        return;
      }
      loadingStudents.value = true;
      try {
        const { data, error: fetchError } = await supabase.from("profiles").select("id, full_name").ilike("full_name", `%${searchTerm.trim()}%`).limit(15);
        if (fetchError) throw fetchError;
        filteredStudentsList.value = data ?? [];
      } catch (err) {
        console.error("Error searching students:", err.message);
        filteredStudentsList.value = [];
      } finally {
        loadingStudents.value = false;
      }
    };
    debounce(() => fetchStudentsDebounced(studentSearchTerm.value), 350);
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      try {
        return new Date(dateString).toLocaleString("ar-EG", {
          // Example locale
          dateStyle: "medium",
          timeStyle: "short"
        });
      } catch (e) {
        console.error("Error formatting date:", e);
        return dateString;
      }
    };
    const getGradingStatusText = (status) => {
      switch (status) {
        case "pending_manual":
          return "يحتاج تصحيح يدوي";
        case "graded":
          return "تم تصحيحه";
        case "auto_graded":
          return "تم تصحيحه آلياً";
        case "pending":
          return "قيد المراجعة (آلي)";
        default:
          return "غير معروف";
      }
    };
    const getStatusBadgeClass = (status) => {
      const baseClass = "px-2.5 py-0.5 rounded-full text-xs font-medium inline-block";
      switch (status) {
        case "pending_manual":
          return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200`;
        case "graded":
          return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200`;
        case "auto_graded":
          return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200`;
        case "pending":
          return `${baseClass} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300`;
        default:
          return `${baseClass} bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400`;
      }
    };
    const hasActiveFilters = computed(() => {
      return selectedStatus.value !== DEFAULT_STATUS_FILTER || selectedCourseId.value !== null || selectedQuizId.value !== null || selectedStudentId.value !== null;
    });
    useHead({ title: "تصحيح الاختبارات - لوحة التحكم" });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-4 sm:p-6" }, _attrs))} data-v-361518fc><h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6" data-v-361518fc>تصحيح الاختبارات</h1><div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 shadow-sm" data-v-361518fc><h2 class="text-lg font-medium text-gray-700 dark:text-gray-300 mb-3" data-v-361518fc>تصفية المحاولات</h2><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-v-361518fc><div data-v-361518fc><label for="statusFilter" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" data-v-361518fc>حالة التصحيح:</label><select id="statusFilter" class="input-field" data-v-361518fc><option${ssrRenderAttr("value", null)} data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedStatus.value) ? ssrLooseContain(selectedStatus.value, null) : ssrLooseEqual(selectedStatus.value, null)) ? " selected" : ""}>الكل</option><option value="pending_manual" data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedStatus.value) ? ssrLooseContain(selectedStatus.value, "pending_manual") : ssrLooseEqual(selectedStatus.value, "pending_manual")) ? " selected" : ""}>يحتاج تصحيح يدوي</option><option value="graded" data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedStatus.value) ? ssrLooseContain(selectedStatus.value, "graded") : ssrLooseEqual(selectedStatus.value, "graded")) ? " selected" : ""}>تم تصحيحه</option><option value="auto_graded" data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedStatus.value) ? ssrLooseContain(selectedStatus.value, "auto_graded") : ssrLooseEqual(selectedStatus.value, "auto_graded")) ? " selected" : ""}>تم تصحيحه آلياً</option><option value="pending" data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedStatus.value) ? ssrLooseContain(selectedStatus.value, "pending") : ssrLooseEqual(selectedStatus.value, "pending")) ? " selected" : ""}>قيد المراجعة (آلي)</option></select></div><div data-v-361518fc><label for="courseFilter" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" data-v-361518fc>الدورة:</label><select id="courseFilter" class="input-field" data-v-361518fc><option${ssrRenderAttr("value", null)} data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedCourseId.value) ? ssrLooseContain(selectedCourseId.value, null) : ssrLooseEqual(selectedCourseId.value, null)) ? " selected" : ""}>كل الدورات</option><!--[-->`);
      ssrRenderList(coursesList.value, (course) => {
        _push(`<option${ssrRenderAttr("value", course.id)} data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedCourseId.value) ? ssrLooseContain(selectedCourseId.value, course.id) : ssrLooseEqual(selectedCourseId.value, course.id)) ? " selected" : ""}>${ssrInterpolate(course.title)}</option>`);
      });
      _push(`<!--]-->`);
      if (loadingCourses.value) {
        _push(`<option disabled data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedCourseId.value) ? ssrLooseContain(selectedCourseId.value, null) : ssrLooseEqual(selectedCourseId.value, null)) ? " selected" : ""}>جارٍ تحميل الدورات...</option>`);
      } else if (!loadingCourses.value && coursesList.value.length === 0) {
        _push(`<option disabled data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedCourseId.value) ? ssrLooseContain(selectedCourseId.value, null) : ssrLooseEqual(selectedCourseId.value, null)) ? " selected" : ""}>لا توجد دورات متاحة</option>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</select></div><div data-v-361518fc><label for="quizFilter" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" data-v-361518fc>الاختبار:</label><select id="quizFilter" class="input-field"${ssrIncludeBooleanAttr(!selectedCourseId.value || loadingQuizzes.value || quizzesListBasedOnCourse.value.length === 0) ? " disabled" : ""} data-v-361518fc><option${ssrRenderAttr("value", null)} data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedQuizId.value) ? ssrLooseContain(selectedQuizId.value, null) : ssrLooseEqual(selectedQuizId.value, null)) ? " selected" : ""}>كل الاختبارات ${ssrInterpolate(selectedCourseId.value ? "في الدورة المحددة" : "")}</option><!--[-->`);
      ssrRenderList(quizzesListBasedOnCourse.value, (quiz) => {
        _push(`<option${ssrRenderAttr("value", quiz.id)} data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedQuizId.value) ? ssrLooseContain(selectedQuizId.value, quiz.id) : ssrLooseEqual(selectedQuizId.value, quiz.id)) ? " selected" : ""}>${ssrInterpolate(quiz.title)}</option>`);
      });
      _push(`<!--]-->`);
      if (loadingQuizzes.value) {
        _push(`<option disabled data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedQuizId.value) ? ssrLooseContain(selectedQuizId.value, null) : ssrLooseEqual(selectedQuizId.value, null)) ? " selected" : ""}>جارٍ تحميل الاختبارات...</option>`);
      } else if (selectedCourseId.value && !loadingQuizzes.value && quizzesListBasedOnCourse.value.length === 0) {
        _push(`<option disabled data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedQuizId.value) ? ssrLooseContain(selectedQuizId.value, null) : ssrLooseEqual(selectedQuizId.value, null)) ? " selected" : ""}>لا توجد اختبارات في هذه الدورة</option>`);
      } else if (!selectedCourseId.value) {
        _push(`<option disabled data-v-361518fc${ssrIncludeBooleanAttr(Array.isArray(selectedQuizId.value) ? ssrLooseContain(selectedQuizId.value, null) : ssrLooseEqual(selectedQuizId.value, null)) ? " selected" : ""}>اختر دورة أولاً</option>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</select></div><div class="relative" data-v-361518fc><label for="studentSearch" class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1" data-v-361518fc>الطالب:</label><input type="text" id="studentSearch"${ssrRenderAttr("value", studentSearchTerm.value)} placeholder="ابحث بالاسم أو المعرف..." class="input-field" autocomplete="off" aria-autocomplete="list"${ssrRenderAttr("aria-expanded", showStudentDropdown.value && (loadingStudents.value || filteredStudentsList.value.length > 0))} aria-controls="student-results-list" data-v-361518fc>`);
      if (showStudentDropdown.value && (loadingStudents.value || filteredStudentsList.value.length > 0)) {
        _push(`<div class="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto" id="student-results-list" role="listbox" data-v-361518fc>`);
        if (loadingStudents.value) {
          _push(`<div class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400" data-v-361518fc>جارٍ البحث...</div>`);
        } else {
          _push(`<ul role="presentation" data-v-361518fc><!--[-->`);
          ssrRenderList(filteredStudentsList.value, (student) => {
            _push(`<li role="option"${ssrRenderAttr("aria-selected", student.id === selectedStudentId.value)} class="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-primary-800/50 cursor-pointer" data-v-361518fc>${ssrInterpolate(student.full_name)} (ID: ${ssrInterpolate(student.id.substring(0, 8))}...) </li>`);
          });
          _push(`<!--]-->`);
          if (filteredStudentsList.value.length === 0 && !loadingStudents.value && studentSearchTerm.value.length > 1) {
            _push(`<li class="px-4 py-2 text-sm text-gray-500 dark:text-gray-400" data-v-361518fc> لا توجد نتائج مطابقة. </li>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</ul>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (selectedStudentId.value && selectedStudentName.value) {
        _push(`<div class="mt-1 text-xs text-gray-500 dark:text-gray-400" data-v-361518fc> الطالب المحدد: ${ssrInterpolate(selectedStudentName.value)} <button class="text-red-500 hover:text-red-700 ms-1 text-xxs font-medium focus:outline-none" aria-label="إلغاء اختيار الطالب" data-v-361518fc>(إلغاء)</button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="mt-4 text-right border-t pt-4 dark:border-gray-700" data-v-361518fc>`);
      if (hasActiveFilters.value) {
        _push(`<button class="button-secondary text-sm" data-v-361518fc> إعادة تعيين كل الفلاتر </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (pending.value && attempts.value.length === 0) {
        _push(`<div class="text-center py-10" data-v-361518fc>`);
        _push(ssrRenderComponent(LoadingSpinner, { class: "w-10 h-10 text-primary" }, null, _parent));
        _push(`<p class="mt-3 text-gray-500 dark:text-gray-400" data-v-361518fc>جارٍ تحميل المحاولات...</p></div>`);
      } else if (error.value) {
        _push(`<div class="error-box mt-6" data-v-361518fc><p data-v-361518fc>حدث خطأ أثناء تحميل المحاولات:</p><pre class="mt-2 text-sm bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-x-auto" data-v-361518fc>${ssrInterpolate(error.value.message)}</pre><button class="button-secondary mt-4" data-v-361518fc>إعادة المحاولة</button></div>`);
      } else if (attempts.value.length === 0 && !pending.value) {
        _push(`<div class="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg mt-6 border dark:border-gray-700" data-v-361518fc><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500" data-v-361518fc><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" data-v-361518fc></path></svg><p class="mt-3 font-medium text-gray-700 dark:text-gray-300" data-v-361518fc>${ssrInterpolate(hasActiveFilters.value ? "لا توجد محاولات تطابق معايير التصفية الحالية." : "لا توجد محاولات لعرضها.")}</p>`);
        if (hasActiveFilters.value) {
          _push(`<button class="button-secondary text-sm mt-4" data-v-361518fc> إلغاء الفلاتر وعرض الكل </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg border dark:border-gray-700 mt-6" data-v-361518fc><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" data-v-361518fc><thead class="bg-gray-50 dark:bg-gray-700/50" data-v-361518fc><tr data-v-361518fc><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" data-v-361518fc>المعرف</th><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" data-v-361518fc>الاختبار</th><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" data-v-361518fc>الطالب</th><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" data-v-361518fc>الحالة</th><th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" data-v-361518fc>تاريخ الإرسال</th><th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" data-v-361518fc>إجراء</th></tr></thead><tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" data-v-361518fc><!--[-->`);
        ssrRenderList(attempts.value, (attempt) => {
          var _a, _b, _c;
          _push(`<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 ease-in-out" data-v-361518fc><td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 dark:text-gray-400" data-v-361518fc>#${ssrInterpolate(attempt.id)}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300" data-v-361518fc>${ssrInterpolate(((_a = attempt.quizzes) == null ? void 0 : _a.title) ?? "اختبار غير متاح")}</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300" data-v-361518fc>${ssrInterpolate(((_b = attempt.profiles) == null ? void 0 : _b.full_name) ?? `مستخدم (${attempt.user_id.substring(0, 8)}...)`)}</td><td class="px-6 py-4 whitespace-nowrap text-sm" data-v-361518fc><span class="${ssrRenderClass(getStatusBadgeClass(attempt.grading_status))}" data-v-361518fc>${ssrInterpolate(getGradingStatusText(attempt.grading_status))}</span></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-v-361518fc>${ssrInterpolate(formatDate(attempt.submitted_at))}</td><td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium" data-v-361518fc>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/admin/grading/${attempt.id}`,
            class: [
              "font-medium transition-colors duration-150 ease-in-out px-3 py-1 rounded",
              attempt.grading_status === "pending_manual" ? "text-primary-700 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30" : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            ],
            "aria-label": `تصحيح أو عرض محاولة الطالب ${((_c = attempt.profiles) == null ? void 0 : _c.full_name) ?? attempt.user_id}`
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(attempt.grading_status === "pending_manual" ? "بدء التصحيح" : "عرض المحاولة")}`);
              } else {
                return [
                  createTextVNode(toDisplayString(attempt.grading_status === "pending_manual" ? "بدء التصحيح" : "عرض المحاولة"), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      _push(`<div class="h-20 flex justify-center items-center mt-6" data-v-361518fc>`);
      if (loadingMore.value) {
        _push(ssrRenderComponent(LoadingSpinner, { class: "w-6 h-6 text-primary" }, null, _parent));
      } else if (!hasMoreAttempts.value && attempts.value.length > 0 && !pending.value) {
        _push(`<span class="text-sm text-gray-500 dark:text-gray-400" data-v-361518fc>وصلت إلى نهاية القائمة.</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=index.vue3.mjs.map
