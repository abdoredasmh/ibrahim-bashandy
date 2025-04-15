<template>
  <div class="container mx-auto px-4 py-8">

    <!-- 1. Loading State -->
    <div v-if="pending && !latestAttempt" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل بيانات الاختبار...</p>
    </div>

    <!-- 2. Error / Authorization Failed State -->
    <div v-else-if="error || (!quizData && !latestAttempt)" class="error-display">
       <div class="flex justify-center items-center text-red-500 dark:text-red-400 mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
           <h2 class="text-2xl font-semibold ms-2">
            {{ error?.data?.statusMessage || error?.message || 'لا يمكن الوصول للاختبار' }}
           </h2>
       </div>
      <p class="text-sm text-red-700 dark:text-red-300 mb-6">
        {{ authorizationError || 'تعذر تحميل الاختبار المطلوب أو أنك لا تملك الصلاحية اللازمة لبدئه/عرضه.' }}
      </p>
       <NuxtLink
         :to="getBackLink()"
         class="button-secondary error-button"
       >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" /></svg>
        <span>العودة</span>
      </NuxtLink>
    </div>

    <!-- 3. Quiz Interface (Handles both Taking and Viewing) -->
    <div v-else-if="quizData && quizData.quiz" class="quiz-interface max-w-4xl mx-auto">
        <!-- Header: Quiz Title, Description, Context Link -->
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

        <!-- Display Overall Results -->
        <div v-if="isViewingAttempt && latestAttempt && latestAttempt.grading_status !== 'pending'"
            class="results-summary">
           <h3 class="results-title">نتيجة المحاولة</h3>
           <p v-if="latestAttempt.total_score !== null" class="results-score">
               {{ latestAttempt.total_score }} / {{ totalPossiblePoints }}
           </p>
           <p v-else class="results-score-pending">النتيجة النهائية غير متاحة بعد.</p>
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
       </div>

      <!-- Timer Placeholder (Needs implementation) -->
      <!-- <div v-if="!isViewingAttempt && quizData.quiz.time_limit_minutes" class="timer ...">...</div> -->

      <form @submit.prevent="handleSubmitAttempt" class="space-y-8">
        <div v-for="(question, index) in quizData.questions" :key="question.id" class="question-block">
          <p class="question-number">
            السؤال {{ index + 1 }}
            <span class="text-xs">({{ question.points }} نقطة)</span>
          </p>
          <p class="question-text">{{ question.question_text }}</p>

          <!-- Answer Area -->
          <div class="answer-area">
            <!-- MCQ -->
            <fieldset v-if="question.type === 'mcq'" class="space-y-3">
              <legend class="sr-only">خيارات السؤال {{ index + 1 }}</legend>
              <div v-for="option in question.question_options" :key="option.id"
                   :class="['option-wrapper', getOptionClassesMcqTf(question, option)]">
                 <div class="radio-input-wrapper">
                  <input
                    :id="`option-${option.id}`" :name="`question-${question.id}`" type="radio"
                    :value="option.id" v-model="userAnswers[question.id]"
                    :disabled="isViewingAttempt" required class="radio-input" />
                 </div>
                 <div class="option-label-wrapper">
                   <label :for="`option-${option.id}`" :class="['option-label', !isViewingAttempt && 'cursor-pointer']">
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
               <div :class="['option-wrapper', getOptionClassesMcqTf(question, { id: -1, is_correct: true, option_text: 'صح' }, 'true')]">
                 <div class="radio-input-wrapper">
                   <input :id="`tf-${question.id}-true`" :name="`question-${question.id}`" type="radio" value="true" v-model="userAnswers[question.id]" :disabled="isViewingAttempt" required class="radio-input"/>
                 </div>
                 <div class="option-label-wrapper">
                   <label :for="`tf-${question.id}-true`" :class="['option-label', !isViewingAttempt && 'cursor-pointer']">صح</label>
                 </div>
                 <span v-if="isViewingAttempt && getCorrectAnswerTf(question.question_options) === true" class="correct-indicator" title="الإجابة الصحيحة">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" /></svg>
                 </span>
               </div>
               <div :class="['option-wrapper', getOptionClassesMcqTf(question, { id: -2, is_correct: false, option_text: 'خطأ' }, 'false')]">
                 <div class="radio-input-wrapper">
                   <input :id="`tf-${question.id}-false`" :name="`question-${question.id}`" type="radio" value="false" v-model="userAnswers[question.id]" :disabled="isViewingAttempt" required class="radio-input"/>
                 </div>
                 <div class="option-label-wrapper">
                   <label :for="`tf-${question.id}-false`" :class="['option-label', !isViewingAttempt && 'cursor-pointer']">خطأ</label>
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
                :disabled="isViewingAttempt"
                :required="!isViewingAttempt"
                class="textarea-input"
                :placeholder="isViewingAttempt ? 'لا توجد إجابة مكتوبة' : 'اكتب إجابتك هنا...'"
              ></textarea>
              <!-- Display Manual Score/Feedback -->
              <div v-if="isViewingAttempt && latestAttempt?.manual_score_map?.[question.id] !== undefined"
                   class="manual-feedback-box">
                  <p class="manual-score">
                      الدرجة الممنوحة: {{ latestAttempt.manual_score_map[question.id] }} / {{ question.points }}
                  </p>
                  <!-- Feedback display placeholder - Implement if feedback field exists -->
                  <!-- <p v-if="latestAttempt.feedback_map?.[question.id]" class="manual-feedback-text">
                      ملاحظات المصحح: {{ latestAttempt.feedback_map[question.id] }}
                  </p> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Submission Area -->
        <div v-if="!isViewingAttempt" class="submit-section">
           <p v-if="submitError" class="submit-error">{{ submitError }}</p>
          <button type="submit" :disabled="isSubmitting" class="button-submit">
            <LoadingSpinner v-if="isSubmitting" class="w-5 h-5 me-2 animate-spin" />
            <span>{{ isSubmitting ? 'جارٍ الإرسال...' : 'إرسال الإجابات' }}</span>
          </button>
        </div>

         <!-- Back Button -->
         <div v-else class="back-section">
             <button type="button" @click="router.back()" class="button-back">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true"><path fill-rule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h10.878a.75.75 0 0 1 0 1.5H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.086l-5.5-5.25a.75.75 0 0 1 0-1.086l5.5-5.25a.75.75 0 0 1 1.06.025Z" clip-rule="evenodd" /></svg>
                 العودة
             </button>
         </div>

      </form>
    </div>
    <!-- Fallback -->
     <div v-else class="text-center py-10 text-gray-500 dark:text-gray-400">
         لا توجد بيانات لعرضها.
     </div>

  </div>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed, watch, shallowRef, nextTick } from 'vue';
import { useRoute, useSupabaseClient, useAsyncData, showError, navigateTo, createError, useRouter } from '#imports';
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
  question_options: Option[];
};
// Extended Attempt type to potentially include parsed structured data
type QuizAttempt = Tables<'quiz_attempts'> & {
  answers_parsed?: Record<number | string, any>; // Parsed answers from JSONB
  manual_score_map?: Record<number | string, number>; // Parsed manual scores
  feedback_map?: Record<number | string, string>; // Parsed feedback
};
type RelatedLink = { to: string; text: string } | null;
type QuizData = {
  quiz: Tables<'quizzes'>;
  questions: QuestionWithOptions[];
  isEnrolled: boolean; // Indicates if user is enrolled in the course (if applicable)
  previousAttemptsCount: number;
  latestAttempt: QuizAttempt | null;
  relatedLink: RelatedLink; // Link back to course or lesson
};

// --- Route Param Validation ---
const quizIdParam = computed<number | null>(() => {
    const rawParam = route.params.id as string;
     if (!rawParam) {
        showError({ statusCode: 400, statusMessage: 'معرف الاختبار مفقود.', fatal: true });
        return null;
    }
    const id = parseInt(rawParam, 10);
    if (isNaN(id) || id <= 0) {
        showError({ statusCode: 400, statusMessage: `معرف اختبار غير صالح: "${rawParam}"`, fatal: true });
        return null;
    }
    return id;
});

// --- State ---
const quizData = shallowRef<QuizData | null>(null);
const latestAttempt = shallowRef<QuizAttempt | null>(null); // Store the latest attempt separately
const userAnswers = ref<Record<string | number, string | number | boolean | null>>({}); // Use string keys for potential TF 'true'/'false'
const isSubmitting = ref(false);
const submitError = ref<string | null>(null);
const authorizationError = ref<string | null>(null); // Stores specific auth error message
const isViewingAttempt = ref(false); // Determines if showing results or taking quiz

// --- Initial Auth Check ---
if (!isLoggedIn.value) {
    // Redirect to login immediately if not logged in
    const redirectPath = route.fullPath;
    console.warn("User not logged in, redirecting to login.");
    navigateTo(`/login?redirect=${encodeURIComponent(redirectPath)}`, { replace: true });
}
// Halt further execution if quiz ID is invalid (showError stops rendering)
if (quizIdParam.value === null) {
     console.error("Quiz Page Setup: Halting due to invalid quiz ID parameter.");
}

// --- Data Fetching & Authorization ---
const { data, pending, error, refresh } = await useAsyncData<QuizData | null>(
    `quizViewData-${quizIdParam.value}-${profile.value?.id ?? 'guest'}`,
    async () => {
        // Reset state variables at the beginning of each fetch
        authorizationError.value = null;
        isViewingAttempt.value = false;
        latestAttempt.value = null;
        userAnswers.value = {}; // Reset answers

        const currentQuizId = quizIdParam.value;
        const currentUser = profile.value; // Use reactive profile ref

        // Ensure we have the necessary IDs
        if (!currentUser?.id) {
            // This case should ideally be caught by the initial check, but good safeguard
            authorizationError.value = 'لم يتم التعرف على المستخدم.';
            throw createError({ statusCode: 401, statusMessage: authorizationError.value , fatal: true });
        }
        if (currentQuizId === null) {
            // Should be caught earlier, but safeguard here too
            throw createError({ statusCode: 400, statusMessage: 'معرف الاختبار غير صالح.', fatal: true });
        }

        console.log(`--- Fetching data for Quiz ${currentQuizId}, User ${currentUser.id} ---`);

        try {
            // 1. Fetch Quiz Details and related course/lesson info
            const { data: fetchedQuiz, error: quizFetchError } = await supabase
                .from('quizzes')
                .select(`
                    *,
                    course:study_courses!course_id ( id, title ),
                    lesson:lessons!lesson_id ( id, title, course_id )
                `)
                .eq('id', currentQuizId)
                .maybeSingle();

            if (quizFetchError) throw quizFetchError;
            if (!fetchedQuiz) throw createError({ statusCode: 404, statusMessage: 'الاختبار غير موجود أو غير متاح.', fatal: true });

            // Determine the context link (back to course or lesson)
             let relatedLink: RelatedLink = null;
             if (fetchedQuiz.lesson?.id && fetchedQuiz.lesson.course_id) {
                 relatedLink = { to: `/study/courses/${fetchedQuiz.lesson.course_id}/lessons/${fetchedQuiz.lesson.id}`, text: `درس: ${fetchedQuiz.lesson.title}` };
             } else if (fetchedQuiz.course?.id) {
                 relatedLink = { to: `/study/courses/${fetchedQuiz.course.id}`, text: `دورة: ${fetchedQuiz.course.title}` };
             }

            // 2. Fetch Questions and Options (Ordered)
            const { data: fetchedQuestionsData, error: questionsFetchError } = await supabase
                .from('quiz_questions')
                .select(`*, question_options (*)`)
                .eq('quiz_id', currentQuizId)
                .order('question_order', { ascending: true, nullsLast: true }); // Ensure options are also potentially orderable if needed

            if (questionsFetchError) throw questionsFetchError;
            const fetchedQuestions = (fetchedQuestionsData || []) as QuestionWithOptions[];

            // 3. Fetch User's Attempts for this Quiz
            const { data: fetchedAttempts, error: attemptsError } = await supabase
                 .from('quiz_attempts')
                 .select('*') // Select all attempt fields
                 .eq('quiz_id', currentQuizId)
                 .eq('user_id', currentUser.id)
                 .order('submitted_at', { ascending: false }); // Get latest first

            if (attemptsError) throw createError({ statusCode: 500, statusMessage: 'فشل جلب المحاولات السابقة.' });
            const attemptsDone = fetchedAttempts?.length ?? 0;
            const latestAttemptData = (fetchedAttempts && fetchedAttempts.length > 0 ? fetchedAttempts[0] : null) as QuizAttempt | null;

            // Parse answers and potential structured feedback/scores from the latest attempt's JSONB
            if (latestAttemptData?.answers && typeof latestAttemptData.answers === 'object') {
                latestAttemptData.answers_parsed = { ...(latestAttemptData.answers as Record<string, any>) };
                // Example: Assuming manual scores/feedback are stored within the answers JSON
                 if (latestAttemptData.answers_parsed?.manual_score_map) {
                    latestAttemptData.manual_score_map = latestAttemptData.answers_parsed.manual_score_map;
                 }
                 if (latestAttemptData.answers_parsed?.feedback_map) {
                    latestAttemptData.feedback_map = latestAttemptData.answers_parsed.feedback_map;
                 }
            }


            // 4. Check Enrollment (if quiz is tied to a course)
            let isEnrolled = true; // Assume enrolled if not tied to a course
            if (fetchedQuiz.course_id) {
                 const { count: enrollmentCount, error: enrollmentError } = await supabase
                     .from('course_enrollments')
                     .select('course_id', { count: 'exact', head: true }) // Efficient check
                     .eq('user_id', currentUser.id)
                     .eq('course_id', fetchedQuiz.course_id);

                 if (enrollmentError) {
                     console.error(`[Quiz Page] Error checking enrollment: ${enrollmentError.message}`, enrollmentError);
                     // Decide how to handle - maybe allow viewing results but not taking?
                     // For now, treat as not enrolled if check fails, but log it.
                     isEnrolled = false;
                     authorizationError.value = 'فشل التحقق من الانتساب للدورة.';
                 } else {
                    isEnrolled = (enrollmentCount ?? 0) > 0;
                    console.log(`[Quiz Page] User enrollment status for course ${fetchedQuiz.course_id}: ${isEnrolled}`);
                 }
            }

            // 5. Determine Mode & Authorize further
            let canTakeNewAttempt = true;
            if (!fetchedQuiz.is_active) { authorizationError.value = 'هذا الاختبار غير نشط حالياً.'; canTakeNewAttempt = false; }
            else if (fetchedQuiz.course_id && !isEnrolled) { authorizationError.value = 'يجب أن تكون منتسبًا للدورة المرتبطة بهذا الاختبار أولاً.'; canTakeNewAttempt = false; }
            else if (fetchedQuiz.max_attempts !== null && attemptsDone >= fetchedQuiz.max_attempts) { authorizationError.value = `لقد استنفدت جميع المحاولات المسموحة (${fetchedQuiz.max_attempts}).`; canTakeNewAttempt = false; }
            // Add other checks if needed (e.g., prerequisites, due date)

            // Set Mode and Populate Answers based on authorization and previous attempts
            if (canTakeNewAttempt) {
                 isViewingAttempt.value = false;
                 userAnswers.value = {}; fetchedQuestions.forEach(q => { userAnswers.value[q.id] = null; }); // Initialize empty answers
                 console.log("[Quiz Page] Mode set to: Taking New Attempt");
            } else if (latestAttemptData) { // Can't take new attempt, but there's a previous one to view
                 isViewingAttempt.value = true;
                 userAnswers.value = latestAttemptData.answers_parsed ?? {}; // Use parsed answers
                 // Ensure all question IDs exist in userAnswers, even if null (for reactivity)
                 fetchedQuestions.forEach(q => { if (!(q.id in userAnswers.value)) { userAnswers.value[q.id] = null; } });
                 console.log("[Quiz Page] Mode set to: Viewing Last Attempt");
            } else {
                 // Can't take new attempt AND no previous attempt exists? -> Forbidden
                 console.error("[Quiz Page] Authorization failed:", authorizationError.value);
                 throw createError({ statusCode: 403, statusMessage: authorizationError.value || 'لا يمكنك الوصول لهذا الاختبار.', fatal: true });
            }

            console.log(`--- Quiz data fetch successful. Mode: ${isViewingAttempt.value ? 'Viewing' : 'Taking'} ---`);

            // 6. Return PLAIN data object for useAsyncData state
            return {
                quiz: fetchedQuiz,
                questions: fetchedQuestions,
                isEnrolled: isEnrolled, // Include enrollment status
                previousAttemptsCount: attemptsDone,
                latestAttempt: latestAttemptData, // Return the latest attempt object
                relatedLink: relatedLink // Include the back link
            };

        } catch (err: any) {
            console.error('!!! CRITICAL ERROR in useAsyncData quiz fetch !!!:', err);
            const message = authorizationError.value || err.message || 'خطأ غير معروف';
            const statusCode = err.statusCode || 500;
            // Use fatal: true only for critical errors preventing page load
            throw createError({ statusCode, statusMessage: message, fatal: (statusCode !== 403) }); // Non-fatal for 403?
        }
    }, {
        default: () => null, // Return null as default
        watch: [quizIdParam, () => profile.value?.id] // Re-fetch if quiz or user changes
    }
);

// --- Update Local State ---
 watch(data, (newData) => {
    console.log("Quiz page useAsyncData watcher triggered. New data received:", !!newData);
    if (newData) {
        quizData.value = newData;
        latestAttempt.value = newData.latestAttempt; // Update the separate ref

        // Determine viewing state based on fetched data (redundant but safe)
        const attemptsDone = newData.previousAttemptsCount ?? 0;
        const maxAttempts = newData.quiz.max_attempts;
        let canTake = newData.quiz.is_active && (!newData.quiz.course_id || newData.isEnrolled) && (maxAttempts === null || attemptsDone < maxAttempts);

        if (!canTake && newData.latestAttempt) {
            isViewingAttempt.value = true;
            userAnswers.value = newData.latestAttempt.answers_parsed ?? {};
            newData.questions.forEach(q => { if (!(q.id in userAnswers.value)) userAnswers.value[q.id] = null; });
        } else if (canTake) {
            isViewingAttempt.value = false;
            userAnswers.value = {};
            newData.questions.forEach(q => { userAnswers.value[q.id] = null; });
        } else {
            // If can't take and no previous attempt, error should have been thrown
            isViewingAttempt.value = false; // Default to not viewing
            userAnswers.value = {};
        }
        console.log(`[Watch] Updated local state. isViewingAttempt: ${isViewingAttempt.value}`);

    } else if (!pending.value && !error.value) {
        // Reset state if data is null after loading without error
        quizData.value = null;
        latestAttempt.value = null;
        userAnswers.value = {};
        isViewingAttempt.value = false;
         console.warn("[Watch] Data is null/undefined after load without error.");
    }
 }, { immediate: true });

// --- Computed Properties ---
const totalPossiblePoints = computed(() => {
    return quizData.value?.questions.reduce((sum, q) => sum + (q.points ?? 0), 0) ?? 0;
});

// --- Helper Functions for Display ---
// Determines CSS classes for MCQ/TF options based on viewing state and correctness
function getOptionClassesMcqTf(
    question: QuestionWithOptions,
    option: Option | { id: number | string, is_correct: boolean, option_text: string }, // Allow fake option for TF
    tfValue?: 'true' | 'false' // Specify if it's for TF comparison
): string {
    const baseClasses = 'relative flex items-start p-3 rounded-md border transition-colors duration-150'; // Added padding & border
    if (!isViewingAttempt.value || !latestAttempt.value?.answers_parsed) {
        return `${baseClasses} border-gray-200 dark:border-gray-600 hover:bg-cream-gray/40 dark:hover:bg-gray-700/40`; // Theme hover + border
    }
    const submittedAnswer = latestAttempt.value.answers_parsed[question.id];
    const isCorrectOption = tfValue !== undefined
        ? getCorrectAnswerTf(question.question_options)?.toString() === tfValue
        : option.is_correct;
    // Handle both option ID (number) and TF value (string 'true'/'false')
    const isSelected = tfValue !== undefined
        ? String(submittedAnswer) === tfValue
        : submittedAnswer === option.id;

    if (isCorrectOption) {
        // Correct option: Theme color border, light bg
        return `${baseClasses} border-golden-calm dark:border-golden-calm bg-golden-calm/10 dark:bg-golden-calm/20 ring-1 ring-golden-calm`;
    } else if (isSelected && !isCorrectOption) {
        // Incorrectly selected option: Red border, light red bg
        return `${baseClasses} border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/30 ring-1 ring-red-400`;
    } else {
        // Unselected incorrect option: Subtle gray
        return `${baseClasses} border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 opacity-70`;
    }
}

// Gets the correct boolean answer for a True/False question
function getCorrectAnswerTf(options: Option[]): boolean | null {
    const correctOption = options?.find(opt => opt.is_correct);
    if (!correctOption) return null;
    // Check against variations of "true" or "صح"
    return /^(true|1|صح|نعم)$/i.test(correctOption.option_text);
}

// Returns user-friendly text for grading status
function getGradingStatusText(status: string | null | undefined): string {
     switch (status) {
        case 'pending': return 'قيد المراجعة';
        case 'auto_graded': return 'تم التصحيح آليًا';
        case 'needs_manual': return 'يحتاج تصحيحًا يدويًا';
        case 'graded': return 'تم التصحيح بالكامل';
        default: return 'غير معروف';
     }
}

// Generates the appropriate "Back" link URL
const getBackLink = (): string => {
    if (quizData.value?.relatedLink) return quizData.value.relatedLink.to;
    if (quizData.value?.quiz.course_id) return `/study/courses/${quizData.value.quiz.course_id}`;
    return '/study'; // Fallback to general study page
};

// --- Actions ---
async function handleSubmitAttempt() {
    if (!quizData.value || !profile.value?.id || isViewingAttempt.value || isSubmitting.value) return;

    // Basic validation: Check if all questions have an answer
    const unansweredQuestions = quizData.value.questions.filter(q =>
        userAnswers.value[q.id] === null || userAnswers.value[q.id] === undefined || userAnswers.value[q.id] === ''
    );
    if (unansweredQuestions.length > 0) {
        submitError.value = `يرجى الإجابة على جميع الأسئلة (${unansweredQuestions.length} سؤال متبقي).`;
        // Optionally scroll to the first unanswered question
        const firstUnansweredId = unansweredQuestions[0]?.id;
        if (firstUnansweredId) {
            const element = document.querySelector(`[name="question-${firstUnansweredId}"]`); // Find by name attr
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    isSubmitting.value = true;
    submitError.value = null;
    const currentQuiz = quizData.value.quiz;
    const currentUserId = profile.value.id;
    const attemptNumber = (quizData.value.previousAttemptsCount ?? 0) + 1;

    // Prepare the attempt data, ensuring answers are stored as JSONB
    const attemptData: Omit<Tables<'quiz_attempts'>, 'id' | 'created_at' | 'started_at'> = { // Exclude generated fields
        user_id: currentUserId,
        quiz_id: currentQuiz.id,
        submitted_at: new Date().toISOString(),
        answers: userAnswers.value as unknown as Json, // Store the answers object directly
        attempt_number: attemptNumber,
        grading_status: 'pending', // Initial status
        score: null,
        manual_score: null,
        total_score: null,
        passed: null,
    };

    console.log("Submitting quiz attempt:", attemptData);

    try {
        const { error: insertError } = await supabase.from('quiz_attempts').insert(attemptData);
        if (insertError) throw insertError; // Throw Supabase error

        console.log("Quiz attempt submitted successfully!");
        alert('تم إرسال إجاباتك بنجاح!'); // TODO: Replace with toast notification
        console.log("Refreshing data to view submitted attempt...");
        isSubmitting.value = false;
        await refresh(); // Refresh data to show results/view mode
        // Wait for DOM update and scroll to top after refresh
        await nextTick();
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err: any) {
        console.error("Error submitting quiz attempt:", err);
        submitError.value = `فشل إرسال الإجابات: ${err.message || 'حدث خطأ غير متوقع.'}`;
        isSubmitting.value = false;
    }
}

// --- SEO Meta Tags ---
watch([quizData, pending, error], ([newQuizData, loadingState, errorState]) => {
    let pageTitle = 'الاختبار'; let description = 'قم بحل أسئلة الاختبار.';
    if (loadingState) { pageTitle = 'جارٍ تحميل الاختبار...'; }
    else if (errorState || !newQuizData?.quiz) { pageTitle = 'خطأ في الاختبار'; description = errorState?.data?.statusMessage || errorState?.message || 'تعذر الوصول للاختبار.'; }
    else { pageTitle = newQuizData.quiz.title || 'اختبار'; description = newQuizData.quiz.description?.substring(0, 160) || `اختبار بعنوان "${pageTitle}"`; }
    useHead({ title: pageTitle, meta: [ { name: 'description', content: description } ] });
 }, { immediate: true });

</script>
<style scoped>
/* General Layout & Theme */
.quiz-interface { @apply space-y-6 md:space-y-8; }
.error-display { @apply text-center py-10 px-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg max-w-lg mx-auto shadow-md; }

/* Header & Results */
/* Using standard Tailwind colors */
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
           disabled:bg-gray-100 /* Standard light gray background when disabled */
           dark:disabled:bg-gray-700
           disabled:cursor-not-allowed
           min-h-[8rem];
}
/* Using standard Tailwind colors */
.manual-feedback-box {
    @apply mt-2 p-2 rounded
           bg-blue-50 dark:bg-blue-900/30 /* Example using light blue */
           border border-blue-200 dark:border-blue-700/50; /* Example using blue border */
}
.manual-score { @apply text-sm font-medium text-blue-700 dark:text-blue-300; }
.manual-feedback-text { @apply text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap; }

/* Buttons & Submission */
.submit-section { @apply pt-6 border-t border-cream-gray dark:border-gray-700 text-center; }
.submit-error { @apply text-red-600 dark:text-red-400 text-sm mb-4; }
.button-submit { @apply inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 dark:focus:ring-offset-gray-900; }
.back-section { @apply pt-6 border-t border-cream-gray dark:border-gray-700 text-center; }
/* Updated: Replaced hover:bg-cream-gray/50 with a standard gray */
.button-back {
    @apply inline-flex items-center justify-center px-6 py-2 border border-cream-gray dark:border-gray-600 text-sm font-medium rounded-md text-brown-dark dark:text-beige-light bg-white dark:bg-gray-700
           hover:bg-gray-50 /* Standard hover background */
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