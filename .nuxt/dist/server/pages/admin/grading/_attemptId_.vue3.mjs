import __nuxt_component_0 from "../../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, computed, shallowRef, reactive, ref, withAsyncContext, watch, mergeProps, withCtx, createBlock, createTextVNode, openBlock, createVNode, unref, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import LoadingSpinner from "../../../components/LoadingSpinner.vue.mjs";
import InfoItem from "../../../components/admin/InfoItem.vue.mjs";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useRoute } from "../../../node_modules/nuxt/dist/app/composables/router.mjs";
import { useSupabaseClient } from "../../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useAsyncData } from "../../../node_modules/nuxt/dist/app/composables/asyncData.mjs";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { createError } from "../../../node_modules/nuxt/dist/app/composables/error.mjs";
import { useHead } from "../../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[attemptId]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const supabase = useSupabaseClient();
    const route = useRoute();
    const attemptId = computed(() => {
      const id = parseInt(route.params.attemptId, 10);
      if (isNaN(id) || id <= 0) {
        throw createError({ statusCode: 400, statusMessage: "معرف المحاولة غير صالح أو مفقود.", fatal: true });
      }
      return id;
    });
    const attemptData = shallowRef(null);
    const quizData = shallowRef(null);
    const studentData = shallowRef(null);
    const allQuestions = shallowRef([]);
    const courseData = shallowRef(null);
    const manualScores = reactive({});
    const scoreErrors = reactive({});
    const isSaving = ref(false);
    const saveError = ref(null);
    const loadErrorReason = ref(null);
    const { data: fetchedData, pending, error: loadError } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      `admin-grading-attempt-details-${attemptId.value}`,
      async () => {
        const currentAttemptId = attemptId.value;
        console.log(`Fetching details for attempt ${currentAttemptId}`);
        loadErrorReason.value = null;
        const { data: attempt, error: attemptError } = await supabase.from("quiz_attempts").select("*").eq("id", currentAttemptId).maybeSingle();
        if (attemptError) {
          console.error("Error fetching attempt:", attemptError);
          loadErrorReason.value = "فشل في جلب بيانات المحاولة من قاعدة البيانات.";
          throw createError({ statusCode: 500, message: loadErrorReason.value, fatal: false });
        }
        if (!attempt) {
          loadErrorReason.value = "لم يتم العثور على المحاولة المطلوبة بالمعرف المحدد.";
          throw createError({ statusCode: 404, message: loadErrorReason.value, fatal: false });
        }
        let parsedAnswers = {};
        if (attempt.answers && typeof attempt.answers === "object" && !Array.isArray(attempt.answers)) {
          parsedAnswers = { ...attempt.answers };
        } else if (attempt.answers) {
          console.warn(`Attempt ${attempt.id} has non-object 'answers' field:`, attempt.answers);
        }
        attempt.answers_parsed = parsedAnswers;
        const [quizRes, studentRes, questionsRes] = await Promise.all([
          // Select course directly via relationship for efficiency
          supabase.from("quizzes").select("*, study_courses(id, title)").eq("id", attempt.quiz_id).maybeSingle(),
          supabase.from("profiles").select("id, full_name").eq("id", attempt.user_id).maybeSingle(),
          supabase.from("quiz_questions").select("*").eq("quiz_id", attempt.quiz_id).order("question_order")
        ]).catch((err) => {
          console.error("Error during parallel fetches:", err);
          loadErrorReason.value = "حدث خطأ أثناء جلب البيانات المرتبطة (الاختبار، الطالب، أو الأسئلة).";
          throw createError({ statusCode: 500, message: loadErrorReason.value, fatal: false });
        });
        const quizData2 = (quizRes == null ? void 0 : quizRes.data) ?? null;
        if (quizRes == null ? void 0 : quizRes.error) console.error("Error fetching quiz:", quizRes.error);
        const studentProfile = (studentRes == null ? void 0 : studentRes.data) ?? null;
        if (studentRes == null ? void 0 : studentRes.error) console.error("Error fetching student profile:", studentRes.error);
        const questionsList = (questionsRes == null ? void 0 : questionsRes.data) ?? [];
        if (questionsRes == null ? void 0 : questionsRes.error) console.error("Error fetching questions:", questionsRes.error);
        const courseInfo = (quizData2 == null ? void 0 : quizData2.study_courses) ?? null;
        if (!quizData2) console.warn(`Quiz data not found for quiz ID: ${attempt.quiz_id}`);
        if (!studentProfile) console.warn(`Student profile not found for user ID: ${attempt.user_id}`);
        return {
          attempt,
          quiz: quizData2,
          student: studentProfile,
          allQuestions: questionsList,
          course: courseInfo
        };
      },
      {
        default: () => ({ attempt: null, quiz: null, student: null, allQuestions: [], course: null }),
        watch: [attemptId]
        // Re-fetch if the attempt ID changes dynamically (less likely here)
      }
    )), __temp = await __temp, __restore(), __temp);
    watch(fetchedData, (newData) => {
      var _a;
      attemptData.value = null;
      quizData.value = null;
      studentData.value = null;
      allQuestions.value = [];
      courseData.value = null;
      Object.keys(manualScores).forEach((key) => delete manualScores[key]);
      Object.keys(scoreErrors).forEach((key) => delete scoreErrors[key]);
      if ((newData == null ? void 0 : newData.attempt) && newData.allQuestions) {
        console.log("Watcher: Data received, updating state and initializing scores.");
        attemptData.value = newData.attempt;
        quizData.value = newData.quiz;
        studentData.value = newData.student;
        allQuestions.value = newData.allQuestions;
        courseData.value = newData.course;
        const currentWrittenQuestions = newData.allQuestions.filter((q) => q.type === "written");
        if (currentWrittenQuestions.length > 0) {
          console.log(`Watcher: Initializing scores for ${currentWrittenQuestions.length} written questions.`);
          const existingScores = ((_a = newData.attempt.answers_parsed) == null ? void 0 : _a.manual_score_map) ?? {};
          currentWrittenQuestions.forEach((q) => {
            if (q.id !== void 0 && q.id !== null) {
              manualScores[q.id] = typeof existingScores[q.id] === "number" ? existingScores[q.id] : null;
              scoreErrors[q.id] = null;
            } else {
              console.warn("Watcher: Question found without a valid ID during score initialization:", q);
            }
          });
          console.log("Watcher: Manual scores initialized:", JSON.parse(JSON.stringify(manualScores)));
        } else {
          console.log("Watcher: No written questions found in newData to initialize scores for.");
        }
      } else if (!loadError.value) {
        console.log("Watcher: Fetched data is null or incomplete, state cleared.");
      } else {
        console.log("Watcher: Load error detected, state update skipped.");
      }
    }, { immediate: true });
    const writtenQuestions = computed(() => {
      return allQuestions.value.filter((q) => q.type === "written");
    });
    const questionsToGrade = computed(() => {
      var _a;
      if (((_a = attemptData.value) == null ? void 0 : _a.grading_status) === "graded") return [];
      return writtenQuestions.value.filter((q) => manualScores[q.id] === null || manualScores[q.id] === void 0);
    });
    const totalPossiblePoints = computed(() => {
      return allQuestions.value.reduce((sum, q) => sum + (q.points ?? 1), 0);
    });
    const autoGradablePoints = computed(() => {
      return allQuestions.value.filter((q) => q.type !== "written").reduce((sum, q) => sum + (q.points ?? 1), 0);
    });
    const manualGradablePoints = computed(() => {
      return writtenQuestions.value.reduce((sum, q) => sum + (q.points ?? 1), 0);
    });
    const calculatedManualScore = computed(() => {
      return Object.entries(manualScores).reduce((sum, [key, score]) => {
        const questionExists = writtenQuestions.value.some((q) => q.id.toString() === key);
        if (questionExists && typeof score === "number" && !isNaN(score) && scoreErrors[key] === null) {
          return sum + score;
        }
        return sum;
      }, 0);
    });
    const calculatedFinalScore = computed(() => {
      var _a;
      const autoScore = ((_a = attemptData.value) == null ? void 0 : _a.score) ?? 0;
      return autoScore + calculatedManualScore.value;
    });
    const calculatedPercentage = computed(() => {
      const total = totalPossiblePoints.value;
      if (total <= 0) return 0;
      const percentage = calculatedFinalScore.value / total * 100;
      return Math.round(percentage * 10) / 10;
    });
    const passStatus = computed(() => {
      if (!quizData.value || typeof quizData.value.pass_mark_percentage !== "number") return null;
      return calculatedPercentage.value >= quizData.value.pass_mark_percentage;
    });
    const allScoresEnteredForPending = computed(() => {
      return questionsToGrade.value.every((q) => typeof manualScores[q.id] === "number");
    });
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      try {
        return new Date(dateString).toLocaleString("ar-SA", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
          // Example options
        });
      } catch {
        console.warn("Failed to format date:", dateString);
        return dateString;
      }
    };
    const getGradingStatusText = (status) => {
      switch (status) {
        case "pending":
          return "قيد المراجعة (آلي)";
        case "auto_graded":
          return "تم التصحيح آليًا";
        case "pending_manual":
          return "يحتاج تصحيحًا يدويًا";
        case "graded":
          return "تم التصحيح بالكامل";
        default:
          return "غير معروف";
      }
    };
    const getStatusBadgeClass = (status) => {
      const baseClass = "px-2.5 py-0.5 rounded-full text-xs font-medium inline-block";
      switch (status) {
        case "pending_manual":
          return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700`;
        case "graded":
          return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-200 border border-green-300 dark:border-green-700`;
        case "auto_graded":
          return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200 border border-blue-300 dark:border-blue-700`;
        case "pending":
          return `${baseClass} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600`;
        default:
          return `${baseClass} bg-gray-200 text-gray-500 dark:bg-gray-600 dark:text-gray-400 border border-gray-400 dark:border-gray-500`;
      }
    };
    const studentAnswerForQuestion = (questionId) => {
      var _a, _b;
      return ((_b = (_a = attemptData.value) == null ? void 0 : _a.answers_parsed) == null ? void 0 : _b[questionId]) ?? null;
    };
    const isQuestionGraded = (questionId) => {
      var _a, _b, _c;
      return typeof ((_c = (_b = (_a = attemptData.value) == null ? void 0 : _a.answers_parsed) == null ? void 0 : _b.manual_score_map) == null ? void 0 : _c[questionId]) === "number";
    };
    const renderMarkdown = (text) => {
      if (!text) return "";
      marked.setOptions({
        breaks: true,
        // Convert single line breaks to <br>
        gfm: true
        // Enable GitHub Flavored Markdown
        // Consider adding a syntax highlighter if needed
      });
      const rawHtml = marked.parse(text);
      return DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } });
    };
    useHead({
      // Use a function for dynamic title based on loaded data
      title: computed(() => {
        if (pending.value) return "جاري تحميل التصحيح...";
        if (attemptData.value) return `تصحيح محاولة #${attemptData.value.id}`;
        return "تصحيح محاولة";
      }),
      meta: [
        { name: "description", content: "صفحة لتصحيح المحاولات الكتابية للاختبارات" }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-4 sm:p-6 lg:p-8" }, _attrs))} data-v-7f98cce7>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/grading",
        class: "inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition-colors duration-150 ease-in-out group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1 transform transition-transform duration-150 ease-in-out group-hover:-translate-x-0.5" data-v-7f98cce7${_scopeId}><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clip-rule="evenodd" data-v-7f98cce7${_scopeId}></path></svg> العودة لقائمة التصحيح `);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 20 20",
                fill: "currentColor",
                class: "w-5 h-5 me-1 transform transition-transform duration-150 ease-in-out group-hover:-translate-x-0.5"
              }, [
                createVNode("path", {
                  "fill-rule": "evenodd",
                  d: "M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z",
                  "clip-rule": "evenodd"
                })
              ])),
              createTextVNode(" العودة لقائمة التصحيح ")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(pending)) {
        _push(`<div class="text-center py-16" data-v-7f98cce7>`);
        _push(ssrRenderComponent(LoadingSpinner, { class: "w-10 h-10 text-primary mx-auto" }, null, _parent));
        _push(`<p class="mt-4 text-lg text-gray-500 dark:text-gray-400" data-v-7f98cce7>جارٍ تحميل تفاصيل المحاولة...</p></div>`);
      } else if (unref(loadError) || !attemptData.value) {
        _push(`<div class="error-box p-6" data-v-7f98cce7><h2 class="text-xl font-semibold text-red-800 dark:text-red-300 mb-3" data-v-7f98cce7>خطأ في التحميل</h2><p class="text-red-700 dark:text-red-400" data-v-7f98cce7>${ssrInterpolate(loadErrorReason.value || "حدث خطأ غير متوقع أثناء تحميل بيانات المحاولة.")}</p>`);
        if (unref(loadError) && unref(loadError).message && loadErrorReason.value !== unref(loadError).message) {
          _push(`<pre class="mt-2 text-sm bg-red-100 dark:bg-red-900/50 p-2 rounded overflow-x-auto" data-v-7f98cce7>${ssrInterpolate(unref(loadError).message)}</pre>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/grading",
          class: "button-secondary mt-6"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`العودة للقائمة`);
            } else {
              return [
                createTextVNode("العودة للقائمة")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="space-y-8" data-v-7f98cce7><h1 class="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4" data-v-7f98cce7> تصحيح محاولة: <span class="font-mono text-2xl text-primary-600 dark:text-primary-400" data-v-7f98cce7>#${ssrInterpolate(attemptData.value.id)}</span></h1><div class="p-5 bg-white dark:bg-gray-800 rounded-lg shadow-md border dark:border-gray-700" data-v-7f98cce7><h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b dark:border-gray-600 pb-2" data-v-7f98cce7>تفاصيل المحاولة والمعلومات الأساسية</h2><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 text-sm mt-4" data-v-7f98cce7><div class="space-y-2" data-v-7f98cce7>`);
        _push(ssrRenderComponent(InfoItem, {
          label: "معرف المحاولة:",
          value: `#${attemptData.value.id}`,
          valueClass: "font-mono"
        }, null, _parent));
        _push(ssrRenderComponent(InfoItem, {
          label: "تاريخ الإرسال:",
          value: formatDate(attemptData.value.submitted_at)
        }, null, _parent));
        _push(ssrRenderComponent(InfoItem, { label: "الحالة الحالية:" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass(getStatusBadgeClass(attemptData.value.grading_status))}" data-v-7f98cce7${_scopeId}>${ssrInterpolate(getGradingStatusText(attemptData.value.grading_status))}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: getStatusBadgeClass(attemptData.value.grading_status)
                }, toDisplayString(getGradingStatusText(attemptData.value.grading_status)), 3)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="space-y-2" data-v-7f98cce7>`);
        _push(ssrRenderComponent(InfoItem, { label: "الطالب:" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            if (_push2) {
              _push2(`<span class="font-medium text-gray-900 dark:text-gray-100" data-v-7f98cce7${_scopeId}>${ssrInterpolate(((_a2 = studentData.value) == null ? void 0 : _a2.full_name) ?? `مستخدم (${attemptData.value.user_id.substring(0, 8)}...)`)}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-medium text-gray-900 dark:text-gray-100" }, toDisplayString(((_b2 = studentData.value) == null ? void 0 : _b2.full_name) ?? `مستخدم (${attemptData.value.user_id.substring(0, 8)}...)`), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(InfoItem, { label: "الاختبار:" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            if (_push2) {
              _push2(`<span class="font-medium text-gray-900 dark:text-gray-100" data-v-7f98cce7${_scopeId}>${ssrInterpolate(((_a2 = quizData.value) == null ? void 0 : _a2.title) ?? "اختبار غير متاح")}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-medium text-gray-900 dark:text-gray-100" }, toDisplayString(((_b2 = quizData.value) == null ? void 0 : _b2.title) ?? "اختبار غير متاح"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(InfoItem, { label: "الدورة التدريبية:" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            if (_push2) {
              _push2(`<span class="font-medium text-gray-900 dark:text-gray-100" data-v-7f98cce7${_scopeId}>${ssrInterpolate(((_a2 = courseData.value) == null ? void 0 : _a2.title) ?? "غير محدد")}</span>`);
            } else {
              return [
                createVNode("span", { class: "font-medium text-gray-900 dark:text-gray-100" }, toDisplayString(((_b2 = courseData.value) == null ? void 0 : _b2.title) ?? "غير محدد"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="space-y-2" data-v-7f98cce7>`);
        _push(ssrRenderComponent(InfoItem, {
          label: "الدرجة الآلية:",
          value: `${attemptData.value.score ?? 0} / ${autoGradablePoints.value}`
        }, null, _parent));
        if (attemptData.value.grading_status === "graded") {
          _push(ssrRenderComponent(InfoItem, {
            label: "الدرجة اليدوية (المسجلة):",
            value: `${attemptData.value.manual_score ?? "-"} / ${manualGradablePoints.value}`
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        if (attemptData.value.grading_status === "graded") {
          _push(ssrRenderComponent(InfoItem, {
            label: "الدرجة الإجمالية (المسجلة):",
            value: `${attemptData.value.total_score ?? "-"} / ${totalPossiblePoints.value}`
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(InfoItem, {
          label: "إجمالي نقاط الاختبار:",
          value: totalPossiblePoints.value.toString()
        }, null, _parent));
        _push(ssrRenderComponent(InfoItem, {
          label: "علامة النجاح:",
          value: `${((_a = quizData.value) == null ? void 0 : _a.pass_mark_percentage) ?? "N/A"}%`
        }, null, _parent));
        if (attemptData.value.grading_status === "graded") {
          _push(ssrRenderComponent(InfoItem, { label: "نتيجة الاختبار (المسجلة):" }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="${ssrRenderClass(attemptData.value.passed ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold")}" data-v-7f98cce7${_scopeId}>${ssrInterpolate(attemptData.value.passed ? "ناجح" : "راسب")}</span>`);
              } else {
                return [
                  createVNode("span", {
                    class: attemptData.value.passed ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"
                  }, toDisplayString(attemptData.value.passed ? "ناجح" : "راسب"), 3)
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><form class="space-y-6" data-v-7f98cce7><h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700" data-v-7f98cce7> الأسئلة الكتابية `);
        if (questionsToGrade.value.length > 0) {
          _push(`<span data-v-7f98cce7>(مطلوب تصحيح ${ssrInterpolate(questionsToGrade.value.length)} سؤال)</span>`);
        } else if (writtenQuestions.value.length > 0 && questionsToGrade.value.length === 0) {
          _push(`<span data-v-7f98cce7>(جميع الأسئلة الكتابية مصححة)</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</h2>`);
        if (writtenQuestions.value.length === 0) {
          _push(`<div class="info-box" data-v-7f98cce7><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-gray-400 mb-2" data-v-7f98cce7><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" data-v-7f98cce7></path></svg> لا توجد أسئلة كتابية في هذا الاختبار. </div>`);
        } else if (questionsToGrade.value.length === 0 && attemptData.value.grading_status === "graded") {
          _push(`<div class="info-box" data-v-7f98cce7><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto text-green-500 mb-2" data-v-7f98cce7><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" data-v-7f98cce7></path></svg> تم تصحيح جميع الأسئلة الكتابية لهذه المحاولة بالفعل. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(writtenQuestions.value, (question, index) => {
          _push(`<div class="${ssrRenderClass([{
            "border-primary-500 dark:border-primary-600 ring-1 ring-primary-500 dark:ring-primary-600": isQuestionGraded(question.id),
            // Highlight graded
            "border-red-500 dark:border-red-600 ring-1 ring-red-500 dark:ring-red-600": scoreErrors[question.id]
            // Highlight errors
          }, "p-4 md:p-5 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 shadow-sm transition-all duration-150 ease-in-out"])}" data-v-7f98cce7><div class="flex justify-between items-baseline mb-3 border-b dark:border-gray-600 pb-2" data-v-7f98cce7><p class="question-number text-sm font-semibold text-gray-600 dark:text-gray-400" data-v-7f98cce7> السؤال الكتابي #${ssrInterpolate(index + 1)} <span class="text-xs font-mono text-gray-400 dark:text-gray-500" data-v-7f98cce7>(${ssrInterpolate(question.id)})</span></p><span class="text-xs font-medium text-gray-500 dark:text-gray-300" data-v-7f98cce7>النقاط المتاحة: ${ssrInterpolate(question.points ?? 1)}</span></div><div class="question-text text-base font-medium text-gray-800 dark:text-gray-200 mb-4 prose prose-sm dark:prose-invert max-w-none" data-v-7f98cce7>${renderMarkdown(question.question_text ?? "") ?? ""}</div><div class="student-answer-box mt-3 mb-4" data-v-7f98cce7><p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1" data-v-7f98cce7>إجابة الطالب:</p><p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap min-h-[40px]" data-v-7f98cce7>${ssrInterpolate(studentAnswerForQuestion(question.id) || "-- لا توجد إجابة --")}</p></div><div class="grading-input-area mt-4" data-v-7f98cce7><label${ssrRenderAttr("for", `score-${question.id}`)} class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-v-7f98cce7>الدرجة الممنوحة:</label><div class="flex items-center" data-v-7f98cce7><input type="number"${ssrRenderAttr("id", `score-${question.id}`)}${ssrRenderAttr("value", manualScores[question.id])}${ssrRenderAttr("max", question.points ?? 1)} min="0" step="0.5" required class="${ssrRenderClass([{ "border-red-500 dark:border-red-600 ring-1 ring-red-500 dark:ring-red-600 focus:ring-red-500 focus:border-red-500": scoreErrors[question.id] }, "input-field w-28 text-center text-base font-medium appearance-none"])}"${ssrIncludeBooleanAttr(isSaving.value || attemptData.value.grading_status === "graded") ? " disabled" : ""} aria-describedby="score-error-{{question.id}}" placeholder="0" data-v-7f98cce7><span class="text-base font-medium text-gray-500 dark:text-gray-400 ms-2" data-v-7f98cce7> / ${ssrInterpolate(question.points ?? 1)}</span></div>`);
          if (scoreErrors[question.id]) {
            _push(`<p${ssrRenderAttr("id", `score-error-${question.id}`)} class="mt-1 text-xs text-red-600 dark:text-red-400" data-v-7f98cce7>${ssrInterpolate(scoreErrors[question.id])}</p>`);
          } else if (isQuestionGraded(question.id)) {
            _push(`<p class="mt-1 text-xs text-green-600 dark:text-green-400" data-v-7f98cce7>تم حفظ الدرجة.</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (attemptData.value.grading_status !== "graded" && writtenQuestions.value.length > 0) {
          _push(`<div class="pt-6 border-t dark:border-gray-700 sticky bottom-0 bg-gradient-to-t from-white dark:from-gray-900 pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" data-v-7f98cce7><div class="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg mb-4 border dark:border-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4" data-v-7f98cce7><div class="text-center sm:text-right" data-v-7f98cce7><p class="text-sm text-gray-600 dark:text-gray-300" data-v-7f98cce7>النتيجة النهائية (تقديرية):</p><p class="text-2xl font-bold text-primary-700 dark:text-primary-400" data-v-7f98cce7>${ssrInterpolate(calculatedFinalScore.value)} / ${ssrInterpolate(totalPossiblePoints.value)} <span class="text-lg font-medium text-gray-500 dark:text-gray-400" data-v-7f98cce7>(${ssrInterpolate(calculatedPercentage.value)}%)</span></p>`);
          if (passStatus.value !== null) {
            _push(`<p class="${ssrRenderClass(["text-sm font-medium", passStatus.value ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"])}" data-v-7f98cce7>${ssrInterpolate(passStatus.value ? "ناجح" : "راسب")} (علامة النجاح: ${ssrInterpolate(((_b = quizData.value) == null ? void 0 : _b.pass_mark_percentage) ?? "N/A")}%) </p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex-shrink-0 w-full sm:w-auto" data-v-7f98cce7><button type="submit" class="button-primary w-full sm:w-auto"${ssrIncludeBooleanAttr(isSaving.value || Object.values(scoreErrors).some((e) => e !== null) || !allScoresEnteredForPending.value) ? " disabled" : ""} aria-label="حفظ التصحيح وإنهاء المراجعة" data-v-7f98cce7>`);
          if (isSaving.value) {
            _push(ssrRenderComponent(LoadingSpinner, { class: "w-5 h-5 me-2 animate-spin" }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(` ${ssrInterpolate(isSaving.value ? "جارٍ الحفظ..." : questionsToGrade.value.length > 0 ? `حفظ تصحيح ${questionsToGrade.value.length} سؤال` : "حفظ التصحيح وإنهاء المراجعة")}</button></div></div>`);
          if (!allScoresEnteredForPending.value && questionsToGrade.value.length > 0) {
            _push(`<p class="text-yellow-700 dark:text-yellow-400 text-xs text-center sm:text-right mt-1" data-v-7f98cce7> يجب إدخال درجة لجميع الأسئلة المطلوب تصحيحها. </p>`);
          } else {
            _push(`<!---->`);
          }
          if (saveError.value) {
            _push(`<p class="text-red-600 dark:text-red-400 text-sm text-center sm:text-right mt-1" data-v-7f98cce7>${ssrInterpolate(saveError.value)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else if (attemptData.value.grading_status === "graded") {
          _push(`<div class="text-center mt-6" data-v-7f98cce7><p class="text-lg font-medium text-green-700 dark:text-green-400" data-v-7f98cce7>تم تصحيح هذه المحاولة بالكامل.</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</form></div>`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=_attemptId_.vue3.mjs.map
