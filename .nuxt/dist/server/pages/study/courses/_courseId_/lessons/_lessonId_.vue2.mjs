import __nuxt_component_0 from "../../../../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import __nuxt_component_1 from "../../../../../node_modules/nuxt/dist/app/components/client-only.mjs";
import { defineComponent, computed, shallowRef, ref, withAsyncContext, watch, mergeProps, unref, withCtx, createBlock, createVNode, openBlock, createTextVNode, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import { useUserStore } from "../../../../../stores/user.mjs";
import { storeToRefs } from "../../../../../node_modules/pinia/dist/pinia.mjs";
import LoadingSpinner from "../../../../../components/LoadingSpinner.vue.mjs";
import { useRoute } from "../../../../../node_modules/nuxt/dist/app/composables/router.mjs";
import { useSupabaseClient } from "../../../../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useAsyncData } from "../../../../../node_modules/nuxt/dist/app/composables/asyncData.mjs";
import { useHead } from "../../../../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
import { showError, createError } from "../../../../../node_modules/nuxt/dist/app/composables/error.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[lessonId]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const supabase = useSupabaseClient();
    const userStore = useUserStore();
    const { profile, isLoggedIn } = storeToRefs(userStore);
    console.log(`--- LESSON PAGE [${route.params.lessonId}] SETUP STARTED ---`);
    const courseIdParam = computed(() => {
      const rawParam = route.params.courseId;
      if (!rawParam) {
        showError({ statusCode: 400, statusMessage: "معرف الدورة مفقود من الرابط.", fatal: true });
        return null;
      }
      const id = parseInt(rawParam, 10);
      if (isNaN(id) || id <= 0) {
        showError({ statusCode: 400, statusMessage: `معرف الدورة غير صالح: "${rawParam}"`, fatal: true });
        return null;
      }
      return id;
    });
    const lessonIdParam = computed(() => {
      const rawParam = route.params.lessonId;
      if (!rawParam) {
        showError({ statusCode: 400, statusMessage: "معرف الدرس مفقود من الرابط.", fatal: true });
        return null;
      }
      const id = parseInt(rawParam, 10);
      if (isNaN(id) || id <= 0) {
        showError({ statusCode: 400, statusMessage: `معرف الدرس غير صالح: "${rawParam}"`, fatal: true });
        return null;
      }
      return id;
    });
    const lesson = shallowRef(null);
    const linkedBooks = shallowRef([]);
    const previousLesson = shallowRef(null);
    const nextLesson = shallowRef(null);
    const courseInfo = shallowRef(null);
    const lessonCompletion = shallowRef(null);
    const enrollment = shallowRef(null);
    const lessonQuiz = shallowRef(null);
    ref(false);
    ref(null);
    ref(false);
    ref(null);
    ref(false);
    ref(null);
    ref(null);
    if (courseIdParam.value === null || lessonIdParam.value === null) {
      console.error("Lesson Page Setup: Halting due to invalid route parameters detected earlier.");
    }
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(async () => {
      var _a;
      return useAsyncData(
        `lessonData-${courseIdParam.value}-${lessonIdParam.value}-${((_a = profile.value) == null ? void 0 : _a.id) ?? "guest"}`,
        async () => {
          var _a2;
          const currentLessonId = lessonIdParam.value;
          const currentCourseId = courseIdParam.value;
          const currentUserId = (_a2 = profile.value) == null ? void 0 : _a2.id;
          if (currentCourseId === null || currentLessonId === null) {
            console.error("Fetcher Error: Invalid course or lesson ID at fetch time.");
            throw createError({ statusCode: 400, statusMessage: "المعرفات المطلوبة غير صالحة لجلب البيانات.", fatal: true });
          }
          console.log(`--- Fetching lesson data for Course ${currentCourseId}, Lesson ${currentLessonId}, User ${currentUserId || "Guest"} ---`);
          try {
            const { data: lessonCourseData, error: lessonCourseError } = await supabase.from("lessons").select(`*, course:study_courses!inner (id, title, is_active)`).eq("id", currentLessonId).eq("course_id", currentCourseId).eq("course.is_active", true).maybeSingle();
            if (lessonCourseError) {
              console.error("DB Error fetching lesson/course:", lessonCourseError);
              throw createError({ statusCode: 500, statusMessage: `خطأ في جلب بيانات الدرس الرئيسية: ${lessonCourseError.message}`, fatal: true });
            }
            if (!lessonCourseData) {
              console.warn(`Lesson ${currentLessonId} not found in active course ${currentCourseId}, or course inactive.`);
              throw createError({ statusCode: 404, statusMessage: "الدرس المطلوب غير موجود أو لا ينتمي لدورة نشطة.", fatal: true });
            }
            const fetchedLesson = lessonCourseData;
            const fetchedCourseInfo = lessonCourseData.course;
            const currentOrder = fetchedLesson.lesson_order;
            const fetchPromises = [
              supabase.from("books").select("*").eq("linked_lesson_id", currentLessonId),
              currentOrder !== null ? supabase.from("lessons").select("id, title").eq("course_id", currentCourseId).lt("lesson_order", currentOrder).order("lesson_order", { ascending: false }).limit(1).maybeSingle() : Promise.resolve({ data: null, error: null }),
              currentOrder !== null ? supabase.from("lessons").select("id, title").eq("course_id", currentCourseId).gt("lesson_order", currentOrder).order("lesson_order", { ascending: true }).limit(1).maybeSingle() : Promise.resolve({ data: null, error: null }),
              isLoggedIn.value && currentUserId ? supabase.from("lesson_completions").select("lesson_id").eq("user_id", currentUserId).eq("lesson_id", currentLessonId).maybeSingle() : Promise.resolve({ data: null, error: null }),
              isLoggedIn.value && currentUserId ? supabase.from("course_enrollments").select("*").eq("user_id", currentUserId).eq("course_id", currentCourseId).maybeSingle() : Promise.resolve({ data: null, error: null }),
              supabase.from("quizzes").select("id, title, is_active").eq("lesson_id", currentLessonId).eq("type", "lesson").eq("is_active", true).maybeSingle()
            ];
            const results = await Promise.allSettled(fetchPromises);
            const processResult = (index, name, defaultValue) => {
              const result = results[index];
              if (result.status === "fulfilled") {
                if (result.value.error) {
                  console.error(`Supabase Error fetching ${name}:`, result.value.error.message);
                  return defaultValue;
                }
                return result.value.data ?? defaultValue;
              } else {
                console.error(`Failed fetching ${name} (Promise rejected):`, result.reason);
                return defaultValue;
              }
            };
            const fetchedBooks = processResult(0, "linked books", []);
            const fetchedPreviousLesson = processResult(1, "previous lesson", null);
            const fetchedNextLesson = processResult(2, "next lesson", null);
            const fetchedCompletion = processResult(3, "completion status", null);
            const fetchedEnrollment = processResult(4, "enrollment status", null);
            const fetchedLessonQuiz = processResult(5, "lesson quiz", null);
            if ((fetchedEnrollment == null ? void 0 : fetchedEnrollment.id) && fetchedLesson.id) {
              console.log(`Attempting to update last accessed lesson for enrollment ${fetchedEnrollment.id} to lesson ${fetchedLesson.id}`);
              supabase.from("course_enrollments").update({ last_accessed_lesson_id: fetchedLesson.id, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", fetchedEnrollment.id).then(({ error: updateError }) => {
                if (updateError) console.error("Failed to update last_accessed_lesson_id:", updateError.message);
                else console.log(`Successfully updated last_accessed_lesson_id.`);
              });
            } else if (isLoggedIn.value && fetchedLesson.id) {
              console.log("User is logged in but not enrolled in this course, skipping last_accessed_lesson update.");
            }
            console.log("--- Lesson data fetch successful ---");
            return {
              lesson: fetchedLesson,
              linkedBooks: fetchedBooks,
              previousLesson: fetchedPreviousLesson,
              nextLesson: fetchedNextLesson,
              courseInfo: fetchedCourseInfo,
              lessonCompletion: fetchedCompletion,
              enrollment: fetchedEnrollment,
              lessonQuiz: fetchedLessonQuiz
            };
          } catch (err) {
            console.error("!!! CRITICAL ERROR in useAsyncData lesson fetch !!!:", err);
            if (err.statusCode && err.fatal) {
              throw err;
            }
            throw createError({
              statusCode: err.statusCode || 500,
              statusMessage: `حدث خطأ غير متوقع أثناء تحميل بيانات الدرس: ${err.message || "خطأ غير معروف"}`,
              fatal: true
            });
          }
        },
        {
          default: () => ({
            lesson: null,
            linkedBooks: [],
            previousLesson: null,
            nextLesson: null,
            courseInfo: null,
            lessonCompletion: null,
            enrollment: null,
            lessonQuiz: null
          }),
          watch: [() => {
            var _a2;
            return (_a2 = profile.value) == null ? void 0 : _a2.id;
          }, () => route.params.lessonId, () => route.params.courseId]
        }
      );
    }), __temp = await __temp, __restore(), __temp);
    watch(data, (newData) => {
      console.log("Lesson page useAsyncData watcher triggered. New data received:", !!newData);
      if (newData) {
        lesson.value = newData.lesson;
        linkedBooks.value = newData.linkedBooks;
        previousLesson.value = newData.previousLesson;
        nextLesson.value = newData.nextLesson;
        courseInfo.value = newData.courseInfo;
        lessonCompletion.value = newData.lessonCompletion;
        enrollment.value = newData.enrollment;
        lessonQuiz.value = newData.lessonQuiz;
      } else if (!pending.value && !error.value) {
        lesson.value = null;
        linkedBooks.value = [];
        previousLesson.value = null;
        nextLesson.value = null;
        courseInfo.value = null;
        lessonCompletion.value = null;
        enrollment.value = null;
        lessonQuiz.value = null;
      }
    }, { immediate: true });
    computed(() => !!enrollment.value);
    computed(() => !!lessonCompletion.value);
    const youtubeVideoId = computed(() => {
      var _a;
      const url = (_a = lesson.value) == null ? void 0 : _a.youtube_url;
      if (!url) return null;
      try {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/;
        const match = url.match(regex);
        return match && match[1] ? match[1] : null;
      } catch (e) {
        console.error("Error parsing YouTube URL:", url, e);
        return null;
      }
    });
    function getBookType(book) {
      if ((book == null ? void 0 : book.is_research) && (book == null ? void 0 : book.is_transcript)) return "بحث وتفريغ";
      if (book == null ? void 0 : book.is_research) return "بحث";
      if (book == null ? void 0 : book.is_transcript) return "تفريغ";
      return "كتاب";
    }
    watch([lesson, courseInfo, pending, error], ([newLesson, newCourse, loadingState, errorState]) => {
      var _a;
      let pageTitle = "تفاصيل الدرس";
      let description = "عرض تفاصيل الدرس والمحتوى المرتبط به ضمن دورات الشيخ.";
      if (loadingState) {
        pageTitle = "جارٍ تحميل الدرس...";
        description = "يتم الآن تحميل بيانات الدرس.";
      } else if (errorState || !newLesson) {
        pageTitle = "الدرس غير متاح";
        description = ((_a = errorState == null ? void 0 : errorState.data) == null ? void 0 : _a.statusMessage) || (errorState == null ? void 0 : errorState.message) || "لم يتم العثور على الدرس المطلوب أو حدث خطأ.";
      } else {
        const lessonTitle = newLesson.title || "درس بدون عنوان";
        const courseTitle = newCourse == null ? void 0 : newCourse.title;
        pageTitle = courseTitle ? `${lessonTitle} - ${courseTitle}` : lessonTitle;
        const lessonDesc = newLesson.description;
        if (lessonDesc) {
          description = lessonDesc.substring(0, 160).trim() + (lessonDesc.length > 160 ? "..." : "");
        } else {
          description = `شاهد درس "${lessonTitle}"${courseTitle ? ` ضمن دورة "${courseTitle}"` : ""}.`;
        }
      }
      useHead({
        title: pageTitle,
        meta: [
          { name: "description", content: description },
          { property: "og:title", content: pageTitle },
          { property: "og:description", content: description },
          { property: "og:type", content: "video.other" },
          { property: "og:url", content: route.fullPath },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: pageTitle },
          { name: "twitter:description", content: description }
        ]
      });
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ClientOnly = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8" }, _attrs))} data-v-847b3f55>`);
      if (unref(pending)) {
        _push(`<div class="text-center py-20" data-v-847b3f55>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-4 text-gray-600 dark:text-gray-400" data-v-847b3f55>جارٍ تحميل بيانات الدرس...</p></div>`);
      } else if (unref(error) || !lesson.value) {
        _push(`<div class="text-center py-20 max-w-2xl mx-auto" data-v-847b3f55><h2 class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4" data-v-847b3f55>${ssrInterpolate(((_b = (_a = unref(error)) == null ? void 0 : _a.data) == null ? void 0 : _b.statusMessage) || ((_c = unref(error)) == null ? void 0 : _c.message) || "خطأ في الوصول للدرس")}</h2><p class="text-gray-600 dark:text-gray-400 mb-6" data-v-847b3f55> لم نتمكن من العثور على الدرس المطلوب ضمن هذه الدورة، أو أن الدورة غير نشطة، أو أنك لا تملك صلاحية الوصول إليه. يرجى التأكد من الرابط أو العودة للدورة. </p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: courseIdParam.value ? `/study/courses/${courseIdParam.value}` : "/study",
          class: "inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true" data-v-847b3f55${_scopeId}><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" data-v-847b3f55${_scopeId}></path></svg><span data-v-847b3f55${_scopeId}>العودة للدورة</span>`);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 20 20",
                  fill: "currentColor",
                  class: "w-5 h-5 ms-2",
                  "aria-hidden": "true"
                }, [
                  createVNode("path", {
                    "fill-rule": "evenodd",
                    d: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z",
                    "clip-rule": "evenodd"
                  })
                ])),
                createVNode("span", null, "العودة للدورة")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="lesson-details max-w-5xl mx-auto space-y-6" data-v-847b3f55>`);
        if (courseInfo.value) {
          _push(`<div class="mb-4 text-sm text-center md:text-right" data-v-847b3f55>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/study/courses/${courseInfo.value.id}`,
            class: "text-gray-600 dark:text-gray-400 hover:text-olive-green transition-colors duration-200"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` دورة: ${ssrInterpolate(courseInfo.value.title)}`);
              } else {
                return [
                  createTextVNode(" دورة: " + toDisplayString(courseInfo.value.title), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark text-center sm:text-right" data-v-847b3f55>${ssrInterpolate(lesson.value.title || "درس بدون عنوان")}</h1><div class="video-section flex items-center gap-2 sm:gap-4" data-v-847b3f55><div class="flex-shrink-0" data-v-847b3f55>`);
        if (previousLesson.value && courseIdParam.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/study/courses/${courseIdParam.value}/lessons/${previousLesson.value.id}`,
            class: "nav-button",
            title: `الدرس السابق: ${previousLesson.value.title}`,
            "aria-label": "الدرس السابق"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="nav-icon" aria-hidden="true" data-v-847b3f55${_scopeId}><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" data-v-847b3f55${_scopeId}></path></svg>`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    class: "nav-icon",
                    "aria-hidden": "true"
                  }, [
                    createVNode("path", {
                      "fill-rule": "evenodd",
                      d: "M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z",
                      "clip-rule": "evenodd"
                    })
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<div class="nav-placeholder" aria-hidden="true" data-v-847b3f55></div>`);
        }
        _push(`</div><div class="flex-grow min-w-0" data-v-847b3f55>`);
        if (youtubeVideoId.value) {
          _push(`<div class="relative w-full rounded-lg overflow-hidden shadow-lg bg-black aspect-video" data-v-847b3f55><iframe${ssrRenderAttr("src", `https://www.youtube.com/embed/${youtubeVideoId.value}`)} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen class="absolute inset-0 w-full h-full" title="مشغل فيديو الدرس" aria-label="مشغل فيديو الدرس" data-v-847b3f55></iframe></div>`);
        } else if (lesson.value.youtube_url) {
          _push(`<div class="video-error-box p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-md" data-v-847b3f55><p class="font-semibold" data-v-847b3f55>رابط يوتيوب غير صالح أو غير متوفر.</p><p class="mt-1 text-sm" data-v-847b3f55>الرجاء التأكد من أن الرابط في قاعدة البيانات هو رابط يوتيوب صحيح (مثل youtube.com/watch?v=... أو youtu.be/... أو youtube.com/embed/... أو youtube.com/shorts/...).</p><p class="mt-1 text-sm" data-v-847b3f55>الرابط المسجل حالياً:</p><code class="block break-all mt-1 text-xs bg-yellow-200 dark:bg-yellow-800 px-1 rounded" data-v-847b3f55>${ssrInterpolate(lesson.value.youtube_url)}</code></div>`);
        } else {
          _push(`<div class="video-error-box p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-md" data-v-847b3f55><p data-v-847b3f55>لا يوجد رابط فيديو متاح لهذا الدرس.</p></div>`);
        }
        _push(`</div><div class="flex-shrink-0" data-v-847b3f55>`);
        if (nextLesson.value && courseIdParam.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/study/courses/${courseIdParam.value}/lessons/${nextLesson.value.id}`,
            class: "nav-button",
            title: `الدرس التالي: ${nextLesson.value.title}`,
            "aria-label": "الدرس التالي"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="nav-icon" aria-hidden="true" data-v-847b3f55${_scopeId}><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" data-v-847b3f55${_scopeId}></path></svg>`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    class: "nav-icon",
                    "aria-hidden": "true"
                  }, [
                    createVNode("path", {
                      "fill-rule": "evenodd",
                      d: "M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z",
                      "clip-rule": "evenodd"
                    })
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<div class="nav-placeholder" aria-hidden="true" data-v-847b3f55></div>`);
        }
        _push(`</div></div>`);
        _push(ssrRenderComponent(_component_ClientOnly, null, {
          fallback: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-center mt-6 h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md max-w-xs mx-auto" data-v-847b3f55${_scopeId}></div>`);
            } else {
              return [
                createVNode("div", { class: "text-center mt-6 h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md max-w-xs mx-auto" })
              ];
            }
          })
        }, _parent));
        if (lesson.value.description) {
          _push(`<div class="description-section pt-6 border-t border-gray-200 dark:border-gray-700" data-v-847b3f55><h2 class="text-2xl font-semibold text-brown-dark dark:text-beige-light mb-3" data-v-847b3f55>عن الدرس:</h2><div class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap" data-v-847b3f55>${ssrInterpolate(lesson.value.description)}</div></div>`);
        } else {
          _push(`<div class="description-section pt-6 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 italic" data-v-847b3f55>لا يوجد وصف متاح لهذا الدرس.</div>`);
        }
        if (linkedBooks.value && linkedBooks.value.length > 0) {
          _push(`<div class="downloads-section p-5 bg-beige-light dark:bg-cream-gray rounded-lg shadow-sm border border-cream-gray dark:border-gray-700" data-v-847b3f55><h3 class="text-lg font-semibold text-brown-dark dark:text-brown-dark mb-4" data-v-847b3f55>ملفات وكتب مرتبطة:</h3><div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap" data-v-847b3f55><!--[-->`);
          ssrRenderList(linkedBooks.value, (book) => {
            _push(`<div data-v-847b3f55>`);
            if (book.storage_path) {
              _push(`<button class="button-secondary inline-flex items-center gap-2 text-sm" data-v-847b3f55><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" aria-hidden="true" data-v-847b3f55><path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 8.75a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" data-v-847b3f55></path><path fill-rule="evenodd" d="M9 3.5a.5.5 0 0 0-.5.5v2.75A1.75 1.75 0 0 0 10.25 8.5h2.75a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-3ZM11 5.75v1.75a.25.25 0 0 0 .25.25h1.75a.25.25 0 0 0 .25-.25V5.75H11Z" clip-rule="evenodd" data-v-847b3f55></path></svg><span data-v-847b3f55>عرض: ${ssrInterpolate(book.title)} <span class="text-xs opacity-75" data-v-847b3f55>(${ssrInterpolate(getBookType(book))})</span></span></button>`);
            } else {
              _push(`<span class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 italic px-4 py-2" data-v-847b3f55><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 opacity-50" aria-hidden="true" data-v-847b3f55><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clip-rule="evenodd" data-v-847b3f55></path></svg><span data-v-847b3f55>${ssrInterpolate(book.title)} (لا يوجد ملف مرفق)</span></span>`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_ClientOnly, null, {
          fallback: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="pt-6 border-t border-gray-200 dark:border-gray-700" data-v-847b3f55${_scopeId}><div class="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" data-v-847b3f55${_scopeId}></div><div class="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" data-v-847b3f55${_scopeId}></div></div>`);
            } else {
              return [
                createVNode("div", { class: "pt-6 border-t border-gray-200 dark:border-gray-700" }, [
                  createVNode("div", { class: "h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" }),
                  createVNode("div", { class: "h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" })
                ])
              ];
            }
          })
        }, _parent));
        _push(`</div>`);
      }
      _push(ssrRenderComponent(_component_ClientOnly, null, {
        fallback: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div data-v-847b3f55${_scopeId}></div>`);
          } else {
            return [
              createVNode("div")
            ];
          }
        })
      }, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=_lessonId_.vue2.mjs.map
