import { defineComponent, ref, reactive, withAsyncContext, watch, mergeProps, unref } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import CourseCard from "../../components/CourseCard.vue.mjs";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import { useUserStore } from "../../stores/user.mjs";
import { storeToRefs } from "../../node_modules/pinia/dist/pinia.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useAsyncData } from "../../node_modules/nuxt/dist/app/composables/asyncData.mjs";
import { useHead } from "../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
import { navigateTo } from "../../node_modules/nuxt/dist/app/composables/router.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const supabase = useSupabaseClient();
    const userStore = useUserStore();
    const { profile, isLoggedIn } = storeToRefs(userStore);
    const courses = ref([]);
    const userEnrollments = ref([]);
    const enrollLoadingState = reactive({});
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      "studyCoursesAndEnrollmentsList",
      // Unique key for this fetch operation
      async () => {
        var _a, _b;
        const userId = (_a = profile.value) == null ? void 0 : _a.id;
        console.log(`[useAsyncData] Fetching study data. User ID: ${userId ?? "Guest"}`);
        const results = await Promise.allSettled([
          // Query 1: Fetch Active Courses with Lesson Count and Category Name
          supabase.from("study_courses").select(`
                  *,
                  lessons!fk_lessons_course_id(count),
                  category:categories ( name )
                `).eq("is_active", true).order("created_at", { ascending: false }),
          // Order courses, newest first
          // Query 2: Fetch User Enrollments (only if logged in)
          isLoggedIn.value && userId ? supabase.from("course_enrollments").select("course_id").eq("user_id", userId) : Promise.resolve({ data: [], error: null })
          // Resolve with empty data if not logged in
        ]);
        let fetchedCoursesRaw = [];
        if (results[0].status === "fulfilled") {
          const courseResult = results[0].value;
          if (courseResult.error) {
            const errorObj = courseResult.error;
            console.error("Supabase error fetching courses (START) -----------");
            console.error("Message:", errorObj.message);
            console.error("Code:", errorObj.code);
            console.error("Details:", errorObj.details);
            console.error("Hint:", errorObj.hint);
            console.error("Full error object for inspection:", JSON.stringify(errorObj, null, 2));
            console.error("Supabase error fetching courses (END) -------------");
            if (String(errorObj.message).includes("more than one relationship")) {
              throw new Error(`فشل جلب الدورات: ${errorObj.message || "التباس في تعريف العلاقات"}. هناك التباس في تعريف العلاقات بين الجداول.`);
            } else {
              throw new Error(`فشل جلب الدورات: ${errorObj.message || "خطأ غير معروف من Supabase."}`);
            }
          }
          fetchedCoursesRaw = courseResult.data || [];
          console.log(`[useAsyncData] Raw courses fetched: ${fetchedCoursesRaw.length}`);
        } else {
          console.error("Failed promise fetching courses (Rejected):", results[0].reason);
          console.error("Rejection reason details:", JSON.stringify(results[0].reason, null, 2));
          throw new Error(`فشل الاتصال لجلب الدورات: ${((_b = results[0].reason) == null ? void 0 : _b.message) || "سبب غير معروف."}`);
        }
        let fetchedEnrollmentsData = [];
        if (results[1].status === "fulfilled") {
          if (results[1].value.error) {
            console.warn("Supabase error fetching enrollments (continuing):", results[1].value.error.message);
          } else {
            fetchedEnrollmentsData = results[1].value.data || [];
            console.log(`[useAsyncData] Enrollments fetched: ${fetchedEnrollmentsData.length}`);
          }
        } else {
          console.warn("Failed promise fetching user enrollments (continuing):", results[1].reason);
        }
        const processedCourses = fetchedCoursesRaw.map((course) => {
          var _a2, _b2, _c;
          return {
            ...course,
            // Safely access count from the 'lessons' relation (using the constraint name implicitly)
            lessons_count: ((_b2 = (_a2 = course.lessons) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.count) ?? 0,
            category_name: ((_c = course.category) == null ? void 0 : _c.name) ?? null,
            // Safely access category name
            lessons: void 0,
            // Remove temporary relation properties
            category: void 0
          };
        });
        return {
          courses: processedCourses,
          enrollments: fetchedEnrollmentsData.map((e) => e.course_id)
          // Return only the array of enrolled course IDs
        };
      },
      {
        // Default value while loading or on error, matches the return structure
        default: () => ({ courses: [], enrollments: [] }),
        // Refetch data if the user logs in or out
        watch: [() => {
          var _a;
          return (_a = profile.value) == null ? void 0 : _a.id;
        }]
        // server: false, // Consider if SSR hydration mismatches occur with auth state
      }
    )), __temp = await __temp, __restore(), __temp);
    watch(data, (newData) => {
      if (newData) {
        courses.value = newData.courses || [];
        userEnrollments.value = newData.enrollments || [];
        console.log("[Watch] Local state updated. Courses:", courses.value.length, "Enrollments:", userEnrollments.value.length);
      } else if (!pending.value && !error.value) {
        console.warn("[Watch] useAsyncData returned null/undefined data unexpectedly.");
        courses.value = [];
        userEnrollments.value = [];
      }
    }, { immediate: true });
    async function handleEnroll(courseId) {
      var _a;
      if (!isLoggedIn.value || !((_a = profile.value) == null ? void 0 : _a.id)) {
        alert("يجب تسجيل الدخول أولاً للانتساب للدورة.");
        navigateTo(`/login?redirect=${(void 0).location.pathname}`);
        return;
      }
      if (userEnrollments.value.includes(courseId)) {
        alert("أنت منتسب بالفعل لهذه الدورة.");
        navigateTo(`/study/courses/${courseId}`);
        return;
      }
      enrollLoadingState[courseId] = true;
      console.log(`[handleEnroll] Attempting enrollment for course ${courseId}...`);
      try {
        const { error: enrollError } = await supabase.from("course_enrollments").insert({ user_id: profile.value.id, course_id: courseId }).select("course_id").single();
        if (enrollError) {
          if (enrollError.code === "23505") {
            console.warn(`Enrollment conflict for course ${courseId}. Syncing state.`);
            alert("أنت منتسب بالفعل لهذه الدورة (تم تحديث الحالة).");
            if (!userEnrollments.value.includes(courseId)) {
              userEnrollments.value.push(courseId);
            }
          } else {
            throw enrollError;
          }
        } else {
          console.log(`[handleEnroll] Enrollment successful for course ${courseId}.`);
          userEnrollments.value.push(courseId);
          alert("تم الانتساب للدورة بنجاح!");
          navigateTo(`/study/courses/${courseId}`);
        }
      } catch (err) {
        console.error(`[handleEnroll] Error enrolling in course ${courseId}:`, err);
        alert(`فشل الانتساب للدورة: ${err.message || "حدث خطأ غير متوقع."}`);
      } finally {
        enrollLoadingState[courseId] = false;
      }
    }
    useHead({
      title: "الدورات الدراسية - موقع الشيخ إبراهيم بشندي",
      meta: [
        { name: "description", content: "تصفح والتحق بالدورات الدراسية المنهجية للشيخ إبراهيم بشندي في مختلف العلوم الشرعية." },
        { property: "og:title", content: "الدورات الدراسية - موقع الشيخ إبراهيم بشندي" },
        { property: "og:description", content: "دورات علمية منهجية ومتخصصة في العلوم الشرعية، متاحة للتعلم والدراسة عبر الإنترنت." },
        { property: "og:type", content: "website" }
        // { property: 'og:image', content: '/path/to/default-course-image.jpg' }, // Consider adding a default image
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8 md:py-12" }, _attrs))} data-v-198b0e3b><h2 class="text-3xl font-bold text-brown-dark dark:text-beige-light mb-6 md:mb-8 border-b-2 border-primary pb-3" data-v-198b0e3b> الدورات الدراسية المنهجية </h2>`);
      if (unref(pending)) {
        _push(`<div class="text-center py-20" data-v-198b0e3b>`);
        _push(ssrRenderComponent(LoadingSpinner, { class: "w-12 h-12 mx-auto text-primary" }, null, _parent));
        _push(`<p class="mt-4 text-base text-gray-600 dark:text-gray-400" data-v-198b0e3b>جارٍ تحميل الدورات المتاحة...</p></div>`);
      } else if (unref(error)) {
        _push(`<div class="text-center py-10 px-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg max-w-lg mx-auto shadow-md" data-v-198b0e3b><div class="flex justify-center items-center text-red-600 dark:text-red-400 mb-4" data-v-198b0e3b><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7" aria-hidden="true" data-v-198b0e3b><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" data-v-198b0e3b></path></svg><h3 class="text-xl font-semibold ms-2" data-v-198b0e3b>خطأ في تحميل الدورات</h3></div><p class="text-sm text-red-700 dark:text-red-300 mb-5" data-v-198b0e3b>${ssrInterpolate(((_a = unref(error).data) == null ? void 0 : _a.message) || unref(error).message || "حدث خطأ غير متوقع أثناء محاولة جلب قائمة الدورات. يرجى المحاولة مرة أخرى.")}</p><button class="button-secondary border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-800/60 hover:bg-red-200 dark:hover:bg-red-700/70 focus:ring-red-500 inline-flex items-center gap-1.5" data-v-198b0e3b><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" aria-hidden="true" data-v-198b0e3b><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.984a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-2.432l.311.31a7 7 0 0 0 11.767-3.18.75.75 0 1 0-1.475-.292ZM4.688 8.576a5.5 5.5 0 0 1 9.201-2.466l.312.311h-2.433a.75.75 0 0 0 0 1.5h4.516a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-1.5 0v2.432l-.311-.31a7 7 0 0 0-11.767 3.18.75.75 0 0 0 1.475.292Z" clip-rule="evenodd" data-v-198b0e3b></path></svg> إعادة المحاولة </button></div>`);
      } else if (Array.isArray(courses.value) && courses.value.length === 0) {
        _push(`<div class="text-center py-16 text-gray-500 dark:text-gray-400 border border-dashed dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/20" data-v-198b0e3b><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" aria-hidden="true" data-v-198b0e3b><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" data-v-198b0e3b></path></svg><p class="text-lg font-medium" data-v-198b0e3b>لا توجد دورات دراسية متاحة حاليًا.</p><p class="text-sm mt-1 text-gray-400 dark:text-gray-500" data-v-198b0e3b>سيتم إضافة دورات جديدة قريبًا بإذن الله، تابعنا للمزيد.</p></div>`);
      } else if (Array.isArray(courses.value) && courses.value.length > 0) {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8" data-v-198b0e3b><!--[-->`);
        ssrRenderList(courses.value, (course) => {
          _push(ssrRenderComponent(CourseCard, {
            key: course.id,
            course,
            "lesson-count": course.lessons_count,
            "category-name": course.category_name,
            "is-enrolled": userEnrollments.value.includes(course.id),
            "enroll-loading": enrollLoadingState[course.id] || false,
            onEnroll: handleEnroll
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      } else if (!unref(pending) && !unref(error)) {
        _push(`<div data-v-198b0e3b><p class="text-center py-10 text-gray-400 dark:text-gray-500 italic" data-v-198b0e3b>حالة عرض الدورات غير معروفة.</p></div>`);
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
