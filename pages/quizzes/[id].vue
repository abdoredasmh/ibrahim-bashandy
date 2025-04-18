<template>
  <div class="container mx-auto px-4 py-8 md:py-12">

    <!-- 1. Loading State (Covers Initial Load & Redirect Check) -->
    <div v-if="pending || isRedirecting" class="text-center py-20">
      <LoadingSpinner class="w-12 h-12 mx-auto text-primary" />
      <p class="mt-4 text-gray-600 dark:text-gray-400">
        {{ isRedirecting ? 'جاري التحقق من المحاولات السابقة...' : 'جارٍ تحميل بيانات الاختبار...' }}
      </p>
    </div>

    <!-- 2. Error / Authorization Failed State -->
    <div v-else-if="loadError" class="error-display">
       <div class="flex justify-center items-center text-red-500 dark:text-red-400 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
           <h2 class="text-2xl font-semibold ms-2">
            {{ loadError.message || 'لا يمكن الوصول للاختبار' }}
           </h2>
       </div>
      <p class="text-sm text-red-700 dark:text-red-300 mb-6">
        {{ loadError.details || 'تعذر تحميل الاختبار المطلوب أو أنك لا تملك الصلاحية اللازمة لبدئه.' }}
      </p>
       <NuxtLink :to="getBackLink()" class="button-secondary error-button">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true"><path fill-rule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.878a.75.75 0 0 1 0 1.5H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.086l-5.5-5.25a.75.75 0 0 1 0-1.086l5.5-5.25a.75.75 0 0 1 1.06.025Z" clip-rule="evenodd" /></svg>
        <span>العودة</span>
      </NuxtLink>
    </div>

    <!-- 3. Quiz Taking Interface (Only shown if authorized and no existing attempt) -->
    <div v-else-if="quizData.quiz && quizData.questions && quizData.isAuthorized" class="quiz-interface max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-6 pb-4 border-b border-cream-gray dark:border-gray-700">
            <div v-if="quizData.relatedLink" class="text-sm text-center sm:text-right mb-2">
                <NuxtLink :to="quizData.relatedLink.to" class="text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
                    ← العودة إلى: {{ quizData.relatedLink.text }}
                </NuxtLink>
            </div>
            <h1 class="text-3xl font-bold text-brown-dark dark:text-beige-light mb-2 text-center sm:text-right">
                {{ quizData.quiz.title }}
            </h1>
            <p v-if="quizData.quiz.description" class="text-gray-600 dark:text-gray-400 text-center sm:text-right">
                {{ quizData.quiz.description }}
            </p>
        </div>

        <!-- Timer (Conditional) -->
         <div v-if="isTimerActive" class="timer-display">
             الوقت المتبقي: <span class="font-semibold tabular-nums">{{ formattedTimeRemaining }}</span>
         </div>

      <!-- Quiz Form -->
      <form @submit.prevent="() => handleSubmitAttempt(false)" class="space-y-8">
        <!-- Questions Loop -->
        <div v-for="(question, index) in quizData.questions" :key="question.id" class="question-block">
          <p class="question-number">
            السؤال {{ index + 1 }}
            <span class="text-xs">({{ question.points ?? 1 }} نقطة)</span>
          </p>
          <!-- Securely render question text -->
          <div class="question-text prose prose-sm dark:prose-invert max-w-none" v-html="renderMarkdown(question.question_text ?? '')"></div>

          <!-- Answer Area -->
          <div class="answer-area">
            <!-- MCQ -->
            <!-- SECURITY WARNING: Fetching options with is_correct is insecure client-side for students -->
            <fieldset v-if="question.type === 'mcq'" class="space-y-3">
              <legend class="sr-only">خيارات السؤال {{ index + 1 }}</legend>
              <div v-if="question.question_options && question.question_options.length > 0">
                   <label
                     v-for="option in question.question_options"
                     :key="option.id"
                     :for="`option-${option.id}`"
                     class="option-wrapper border rounded-md p-3 flex items-center cursor-pointer hover:bg-cream-gray/40 dark:hover:bg-gray-700/40 dark:border-gray-600 transition-colors duration-150"
                     :class="{ 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-500': userAnswers[question.id] === option.id }"
                    >
                      <div class="radio-input-wrapper">
                       <input
                         type="radio"
                         :id="`option-${option.id}`"
                         :name="`question-${question.id}`"
                         :value="option.id"
                         v-model="userAnswers[question.id]"
                         :disabled="isSubmitting"
                         required
                         class="radio-input"
                       />
                      </div>
                      <div class="option-label-wrapper">
                        <span class="option-label">{{ option.option_text }}</span>
                      </div>
                   </label>
              </div>
              <p v-else class="text-sm text-red-600 dark:text-red-400 italic">(لا توجد خيارات لهذا السؤال)</p>
            </fieldset>

            <!-- True/False -->
            <fieldset v-else-if="question.type === 'true_false' || question.type === 'tf'" class="space-y-3">
               <legend class="sr-only">اختر صح أو خطأ للسؤال {{ index + 1 }}</legend>
               <label
                 :for="`tf-${question.id}-true`"
                 class="option-wrapper border rounded-md p-3 flex items-center cursor-pointer hover:bg-cream-gray/40 dark:hover:bg-gray-700/40 dark:border-gray-600 transition-colors duration-150"
                 :class="{ 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-500': userAnswers[question.id] === true }"
                >
                 <div class="radio-input-wrapper">
                   <input :id="`tf-${question.id}-true`" :name="`question-${question.id}`" type="radio" :value="true" v-model="userAnswers[question.id]" :disabled="isSubmitting" required class="radio-input"/>
                 </div>
                 <div class="option-label-wrapper">
                   <span class="option-label">صح</span>
                 </div>
               </label>
               <label
                 :for="`tf-${question.id}-false`"
                 class="option-wrapper border rounded-md p-3 flex items-center cursor-pointer hover:bg-cream-gray/40 dark:hover:bg-gray-700/40 dark:border-gray-600 transition-colors duration-150"
                 :class="{ 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-500': userAnswers[question.id] === false }"
                >
                 <div class="radio-input-wrapper">
                   <input :id="`tf-${question.id}-false`" :name="`question-${question.id}`" type="radio" :value="false" v-model="userAnswers[question.id]" :disabled="isSubmitting" required class="radio-input"/>
                 </div>
                 <div class="option-label-wrapper">
                   <span class="option-label">خطأ</span>
                 </div>
               </label>
            </fieldset>

            <!-- Written -->
            <div v-else-if="question.type === 'written'">
               <label :for="`written-${question.id}`" class="sr-only">إجابة السؤال {{ index + 1 }}</label>
              <textarea
                :id="`written-${question.id}`"
                rows="5"
                v-model="userAnswers[question.id]"
                :disabled="isSubmitting"
                required
                class="textarea-input"
                placeholder="اكتب إجابتك هنا..."
              ></textarea>
            </div>
             <!-- Placeholder for other question types -->
             <div v-else class="text-sm text-gray-500 italic">(نوع سؤال غير مدعوم حالياً: {{ question.type }})</div>
          </div>
        </div>

        <!-- Submission Area -->
        <div class="submit-section">
           <p v-if="submitError" class="submit-error">{{ submitError }}</p>
          <button type="submit" :disabled="isSubmitting || !allQuestionsAnswered" class="button-submit">
            <LoadingSpinner v-if="isSubmitting" class="w-5 h-5 me-2 animate-spin" />
            <span>{{ isSubmitting ? 'جارٍ الإرسال...' : 'إرسال الإجابات النهائية' }}</span>
          </button>
           <p v-if="!allQuestionsAnswered && !isSubmitting" class="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
               * يرجى الإجابة على جميع الأسئلة قبل الإرسال.
           </p>
        </div>
      </form>
    </div>

    <!-- Fallback if no data but no error -->
     <div v-else-if="!pending && !loadError && !isRedirecting" class="text-center py-10 text-gray-500 dark:text-gray-400">
         لا توجد بيانات لعرضها أو أن الاختبار غير متاح حاليًا.
     </div>
  </div>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed, watch, shallowRef, nextTick, onUnmounted, onMounted } from 'vue';
import { useRoute, useRouter, navigateTo, createError, useError, useHead } from '#app';
// No need for manual Supabase imports thanks to Nuxt auto-imports
import type { Database, Tables, Enums, Json } from '~/types/database.types';
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- Composables & Store ---
const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const userStore = useUserStore();
const { profile, isLoggedIn } = storeToRefs(userStore);

console.log(`--- QUIZ TAKE PAGE [${route.params.id}] SETUP STARTED ---`);

// --- Types ---
type OptionPojo = Pick<Tables<'question_options'>, 'id' | 'question_id' | 'option_text' | 'is_correct' | 'option_order'>;
type QuestionBasePojo = Pick<Tables<'quiz_questions'>, 'id' | 'quiz_id' | 'question_text' | 'type' | 'question_order' | 'points'>;
type QuestionWithOptionsPojo = QuestionBasePojo & { question_options: OptionPojo[] };
type QuizPojo = Pick<Tables<'quizzes'>, 'id' | 'title' | 'description' | 'is_active' | 'course_id' | 'lesson_id' | 'time_limit_minutes' | 'type' | 'pass_mark_percentage'> & {
    course?: Pick<Tables<'study_courses'>, 'id' | 'title'> | null;
    lesson?: Pick<Tables<'lessons'>, 'id' | 'title' | 'course_id'> | null;
};
type QuizTakeData = {
  quiz: QuizPojo | null;
  questions: QuestionWithOptionsPojo[] | null;
  isEnrolled: boolean;
  existingAttemptId: number | null;
  relatedLink: { to: string; text: string } | null;
  isAuthorized: boolean;
  authFailReason: string;
};
type LoadError = { message: string; details?: string; statusCode?: number };

// --- Route Param Validation ---
const quizIdParam = computed<number | null>(() => {
    const rawParam = route.params.id as string;
    if (!rawParam) { console.error("Quiz ID missing."); return null; }
    const id = parseInt(rawParam, 10);
    if (isNaN(id) || id <= 0) { console.error(`Invalid Quiz ID: "${rawParam}"`); return null; }
    return id;
});

// --- State ---
const quizData = shallowRef<Partial<QuizTakeData>>({});
// Use Record<number, ...> for keys derived from question.id
const userAnswers = ref<Record<number, number | string | boolean | null>>({});
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);
const loadError = ref<LoadError | null>(null);
const isRedirecting = ref(false);

// --- Timer State ---
const timerInterval = ref<NodeJS.Timeout | null>(null);
const timeRemainingSeconds = ref(0);
const isTimerActive = ref(false);
let quizStartTime: number | null = null;

// ***** START: Moved Timer Functions & Handler *****
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (isTimerActive.value && !isSubmitting.value) {
    event.preventDefault();
    event.returnValue = 'هل أنت متأكد أنك تريد مغادرة الصفحة؟ سيستمر وقت الاختبار بالعد، وقد تفقد تقدمك.';
    return event.returnValue;
  }
};
function stopTimer() {
    if (timerInterval.value) { clearInterval(timerInterval.value); timerInterval.value = null; }
    isTimerActive.value = false; quizStartTime = null;
    if (process.client) { window.removeEventListener('beforeunload', handleBeforeUnload); }
    console.log("[Timer] Stopped.");
}
function startTimer(minutes: number) {
    stopTimer(); timeRemainingSeconds.value = minutes * 60; isTimerActive.value = true; quizStartTime = Date.now();
    console.log(`[Timer] Started: ${minutes} mins.`);
    timerInterval.value = setInterval(tickTimer, 1000);
    if (process.client) { window.addEventListener('beforeunload', handleBeforeUnload); }
}
function tickTimer() {
    if (timeRemainingSeconds.value > 0) { timeRemainingSeconds.value--; }
    else { console.log("[Timer] Time up! Auto-submitting."); stopTimer(); handleSubmitAttempt(true); }
}
// ***** END: Moved Timer Functions & Handler *****

// --- Initial Auth Check (Client-Side) ---
onMounted(() => {
    if (!isLoggedIn.value) { navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`, { replace: true }); return; }
    if (quizIdParam.value === null) { showError({ statusCode: 400, statusMessage: 'معرف اختبار غير صالح.', fatal: true }); }
});

// --- Data Fetching & Authorization (Simplified Query Approach) ---
const { data, pending, error: asyncDataError, refresh } = await useAsyncData<QuizTakeData>(
    `quizTakeData-${quizIdParam.value}-${profile.value?.id ?? 'guest'}`,
    async () => {
        isRedirecting.value = true; loadError.value = null;
        const currentQuizId = quizIdParam.value; const currentUser = profile.value;
        if (!currentUser?.id || currentQuizId === null) throw createError({ statusCode: 400, statusMessage: 'بيانات غير كافية.', fatal: true });
        console.log(`Checking attempt: Q${currentQuizId}, U${currentUser.id}`);
        try {
            const { data: existingAttempt, error: attemptCheckError } = await supabase.from('quiz_attempts').select('id').eq('quiz_id', currentQuizId).eq('user_id', currentUser.id).limit(1).maybeSingle();
            if (attemptCheckError) throw createError({ statusCode: 500, statusMessage: 'فشل التحقق.' });
            const existingAttemptId = existingAttempt?.id ?? null;
            if (existingAttemptId !== null) { console.log(`Attempt ${existingAttemptId} found.`); return { quiz: null, questions: null, isEnrolled: false, existingAttemptId, relatedLink: null, isAuthorized: false, authFailReason: 'Exist' }; }

            console.log(`No attempt found. Fetching details...`);
            const { data: fetchedQuiz, error: quizFetchError } = await supabase.from('quizzes').select(`*, course:study_courses!course_id(id, title), lesson:lessons!lesson_id(id, title, course_id)`).eq('id', currentQuizId).single();
            if (quizFetchError || !fetchedQuiz) throw createError({ statusCode: quizFetchError?.code === 'PGRST116' ? 404 : 500, statusMessage: 'الاختبار غير موجود.', fatal: true });
            let relatedLink: RelatedLink = null; if (fetchedQuiz.lesson?.id && fetchedQuiz.lesson.course_id) relatedLink = { to: `/study/courses/${fetchedQuiz.lesson.course_id}/lessons/${fetchedQuiz.lesson.id}`, text: `درس: ${fetchedQuiz.lesson.title}` }; else if (fetchedQuiz.course?.id) relatedLink = { to: `/study/courses/${fetchedQuiz.course.id}`, text: `دورة: ${fetchedQuiz.course.title}` };
            let isAuthorized = true; let authFailReason = ''; let isEnrolled = true; if (!fetchedQuiz.is_active) { authFailReason = 'الاختبار غير نشط.'; isAuthorized = false; }
            if (fetchedQuiz.course_id && isAuthorized) { const { count, error } = await supabase.from('course_enrollments').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id).eq('course_id', fetchedQuiz.course_id); if (error) { authFailReason = 'فشل التحقق.'; isAuthorized = false; } else { isEnrolled = (count ?? 0) > 0; if (!isEnrolled) { authFailReason = 'غير منتسب.'; isAuthorized = false; } } }
            if (!isAuthorized) throw createError({ statusCode: 403, statusMessage: authFailReason, fatal: true });

            // **** Fetch questions and options separately ****
            const { data: fetchedQuestionsData, error: questionsFetchError } = await supabase
                .from('quiz_questions').select(`id, quiz_id, question_text, type, question_order, points`).eq('quiz_id', currentQuizId).order('question_order');
            if (questionsFetchError) throw questionsFetchError;
            if (!fetchedQuestionsData || fetchedQuestionsData.length === 0) { console.warn("No questions found!"); return { quiz: null, questions: [], isEnrolled, existingAttemptId: null, relatedLink, isAuthorized: true, authFailReason: 'No questions' }; }
            const questionIds = fetchedQuestionsData.map(q => q.id);

            let fetchedOptionsData: OptionPojo[] = [];
            if (questionIds.length > 0) {
                const { data: options, error: optionsFetchError } = await supabase
                    .from('question_options').select(`id, question_id, option_text, is_correct, option_order`).in('question_id', questionIds).order('option_order');
                if (optionsFetchError) console.error("Error fetching options:", optionsFetchError);
                else fetchedOptionsData = (options || []).map(opt => ({ // Ensure POJO structure
                    id: opt.id, question_id: opt.question_id, option_text: opt.option_text,
                    is_correct: opt.is_correct, option_order: opt.option_order
                }));
            }
            console.log(`Fetched ${fetchedOptionsData.length} options for ${questionIds.length} questions.`);

            const optionsMap = new Map<number, OptionPojo[]>();
            fetchedOptionsData.forEach(opt => { if (opt.question_id !== null) { const existing = optionsMap.get(opt.question_id) || []; existing.push(opt); optionsMap.set(opt.question_id, existing); } });

            const sanitizedQuestions: QuestionWithOptionsPojo[] = fetchedQuestionsData.map(q => ({
                id: q.id, quiz_id: q.quiz_id, question_text: q.question_text, type: q.type, question_order: q.question_order, points: q.points,
                question_options: optionsMap.get(q.id) || [] // Assign mapped options
            }));
            const sanitizedQuiz: QuizPojo = { id: fetchedQuiz.id, title: fetchedQuiz.title, description: fetchedQuiz.description, is_active: fetchedQuiz.is_active, course_id: fetchedQuiz.course_id, lesson_id: fetchedQuiz.lesson_id, time_limit_minutes: fetchedQuiz.time_limit_minutes, type: fetchedQuiz.type, pass_mark_percentage: fetchedQuiz.pass_mark_percentage, course: fetchedQuiz.course ? { id: fetchedQuiz.course.id, title: fetchedQuiz.course.title } : null, lesson: fetchedQuiz.lesson ? { id: fetchedQuiz.lesson.id, title: fetchedQuiz.lesson.title, course_id: fetchedQuiz.lesson.course_id } : null, };

            console.log(`Fetch successful.`); return { quiz: sanitizedQuiz, questions: sanitizedQuestions, isEnrolled, existingAttemptId: null, relatedLink, isAuthorized: true, authFailReason: '' };
        } catch (err: any) { console.error('!!! ASYNC DATA ERROR !!!:', err); loadError.value = { message: err.data?.message || err.message || 'خطأ غير معروف', details: err.data?.details, statusCode: err.statusCode || 500 }; return { quiz: null, questions: null, isEnrolled: false, existingAttemptId: null, relatedLink: null, isAuthorized: false, authFailReason: loadError.value.message }; }
        finally { isRedirecting.value = false; }
    },
    { watch: [quizIdParam, () => profile.value?.id] }
);

// --- Watcher for Redirection & State Initialization ---
watch(data, async (newData) => {
    stopTimer();
    if (newData?.existingAttemptId) {
        isRedirecting.value = true; console.log(`Redirecting to results for attempt ${newData.existingAttemptId}...`); await nextTick();
        try { await navigateTo(`/quizzes/results/${newData.existingAttemptId}`, { replace: true }); }
        catch (navError) { console.error("Nav error:", navError); loadError.value = { message: 'فشل توجيهك لصفحة النتائج.' }; isRedirecting.value = false; }
        return;
    }
    if (newData?.quiz && newData.questions && newData.isAuthorized && !loadError.value) {
        console.log("[Watch] Setting up quiz taking state. Questions:", newData.questions.length);
        if(newData.questions.length > 0 && newData.questions[0].question_options) { console.log("[Watch] Opts[0]:", JSON.stringify(newData.questions[0].question_options)); } // Log options
        quizData.value = newData; userAnswers.value = {}; isSubmitting.value = false; submitError.value = null;
        newData.questions.forEach(q => { userAnswers.value[q.id] = null; });
        if (newData.quiz.time_limit_minutes && newData.quiz.time_limit_minutes > 0) startTimer(newData.quiz.time_limit_minutes);
        else isTimerActive.value = false;
        isRedirecting.value = false;
    } else if (!pending.value && !isRedirecting.value) {
         console.warn("[Watch] Invalid data after load/no redirect.");
         if (!loadError.value) loadError.value = { message: 'فشل تحميل بيانات الاختبار.' };
         quizData.value = {}; userAnswers.value = {}; isRedirecting.value = false;
    }
}, { immediate: true });

// --- Computed Properties ---
const allQuestionsAnswered = computed(() => {
    if (!quizData.value?.questions) return false;
    return quizData.value.questions.every(q => userAnswers.value[q.id] !== null && userAnswers.value[q.id] !== undefined && String(userAnswers.value[q.id]).trim() !== '');
});
const formattedTimeRemaining = computed(() => {
    const minutes = Math.floor(timeRemainingSeconds.value / 60); const seconds = timeRemainingSeconds.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// --- Helper Functions ---
const renderMarkdown = (text: string): string => { if (!text) return ''; marked.setOptions({ breaks: true, gfm: true }); if (process.client) return DOMPurify.sanitize(marked.parse(text), { USE_PROFILES: { html: true } }); return marked.parse(text); };
const getBackLink = (): string => quizData.value?.relatedLink?.to ?? (quizData.value?.quiz?.course_id ? `/study/courses/${quizData.value.quiz.course_id}` : '/study');

// --- Submission Action ---
async function handleSubmitAttempt(autoSubmitted: boolean = false) {
    if (!quizData.value?.quiz || !profile.value?.id || isSubmitting.value) return;
    stopTimer();
    if (!autoSubmitted && !allQuestionsAnswered.value) {
        submitError.value = `يرجى الإجابة على جميع الأسئلة.`;
        const firstUnanswered = quizData.value.questions?.find(q => userAnswers.value[q.id] === null || String(userAnswers.value[q.id]).trim() === '');
        if (firstUnanswered) { document.querySelector(`#written-${firstUnanswered.id}, [name="question-${firstUnanswered.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        return;
    }
    isSubmitting.value = true; submitError.value = null;
    const currentQuiz = quizData.value.quiz; const currentUserId = profile.value.id;
    const needsManualGrading = quizData.value.questions?.some(q => q.type === 'written') ?? false;
    const initialGradingStatus: Enums<'grading_status_enum'> = needsManualGrading ? 'pending_manual' : 'pending';
    const attemptPayload: Omit<Tables<'quiz_attempts'>, 'id' | 'created_at' | 'started_at'> = {
        user_id: currentUserId, quiz_id: currentQuiz.id, submitted_at: new Date().toISOString(),
        answers: userAnswers.value as unknown as Json, attempt_number: 1, grading_status: initialGradingStatus,
        score: null, manual_score: null, total_score: null, passed: null,
    };
    console.log("Submitting quiz attempt:", attemptPayload);
    try {
        const { data: newAttempt, error: insertError } = await supabase.from('quiz_attempts').insert(attemptPayload).select('id').single();
        if (insertError) throw insertError; if (!newAttempt?.id) throw new Error("Failed to get new attempt ID.");
        console.log(`Submitted! New Attempt ID: ${newAttempt.id}. Redirecting...`);
        await navigateTo(`/quizzes/results/${newAttempt.id}`, { replace: true });
    } catch (err: any) {
        console.error("Error submitting quiz attempt:", err);
        submitError.value = `فشل إرسال الإجابات: ${err.message || 'حدث خطأ غير متوقع.'}`;
        isSubmitting.value = false;
    }
}

// --- Cleanup ---
onUnmounted(() => { stopTimer(); });

// --- SEO Meta Tags ---
watch([quizData, pending, loadError, isRedirecting], ([newQuizData, loadingState, errorState, redirectState]) => {
    let pageTitle = 'الاختبار'; let description = 'قم بحل أسئلة الاختبار.';
    if (loadingState || redirectState) { pageTitle = 'جارٍ التحميل...'; }
    else if (errorState || !newQuizData?.quiz) { pageTitle = 'خطأ في الاختبار'; description = errorState?.message || 'تعذر الوصول للاختبار.'; }
    else { pageTitle = newQuizData.quiz.title || 'اختبار'; description = newQuizData.quiz.description?.substring(0, 160) || `اختبار بعنوان "${pageTitle}"`; }
    useHead({ title: pageTitle, meta: [ { name: 'description', content: description } ] });
 }, { immediate: true });

</script>

<style scoped>
/* Styles from previous version, refined */

.quiz-interface { @apply space-y-6 md:space-y-8; }
.error-display { @apply text-center py-10 px-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg max-w-lg mx-auto shadow-md; }
.timer-display { @apply text-center font-semibold text-lg p-3 mb-4 rounded-md bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 border border-yellow-300 dark:border-yellow-600 shadow sticky top-0 z-10; }

/* Question Block */
.question-block { @apply p-5 bg-beige-light dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700 transition-shadow duration-200; }
.question-block:focus-within { @apply ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800; }
.question-number { @apply text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1; }
.question-text { @apply text-lg font-medium text-brown-dark dark:text-beige-light mb-4 whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none; }
.question-text :deep(p) { @apply mb-2 last:mb-0; }
.answer-area { @apply mt-4; }

/* Options (MCQ/TF) */
.option-wrapper { @apply relative flex items-start p-3 rounded-md border transition-colors duration-150; }
.radio-input-wrapper { @apply flex items-center h-5; }
.radio-input { @apply focus:ring-primary h-4 w-4 text-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-primary dark:focus:ring-primary dark:focus:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed; }
.option-label-wrapper { @apply ms-3 text-sm flex-grow; }
.option-label { @apply font-medium text-gray-700 dark:text-gray-300; }

/* Written Answer */
.textarea-input {
    @apply shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-cream-gray dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-beige-light dark:placeholder-gray-500
           disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed min-h-[8rem];
}

/* Buttons & Submission */
.submit-section { @apply pt-6 border-t border-cream-gray dark:border-gray-700 text-center; }
.submit-error { @apply text-red-600 dark:text-red-400 text-sm mb-4; }
.button-submit { @apply inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 dark:focus:ring-offset-gray-900; }

/* Base button styles */
.button-base { @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150; }
.button-secondary { @apply button-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-muted; }
.error-button { @apply border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-800/60 hover:bg-red-200 dark:hover:bg-red-700/70 focus:ring-red-500; }

/* Ensure focus states are clearly visible */
*:focus-visible { outline: 2px solid var(--color-primary, #4f46e5); outline-offset: 2px; }

/* Markdown styles */
.question-text :deep(strong) { @apply font-semibold; }
.question-text :deep(em) { @apply italic; }
.question-text :deep(ul), .question-text :deep(ol) { @apply my-2 ms-5 list-outside; }
.question-text :deep(li) { @apply mb-1; }

</style>