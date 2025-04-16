<template>
  <div class="container mx-auto px-4 py-8">

    <!-- 1. Loading State -->
    <div v-if="pending && !initialDataLoaded" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل بيانات الاختبار...</p>
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
        {{ loadError.details || 'تعذر تحميل الاختبار المطلوب أو أنك لا تملك الصلاحية اللازمة لبدئه/عرضه.' }}
      </p>
       <NuxtLink
         :to="getBackLink()"
         class="button-secondary error-button"
       >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" /></svg>
        <span>العودة</span>
      </NuxtLink>
    </div>

    <!-- 3. Quiz Interface -->
    <div v-else-if="quizData.quiz" class="quiz-interface max-w-4xl mx-auto">
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

        <!-- Display Overall Results (Viewing Mode) -->
        <div v-if="isViewingAttempt && latestAttempt && latestAttempt.grading_status !== 'pending'"
            class="results-summary">
           <h3 class="results-title">نتيجة المحاولة</h3>
           <p v-if="latestAttempt.total_score !== null" class="results-score">
               {{ latestAttempt.total_score }} / {{ totalPossiblePoints }}
               <span class="text-sm font-normal">({{ calculatePercentage(latestAttempt.total_score, totalPossiblePoints) }}%)</span>
           </p>
           <p v-else class="results-score-pending">النتيجة النهائية قيد المراجعة أو غير متاحة بعد.</p>
           <!-- Pass/Fail Badges -->
           <span v-if="latestAttempt.passed === true" class="badge-success">
               <svg class="badge-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
               ناجح
           </span>
           <span v-else-if="latestAttempt.passed === false" class="badge-danger">
                <svg class="badge-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
               لم يتم الاجتياز
           </span>
           <p class="results-status">حالة التصحيح: {{ getGradingStatusText(latestAttempt.grading_status) }}</p>
           <p v-if="latestAttempt.submitted_at" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                تاريخ الإرسال: {{ new Date(latestAttempt.submitted_at).toLocaleString('ar-EG') }}
           </p>
       </div>

      <!-- Quiz Form -->
      <form @submit.prevent="() => handleSubmitAttempt(false)" class="space-y-8">
        <div v-for="(question, index) in quizData.questions" :key="question.id" class="question-block">
          <p class="question-number">
            السؤال {{ index + 1 }}
            <span class="text-xs">({{ question.points ?? 1 }} نقطة)</span>
          </p>
          <p class="question-text">{{ question.question_text }}</p>

          <!-- Answer Area -->
          <div class="answer-area">
            <!-- MCQ -->
            <!-- NOTE: Reading question.question_options assumes RLS allows it or you use RPC/View -->
            <fieldset v-if="question.type === 'mcq'" class="space-y-3">
              <legend class="sr-only">خيارات السؤال {{ index + 1 }}</legend>
              <div v-for="option in question.question_options" :key="option.id"
                   :class="['option-wrapper', getOptionClassesMcqTf(question, option)]">
                 <div class="radio-input-wrapper">
                  <input
                    :id="`option-${option.id}`" :name="`question-${question.id}`" type="radio"
                    :value="option.id" v-model="userAnswers[question.id]"
                    :disabled="isViewingAttempt || isSubmitting" required class="radio-input" />
                 </div>
                 <div class="option-label-wrapper">
                   <label :for="`option-${option.id}`" :class="['option-label', (!isViewingAttempt && !isSubmitting) && 'cursor-pointer']">
                     {{ option.option_text }}
                   </label>
                 </div>
                 <span v-if="isViewingAttempt && option.is_correct" class="correct-indicator" title="الإجابة الصحيحة">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
                 </span>
              </div>
            </fieldset>

            <!-- True/False -->
            <fieldset v-else-if="question.type === 'true_false' || question.type === 'tf'" class="space-y-3">
               <legend class="sr-only">اختر صح أو خطأ للسؤال {{ index + 1 }}</legend>
               <!-- NOTE: Reading question.question_options assumes RLS allows it or you use RPC/View -->
               <div :class="['option-wrapper', getOptionClassesMcqTf(question, { id: -1, is_correct: true, option_text: 'صح' }, 'true')]">
                 <div class="radio-input-wrapper">
                   <input :id="`tf-${question.id}-true`" :name="`question-${question.id}`" type="radio" value="true" v-model="userAnswers[question.id]" :disabled="isViewingAttempt || isSubmitting" required class="radio-input"/>
                 </div>
                 <div class="option-label-wrapper">
                   <label :for="`tf-${question.id}-true`" :class="['option-label', (!isViewingAttempt && !isSubmitting) && 'cursor-pointer']">صح</label>
                 </div>
                 <span v-if="isViewingAttempt && getCorrectAnswerTf(question.question_options) === true" class="correct-indicator" title="الإجابة الصحيحة">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
                 </span>
               </div>
               <div :class="['option-wrapper', getOptionClassesMcqTf(question, { id: -2, is_correct: false, option_text: 'خطأ' }, 'false')]">
                 <div class="radio-input-wrapper">
                   <input :id="`tf-${question.id}-false`" :name="`question-${question.id}`" type="radio" value="false" v-model="userAnswers[question.id]" :disabled="isViewingAttempt || isSubmitting" required class="radio-input"/>
                 </div>
                 <div class="option-label-wrapper">
                   <label :for="`tf-${question.id}-false`" :class="['option-label', (!isViewingAttempt && !isSubmitting) && 'cursor-pointer']">خطأ</label>
                 </div>
                 <span v-if="isViewingAttempt && getCorrectAnswerTf(question.question_options) === false" class="correct-indicator" title="الإجابة الصحيحة">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
                 </span>
               </div>
            </fieldset>

            <!-- Written -->
            <div v-else-if="question.type === 'written'">
               <label :for="`written-${question.id}`" class="sr-only">إجابة السؤال {{ index + 1 }}</label>
              <textarea
                :id="`written-${question.id}`"
                rows="4"
                v-model="userAnswers[question.id]"
                :disabled="isViewingAttempt || isSubmitting"
                :required="!isViewingAttempt"
                class="textarea-input"
                :placeholder="isViewingAttempt ? 'لا توجد إجابة مكتوبة' : 'اكتب إجابتك هنا...'"
              ></textarea>
              <!-- Display Manual Score/Feedback (from answers JSONB) -->
              <div v-if="isViewingAttempt && latestAttempt?.answers_parsed?.manual_score_map?.[question.id] !== undefined"
                   class="manual-feedback-box">
                  <p class="manual-score">
                      الدرجة الممنوحة: {{ latestAttempt.answers_parsed.manual_score_map[question.id] }} / {{ question.points ?? 1 }}
                  </p>
                  <p v-if="latestAttempt.answers_parsed?.feedback_map?.[question.id]" class="manual-feedback-text">
                      ملاحظات المصحح: {{ latestAttempt.answers_parsed.feedback_map[question.id] }}
                  </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Submission Area (Taking Mode) -->
        <div v-if="!isViewingAttempt" class="submit-section">
           <p v-if="submitError" class="submit-error">{{ submitError }}</p>
          <button type="submit" :disabled="isSubmitting || !allQuestionsAnswered" class="button-submit">
            <LoadingSpinner v-if="isSubmitting" class="w-5 h-5 me-2 animate-spin" />
            <span>{{ isSubmitting ? 'جارٍ الإرسال...' : 'إرسال الإجابات' }}</span>
          </button>
           <p v-if="!allQuestionsAnswered && !isSubmitting" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
               يرجى الإجابة على جميع الأسئلة لتتمكن من الإرسال.
           </p>
        </div>

         <!-- Back Button (Viewing Mode) -->
         <div v-else class="back-section">
             <button type="button" @click="router.back()" class="button-back">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true"><path fill-rule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.878a.75.75 0 0 1 0 1.5H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.086l-5.5-5.25a.75.75 0 0 1 0-1.086l5.5-5.25a.75.75 0 0 1 1.06.025Z" clip-rule="evenodd" /></svg>
                 العودة
             </button>
         </div>

      </form>
    </div>
    <!-- Fallback -->
     <div v-else-if="!pending && !loadError" class="text-center py-10 text-gray-500 dark:text-gray-400">
         لا توجد بيانات لعرضها أو أن الاختبار غير متاح.
     </div>

  </div>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed, watch, shallowRef, nextTick, onUnmounted } from 'vue';
import { useRoute, useSupabaseClient, useAsyncData, showError, navigateTo, createError, useRouter, useHead } from '#imports';
import type { Database, Tables, Enums, Json } from '~/types/database.types';
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '~/components/LoadingSpinner.vue';

// --- Composables & Store ---
const route = useRoute();
const supabase = useSupabaseClient<Database>();
const userStore = useUserStore();
const { profile, isLoggedIn } = storeToRefs(userStore);
const router = useRouter();

console.log(`--- QUIZ PAGE [${route.params.id}] SETUP STARTED ---`);

// --- Types ---
type Option = Tables<'question_options'>;
type QuestionWithOptions = Tables<'quiz_questions'> & {
  question_options: Option[]; // Ensure options are fetched
};
type QuizAttempt = Tables<'quiz_attempts'> & {
  answers_parsed?: Record<number | string, any>;
};
type RelatedLink = { to: string; text: string } | null;
type QuizData = {
  quiz: Tables<'quizzes'> & { course?: Pick<Tables<'study_courses'>, 'id' | 'title'>, lesson?: Pick<Tables<'lessons'>, 'id' | 'title' | 'course_id'> };
  questions: QuestionWithOptions[];
  isEnrolled: boolean;
  previousAttemptsCount: number;
  latestAttempt: QuizAttempt | null;
  relatedLink: RelatedLink;
  canTakeNewAttempt: boolean; // Authorization result
};
type LoadError = { message: string; details?: string; statusCode?: number };

// --- Route Param Validation ---
const quizIdParam = computed<number | null>(() => { /* ... (same as before) ... */
    const rawParam = route.params.id as string;
     if (!rawParam) {
        // Cannot use showError here as it might run before hydration
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

// --- State ---
const quizData = shallowRef<Partial<QuizData>>({}); // Start with partial empty object
const latestAttempt = shallowRef<QuizAttempt | null>(null);
const userAnswers = ref<Record<string | number, string | number | boolean | null>>({});
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);
const loadError = ref<LoadError | null>(null);
const isViewingAttempt = ref(false);
const initialDataLoaded = ref(false); // Track if first load finished

// --- Timer State ---
const timerInterval = ref<NodeJS.Timeout | null>(null);
const timeRemainingSeconds = ref(0);
const isTimerActive = ref(false);

// --- Initial Auth Check ---
if (process.client && !isLoggedIn.value) {
    const redirectPath = route.fullPath;
    console.warn("User not logged in, redirecting to login.");
    navigateTo(`/login?redirect=${encodeURIComponent(redirectPath)}`, { replace: true });
}
if (quizIdParam.value === null && process.client) {
    showError({ statusCode: 400, statusMessage: 'معرف اختبار غير صالح.', fatal: true });
}

// --- Data Fetching & Authorization ---
const { data, pending, error: asyncDataError, refresh } = await useAsyncData<QuizData>(
    `quizViewData-${quizIdParam.value}-${profile.value?.id ?? 'guest'}`, // Unique key
    async () => {
        initialDataLoaded.value = false; // Reset loading flag
        loadError.value = null; // Reset errors on each fetch

        const currentQuizId = quizIdParam.value;
        const currentUser = profile.value;

        // --- Pre-fetch Checks ---
        if (!currentUser?.id) throw createError({ statusCode: 401, statusMessage: 'لم يتم التعرف على المستخدم.', fatal: true });
        if (currentQuizId === null) throw createError({ statusCode: 400, statusMessage: 'معرف الاختبار غير صالح.', fatal: true });

        console.log(`--- Fetching data for Quiz ${currentQuizId}, User ${currentUser.id} ---`);

        try {
            // 1. Fetch Quiz Details (includes potential course/lesson)
            const { data: fetchedQuiz, error: quizFetchError } = await supabase
                .from('quizzes')
                .select(`*, course:study_courses!course_id ( id, title ), lesson:lessons!lesson_id ( id, title, course_id )`)
                .eq('id', currentQuizId)
                .single(); // Use single, expect one result

            if (quizFetchError || !fetchedQuiz) {
                throw createError({ statusCode: quizFetchError?.code === 'PGRST116' ? 404 : 500, statusMessage: 'الاختبار غير موجود أو حدث خطأ.', fatal: true });
            }

            let relatedLink: RelatedLink = null; /* ... (same as before) ... */
             if (fetchedQuiz.lesson?.id && fetchedQuiz.lesson.course_id) {
                 relatedLink = { to: `/study/courses/${fetchedQuiz.lesson.course_id}/lessons/${fetchedQuiz.lesson.id}`, text: `درس: ${fetchedQuiz.lesson.title}` };
             } else if (fetchedQuiz.course?.id) {
                 relatedLink = { to: `/study/courses/${fetchedQuiz.course.id}`, text: `دورة: ${fetchedQuiz.course.title}` };
             }


            // 2. Fetch Questions and Options (CRITICAL: RLS/RPC/View needed for student options)
            // For now, assuming direct fetch works (requires permissive RLS or testing as admin)
            const { data: fetchedQuestionsData, error: questionsFetchError } = await supabase
                .from('quiz_questions')
                .select(`*, question_options (*)`) // Select options nested
                .eq('quiz_id', currentQuizId)
                .order('question_order', { ascending: true, nullsLast: true })
                .order('option_order', { referencedTable: 'question_options', ascending: true, nullsLast: true }); // Order options too

            if (questionsFetchError) throw questionsFetchError;
            const fetchedQuestions = (fetchedQuestionsData || []) as QuestionWithOptions[];

            // 3. Fetch User's Attempts
            const { data: fetchedAttempts, error: attemptsError } = await supabase
                 .from('quiz_attempts')
                 .select('*')
                 .eq('quiz_id', currentQuizId)
                 .eq('user_id', currentUser.id)
                 .order('submitted_at', { ascending: false });

            if (attemptsError) throw createError({ statusCode: 500, statusMessage: 'فشل جلب المحاولات السابقة.' });
            const attemptsDone = fetchedAttempts?.length ?? 0;
            let latestAttemptData = (fetchedAttempts && fetchedAttempts.length > 0 ? fetchedAttempts[0] : null) as QuizAttempt | null;

            if (latestAttemptData?.answers && typeof latestAttemptData.answers === 'object') {
                latestAttemptData.answers_parsed = { ...(latestAttemptData.answers as Record<string, any>) };
            } else {
                 if(latestAttemptData) latestAttemptData.answers_parsed = {}; // Ensure it exists even if empty
            }

            // 4. Check Enrollment
            let isEnrolled = true; /* ... (same as before, improved error handling) ... */
             if (fetchedQuiz.course_id) {
                 const { count: enrollmentCount, error: enrollmentError } = await supabase
                     .from('course_enrollments')
                     .select('course_id', { count: 'exact', head: true })
                     .eq('user_id', currentUser.id)
                     .eq('course_id', fetchedQuiz.course_id);
                 isEnrolled = (enrollmentCount ?? 0) > 0;
                 if (enrollmentError) console.error(`Enrollment check failed: ${enrollmentError.message}`); // Log error but don't block
             }

            // 5. Authorization Logic: Determine if a new attempt can be taken
            let canTakeNewAttempt = true;
            let authFailReason = '';
            if (!fetchedQuiz.is_active) { authFailReason = 'هذا الاختبار غير نشط حالياً.'; canTakeNewAttempt = false; }
            else if (fetchedQuiz.course_id && !isEnrolled) { authFailReason = 'يجب أن تكون منتسبًا للدورة المرتبطة بهذا الاختبار أولاً.'; canTakeNewAttempt = false; }
            else if (fetchedQuiz.max_attempts !== null && attemptsDone >= fetchedQuiz.max_attempts) { authFailReason = `لقد استنفدت جميع المحاولات المسموحة (${fetchedQuiz.max_attempts}).`; canTakeNewAttempt = false; }
            // TODO: Add due date check if needed:
            // else if (fetchedQuiz.due_date && new Date() > new Date(fetchedQuiz.due_date)) { ... }

             // If cannot take and no previous attempt -> Forbidden
            if (!canTakeNewAttempt && !latestAttemptData) {
                throw createError({ statusCode: 403, statusMessage: authFailReason || 'لا يمكنك الوصول لهذا الاختبار.', fatal: true });
            }

            console.log(`--- Quiz data fetch successful. Can take new attempt: ${canTakeNewAttempt} ---`);

            return {
                quiz: fetchedQuiz,
                questions: fetchedQuestions,
                isEnrolled: isEnrolled,
                previousAttemptsCount: attemptsDone,
                latestAttempt: latestAttemptData,
                relatedLink: relatedLink,
                canTakeNewAttempt: canTakeNewAttempt
            };

        } catch (err: any) {
             console.error('!!! ERROR in useAsyncData quiz fetch !!!:', err);
             const message = err.data?.message || err.message || 'خطأ غير معروف';
             const details = err.data?.details || undefined;
             const statusCode = err.statusCode || 500;
             // Set the loadError ref instead of throwing immediately if not fatal
             loadError.value = { message, details, statusCode };
             return {} as QuizData; // Return empty object on error to avoid breaking structure
        } finally {
             initialDataLoaded.value = true; // Mark that initial load attempt finished
        }
    }, {
        watch: [quizIdParam, () => profile.value?.id] // Re-fetch if quiz or user changes
    }
);

// --- Update Local State & Start Timer ---
watch(data, (newData) => {
    stopTimer(); // Stop any previous timer when data changes
    if (newData && newData.quiz && !loadError.value) {
        quizData.value = newData;
        latestAttempt.value = newData.latestAttempt;
        userAnswers.value = {}; // Always reset answers first

        if (newData.canTakeNewAttempt) {
            isViewingAttempt.value = false;
            // Initialize answers structure
            newData.questions.forEach(q => { userAnswers.value[q.id] = null; });
            console.log("[Watch] Mode: Taking New Attempt");
            // Check if timer should start
            // ----> Adjust quiz type check as needed <----
             if (newData.quiz.time_limit_minutes && (newData.quiz.type === 'course_final' || newData.quiz.type === 'module_final')) { // Example type check
                startTimer(newData.quiz.time_limit_minutes);
             }
        } else if (newData.latestAttempt) {
            isViewingAttempt.value = true;
            userAnswers.value = newData.latestAttempt.answers_parsed ?? {};
            // Ensure all questions have an entry in answers for reactivity
             newData.questions.forEach(q => { if (!(q.id in userAnswers.value)) { userAnswers.value[q.id] = null; } });
            console.log("[Watch] Mode: Viewing Last Attempt");
        } else {
             // This case implies !canTakeNewAttempt && !latestAttempt which should have thrown 403
             console.error("[Watch] Invalid state: Cannot take attempt and no previous attempt found.");
             isViewingAttempt.value = false; // Default state
        }
    } else {
        // Handle case where data becomes null or error occurred after initial load
        quizData.value = {};
        latestAttempt.value = null;
        userAnswers.value = {};
        isViewingAttempt.value = false;
        if (!pending.value && !loadError.value && initialDataLoaded.value) {
             console.warn("[Watch] Data is null/invalid after load without specific error. Displaying fallback.");
             // Optionally set a generic load error if needed
             loadError.value = loadError.value ?? { message: 'فشل تحميل بيانات الاختبار.', details: 'يرجى المحاولة مرة أخرى.' };
        }
    }
}, { immediate: true });

// --- Computed Properties ---
const totalPossiblePoints = computed(() => { /* ... (same as before) ... */
    return quizData.value?.questions?.reduce((sum, q) => sum + (q.points ?? 1), 0) ?? 0; // Default points to 1
});

const allQuestionsAnswered = computed(() => {
    if (!quizData.value?.questions) return false;
    return quizData.value.questions.every(q =>
        userAnswers.value[q.id] !== null && userAnswers.value[q.id] !== undefined && userAnswers.value[q.id] !== ''
    );
});

const formattedTimeRemaining = computed(() => {
    const minutes = Math.floor(timeRemainingSeconds.value / 60);
    const seconds = timeRemainingSeconds.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// --- Helper Functions ---
function getOptionClassesMcqTf( /* ... (same as before - requires fetched options) ... */
    question: QuestionWithOptions,
    option: Option | { id: number | string, is_correct: boolean, option_text: string },
    tfValue?: 'true' | 'false'
): string {
    const baseClasses = 'relative flex items-start p-3 rounded-md border transition-colors duration-150';
    if (!isViewingAttempt.value || !latestAttempt.value?.answers_parsed) {
        return `${baseClasses} border-gray-200 dark:border-gray-600 hover:bg-cream-gray/40 dark:hover:bg-gray-700/40`;
    }
    const submittedAnswer = latestAttempt.value.answers_parsed[question.id];
    // --- IMPORTANT: Assumes option.is_correct is available. NEEDS RLS/RPC/View FIX for students ---
    const isCorrectOption = tfValue !== undefined
        ? getCorrectAnswerTf(question.question_options)?.toString() === tfValue
        : !!option.is_correct; // Use !! to ensure boolean
    const isSelected = tfValue !== undefined
        ? String(submittedAnswer) === tfValue
        : submittedAnswer === option.id;

    if (isCorrectOption) {
        return `${baseClasses} border-golden-calm dark:border-golden-calm bg-golden-calm/10 dark:bg-golden-calm/20 ring-1 ring-golden-calm`;
    } else if (isSelected && !isCorrectOption) {
        return `${baseClasses} border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/30 ring-1 ring-red-400`;
    } else {
        return `${baseClasses} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 opacity-70`;
    }
}

function getCorrectAnswerTf(options: Option[]): boolean | null { /* ... (same as before - requires fetched options) ... */
    const correctOption = options?.find(opt => opt.is_correct);
    if (!correctOption) return null;
    return /^(true|1|صح|نعم)$/i.test(correctOption.option_text);
}

function getGradingStatusText(status: string | null | undefined): string { /* ... (same as before) ... */
     switch (status) {
        case 'pending': return 'قيد المراجعة';
        case 'auto_graded': return 'تم التصحيح آليًا';
        case 'pending_manual': return 'يحتاج تصحيحًا يدويًا';
        case 'graded': return 'تم التصحيح بالكامل';
        default: return 'غير معروف';
     }
}

const getBackLink = (): string => { /* ... (same as before) ... */
    if (quizData.value?.relatedLink) return quizData.value.relatedLink.to;
    if (quizData.value?.quiz?.course_id) return `/study/courses/${quizData.value.quiz.course_id}`;
    return '/study';
};

function calculatePercentage(score: number | null | undefined, total: number): number {
    if (score === null || score === undefined || total <= 0) return 0;
    return Math.round((score / total) * 100);
}


// --- Timer Actions ---
function startTimer(minutes: number) {
    stopTimer(); // Ensure no duplicates
    timeRemainingSeconds.value = minutes * 60;
    isTimerActive.value = true;
    console.log(`[Timer] Starting timer for ${minutes} minutes (${timeRemainingSeconds.value}s).`);
    timerInterval.value = setInterval(tickTimer, 1000);
}

function stopTimer() {
    if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
        isTimerActive.value = false;
        console.log("[Timer] Stopped.");
    }
}

function tickTimer() {
    if (timeRemainingSeconds.value > 0) {
        timeRemainingSeconds.value--;
    } else {
        console.log("[Timer] Time is up! Auto-submitting.");
        stopTimer();
        handleSubmitAttempt(true); // Pass flag indicating auto-submit due to timeout
    }
}

// --- Submission Action ---
async function handleSubmitAttempt(autoSubmitted: boolean = false) {
    if (!quizData.value?.quiz || !profile.value?.id || isViewingAttempt.value || isSubmitting.value) return;

    // Stop the timer if it was running
    stopTimer();

    // Validation (only if not auto-submitted, maybe allow auto-submit with unanswered?)
    if (!autoSubmitted && !allQuestionsAnswered.value) {
        submitError.value = `يرجى الإجابة على جميع الأسئلة.`;
        // Scroll to first unanswered
        const firstUnanswered = quizData.value.questions?.find(q => userAnswers.value[q.id] === null || userAnswers.value[q.id] === undefined || userAnswers.value[q.id] === '');
        if (firstUnanswered) {
             const element = document.querySelector(`[id^="option-${firstUnanswered.id}"], [id^="tf-${firstUnanswered.id}"], #written-${firstUnanswered.id}`);
             element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
             (element as HTMLElement)?.focus();
        }
        return;
    }

    isSubmitting.value = true;
    submitError.value = null;
    const currentQuiz = quizData.value.quiz;
    const currentUserId = profile.value.id;
    const attemptNumber = (quizData.value.previousAttemptsCount ?? 0) + 1;

    const attemptData: Omit<Tables<'quiz_attempts'>, 'id' | 'created_at' | 'started_at'> = {
        user_id: currentUserId,
        quiz_id: currentQuiz.id,
        submitted_at: new Date().toISOString(),
        answers: userAnswers.value as unknown as Json, // Store answers
        attempt_number: attemptNumber,
        // Determine initial grading status based on question types
        grading_status: quizData.value.questions?.some(q => q.type === 'written') ? 'pending_manual' : 'pending',
        score: null, manual_score: null, total_score: null, passed: null,
    };

    console.log("Submitting quiz attempt:", attemptData);

    try {
        const { error: insertError } = await supabase.from('quiz_attempts').insert(attemptData).select().single(); // Select to get the new row ID if needed

        if (insertError) throw insertError;

        console.log("Quiz attempt submitted successfully!");
        // TODO: Replace with toast notification
        if (autoSubmitted) {
            alert('انتهى الوقت! تم إرسال إجاباتك تلقائيًا.');
        } else {
            alert('تم إرسال إجاباتك بنجاح!');
        }

        console.log("Refreshing data to view submitted attempt...");
        isSubmitting.value = false;
        await refresh(); // Refresh data
        await nextTick();
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
        console.error("Error submitting quiz attempt:", err);
        submitError.value = `فشل إرسال الإجابات: ${err.message || 'حدث خطأ غير متوقع.'}`;
        isSubmitting.value = false;
    }
}

// --- Cleanup ---
onUnmounted(() => {
    stopTimer(); // Important to clear interval on navigation
});

// --- SEO Meta Tags ---
watch([quizData, pending, loadError], ([newQuizData, loadingState, errorState]) => {
    let pageTitle = 'الاختبار'; let description = 'قم بحل أسئلة الاختبار.';
    if (loadingState && !initialDataLoaded.value) { pageTitle = 'جارٍ تحميل الاختبار...'; }
    else if (errorState || !newQuizData?.quiz) { pageTitle = 'خطأ في الاختبار'; description = errorState?.message || 'تعذر الوصول للاختبار.'; }
    else { pageTitle = newQuizData.quiz.title || 'اختبار'; description = newQuizData.quiz.description?.substring(0, 160) || `اختبار بعنوان "${pageTitle}"`; }
    useHead({ title: pageTitle, meta: [ { name: 'description', content: description } ] });
 }, { immediate: true });

</script>

<style scoped>


.quiz-interface { @apply space-y-6 md:space-y-8; }
.error-display { @apply text-center py-10 px-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg max-w-lg mx-auto shadow-md; }

/* Header & Results */
.results-summary {
    @apply p-4 mb-6 rounded-lg shadow text-center space-y-2
           bg-yellow-50 dark:bg-yellow-900/30
           border border-yellow-200 dark:border-yellow-700/50;
}
.results-title { @apply text-lg font-semibold text-brown-dark dark:text-beige-light; }
.results-score { @apply text-2xl font-bold text-primary dark:text-golden-calm; }
.results-score-pending { @apply text-gray-600 dark:text-gray-400 italic; }
.results-status { @apply text-xs text-gray-500 dark:text-gray-400; }
.badge-base { @apply inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium; }
.badge-success { @apply badge-base bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200; }
.badge-danger { @apply badge-base bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200; }
.badge-icon { @apply -ml-1 mr-1.5 h-4 w-4; }

/* Question Block */
.question-block { @apply p-5 bg-beige-light dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700 transition-shadow duration-200; }
.question-block:focus-within { @apply ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800; }
.question-number { @apply text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1; }
.question-text { @apply text-lg font-medium text-brown-dark dark:text-beige-light mb-4 whitespace-pre-wrap; }
.answer-area { @apply mt-4; }

/* Options (MCQ/TF) */
.option-wrapper { @apply relative flex items-start p-3 rounded-md border transition-colors duration-150; }
.radio-input-wrapper { @apply flex items-center h-5; }
.radio-input { @apply focus:ring-primary h-4 w-4 text-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-primary dark:focus:ring-primary dark:focus:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed; }
.option-label-wrapper { @apply ms-3 text-sm flex-grow; }
.option-label { @apply font-medium text-gray-700 dark:text-gray-300; }
.correct-indicator { @apply ms-auto text-golden-calm flex-shrink-0; }

/* Written Answer */
.textarea-input {
    @apply shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-cream-gray dark:border-gray-600 rounded-md dark:bg-gray-900 dark:text-beige-light dark:placeholder-gray-500
           disabled:opacity-70
           disabled:bg-gray-100
           dark:disabled:bg-gray-700
           disabled:cursor-not-allowed
           min-h-[8rem];
}
.manual-feedback-box {
    @apply mt-2 p-2 rounded
           bg-blue-50 dark:bg-blue-900/30
           border border-blue-200 dark:border-blue-700/50;
}
.manual-score { @apply text-sm font-medium text-blue-700 dark:text-blue-300; }
.manual-feedback-text { @apply text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap; }

/* Buttons & Submission */
.submit-section { @apply pt-6 border-t border-cream-gray dark:border-gray-700 text-center; }
.submit-error { @apply text-red-600 dark:text-red-400 text-sm mb-4; }
.button-submit { @apply inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 dark:focus:ring-offset-gray-900; }
.back-section { @apply pt-6 border-t border-cream-gray dark:border-gray-700 text-center; }
.button-back {
    @apply inline-flex items-center justify-center px-6 py-2 border border-cream-gray dark:border-gray-600 text-sm font-medium rounded-md text-brown-dark dark:text-beige-light bg-white dark:bg-gray-700
           hover:bg-gray-50
           dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900;
}
.error-button { @apply border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-800/60 hover:bg-red-200 dark:hover:bg-red-700/70 focus:ring-red-500; }

/* Base button styles */
.button-base { @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150; }
.button-secondary { @apply button-base border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-blue-muted; }

/* Ensure focus states are clearly visible */
button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>