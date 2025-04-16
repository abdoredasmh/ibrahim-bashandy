import __nuxt_component_0 from "../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, computed, shallowRef, ref, withAsyncContext, watch, mergeProps, unref, withCtx, createBlock, createVNode, openBlock, createTextVNode, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseEqual } from "vue/server-renderer";
import { useUserStore } from "../../stores/user.mjs";
import { storeToRefs } from "../../node_modules/pinia/dist/pinia.mjs";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import { setInterval } from "../../node_modules/nuxt/dist/app/compat/interval.mjs";
import { useRoute, useRouter } from "../../node_modules/nuxt/dist/app/composables/router.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useAsyncData } from "../../node_modules/nuxt/dist/app/composables/asyncData.mjs";
import { createError } from "../../node_modules/nuxt/dist/app/composables/error.mjs";
import { useHead } from "../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const supabase = useSupabaseClient();
    const userStore = useUserStore();
    const { profile, isLoggedIn } = storeToRefs(userStore);
    useRouter();
    console.log(`--- QUIZ PAGE [${route.params.id}] SETUP STARTED ---`);
    const quizIdParam = computed(() => {
      const rawParam = route.params.id;
      if (!rawParam) {
        console.error("Quiz Page Setup: Quiz ID parameter is missing.");
        return null;
      }
      const id = parseInt(rawParam, 10);
      if (isNaN(id) || id <= 0) {
        console.error(`Quiz Page Setup: Invalid Quiz ID parameter: "${rawParam}"`);
        return null;
      }
      return id;
    });
    const quizData = shallowRef({});
    const latestAttempt = shallowRef(null);
    const userAnswers = ref({});
    const isSubmitting = ref(false);
    const submitError = ref(null);
    const loadError = ref(null);
    const isViewingAttempt = ref(false);
    const initialDataLoaded = ref(false);
    const timerInterval = ref(null);
    const timeRemainingSeconds = ref(0);
    const isTimerActive = ref(false);
    if (quizIdParam.value === null && false) ;
    const { data, pending, error: asyncDataError, refresh } = ([__temp, __restore] = withAsyncContext(async () => {
      var _a;
      return useAsyncData(
        `quizViewData-${quizIdParam.value}-${((_a = profile.value) == null ? void 0 : _a.id) ?? "guest"}`,
        // Unique key
        async () => {
          var _a2, _b, _c, _d;
          initialDataLoaded.value = false;
          loadError.value = null;
          const currentQuizId = quizIdParam.value;
          const currentUser = profile.value;
          if (!(currentUser == null ? void 0 : currentUser.id)) throw createError({ statusCode: 401, statusMessage: "لم يتم التعرف على المستخدم.", fatal: true });
          if (currentQuizId === null) throw createError({ statusCode: 400, statusMessage: "معرف الاختبار غير صالح.", fatal: true });
          console.log(`--- Fetching data for Quiz ${currentQuizId}, User ${currentUser.id} ---`);
          try {
            const { data: fetchedQuiz, error: quizFetchError } = await supabase.from("quizzes").select(`*, course:study_courses!course_id ( id, title ), lesson:lessons!lesson_id ( id, title, course_id )`).eq("id", currentQuizId).single();
            if (quizFetchError || !fetchedQuiz) {
              throw createError({ statusCode: (quizFetchError == null ? void 0 : quizFetchError.code) === "PGRST116" ? 404 : 500, statusMessage: "الاختبار غير موجود أو حدث خطأ.", fatal: true });
            }
            let relatedLink = null;
            if (((_a2 = fetchedQuiz.lesson) == null ? void 0 : _a2.id) && fetchedQuiz.lesson.course_id) {
              relatedLink = { to: `/study/courses/${fetchedQuiz.lesson.course_id}/lessons/${fetchedQuiz.lesson.id}`, text: `درس: ${fetchedQuiz.lesson.title}` };
            } else if ((_b = fetchedQuiz.course) == null ? void 0 : _b.id) {
              relatedLink = { to: `/study/courses/${fetchedQuiz.course.id}`, text: `دورة: ${fetchedQuiz.course.title}` };
            }
            const { data: fetchedQuestionsData, error: questionsFetchError } = await supabase.from("quiz_questions").select(`*, question_options (*)`).eq("quiz_id", currentQuizId).order("question_order", { ascending: true, nullsLast: true }).order("option_order", { referencedTable: "question_options", ascending: true, nullsLast: true });
            if (questionsFetchError) throw questionsFetchError;
            const fetchedQuestions = fetchedQuestionsData || [];
            const { data: fetchedAttempts, error: attemptsError } = await supabase.from("quiz_attempts").select("*").eq("quiz_id", currentQuizId).eq("user_id", currentUser.id).order("submitted_at", { ascending: false });
            if (attemptsError) throw createError({ statusCode: 500, statusMessage: "فشل جلب المحاولات السابقة." });
            const attemptsDone = (fetchedAttempts == null ? void 0 : fetchedAttempts.length) ?? 0;
            let latestAttemptData = fetchedAttempts && fetchedAttempts.length > 0 ? fetchedAttempts[0] : null;
            if ((latestAttemptData == null ? void 0 : latestAttemptData.answers) && typeof latestAttemptData.answers === "object") {
              latestAttemptData.answers_parsed = { ...latestAttemptData.answers };
            } else {
              if (latestAttemptData) latestAttemptData.answers_parsed = {};
            }
            let isEnrolled = true;
            if (fetchedQuiz.course_id) {
              const { count: enrollmentCount, error: enrollmentError } = await supabase.from("course_enrollments").select("course_id", { count: "exact", head: true }).eq("user_id", currentUser.id).eq("course_id", fetchedQuiz.course_id);
              isEnrolled = (enrollmentCount ?? 0) > 0;
              if (enrollmentError) console.error(`Enrollment check failed: ${enrollmentError.message}`);
            }
            let canTakeNewAttempt = true;
            let authFailReason = "";
            if (!fetchedQuiz.is_active) {
              authFailReason = "هذا الاختبار غير نشط حالياً.";
              canTakeNewAttempt = false;
            } else if (fetchedQuiz.course_id && !isEnrolled) {
              authFailReason = "يجب أن تكون منتسبًا للدورة المرتبطة بهذا الاختبار أولاً.";
              canTakeNewAttempt = false;
            } else if (fetchedQuiz.max_attempts !== null && attemptsDone >= fetchedQuiz.max_attempts) {
              authFailReason = `لقد استنفدت جميع المحاولات المسموحة (${fetchedQuiz.max_attempts}).`;
              canTakeNewAttempt = false;
            }
            if (!canTakeNewAttempt && !latestAttemptData) {
              throw createError({ statusCode: 403, statusMessage: authFailReason || "لا يمكنك الوصول لهذا الاختبار.", fatal: true });
            }
            console.log(`--- Quiz data fetch successful. Can take new attempt: ${canTakeNewAttempt} ---`);
            return {
              quiz: fetchedQuiz,
              questions: fetchedQuestions,
              isEnrolled,
              previousAttemptsCount: attemptsDone,
              latestAttempt: latestAttemptData,
              relatedLink,
              canTakeNewAttempt
            };
          } catch (err) {
            console.error("!!! ERROR in useAsyncData quiz fetch !!!:", err);
            const message = ((_c = err.data) == null ? void 0 : _c.message) || err.message || "خطأ غير معروف";
            const details = ((_d = err.data) == null ? void 0 : _d.details) || void 0;
            const statusCode = err.statusCode || 500;
            loadError.value = { message, details, statusCode };
            return {};
          } finally {
            initialDataLoaded.value = true;
          }
        },
        {
          watch: [quizIdParam, () => {
            var _a2;
            return (_a2 = profile.value) == null ? void 0 : _a2.id;
          }]
          // Re-fetch if quiz or user changes
        }
      );
    }), __temp = await __temp, __restore(), __temp);
    watch(data, (newData) => {
      stopTimer();
      if (newData && newData.quiz && !loadError.value) {
        quizData.value = newData;
        latestAttempt.value = newData.latestAttempt;
        userAnswers.value = {};
        if (newData.canTakeNewAttempt) {
          isViewingAttempt.value = false;
          newData.questions.forEach((q) => {
            userAnswers.value[q.id] = null;
          });
          console.log("[Watch] Mode: Taking New Attempt");
          if (newData.quiz.time_limit_minutes && (newData.quiz.type === "course_final" || newData.quiz.type === "module_final")) {
            startTimer(newData.quiz.time_limit_minutes);
          }
        } else if (newData.latestAttempt) {
          isViewingAttempt.value = true;
          userAnswers.value = newData.latestAttempt.answers_parsed ?? {};
          newData.questions.forEach((q) => {
            if (!(q.id in userAnswers.value)) {
              userAnswers.value[q.id] = null;
            }
          });
          console.log("[Watch] Mode: Viewing Last Attempt");
        } else {
          console.error("[Watch] Invalid state: Cannot take attempt and no previous attempt found.");
          isViewingAttempt.value = false;
        }
      } else {
        quizData.value = {};
        latestAttempt.value = null;
        userAnswers.value = {};
        isViewingAttempt.value = false;
        if (!pending.value && !loadError.value && initialDataLoaded.value) {
          console.warn("[Watch] Data is null/invalid after load without specific error. Displaying fallback.");
          loadError.value = loadError.value ?? { message: "فشل تحميل بيانات الاختبار.", details: "يرجى المحاولة مرة أخرى." };
        }
      }
    }, { immediate: true });
    const totalPossiblePoints = computed(() => {
      var _a, _b;
      return ((_b = (_a = quizData.value) == null ? void 0 : _a.questions) == null ? void 0 : _b.reduce((sum, q) => sum + (q.points ?? 1), 0)) ?? 0;
    });
    const allQuestionsAnswered = computed(() => {
      var _a;
      if (!((_a = quizData.value) == null ? void 0 : _a.questions)) return false;
      return quizData.value.questions.every(
        (q) => userAnswers.value[q.id] !== null && userAnswers.value[q.id] !== void 0 && userAnswers.value[q.id] !== ""
      );
    });
    const formattedTimeRemaining = computed(() => {
      const minutes = Math.floor(timeRemainingSeconds.value / 60);
      const seconds = timeRemainingSeconds.value % 60;
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    });
    function getOptionClassesMcqTf(question, option, tfValue) {
      var _a, _b;
      const baseClasses = "relative flex items-start p-3 rounded-md border transition-colors duration-150";
      if (!isViewingAttempt.value || !((_a = latestAttempt.value) == null ? void 0 : _a.answers_parsed)) {
        return `${baseClasses} border-gray-200 dark:border-gray-600 hover:bg-cream-gray/40 dark:hover:bg-gray-700/40`;
      }
      const submittedAnswer = latestAttempt.value.answers_parsed[question.id];
      const isCorrectOption = tfValue !== void 0 ? ((_b = getCorrectAnswerTf(question.question_options)) == null ? void 0 : _b.toString()) === tfValue : !!option.is_correct;
      const isSelected = tfValue !== void 0 ? String(submittedAnswer) === tfValue : submittedAnswer === option.id;
      if (isCorrectOption) {
        return `${baseClasses} border-golden-calm dark:border-golden-calm bg-golden-calm/10 dark:bg-golden-calm/20 ring-1 ring-golden-calm`;
      } else if (isSelected && !isCorrectOption) {
        return `${baseClasses} border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/30 ring-1 ring-red-400`;
      } else {
        return `${baseClasses} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 opacity-70`;
      }
    }
    function getCorrectAnswerTf(options) {
      const correctOption = options == null ? void 0 : options.find((opt) => opt.is_correct);
      if (!correctOption) return null;
      return /^(true|1|صح|نعم)$/i.test(correctOption.option_text);
    }
    function getGradingStatusText(status) {
      switch (status) {
        case "pending":
          return "قيد المراجعة";
        case "auto_graded":
          return "تم التصحيح آليًا";
        case "pending_manual":
          return "يحتاج تصحيحًا يدويًا";
        case "graded":
          return "تم التصحيح بالكامل";
        default:
          return "غير معروف";
      }
    }
    const getBackLink = () => {
      var _a, _b, _c;
      if ((_a = quizData.value) == null ? void 0 : _a.relatedLink) return quizData.value.relatedLink.to;
      if ((_c = (_b = quizData.value) == null ? void 0 : _b.quiz) == null ? void 0 : _c.course_id) return `/study/courses/${quizData.value.quiz.course_id}`;
      return "/study";
    };
    function calculatePercentage(score, total) {
      if (score === null || score === void 0 || total <= 0) return 0;
      return Math.round(score / total * 100);
    }
    function startTimer(minutes) {
      stopTimer();
      timeRemainingSeconds.value = minutes * 60;
      isTimerActive.value = true;
      console.log(`[Timer] Starting timer for ${minutes} minutes (${timeRemainingSeconds.value}s).`);
      timerInterval.value = setInterval();
    }
    function stopTimer() {
      if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
        isTimerActive.value = false;
        console.log("[Timer] Stopped.");
      }
    }
    watch([quizData, pending, loadError], ([newQuizData, loadingState, errorState]) => {
      var _a;
      let pageTitle = "الاختبار";
      let description = "قم بحل أسئلة الاختبار.";
      if (loadingState && !initialDataLoaded.value) {
        pageTitle = "جارٍ تحميل الاختبار...";
      } else if (errorState || !(newQuizData == null ? void 0 : newQuizData.quiz)) {
        pageTitle = "خطأ في الاختبار";
        description = (errorState == null ? void 0 : errorState.message) || "تعذر الوصول للاختبار.";
      } else {
        pageTitle = newQuizData.quiz.title || "اختبار";
        description = ((_a = newQuizData.quiz.description) == null ? void 0 : _a.substring(0, 160)) || `اختبار بعنوان "${pageTitle}"`;
      }
      useHead({ title: pageTitle, meta: [{ name: "description", content: description }] });
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8" }, _attrs))} data-v-dafaca82>`);
      if (unref(pending) && !initialDataLoaded.value) {
        _push(`<div class="text-center py-20" data-v-dafaca82>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-4 text-gray-600 dark:text-gray-400" data-v-dafaca82>جارٍ تحميل بيانات الاختبار...</p></div>`);
      } else if (loadError.value) {
        _push(`<div class="error-display" data-v-dafaca82><div class="flex justify-center items-center text-red-500 dark:text-red-400 mb-4" data-v-dafaca82><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7" aria-hidden="true" data-v-dafaca82><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" data-v-dafaca82></path></svg><h2 class="text-2xl font-semibold ms-2" data-v-dafaca82>${ssrInterpolate(loadError.value.message || "لا يمكن الوصول للاختبار")}</h2></div><p class="text-sm text-red-700 dark:text-red-300 mb-6" data-v-dafaca82>${ssrInterpolate(loadError.value.details || "تعذر تحميل الاختبار المطلوب أو أنك لا تملك الصلاحية اللازمة لبدئه/عرضه.")}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: getBackLink(),
          class: "button-secondary error-button"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true" data-v-dafaca82${_scopeId}><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" data-v-dafaca82${_scopeId}></path></svg><span data-v-dafaca82${_scopeId}>العودة</span>`);
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
                createVNode("span", null, "العودة")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (quizData.value.quiz) {
        _push(`<div class="quiz-interface max-w-4xl mx-auto" data-v-dafaca82><div class="mb-6 pb-4 border-b border-cream-gray dark:border-gray-700" data-v-dafaca82>`);
        if (quizData.value.relatedLink) {
          _push(`<div class="text-sm text-center sm:text-right mb-2" data-v-dafaca82>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: quizData.value.relatedLink.to,
            class: "text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` ← العودة إلى: ${ssrInterpolate(quizData.value.relatedLink.text)}`);
              } else {
                return [
                  createTextVNode(" ← العودة إلى: " + toDisplayString(quizData.value.relatedLink.text), 1)
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<h1 class="text-3xl font-bold text-brown-dark dark:text-beige-light mb-2 text-center sm:text-right" data-v-dafaca82>${ssrInterpolate(quizData.value.quiz.title)}</h1>`);
        if (quizData.value.quiz.description) {
          _push(`<p class="text-gray-600 dark:text-gray-400 text-center sm:text-right" data-v-dafaca82>${ssrInterpolate(quizData.value.quiz.description)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (isTimerActive.value) {
          _push(`<div class="timer-display" data-v-dafaca82> الوقت المتبقي: <span class="font-semibold tabular-nums" data-v-dafaca82>${ssrInterpolate(formattedTimeRemaining.value)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (isViewingAttempt.value && latestAttempt.value && latestAttempt.value.grading_status !== "pending") {
          _push(`<div class="results-summary" data-v-dafaca82><h3 class="results-title" data-v-dafaca82>نتيجة المحاولة</h3>`);
          if (latestAttempt.value.total_score !== null) {
            _push(`<p class="results-score" data-v-dafaca82>${ssrInterpolate(latestAttempt.value.total_score)} / ${ssrInterpolate(totalPossiblePoints.value)} <span class="text-sm font-normal" data-v-dafaca82>(${ssrInterpolate(calculatePercentage(latestAttempt.value.total_score, totalPossiblePoints.value))}%)</span></p>`);
          } else {
            _push(`<p class="results-score-pending" data-v-dafaca82>النتيجة النهائية قيد المراجعة أو غير متاحة بعد.</p>`);
          }
          if (latestAttempt.value.passed === true) {
            _push(`<span class="badge-success" data-v-dafaca82><svg class="badge-icon" fill="currentColor" viewBox="0 0 20 20" data-v-dafaca82><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" data-v-dafaca82></path></svg> ناجح </span>`);
          } else if (latestAttempt.value.passed === false) {
            _push(`<span class="badge-danger" data-v-dafaca82><svg class="badge-icon" fill="currentColor" viewBox="0 0 20 20" data-v-dafaca82><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" data-v-dafaca82></path></svg> لم يتم الاجتياز </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<p class="results-status" data-v-dafaca82>حالة التصحيح: ${ssrInterpolate(getGradingStatusText(latestAttempt.value.grading_status))}</p>`);
          if (latestAttempt.value.submitted_at) {
            _push(`<p class="text-xs text-gray-500 dark:text-gray-400 mt-1" data-v-dafaca82> تاريخ الإرسال: ${ssrInterpolate(new Date(latestAttempt.value.submitted_at).toLocaleString("ar-EG"))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<form class="space-y-8" data-v-dafaca82><!--[-->`);
        ssrRenderList(quizData.value.questions, (question, index) => {
          var _a, _b, _c, _d, _e;
          _push(`<div class="question-block" data-v-dafaca82><p class="question-number" data-v-dafaca82> السؤال ${ssrInterpolate(index + 1)} <span class="text-xs" data-v-dafaca82>(${ssrInterpolate(question.points ?? 1)} نقطة)</span></p><p class="question-text" data-v-dafaca82>${ssrInterpolate(question.question_text)}</p><div class="answer-area" data-v-dafaca82>`);
          if (question.type === "mcq") {
            _push(`<fieldset class="space-y-3" data-v-dafaca82><legend class="sr-only" data-v-dafaca82>خيارات السؤال ${ssrInterpolate(index + 1)}</legend><!--[-->`);
            ssrRenderList(question.question_options, (option) => {
              _push(`<div class="${ssrRenderClass(["option-wrapper", getOptionClassesMcqTf(question, option)])}" data-v-dafaca82><div class="radio-input-wrapper" data-v-dafaca82><input${ssrRenderAttr("id", `option-${option.id}`)}${ssrRenderAttr("name", `question-${question.id}`)} type="radio"${ssrRenderAttr("value", option.id)}${ssrIncludeBooleanAttr(ssrLooseEqual(userAnswers.value[question.id], option.id)) ? " checked" : ""}${ssrIncludeBooleanAttr(isViewingAttempt.value || isSubmitting.value) ? " disabled" : ""} required class="radio-input" data-v-dafaca82></div><div class="option-label-wrapper" data-v-dafaca82><label${ssrRenderAttr("for", `option-${option.id}`)} class="${ssrRenderClass(["option-label", !isViewingAttempt.value && !isSubmitting.value && "cursor-pointer"])}" data-v-dafaca82>${ssrInterpolate(option.option_text)}</label></div>`);
              if (isViewingAttempt.value && option.is_correct) {
                _push(`<span class="correct-indicator" title="الإجابة الصحيحة" data-v-dafaca82><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" data-v-dafaca82><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" data-v-dafaca82></path></svg></span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></fieldset>`);
          } else if (question.type === "true_false" || question.type === "tf") {
            _push(`<fieldset class="space-y-3" data-v-dafaca82><legend class="sr-only" data-v-dafaca82>اختر صح أو خطأ للسؤال ${ssrInterpolate(index + 1)}</legend><div class="${ssrRenderClass(["option-wrapper", getOptionClassesMcqTf(question, { id: -1, is_correct: true }, "true")])}" data-v-dafaca82><div class="radio-input-wrapper" data-v-dafaca82><input${ssrRenderAttr("id", `tf-${question.id}-true`)}${ssrRenderAttr("name", `question-${question.id}`)} type="radio" value="true"${ssrIncludeBooleanAttr(ssrLooseEqual(userAnswers.value[question.id], "true")) ? " checked" : ""}${ssrIncludeBooleanAttr(isViewingAttempt.value || isSubmitting.value) ? " disabled" : ""} required class="radio-input" data-v-dafaca82></div><div class="option-label-wrapper" data-v-dafaca82><label${ssrRenderAttr("for", `tf-${question.id}-true`)} class="${ssrRenderClass(["option-label", !isViewingAttempt.value && !isSubmitting.value && "cursor-pointer"])}" data-v-dafaca82>صح</label></div>`);
            if (isViewingAttempt.value && getCorrectAnswerTf(question.question_options) === true) {
              _push(`<span class="correct-indicator" title="الإجابة الصحيحة" data-v-dafaca82><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" data-v-dafaca82><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" data-v-dafaca82></path></svg></span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="${ssrRenderClass(["option-wrapper", getOptionClassesMcqTf(question, { id: -2, is_correct: false }, "false")])}" data-v-dafaca82><div class="radio-input-wrapper" data-v-dafaca82><input${ssrRenderAttr("id", `tf-${question.id}-false`)}${ssrRenderAttr("name", `question-${question.id}`)} type="radio" value="false"${ssrIncludeBooleanAttr(ssrLooseEqual(userAnswers.value[question.id], "false")) ? " checked" : ""}${ssrIncludeBooleanAttr(isViewingAttempt.value || isSubmitting.value) ? " disabled" : ""} required class="radio-input" data-v-dafaca82></div><div class="option-label-wrapper" data-v-dafaca82><label${ssrRenderAttr("for", `tf-${question.id}-false`)} class="${ssrRenderClass(["option-label", !isViewingAttempt.value && !isSubmitting.value && "cursor-pointer"])}" data-v-dafaca82>خطأ</label></div>`);
            if (isViewingAttempt.value && getCorrectAnswerTf(question.question_options) === false) {
              _push(`<span class="correct-indicator" title="الإجابة الصحيحة" data-v-dafaca82><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" data-v-dafaca82><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" data-v-dafaca82></path></svg></span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></fieldset>`);
          } else if (question.type === "written") {
            _push(`<div data-v-dafaca82><label${ssrRenderAttr("for", `written-${question.id}`)} class="sr-only" data-v-dafaca82>إجابة السؤال ${ssrInterpolate(index + 1)}</label><textarea${ssrRenderAttr("id", `written-${question.id}`)} rows="4"${ssrIncludeBooleanAttr(isViewingAttempt.value || isSubmitting.value) ? " disabled" : ""}${ssrIncludeBooleanAttr(!isViewingAttempt.value) ? " required" : ""} class="textarea-input"${ssrRenderAttr("placeholder", isViewingAttempt.value ? "لا توجد إجابة مكتوبة" : "اكتب إجابتك هنا...")} data-v-dafaca82>${ssrInterpolate(userAnswers.value[question.id])}</textarea>`);
            if (isViewingAttempt.value && ((_c = (_b = (_a = latestAttempt.value) == null ? void 0 : _a.answers_parsed) == null ? void 0 : _b.manual_score_map) == null ? void 0 : _c[question.id]) !== void 0) {
              _push(`<div class="manual-feedback-box" data-v-dafaca82><p class="manual-score" data-v-dafaca82> الدرجة الممنوحة: ${ssrInterpolate(latestAttempt.value.answers_parsed.manual_score_map[question.id])} / ${ssrInterpolate(question.points ?? 1)}</p>`);
              if ((_e = (_d = latestAttempt.value.answers_parsed) == null ? void 0 : _d.feedback_map) == null ? void 0 : _e[question.id]) {
                _push(`<p class="manual-feedback-text" data-v-dafaca82> ملاحظات المصحح: ${ssrInterpolate(latestAttempt.value.answers_parsed.feedback_map[question.id])}</p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]-->`);
        if (!isViewingAttempt.value) {
          _push(`<div class="submit-section" data-v-dafaca82>`);
          if (submitError.value) {
            _push(`<p class="submit-error" data-v-dafaca82>${ssrInterpolate(submitError.value)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button type="submit"${ssrIncludeBooleanAttr(isSubmitting.value || !allQuestionsAnswered.value) ? " disabled" : ""} class="button-submit" data-v-dafaca82>`);
          if (isSubmitting.value) {
            _push(ssrRenderComponent(LoadingSpinner, { class: "w-5 h-5 me-2 animate-spin" }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`<span data-v-dafaca82>${ssrInterpolate(isSubmitting.value ? "جارٍ الإرسال..." : "إرسال الإجابات")}</span></button>`);
          if (!allQuestionsAnswered.value && !isSubmitting.value) {
            _push(`<p class="text-xs text-gray-500 dark:text-gray-400 mt-2" data-v-dafaca82> يرجى الإجابة على جميع الأسئلة لتتمكن من الإرسال. </p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="back-section" data-v-dafaca82><button type="button" class="button-back" data-v-dafaca82><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true" data-v-dafaca82><path fill-rule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.878a.75.75 0 0 1 0 1.5H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.086l-5.5-5.25a.75.75 0 0 1 0-1.086l5.5-5.25a.75.75 0 0 1 1.06.025Z" clip-rule="evenodd" data-v-dafaca82></path></svg> العودة </button></div>`);
        }
        _push(`</form></div>`);
      } else if (!unref(pending) && !loadError.value) {
        _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-dafaca82> لا توجد بيانات لعرضها أو أن الاختبار غير متاح. </div>`);
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
//# sourceMappingURL=_id_.vue2.mjs.map
