<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner class="w-12 h-12 text-primary-600 mx-auto" />
      <p class="mt-4 text-xl text-gray-600 dark:text-gray-400">جارٍ تحميل نتيجة الاختبار...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !attempt" class="error-box p-6 text-center">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mx-auto text-red-400 mb-4">
         <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
       </svg>
      <h2 class="text-2xl font-semibold text-red-800 dark:text-red-300 mb-3">خطأ في عرض النتيجة</h2>
      <p class="text-red-700 dark:text-red-400 mb-6">{{ error?.message || 'لم نتمكن من العثور على نتيجة المحاولة المطلوبة أو ليس لديك صلاحية لعرضها.' }}</p>
      <NuxtLink v-if="quiz?.study_courses?.id" :to="`/courses/${quiz.study_courses.id}`" class="button-secondary">
          العودة إلى الدورة
      </NuxtLink>
       <NuxtLink v-else to="/my-courses" class="button-secondary">
          العودة إلى دوراتي
      </NuxtLink>
    </div>

    <!-- Results Display -->
    <div v-else class="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
      <header class="p-6 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <NuxtLink v-if="quiz?.study_courses?.id" :to="`/courses/${quiz.study_courses.id}`" class="text-sm text-primary-600 dark:text-primary-400 hover:underline mb-1 block">
                    {{ quiz.study_courses.title }}
                </NuxtLink>
                <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  نتيجة اختبار: {{ quiz?.title || '...' }}
                </h1>
                 <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    تم الإرسال في: {{ formatDate(attempt.submitted_at) }}
                </p>
            </div>
             <div class="text-center sm:text-right flex-shrink-0">
                <p class="text-sm text-gray-500 dark:text-gray-400">النتيجة النهائية</p>
                <p class="text-4xl font-bold" :class="attempt.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
                    {{ attempt.total_score ?? 0 }} / {{ totalPossiblePoints }}
                </p>
                 <p class="text-sm font-semibold mt-1" :class="attempt.passed ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
                     {{ attempt.passed ? 'ناجح' : 'راسب' }} (علامة النجاح: {{ quiz?.pass_mark_percentage ?? 'N/A' }}%)
                 </p>
             </div>
        </div>
      </header>

      <div class="p-6 md:p-8 space-y-8">
         <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b dark:border-gray-700 pb-3">تفاصيل الإجابات:</h2>

        <!-- Loop through questions -->
        <div
          v-for="(question, index) in questionsWithOptions"
          :key="question.id"
          class="pb-6 border-b dark:border-gray-700 last:border-b-0 question-item"
        >
           <!-- Question Header -->
          <div class="flex justify-between items-start mb-4">
            <p class="font-semibold text-gray-800 dark:text-gray-200 flex-grow">
              السؤال {{ index + 1 }}:
            </p>
             <div class="text-sm font-medium text-right flex-shrink-0 ms-4 space-y-1">
                <span class="block text-xs text-gray-400 dark:text-gray-500">(ID: {{ question.id }} | {{ question.points ?? 1 }} نقطة)</span>
                 <!-- Status Indicator -->
                 <span v-if="question.type !== 'written'"
                      :class="[
                          'px-2 py-0.5 rounded-full text-xs font-semibold',
                          isQuestionCorrect(question)
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      ]">
                     {{ isQuestionCorrect(question) ? 'إجابة صحيحة' : 'إجابة خاطئة' }}
                 </span>
                 <span v-else
                       class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      الدرجة: {{ getManualScoreForQuestion(question.id) ?? 'لم تُصحح' }} / {{ question.points ?? 1 }}
                 </span>
             </div>
          </div>

          <!-- Question Text (Rendered Markdown) -->
          <div class="question-text text-base text-gray-800 dark:text-gray-200 mb-5 prose prose-sm dark:prose-invert max-w-none" v-html="renderMarkdown(question.question_text ?? '')"></div>

          <!-- Answer Area -->
          <div class="mt-4 space-y-3">
            <!-- Multiple Choice / True/False -->
            <template v-if="question.type === 'multiple_choice' || question.type === 'true_false'">
               <div
                 v-for="option in question.options"
                 :key="option.id"
                 class="p-3 rounded-md border flex items-start text-sm transition-colors duration-150"
                 :class="getOptionClasses(question, option)"
               >
                 <!-- Icon Indicator -->
                 <span class="flex-shrink-0 w-5 h-5 me-3 mt-0.5">
                      <!-- Always show check for the correct answer -->
                     <CheckCircleIcon v-if="option.is_correct" class="w-5 h-5 text-green-500 dark:text-green-400" aria-label="إجابة صحيحة" />
                     <!-- Show X only if the student selected this INCORRECT option -->
                     <XCircleIcon v-else-if="isOptionSelectedByStudent(question.id, option.id) && !option.is_correct" class="w-5 h-5 text-red-500 dark:text-red-400" aria-label="إجابة خاطئة تم اختيارها" />
                      <!-- Placeholder for alignment if neither correct nor wrongly selected -->
                     <span v-else class="w-5 h-5 block" />
                 </span>
                 <!-- Option Text -->
                 <span class="flex-grow">{{ option.option_text }}</span>
                 <!-- 'Your Answer' Badge -->
                 <span v-if="isOptionSelectedByStudent(question.id, option.id)" class="ms-3 flex-shrink-0 text-xs font-medium px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200">
                     إجابتك
                 </span>
               </div>
            </template>

            <!-- Written Answer -->
            <template v-if="question.type === 'written'">
                <!-- Student's Answer -->
                <div class="student-answer-box">
                    <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">إجابتك:</p>
                    <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap min-h-[40px]">
                      {{ studentAnswerForQuestion(question.id) || '-- لم تقدم إجابة --' }}
                    </p>
                     <!-- Display Manual Score Here Too (optional but clear) -->
                     <p v-if="getManualScoreForQuestion(question.id) !== null" class="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-right">
                         الدرجة الممنوحة: <span class="font-semibold">{{ getManualScoreForQuestion(question.id) }}</span> / {{ question.points ?? 1 }}
                     </p>
                      <p v-else class="text-xs text-gray-400 dark:text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-600 text-right italic">
                         في انتظار التصحيح اليدوي
                     </p>
                </div>
                <!-- Model Answer (if available) -->
                 <div v-if="question.model_answer" class="model-answer-box mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-700">
                    <p class="text-xs font-medium text-blue-600 dark:text-blue-300 mb-1">الإجابة النموذجية:</p>
                    <div class="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none" v-html="renderMarkdown(question.model_answer)"></div>
                 </div>
            </template>

          </div> <!-- End Answer Area -->
        </div> <!-- End Question Loop -->

      </div> <!-- End Content Padding -->

       <footer class="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 text-center">
           <NuxtLink v-if="quiz?.study_courses?.id" :to="`/courses/${quiz.study_courses.id}`" class="button-secondary">
              العودة إلى الدورة
           </NuxtLink>
           <NuxtLink v-else to="/my-courses" class="button-secondary ms-3">
              العودة إلى دوراتي
           </NuxtLink>
           <!-- Optionally add a button to retake if applicable -->
           <!-- <button v-if="canRetake" @click="retakeQuiz" class="button-primary ms-3">إعادة الاختبار</button> -->
       </footer>

    </div> <!-- End Card -->
  </div> <!-- End Container -->
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, watch } from 'vue';
import { useRoute, useSupabaseClient, useAsyncData, definePageMeta, createError, navigateTo, useHead } from '#imports';
import type { Database, Tables, Json, Enums } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // Adjust path if needed
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/20/solid';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// --- Types ---
type ParsedAnswers = Record<string | number, any> & {
  manual_score_map?: Record<string | number, number>;
};
type QuizAttemptFull = Omit<Tables<'quiz_attempts'>, 'answers'> & {
    answers: Json;
    answers_parsed?: ParsedAnswers;
};
type QuizOption = Tables<'question_options'>;
type QuizQuestion = Tables<'quiz_questions'>;
type QuestionWithOptions = QuizQuestion & { options: QuizOption[] };
type QuizFull = Tables<'quizzes'> & { study_courses?: Pick<Tables<'study_courses'>, 'id' | 'title'> | null };
type FetchedResultData = {
  attempt: QuizAttemptFull | null;
  quiz: QuizFull | null;
  questionsWithOptions: QuestionWithOptions[];
};

// --- Page Meta & Middleware ---
definePageMeta({
  layout: 'default',
  middleware: ['auth']
});

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const route = useRoute();
const user = useSupabaseUser();

// --- Attempt ID ---
const attemptId = computed<number>(() => {
    const id = parseInt(route.params.attemptId as string, 10);
    if (isNaN(id) || id <= 0) {
         throw createError({ statusCode: 400, statusMessage: 'معرف المحاولة غير صالح أو مفقود.', fatal: true });
    }
    return id;
});

// --- State ---
const attempt = shallowRef<QuizAttemptFull | null>(null);
const quiz = shallowRef<QuizFull | null>(null);
const questionsWithOptions = shallowRef<QuestionWithOptions[]>([]);

// --- Data Fetching (`useAsyncData`) ---
const { data: fetchedData, pending, error } = await useAsyncData<FetchedResultData>(
  `quiz-result-${attemptId.value}`,
  async () => {
    const currentAttemptId = attemptId.value;
    const currentUserId = user.value?.id;

    if (!currentUserId) {
        throw createError({ statusCode: 401, message: 'المستخدم غير مسجل الدخول.', fatal: true });
    }

    // 1. Fetch attempt (RLS enforces ownership)
    const { data: attemptData, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', currentAttemptId)
      .eq('user_id', currentUserId) // Explicit check for clarity, RLS is primary
      .single();

    if (attemptError) {
        console.error("Error fetching quiz attempt:", attemptError);
        if (attemptError.code === 'PGRST116') { // Not found or RLS denied
            throw createError({ statusCode: 404, message: 'المحاولة غير موجودة أو لا تملك صلاحية الوصول إليها.', fatal: false });
        }
        throw createError({ statusCode: 500, message: 'خطأ في جلب بيانات المحاولة.', fatal: false });
    }
     if (!attemptData) { // Should be covered by PGRST116, but belt-and-suspenders
        throw createError({ statusCode: 404, message: 'المحاولة غير موجودة أو لا تملك صلاحية الوصول إليها.', fatal: false });
     }

    // Parse answers JSONB
    let parsedAnswers: ParsedAnswers = {};
    if (attemptData.answers && typeof attemptData.answers === 'object' && !Array.isArray(attemptData.answers)) {
      parsedAnswers = { ...(attemptData.answers as Record<string, any>) };
    }
    (attemptData as QuizAttemptFull).answers_parsed = parsedAnswers;

    const quizId = attemptData.quiz_id;

    // 2. Fetch Quiz details, Questions, and Options in parallel
     const questionIdsResult = await supabase.from('quiz_questions').select('id').eq('quiz_id', quizId);
     if (questionIdsResult.error) {
         throw createError({ statusCode: 500, message: `خطأ في جلب معرفات الأسئلة: ${questionIdsResult.error.message}`, fatal: false });
     }
     const questionIds = questionIdsResult.data?.map(q => q.id) ?? [];

    const [quizRes, questionsRes, optionsRes] = await Promise.all([
      supabase.from('quizzes').select('*, study_courses(id, title)').eq('id', quizId).single(),
      supabase.from('quiz_questions').select('*').eq('quiz_id', quizId).order('question_order'),
      // Only fetch options if there are questions
      questionIds.length > 0
          ? supabase.from('question_options').select('*').in('question_id', questionIds)
          : Promise.resolve({ data: [], error: null }) // Avoid empty 'in' clause
    ]).catch(err => {
         console.error("Error during parallel fetches (quiz/questions/options):", err);
         throw createError({ statusCode: 500, message: 'خطأ في جلب تفاصيل الاختبار أو الأسئلة.', fatal: false });
    });

    // Process results
    if (quizRes.error) throw createError({ statusCode: 500, message: `خطأ في جلب الاختبار: ${quizRes.error.message}`, fatal: false });
    if (questionsRes.error) throw createError({ statusCode: 500, message: `خطأ في جلب الأسئلة: ${questionsRes.error.message}`, fatal: false });
    if (optionsRes.error) throw createError({ statusCode: 500, message: `خطأ في جلب خيارات الأسئلة: ${optionsRes.error.message}`, fatal: false });

    const quizData = quizRes.data;
    const questionsData = questionsRes.data || [];
    const optionsData = optionsRes.data || [];

    // 3. Merge Questions with their Options
    const optionsMap = new Map<number, QuizOption[]>();
    optionsData.forEach(opt => {
      if (opt.question_id === null) return;
      const existing = optionsMap.get(opt.question_id) || [];
      existing.push(opt);
      optionsMap.set(opt.question_id, existing);
    });

    const mergedQuestions: QuestionWithOptions[] = questionsData.map(q => ({
      ...q,
      options: optionsMap.get(q.id) || []
    }));

    return {
      attempt: attemptData as QuizAttemptFull,
      quiz: quizData,
      questionsWithOptions: mergedQuestions
    };
  }, {
     default: () => ({ attempt: null, quiz: null, questionsWithOptions: [] }),
     watch: [attemptId]
  }
);

// --- Watcher to update local state ---
watch(fetchedData, (newData) => {
    if (newData) {
        attempt.value = newData.attempt;
        quiz.value = newData.quiz;
        questionsWithOptions.value = newData.questionsWithOptions;
    }
}, { immediate: true });

// --- Computed Properties ---
const totalPossiblePoints = computed<number>(() => {
  return questionsWithOptions.value.reduce((sum, q) => sum + (q.points ?? 1), 0);
});

// --- Helper Functions ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
      return new Date(dateString).toLocaleString('ar-SA', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true
      });
   } catch { return dateString; }
};

const renderMarkdown = (text: string | null | undefined): string => {
    if (!text) return '';
    marked.setOptions({ breaks: true, gfm: true });
    // Ensure DOMPurify runs client-side if needed, or configure server-side sanitization
    const dirty = marked.parse(text);
    // Check if running in browser context before using DOMPurify
    const sanitized = typeof window !== 'undefined' ? DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } }) : dirty;
    return sanitized;
};

const studentAnswerForQuestion = (questionId: number): any => {
    return attempt.value?.answers_parsed?.[questionId] ?? null;
};

const getManualScoreForQuestion = (questionId: number): number | null => {
    const scoreMap = attempt.value?.answers_parsed?.manual_score_map;
    if (scoreMap && typeof scoreMap === 'object' && questionId in scoreMap) {
        const score = scoreMap[questionId];
        return typeof score === 'number' ? score : null; // Ensure it's a number
    }
    return null; // Return null if not found or not a number
};

const isOptionSelectedByStudent = (questionId: number, optionId: number): boolean => {
    const answer = studentAnswerForQuestion(questionId);
    if (answer === null || answer === undefined) return false;
    if (Array.isArray(answer)) {
        return answer.includes(optionId);
    }
    // Ensure type consistency if answers are stored as strings sometimes
    return String(answer) === String(optionId);
};

const isQuestionCorrect = (question: QuestionWithOptions): boolean => {
    if (question.type === 'written') return false; // Correctness determined manually

    const correctAnswerIds = question.options.filter(o => o.is_correct).map(o => o.id);
    const studentAnswer = studentAnswerForQuestion(question.id);

    // Handle case where no answer was submitted for this question
    if (studentAnswer === null || studentAnswer === undefined || (Array.isArray(studentAnswer) && studentAnswer.length === 0)) {
        return false;
    }

    if (correctAnswerIds.length === 0) {
        console.warn(`Question ${question.id} (type: ${question.type}) has no correct answers defined.`);
        return false; // Cannot be correct if no correct answer is defined
    }

    // --- Determine if multiple answers are possible/expected ---
    // Heuristic: If there's more than one correct option defined, assume multiple answers could be selected.
    // Or, ideally, add a flag 'allow_multiple' to the question table itself.
    const multipleAnswersPossible = correctAnswerIds.length > 1; // Simple heuristic

    if (multipleAnswersPossible) {
        // Expect student answer to be an array
        if (!Array.isArray(studentAnswer)) {
            console.warn(`Question ${question.id} expected multiple answers (array), but got:`, studentAnswer);
            return false; // Format mismatch
        }
        // Strict check: must select *all* correct answers and *no* incorrect ones.
        if (studentAnswer.length !== correctAnswerIds.length) return false;
        const studentAnswerSet = new Set(studentAnswer);
        return correctAnswerIds.every(id => studentAnswerSet.has(id));
    } else {
        // Single correct answer expected
        if (Array.isArray(studentAnswer)) {
            // If student answer is array but only one correct answer exists, check if array contains only that answer
            return studentAnswer.length === 1 && String(studentAnswer[0]) === String(correctAnswerIds[0]);
        } else {
             // Compare single value directly
             return String(studentAnswer) === String(correctAnswerIds[0]);
        }
    }
};


// Determines the CSS classes for displaying an option based on correctness and student selection
const getOptionClasses = (question: QuestionWithOptions, option: QuizOption): string => {
    const isSelected = isOptionSelectedByStudent(question.id, option.id);
    const base = 'border '; // Base classes

    if (option.is_correct) {
        // Correct Option: Always highlight positively
        return `${base} bg-green-50 dark:bg-green-900/40 border-green-300 dark:border-green-600 text-green-800 dark:text-green-100 font-medium`;
    } else if (isSelected && !option.is_correct) {
        // Incorrect Option Selected by Student: Highlight negatively
        return `${base} bg-red-50 dark:bg-red-900/40 border-red-300 dark:border-red-600 text-red-800 dark:text-red-100`;
    } else {
        // Other options (incorrect but not selected)
        return `${base} bg-white dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 opacity-80 dark:opacity-70`; // Slightly dimmed
    }
};

// --- Meta Tags ---
useHead({
  title: computed(() => {
      if (pending.value) return 'تحميل النتيجة...';
      if (quiz.value?.title) return `نتيجة اختبار: ${quiz.value.title}`;
      return 'نتيجة الاختبار';
  }),
  meta: [ { name: 'description', content: 'عرض تفصيلي لنتيجة محاولة اختبار.' } ]
});

</script>

<style scoped>
/* Basic Error Box Style */
.error-box {
  @apply border border-red-300 bg-red-50 text-red-700 rounded-md dark:bg-red-900/30 dark:border-red-700/50 dark:text-red-300;
}
/* Standard Button Styles */
.button-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}
.button-primary {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}

/* Question Item styling */
.question-item:not(:last-child) {
     margin-bottom: 2rem; /* Add more space between questions */
}

/* Student Answer Box Styling */
.student-answer-box {
  @apply text-sm border p-3 rounded bg-gray-50 dark:bg-gray-700/60 border-gray-200 dark:border-gray-600 shadow-inner;
}

/* Model Answer Box Styling */
.model-answer-box {
   @apply text-sm border p-3 rounded bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700;
}
.model-answer-box p:first-child { /* Style the label */
    @apply font-semibold !mb-2; /* Ensure bottom margin using !important if needed */
}

/* Styling for Markdown content using Tailwind Typography plugin */
.question-text {
    @apply prose prose-sm dark:prose-invert max-w-none;
    /* Ensure consistent spacing */
    & :deep(p:last-child) {
        margin-bottom: 0;
    }
}
.model-answer-box .prose {
     /* Customize model answer markdown if needed */
     & :deep(p:last-child) {
        margin-bottom: 0;
    }
}
.question-text :deep(p),
.model-answer-box :deep(p) { @apply mb-2; } /* Consistent paragraph spacing */

.question-text :deep(ul),
.question-text :deep(ol),
.model-answer-box :deep(ul),
.model-answer-box :deep(ol) { @apply my-3 ms-4; }
</style>