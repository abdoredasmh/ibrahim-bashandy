import __nuxt_component_0 from "../../../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import __nuxt_component_1 from "../../../../node_modules/nuxt/dist/app/components/client-only.mjs";
import { defineComponent, computed, shallowRef, ref, withAsyncContext, watch, mergeProps, unref, withCtx, createBlock, createVNode, openBlock, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr } from "vue/server-renderer";
import LoadingSpinner from "../../../../components/LoadingSpinner.vue.mjs";
import { useUserStore } from "../../../../stores/user.mjs";
import { storeToRefs } from "../../../../node_modules/pinia/dist/pinia.mjs";
import { useSupabaseClient } from "../../../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useAsyncData } from "../../../../node_modules/nuxt/dist/app/composables/asyncData.mjs";
import { useRoute } from "../../../../node_modules/nuxt/dist/app/composables/router.mjs";
import { useHead } from "../../../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
import { showError, createError } from "../../../../node_modules/nuxt/dist/app/composables/error.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const supabase = useSupabaseClient();
    const route = useRoute();
    const userStore = useUserStore();
    const { profile, isLoggedIn } = storeToRefs(userStore);
    const courseId = computed(() => {
      const id = parseInt(route.params.courseId, 10);
      if (isNaN(id) || id <= 0) {
        showError({ statusCode: 400, statusMessage: `معرف الدورة غير صالح: "${route.params.courseId}"`, fatal: true });
        return NaN;
      }
      return id;
    });
    const course = shallowRef(null);
    const courseModulesData = shallowRef([]);
    const courseLessonsData = shallowRef([]);
    const courseQuizzesData = shallowRef([]);
    const userQuizAttempts = shallowRef([]);
    const categoryName = shallowRef(null);
    const enrollment = shallowRef(null);
    const completedLessonIds = shallowRef([]);
    ref(false);
    if (isNaN(courseId.value)) {
      console.error("Course ID is invalid, stopping component setup.");
    }
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(async () => {
      var _a;
      return useAsyncData(
        // مفتاح فريد لتخزين البيانات: يعتمد على معرف الدورة ومعرف المستخدم (للتحديث عند تسجيل الدخول/الخروج)
        `course-page-data-${courseId.value}-${((_a = profile.value) == null ? void 0 : _a.id) ?? "guest"}`,
        // الدالة الفعلية التي تقوم بالجلب
        async () => {
          var _a2, _b, _c, _d;
          const currentCourseId = courseId.value;
          if (isNaN(currentCourseId)) {
            throw createError({ statusCode: 400, message: "معرف الدورة غير صالح عند بدء الجلب.", fatal: true });
          }
          const currentUserId = (_a2 = profile.value) == null ? void 0 : _a2.id;
          console.log(`[useAsyncData] Fetching data for course ${currentCourseId}, User ${currentUserId ?? "Guest"}`);
          try {
            console.log("[useAsyncData] Fetching main course data, category, modules, lessons...");
            const { data: courseBaseData, error: courseFetchError } = await supabase.from("study_courses").select(`
                    *,
                    category:categories ( name ),
                    modules:course_modules!course_id ( id, title, module_number ),
                    lessons:lessons!course_id ( id, title, lesson_order, module_number, created_at )
                `).eq("id", currentCourseId).eq("is_active", true).single();
            if (courseFetchError) {
              console.error("[useAsyncData] Error fetching base course data:", courseFetchError);
              throw createError({ statusCode: 500, statusMessage: `فشل جلب بيانات الدورة الرئيسية: ${courseFetchError.message}`, fatal: true });
            }
            if (!courseBaseData) {
              console.warn(`[useAsyncData] Course ${currentCourseId} not found or inactive.`);
              throw createError({ statusCode: 404, message: "الدورة المطلوبة غير موجودة أو غير نشطة.", fatal: true });
            }
            const fetchedCourse = { ...courseBaseData, category: void 0, modules: void 0, lessons: void 0 };
            const fetchedModules = ((_b = courseBaseData.modules) == null ? void 0 : _b.sort((a, b) => (a.module_number ?? Infinity) - (b.module_number ?? Infinity))) ?? [];
            const fetchedLessons = ((_c = courseBaseData.lessons) == null ? void 0 : _c.sort((a, b) => {
              const moduleCompare = (a.module_number ?? Infinity) - (b.module_number ?? Infinity);
              if (moduleCompare !== 0) return moduleCompare;
              const orderCompare = (a.lesson_order ?? Infinity) - (b.lesson_order ?? Infinity);
              if (orderCompare !== 0) return orderCompare;
              return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
            })) ?? [];
            const fetchedCategoryName = ((_d = courseBaseData.category) == null ? void 0 : _d.name) ?? null;
            const lessonIds = fetchedLessons.map((l) => l.id);
            console.log("[useAsyncData] Fetching course-level and lesson-level quizzes...");
            let fetchedQuizzes = [];
            const { data: courseLinkedQuizzes, error: courseQuizError } = await supabase.from("quizzes").select("id, title, lesson_id, module_number, course_id, is_active").eq("course_id", currentCourseId).eq("is_active", true);
            if (courseQuizError) console.error("Error fetching course-linked quizzes:", courseQuizError.message);
            else fetchedQuizzes = fetchedQuizzes.concat(courseLinkedQuizzes ?? []);
            if (lessonIds.length > 0) {
              const { data: lessonLinkedQuizzes, error: lessonQuizError } = await supabase.from("quizzes").select("id, title, lesson_id, module_number, course_id, is_active").in("lesson_id", lessonIds).eq("is_active", true);
              if (lessonQuizError) console.error("Error fetching lesson-linked quizzes:", lessonQuizError.message);
              else fetchedQuizzes = fetchedQuizzes.concat(lessonLinkedQuizzes ?? []);
            }
            fetchedQuizzes = Array.from(new Map(fetchedQuizzes.map((q) => [q.id, q])).values());
            console.log(`[useAsyncData] Total active quizzes fetched: ${fetchedQuizzes.length}`);
            console.log("[useAsyncData] Fetching user-specific data...");
            let fetchedEnrollment = null;
            let fetchedCompletions = [];
            let fetchedAttempts = [];
            const quizIds = fetchedQuizzes.map((q) => q.id);
            if (isLoggedIn.value && currentUserId) {
              const [enrollmentRes, completionsRes, attemptsRes] = await Promise.all([
                supabase.from("course_enrollments").select("*").eq("user_id", currentUserId).eq("course_id", currentCourseId).maybeSingle(),
                lessonIds.length > 0 ? supabase.from("lesson_completions").select("lesson_id").eq("user_id", currentUserId).in("lesson_id", lessonIds) : Promise.resolve({ data: [], error: null }),
                quizIds.length > 0 ? supabase.from("quiz_attempts").select("id, quiz_id, passed, submitted_at").eq("user_id", currentUserId).in("quiz_id", quizIds) : Promise.resolve({ data: [], error: null })
              ]);
              if (enrollmentRes.error) console.error("Enrollment fetch error:", enrollmentRes.error.message);
              else fetchedEnrollment = enrollmentRes.data;
              if (completionsRes.error) console.error("Completions fetch error:", completionsRes.error.message);
              else fetchedCompletions = completionsRes.data ?? [];
              if (attemptsRes.error) console.error("Attempts fetch error:", attemptsRes.error.message);
              else fetchedAttempts = attemptsRes.data ?? [];
              console.log(`[useAsyncData] User data fetched. Enrolled: ${!!fetchedEnrollment}, Completions: ${fetchedCompletions.length}, Attempts: ${fetchedAttempts.length}`);
            } else {
              console.log("[useAsyncData] User not logged in, skipping user-specific data fetch.");
            }
            console.log("[useAsyncData] Fetch process complete.");
            return {
              course: fetchedCourse,
              modules: fetchedModules,
              lessons: fetchedLessons,
              quizzes: fetchedQuizzes,
              // القائمة المدمجة للاختبارات
              categoryName: fetchedCategoryName,
              enrollment: fetchedEnrollment,
              completions: fetchedCompletions,
              attempts: fetchedAttempts
            };
          } catch (err) {
            console.error("[useAsyncData] CRITICAL ERROR during data fetching:", err);
            if (err.statusCode && err.fatal) {
              throw err;
            }
            showError({ statusCode: err.statusCode || 500, message: `حدث خطأ غير متوقع أثناء تحميل بيانات الدورة: ${err.message || "خطأ غير معروف"}`, fatal: true });
            return { course: null, modules: [], lessons: [], quizzes: [], attempts: [], categoryName: null, enrollment: null, completions: [] };
          }
        },
        {
          // القيمة الافتراضية أثناء التحميل أو في حالة عدم وجود بيانات
          default: () => ({
            course: null,
            modules: [],
            lessons: [],
            quizzes: [],
            attempts: [],
            categoryName: null,
            enrollment: null,
            completions: []
          }),
          // إعادة الجلب عند تغير معرف المستخدم (تسجيل الدخول/الخروج)
          watch: [() => {
            var _a2;
            return (_a2 = profile.value) == null ? void 0 : _a2.id;
          }]
        }
      );
    }), __temp = await __temp, __restore(), __temp);
    watch(data, (newData) => {
      console.log("[Watcher] Updating local state from fetched data.");
      course.value = (newData == null ? void 0 : newData.course) ?? null;
      courseModulesData.value = Array.isArray(newData == null ? void 0 : newData.modules) ? newData.modules : [];
      courseLessonsData.value = Array.isArray(newData == null ? void 0 : newData.lessons) ? newData.lessons : [];
      courseQuizzesData.value = Array.isArray(newData == null ? void 0 : newData.quizzes) ? newData.quizzes : [];
      userQuizAttempts.value = Array.isArray(newData == null ? void 0 : newData.attempts) ? newData.attempts : [];
      categoryName.value = (newData == null ? void 0 : newData.categoryName) ?? null;
      enrollment.value = (newData == null ? void 0 : newData.enrollment) ?? null;
      completedLessonIds.value = Array.isArray(newData == null ? void 0 : newData.completions) ? newData.completions.map((c) => c.lesson_id) : [];
      console.log("[Watcher] Local state updated. Course:", !!course.value, "Lessons:", courseLessonsData.value.length, "Quizzes:", courseQuizzesData.value.length);
      if (!pending.value && !error.value && !(newData == null ? void 0 : newData.course)) {
        console.warn("[Watcher] No course data found after loading.");
      }
    }, { immediate: true });
    const isEnrolled = computed(() => !!enrollment.value);
    const totalLessonsCount = computed(() => courseLessonsData.value.length);
    const completedLessonsCount = computed(() => completedLessonIds.value.length);
    computed(() => {
      if (totalLessonsCount.value === 0) return 0;
      const validCompletedCount = Math.min(completedLessonsCount.value, totalLessonsCount.value);
      return Math.round(validCompletedCount / totalLessonsCount.value * 100);
    });
    const lessonQuizzesMap = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const quiz of courseQuizzesData.value) {
        if (quiz.lesson_id !== null && !isNaN(Number(quiz.lesson_id))) {
          const lessonIdNumber = Number(quiz.lesson_id);
          if (!map.has(lessonIdNumber)) {
            map.set(lessonIdNumber, []);
          }
          map.get(lessonIdNumber).push(quiz);
        }
      }
      map.forEach((quizzes) => quizzes.sort((a, b) => (a.title || "").localeCompare(b.title || "")));
      return map;
    });
    computed(() => {
      return courseQuizzesData.value.filter((q) => q.lesson_id === null && q.module_number === null).sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    });
    const groupedContent = computed(() => {
      var _a;
      const modulesMap = /* @__PURE__ */ new Map();
      for (const moduleInfo of courseModulesData.value) {
        if (moduleInfo.module_number !== null) {
          modulesMap.set(moduleInfo.module_number, {
            moduleNumber: moduleInfo.module_number,
            moduleTitle: moduleInfo.title || `الوحدة ${moduleInfo.module_number}`,
            // عنوان الوحدة أو عنوان افتراضي
            lessons: [],
            // قائمة فارغة مبدئية للدروس
            quizzes: []
            // قائمة فارغة مبدئية لاختبارات الوحدة
          });
        } else {
          console.warn(`Module ID ${moduleInfo.id} has null module_number.`);
        }
      }
      const generalGroupKey = "general";
      modulesMap.set(generalGroupKey, { moduleNumber: null, moduleTitle: "دروس أو اختبارات عامة", lessons: [], quizzes: [] });
      for (const lesson of courseLessonsData.value) {
        const key = lesson.module_number !== null ? lesson.module_number : generalGroupKey;
        const group = modulesMap.get(key);
        if (group) {
          group.lessons.push(lesson);
        } else {
          (_a = modulesMap.get(generalGroupKey)) == null ? void 0 : _a.lessons.push(lesson);
        }
      }
      for (const quiz of courseQuizzesData.value) {
        if (quiz.module_number !== null && quiz.lesson_id === null) {
          const group = modulesMap.get(quiz.module_number);
          if (group) {
            group.quizzes.push(quiz);
          } else {
            console.warn(`Module quiz ${quiz.id} (module ${quiz.module_number}) has no matching group.`);
          }
        }
      }
      modulesMap.forEach((group) => group.quizzes.sort((a, b) => (a.title || "").localeCompare(b.title || "")));
      const generalGroup = modulesMap.get(generalGroupKey);
      if (generalGroup && generalGroup.lessons.length === 0 && generalGroup.quizzes.length === 0) {
        modulesMap.delete(generalGroupKey);
      }
      const sortedGroups = Array.from(modulesMap.values()).sort((a, b) => {
        if (a.moduleNumber === null) return -1;
        if (b.moduleNumber === null) return 1;
        return a.moduleNumber - b.moduleNumber;
      });
      return sortedGroups;
    });
    const isLessonCompleted = (lessonId) => completedLessonIds.value.includes(lessonId);
    const getCourseImageUrl = (url) => url || "/images/placeholder-course.jpg";
    const lessonLink = (lessonId) => lessonId ? `/study/courses/${courseId.value}/lessons/${lessonId}` : "#";
    const hasPassedQuiz = (quizId) => {
      if (!quizId || !isLoggedIn.value) return false;
      const numericQuizId = Number(quizId);
      const attemptsForQuiz = userQuizAttempts.value.filter((att) => att.quiz_id === numericQuizId && att.submitted_at !== null).sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
      return attemptsForQuiz.length > 0 && attemptsForQuiz[0].passed === true;
    };
    const canAttemptQuiz = (quizId) => {
      return isLoggedIn.value && isEnrolled.value;
    };
    watch([course, pending, error], ([newCourse, loadingState, errorState]) => {
      var _a;
      let pageTitle = "تفاصيل الدورة";
      let description = "تصفح محتوى الدورة والدروس المتاحة.";
      if (loadingState) {
        pageTitle = "جارٍ تحميل الدورة...";
        description = "يتم الآن تحميل تفاصيل الدورة المطلوبة.";
      } else if (errorState && errorState.statusCode === 404) {
        pageTitle = "الدورة غير متاحة";
        description = "لم نتمكن من العثور على الدورة المطلوبة أو أنها غير نشطة حالياً.";
      } else if (errorState) {
        pageTitle = "خطأ في تحميل الدورة";
        description = `حدث خطأ أثناء تحميل بيانات الدورة: ${errorState.message}`;
      } else if (newCourse) {
        pageTitle = `دورة: ${newCourse.title}`;
        description = ((_a = newCourse.description) == null ? void 0 : _a.substring(0, 160)) || `تفاصيل ومحتوى دورة "${newCourse.title}".`;
      }
      useHead({
        title: pageTitle,
        // تعيين عنوان الصفحة
        meta: [
          { name: "description", content: description },
          // تعيين وصف الصفحة
          // إضافة علامات Open Graph لتحسين المشاركة على وسائل التواصل الاجتماعي (اختياري)
          { property: "og:title", content: pageTitle },
          { property: "og:description", content: description },
          { property: "og:type", content: "website" }
          // يمكنك إضافة og:image هنا إذا كان لديك رابط صورة الدورة
          // { property: 'og:image', content: getCourseImageUrl(newCourse?.image_url ?? null) },
        ]
      });
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ClientOnly = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8 md:py-12" }, _attrs))} data-v-6e3553fa>`);
      if (unref(pending)) {
        _push(`<div class="text-center py-20" data-v-6e3553fa>`);
        _push(ssrRenderComponent(LoadingSpinner, { class: "w-12 h-12 mx-auto text-primary" }, null, _parent));
        _push(`<p class="mt-4 text-base text-gray-600 dark:text-gray-400" data-v-6e3553fa>جارٍ تحميل تفاصيل الدورة...</p></div>`);
      } else if (unref(error) || !course.value) {
        _push(`<div class="text-center py-10 px-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg max-w-lg mx-auto shadow-md" data-v-6e3553fa><div class="flex justify-center items-center text-red-600 dark:text-red-400 mb-4" data-v-6e3553fa><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7" aria-hidden="true" data-v-6e3553fa><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" data-v-6e3553fa></path></svg><h2 class="text-xl font-semibold ms-2" data-v-6e3553fa>${ssrInterpolate(((_a = unref(error)) == null ? void 0 : _a.statusCode) === 404 || !course.value ? "الدورة غير متاحة" : ((_c = (_b = unref(error)) == null ? void 0 : _b.data) == null ? void 0 : _c.statusMessage) || ((_d = unref(error)) == null ? void 0 : _d.message) || "حدث خطأ")}</h2></div><p class="text-sm text-red-700 dark:text-red-300 mb-5" data-v-6e3553fa>${ssrInterpolate(((_f = (_e = unref(error)) == null ? void 0 : _e.data) == null ? void 0 : _f.message) || ((_g = unref(error)) == null ? void 0 : _g.message) || "لم نتمكن من العثور على الدورة المطلوبة أو حدث خطأ غير متوقع أثناء تحميلها.")}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/study",
          class: "button-secondary border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-800/60 hover:bg-red-200 dark:hover:bg-red-700/70 focus:ring-red-500 inline-flex items-center gap-1.5"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-1" aria-hidden="true" data-v-6e3553fa${_scopeId}><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" data-v-6e3553fa${_scopeId}></path></svg><span data-v-6e3553fa${_scopeId}>العودة لقائمة الدورات</span>`);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 20 20",
                  fill: "currentColor",
                  class: "w-5 h-5 ms-1",
                  "aria-hidden": "true"
                }, [
                  createVNode("path", {
                    "fill-rule": "evenodd",
                    d: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z",
                    "clip-rule": "evenodd"
                  })
                ])),
                createVNode("span", null, "العودة لقائمة الدورات")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (!unref(pending) && course.value) {
        _push(`<div class="course-details space-y-8 md:space-y-12" data-v-6e3553fa><header class="md:flex md:items-start md:gap-8 p-4 sm:p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-lg shadow-sm border dark:border-gray-700/50" data-v-6e3553fa><div class="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mb-4 md:mb-0" data-v-6e3553fa><img${ssrRenderAttr("src", getCourseImageUrl(course.value.image_url))}${ssrRenderAttr("alt", `غلاف دورة: ${course.value.title}`)} class="w-full aspect-video object-cover rounded-lg shadow-md" data-v-6e3553fa></div><div class="flex-grow" data-v-6e3553fa><h1 class="text-3xl font-bold text-brown-dark dark:text-beige-light mb-3" data-v-6e3553fa>${ssrInterpolate(course.value.title)}</h1>`);
        if (categoryName.value) {
          _push(`<p class="text-sm text-gray-500 dark:text-gray-400 mb-3" data-v-6e3553fa> الفئة: <span class="font-medium text-gray-700 dark:text-gray-300" data-v-6e3553fa>${ssrInterpolate(categoryName.value)}</span></p>`);
        } else {
          _push(`<!---->`);
        }
        if (course.value.description) {
          _push(`<p class="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed" data-v-6e3553fa>${ssrInterpolate(course.value.description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_ClientOnly, null, {
          fallback: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-full sm:w-40" data-v-6e3553fa${_scopeId}></div>`);
            } else {
              return [
                createVNode("div", { class: "h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-full sm:w-40" })
              ];
            }
          })
        }, _parent));
        _push(`</div></header><section class="course-content" data-v-6e3553fa><h2 class="text-2xl font-semibold text-brown-dark dark:text-beige-light mb-6" data-v-6e3553fa>محتوى الدورة</h2>`);
        if (groupedContent.value.length === 0) {
          _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed dark:border-gray-700" data-v-6e3553fa><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500" data-v-6e3553fa><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" data-v-6e3553fa></path></svg> سيتم إضافة محتوى لهذه الدورة قريبًا إن شاء الله. </div>`);
        } else {
          _push(`<div class="space-y-6" data-v-6e3553fa><!--[-->`);
          ssrRenderList(groupedContent.value, (moduleGroup) => {
            _push(`<div class="module-section bg-white dark:bg-gray-800/40 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" data-v-6e3553fa><div class="module-header flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700" data-v-6e3553fa><h3 class="text-lg font-semibold text-primary dark:text-primary-400" data-v-6e3553fa>`);
            if (moduleGroup.moduleNumber !== null) {
              _push(`<span class="font-mono me-1.5 text-sm opacity-80" data-v-6e3553fa>#${ssrInterpolate(moduleGroup.moduleNumber)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(` ${ssrInterpolate(moduleGroup.moduleTitle)}</h3>`);
            if (isEnrolled.value && moduleGroup.quizzes.length > 0) {
              _push(`<div class="flex flex-wrap gap-2" data-v-6e3553fa><!--[-->`);
              ssrRenderList(moduleGroup.quizzes, (quiz) => {
                _push(`<button class="${ssrRenderClass(["button-quiz-base button-quiz-module", { "passed": hasPassedQuiz(quiz.id) }])}"${ssrRenderAttr("title", hasPassedQuiz(quiz.id) ? `تم اجتياز الاختبار: ${quiz.title}` : quiz.title)}${ssrIncludeBooleanAttr(!canAttemptQuiz(quiz.id)) ? " disabled" : ""} data-v-6e3553fa>${ssrInterpolate(quiz.title || `اختبار الوحدة ${moduleGroup.moduleNumber}`)} `);
                if (hasPassedQuiz(quiz.id)) {
                  _push(`<span class="ms-1.5 text-xxs opacity-80 text-green-100" data-v-6e3553fa>(تم الاجتياز - عرض النتيجة)</span>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</button>`);
              });
              _push(`<!--]--></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
            if (moduleGroup.lessons.length > 0) {
              _push(`<ul class="space-y-2" data-v-6e3553fa><!--[-->`);
              ssrRenderList(moduleGroup.lessons, (lesson, index) => {
                _push(`<li class="${ssrRenderClass(["flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md transition-colors duration-150 gap-2 sm:gap-4", isLessonCompleted(lesson.id) ? "lesson-completed" : "lesson-incomplete"])}" data-v-6e3553fa><div class="flex items-center space-x-3 rtl:space-x-reverse flex-grow min-w-0" data-v-6e3553fa><span class="${ssrRenderClass(["lesson-status-icon", isLessonCompleted(lesson.id) ? "completed" : "incomplete"])}" aria-hidden="true" data-v-6e3553fa>`);
                if (isLessonCompleted(lesson.id)) {
                  _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-6e3553fa><path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.208Z" clip-rule="evenodd" data-v-6e3553fa></path></svg>`);
                } else {
                  _push(`<span class="font-mono" data-v-6e3553fa>${ssrInterpolate(lesson.lesson_order ?? index + 1)}</span>`);
                }
                _push(`</span>`);
                _push(ssrRenderComponent(_component_NuxtLink, {
                  to: lessonLink(lesson.id),
                  class: "lesson-title-link flex-1 min-w-0"
                }, {
                  default: withCtx((_, _push2, _parent2, _scopeId) => {
                    if (_push2) {
                      _push2(`<span class="truncate" data-v-6e3553fa${_scopeId}>${ssrInterpolate(lesson.title)}</span>`);
                    } else {
                      return [
                        createVNode("span", { class: "truncate" }, toDisplayString(lesson.title), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent));
                _push(`</div>`);
                if (isEnrolled.value && lessonQuizzesMap.value.get(lesson.id) && lessonQuizzesMap.value.get(lesson.id).length > 0) {
                  _push(`<div class="flex flex-wrap gap-1.5 mt-1 sm:mt-0 flex-shrink-0 w-full sm:w-auto justify-start sm:justify-end" data-v-6e3553fa><!--[-->`);
                  ssrRenderList(lessonQuizzesMap.value.get(lesson.id), (quiz) => {
                    _push(`<button class="${ssrRenderClass(["button-quiz-base button-quiz-lesson", { "passed": hasPassedQuiz(quiz.id) }])}"${ssrRenderAttr("title", hasPassedQuiz(quiz.id) ? `تم اجتياز الاختبار: ${quiz.title}` : quiz.title)}${ssrIncludeBooleanAttr(!canAttemptQuiz(quiz.id)) ? " disabled" : ""} data-v-6e3553fa>${ssrInterpolate(quiz.title || "اختبار الدرس")} `);
                    if (hasPassedQuiz(quiz.id)) {
                      _push(`<span class="ms-1 text-xxs opacity-80 text-indigo-800 dark:text-indigo-300" data-v-6e3553fa>(تم الاجتياز - عرض النتيجة)</span>`);
                    } else {
                      _push(`<!---->`);
                    }
                    _push(`</button>`);
                  });
                  _push(`<!--]--></div>`);
                } else {
                  _push(`<div class="h-[30px] flex-shrink-0 w-full sm:w-auto sm:min-w-[100px]" data-v-6e3553fa></div>`);
                }
                _push(`</li>`);
              });
              _push(`<!--]--></ul>`);
            } else {
              _push(`<p class="text-sm text-gray-500 dark:text-gray-400 italic px-3 py-4 text-center" data-v-6e3553fa>لا توجد دروس في هذه الوحدة بعد.</p>`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</section></div>`);
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
//# sourceMappingURL=index.vue2.mjs.map
