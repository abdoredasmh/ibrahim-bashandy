import { defineComponent, ref, mergeProps } from "vue";
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import AdminStatCard from "../../components/admin/AdminStatCard.vue.vue.mjs";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const stats = ref({
      totalUsers: null,
      totalComments: null,
      totalEnrollments: null,
      totalCompletions: null,
      totalBooks: null,
      totalLessons: null,
      totalCourses: null,
      totalQuizzes: null,
      totalQuestionsToSheikh: null,
      unansweredQuestions: null,
      unreadNotifications: null,
      totalQuizAttempts: null,
      totalLessonViews: null,
      totalBookDownloads: null
    });
    const isLoading = ref(true);
    const error = ref(null);
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen" }, _attrs))} data-v-847d0b30><div class="flex justify-between items-center mb-6" data-v-847d0b30><h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200" data-v-847d0b30> 📊 لوحة الإحصائيات </h1><button${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""} class="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center" data-v-847d0b30>`);
      if (isLoading.value) {
        _push(`<svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-847d0b30><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-847d0b30></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-847d0b30></path></svg>`);
      } else {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-v-847d0b30><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0115.357 2m0 0H15" data-v-847d0b30></path></svg>`);
      }
      _push(` ${ssrInterpolate(isLoading.value ? "جاري التحديث..." : "تحديث")}</button></div>`);
      if (isLoading.value && !stats.value.totalUsers) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" data-v-847d0b30><!--[-->`);
        ssrRenderList(12, (n) => {
          _push(`<div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse" data-v-847d0b30><div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" data-v-847d0b30></div><div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2" data-v-847d0b30></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (error.value) {
        _push(`<div class="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-6 rounded-lg shadow border border-red-200 dark:border-red-800" data-v-847d0b30><h3 class="text-lg font-semibold mb-2" data-v-847d0b30>حدث خطأ!</h3><p class="mb-4" data-v-847d0b30>لم نتمكن من جلب بيانات لوحة الإحصائيات.</p><p class="text-sm text-gray-600 dark:text-gray-400 mb-4" data-v-847d0b30>الخطأ: ${ssrInterpolate(error.value.message || "غير معروف")}</p><button${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""} class="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center mx-auto" data-v-847d0b30><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-v-847d0b30><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0115.357 2m0 0H15" data-v-847d0b30></path></svg> إعادة المحاولة </button></div>`);
      } else {
        _push(`<div class="space-y-8" data-v-847d0b30><section data-v-847d0b30><h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700" data-v-847d0b30> المستخدمون والتفاعل </h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" data-v-847d0b30>`);
        _push(ssrRenderComponent(AdminStatCard, {
          title: "إجمالي المستخدمين",
          value: stats.value.totalUsers,
          icon: "users",
          "link-to": "/admin/users",
          "is-loading": isLoading.value,
          tooltip: "إجمالي عدد المستخدمين المسجلين"
        }, null, _parent));
        _push(ssrRenderComponent(AdminStatCard, {
          title: "إجمالي التعليقات",
          value: stats.value.totalComments,
          icon: "comments",
          "link-to": "/admin/comments",
          "is-loading": isLoading.value,
          tooltip: "إجمالي عدد التعليقات على الدروس"
        }, null, _parent));
        _push(ssrRenderComponent(AdminStatCard, {
          title: "التسجيلات بالدورات",
          value: stats.value.totalEnrollments,
          icon: "graduation-cap",
          "link-to": "/admin/enrollments",
          "is-loading": isLoading.value,
          tooltip: "إجمالي عدد مرات تسجيل المستخدمين في الدورات"
        }, null, _parent));
        _push(ssrRenderComponent(AdminStatCard, {
          title: "إكمالات الدروس",
          value: stats.value.totalCompletions,
          icon: "check-circle",
          "link-to": "/admin/completions",
          "is-loading": isLoading.value,
          tooltip: "إجمالي عدد الدروس التي تم إكمالها بواسطة المستخدمين"
        }, null, _parent));
        _push(`</div></section><section data-v-847d0b30><h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700" data-v-847d0b30> المحتوى التعليمي </h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" data-v-847d0b30>`);
        _push(ssrRenderComponent(AdminStatCard, {
          title: "إجمالي الكتب",
          value: stats.value.totalBooks,
          icon: "book",
          "link-to": "/admin/books",
          "is-loading": isLoading.value,
          tooltip: "إجمالي عدد الكتب المتاحة"
        }, null, _parent));
        _push(ssrRenderComponent(AdminStatCard, {
          title: "إجمالي الدروس",
          value: stats.value.totalLessons,
          icon: "video",
          "link-to": "/admin/lessons",
          "is-loading": isLoading.value,
          tooltip: "إجمالي عدد الدروس المتاحة"
        }, null, _parent));
        _push(ssrRenderComponent(AdminStatCard, {
          title: "إجمالي الدورات",
          value: stats.value.totalCourses,
          icon: "chalkboard-teacher",
          "link-to": "/admin/courses",
          "is-loading": isLoading.value,
          tooltip: "إجمالي عدد الدورات التدريبية المتاحة"
        }, null, _parent));
        _push(ssrRenderComponent(AdminStatCard, {
          title: "إجمالي الاختبارات",
          value: stats.value.totalQuizzes,
          icon: "question-circle",
          "link-to": "/admin/quizzes",
          "is-loading": isLoading.value,
          tooltip: "إجمالي عدد الاختبارات المتاحة"
        }, null, _parent));
        _push(`</div></section><section data-v-847d0b30><h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700" data-v-847d0b30> الاستفسارات والتنبيهات </h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" data-v-847d0b30>`);
        _push(ssrRenderComponent(AdminStatCard, {
          title: "أسئلة للشيخ",
          value: stats.value.totalQuestionsToSheikh,
          icon: "question",
          "link-to": "/admin/questions-sheikh",
          "is-loading": isLoading.value,
          tooltip: "إجمالي الأسئلة الموجهة للشيخ"
        }, null, _parent));
        _push(ssrRenderComponent(AdminStatCard, {
          title: "أسئلة بانتظار الرد",
          value: stats.value.unansweredQuestions,
          icon: "clock",
          warning: stats.value.unansweredQuestions !== null && stats.value.unansweredQuestions > 0,
          "link-to": "/admin/questions-sheikh?filter=unanswered",
          "is-loading": isLoading.value,
          tooltip: "عدد الأسئلة الموجهة للشيخ ولم يتم الرد عليها بعد"
        }, null, _parent));
        _push(ssrRenderComponent(AdminStatCard, {
          title: "إشعارات غير مقروءة",
          value: stats.value.unreadNotifications,
          icon: "bell",
          warning: stats.value.unreadNotifications !== null && stats.value.unreadNotifications > 0,
          "link-to": "/admin/notifications",
          "is-loading": isLoading.value,
          tooltip: "عدد الإشعارات الهامة التي لم يتم الاطلاع عليها"
        }, null, _parent));
        _push(ssrRenderComponent(AdminStatCard, {
          title: "محاولات الاختبارات",
          value: stats.value.totalQuizAttempts,
          icon: "file-alt",
          "link-to": "/admin/quiz-attempts",
          "is-loading": isLoading.value,
          tooltip: "إجمالي عدد المحاولات التي أجراها المستخدمون للاختبارات"
        }, null, _parent));
        _push(`</div></section>`);
        if (stats.value.totalLessonViews !== null || stats.value.totalBookDownloads !== null) {
          _push(`<section data-v-847d0b30><h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700" data-v-847d0b30> إحصائيات الموقع </h2><div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" data-v-847d0b30>`);
          if (stats.value.totalLessonViews !== null) {
            _push(ssrRenderComponent(AdminStatCard, {
              title: "مشاهدات الدروس",
              value: stats.value.totalLessonViews,
              icon: "eye",
              "is-loading": isLoading.value,
              tooltip: "إجمالي عدد مرات مشاهدة الدروس"
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          if (stats.value.totalBookDownloads !== null) {
            _push(ssrRenderComponent(AdminStatCard, {
              title: "تحميلات الكتب",
              value: stats.value.totalBookDownloads,
              icon: "download",
              "is-loading": isLoading.value,
              tooltip: "إجمالي عدد مرات تحميل الكتب"
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=index.vue3.mjs.map
