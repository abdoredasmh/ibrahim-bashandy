<template>
  <div class="container mx-auto px-4 py-8 md:py-12">

    <!-- 1. Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner class="w-12 h-12 mx-auto text-primary" />
      <p class="mt-4 text-base text-gray-600 dark:text-gray-400">جارٍ تحميل تفاصيل الدورة...</p>
    </div>

    <!-- 2. Error or Not Found State -->
     <div v-else-if="error || !course" class="text-center py-10 px-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg max-w-lg mx-auto shadow-md">
         <div class="flex justify-center items-center text-red-600 dark:text-red-400 mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-7 h-7" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
             <h2 class="text-xl font-semibold ms-2">
                 {{ error?.statusCode === 404 || !course ? 'الدورة غير متاحة' : (error?.data?.statusMessage || error?.message || 'حدث خطأ') }}
             </h2>
         </div>
        <p class="text-sm text-red-700 dark:text-red-300 mb-5">
             {{ error?.data?.message || error?.message || 'لم نتمكن من العثور على الدورة المطلوبة أو حدث خطأ غير متوقع أثناء تحميلها.' }}
        </p>
        <NuxtLink to="/study" class="button-secondary border-red-300 dark:border-red-600 text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-800/60 hover:bg-red-200 dark:hover:bg-red-700/70 focus:ring-red-500 inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-1" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" /></svg>
            <span>العودة لقائمة الدورات</span>
        </NuxtLink>
     </div>

    <!-- 3. Course Details - Success State -->
    <div v-else-if="!pending && course" class="course-details space-y-8 md:space-y-12">
       <!-- Header Section -->
       <header class="md:flex md:items-start md:gap-8 p-4 sm:p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-lg shadow-sm border dark:border-gray-700/50">
          <!-- Course Image -->
          <div class="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mb-4 md:mb-0">
             <img :src="getCourseImageUrl(course.image_url)" :alt="`غلاف دورة: ${course.title}`" class="w-full aspect-video object-cover rounded-lg shadow-md">
          </div>
          <!-- Course Info & Actions -->
          <div class="flex-grow">
             <h1 class="text-3xl font-bold text-brown-dark dark:text-beige-light mb-3">{{ course.title }}</h1>
             <p v-if="categoryName" class="text-sm text-gray-500 dark:text-gray-400 mb-3">
                الفئة: <span class="font-medium text-gray-700 dark:text-gray-300">{{ categoryName }}</span>
             </p>
             <p v-if="course.description" class="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">{{ course.description }}</p>

             <ClientOnly>
                 <div class="space-y-4">
                     <!-- Enrollment Section -->
                     <div v-if="isLoggedIn">
                         <!-- Not Enrolled -->
                         <button v-if="!isEnrolled" @click="handleEnroll(course?.id)" :disabled="enrollLoading" class="button-enroll w-full sm:w-auto">
                              <span v-if="enrollLoading">جاري الانتساب...</span><span v-else>انتسب الآن</span>
                         </button>
                         <!-- Enrolled -->
                         <div v-else class="space-y-3 bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-700/50">
                             <p class="text-green-700 dark:text-green-300 font-semibold text-base flex items-center">
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1.5 flex-shrink-0" aria-hidden="true"><path fill-rule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.48 4.774L6.52 10.91a.75.75 0 1 0-1.04 1.08l2.18 2.108a.75.75 0 0 0 1.076-.015l4.145-5.682Z" clip-rule="evenodd" /></svg>
                                  أنت منتسب لهذه الدورة
                             </p>
                             <!-- Progress Bar Section -->
                             <div v-if="totalLessonsCount > 0" class="progress-section pt-2">
                                  <div class="flex justify-between mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                                     <span>التقدم</span>
                                     <span>{{ progressPercentage }}%</span>
                                  </div>
                                  <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                                     <div class="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" :style="{ width: progressPercentage + '%' }"></div>
                                  </div>
                                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-1"> {{ completedLessonsCount }} / {{ totalLessonsCount }} درس مكتمل</p>
                             </div>
                             <div v-else class="text-xs text-gray-500 dark:text-gray-400 italic pt-2"> (لم تتم إضافة دروس لهذه الدورة بعد)</div>
                             <!-- Actions -->
                             <div class="flex items-center gap-4 pt-3 mt-2 border-t border-green-200 dark:border-green-700/50">
                                  <button @click="navigateToLastAccessed" class="button-secondary flex-grow sm:flex-grow-0 text-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1.5" aria-hidden="true"><path fill-rule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z" clip-rule="evenodd" /></svg>
                                      استئناف التعلم
                                  </button>
                                  <button @click="handleUnenroll(course?.id)" :disabled="enrollLoading" class="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-300 underline disabled:opacity-50 disabled:cursor-not-allowed">إلغاء الانتساب</button>
                             </div>
                         </div>
                     </div>
                     <!-- Not Logged In -->
                     <NuxtLink v-else :to="`/login?redirect=${route.fullPath}`" class="button-enroll w-full sm:w-auto">سجل الدخول للانتساب</NuxtLink>

                     <!-- Course Level Quizzes Section -->
                     <div v-if="isEnrolled && courseLevelQuizzes.length > 0" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                         <h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">الاختبارات النهائية للدورة:</h3>
                         <div class="flex flex-wrap gap-2">
                             <button
                                 v-for="quiz in courseLevelQuizzes"
                                 :key="quiz.id"
                                 @click="goToQuiz(quiz.id)"
                                 :class="['button-quiz-base button-quiz-course', { 'passed': hasPassedQuiz(quiz.id) }]"
                                 :title="hasPassedQuiz(quiz.id) ? 'تم اجتياز هذا الاختبار' : quiz.title"
                                 :disabled="!canAttemptQuiz(quiz.id) || hasPassedQuiz(quiz.id)"
                              >
                                 <QuizIcon class="w-4 h-4 me-1.5" aria-hidden="true"/>
                                 {{ quiz.title || 'الاختبار النهائي' }}
                                 <span v-if="hasPassedQuiz(quiz.id)" class="ms-1.5 text-xxs opacity-80">(تم الاجتياز)</span>
                             </button>
                         </div>
                     </div>
                 </div>
                 <template #fallback>
                      <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-full sm:w-40"></div>
                 </template>
              </ClientOnly>
          </div>
       </header>

       <!-- Course Content Section -->
       <section class="course-content">
          <h2 class="text-2xl font-semibold text-brown-dark dark:text-beige-light mb-6">محتوى الدورة</h2>
          <!-- No Content -->
          <div v-if="groupedContent.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed dark:border-gray-700">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
              سيتم إضافة محتوى لهذه الدورة قريبًا إن شاء الله.
          </div>

          <!-- Modules Loop -->
          <div v-else class="space-y-6">
            <div v-for="moduleGroup in groupedContent" :key="moduleGroup.moduleNumber ?? 'general'" class="module-section bg-white dark:bg-gray-800/40 p-4 sm:p-5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <!-- Module Header -->
                <div class="module-header flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <!-- Module Title -->
                    <h3 class="text-lg font-semibold text-primary dark:text-primary-400">
                        <span v-if="moduleGroup.moduleNumber !== null" class="font-mono me-1.5 text-sm opacity-80">#{{ moduleGroup.moduleNumber }}</span>
                        {{ moduleGroup.moduleTitle }}
                    </h3>
                    <!-- Module Level Quizzes Section -->
                    <div v-if="isEnrolled && moduleGroup.quizzes.length > 0" class="flex flex-wrap gap-2">
                       <button
                           v-for="quiz in moduleGroup.quizzes"
                           :key="quiz.id"
                           @click="goToQuiz(quiz.id)"
                           :class="['button-quiz-base button-quiz-module', { 'passed': hasPassedQuiz(quiz.id) }]"
                           :title="hasPassedQuiz(quiz.id) ? 'تم اجتياز هذا الاختبار' : quiz.title"
                           :disabled="!canAttemptQuiz(quiz.id) || hasPassedQuiz(quiz.id)"
                       >
                            <QuizIcon class="w-4 h-4 me-1.5" aria-hidden="true"/>
                            {{ quiz.title || `اختبار الوحدة ${moduleGroup.moduleNumber}` }}
                             <span v-if="hasPassedQuiz(quiz.id)" class="ms-1.5 text-xxs opacity-80">(تم الاجتياز)</span>
                       </button>
                    </div>
                </div>

                <!-- Lessons List -->
                <ul v-if="moduleGroup.lessons.length > 0" class="space-y-2">
                    <!-- Lesson Loop -->
                    <li v-for="(lesson, index) in moduleGroup.lessons" :key="lesson.id"
                        :class="['flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-md transition-colors duration-150 gap-2 sm:gap-4', isLessonCompleted(lesson.id) ? 'lesson-completed' : 'lesson-incomplete']">
                        <!-- Lesson Title and Status -->
                        <div class="flex items-center space-x-3 rtl:space-x-reverse flex-grow min-w-0">
                            <span :class="['lesson-status-icon', isLessonCompleted(lesson.id) ? 'completed' : 'incomplete']" aria-hidden="true">
                               <svg v-if="isLessonCompleted(lesson.id)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.208Z" clip-rule="evenodd" /></svg>
                               <span v-else class="font-mono">{{ lesson.lesson_order ?? index + 1 }}</span>
                            </span>
                            <NuxtLink :to="lessonLink(lesson.id)" class="lesson-title-link flex-1 min-w-0">
                                <span class="truncate">{{ lesson.title }}</span>
                            </NuxtLink>
                        </div>
                         <!-- Lesson Level Quizzes Section -->
                         <div v-if="isEnrolled && lessonQuizzesMap.get(lesson.id) && lessonQuizzesMap.get(lesson.id)!.length > 0" class="flex flex-wrap gap-1.5 mt-1 sm:mt-0 flex-shrink-0 w-full sm:w-auto justify-start sm:justify-end">
                            <button
                                v-for="quiz in lessonQuizzesMap.get(lesson.id)"
                                :key="quiz.id"
                                @click="goToQuiz(quiz.id)"
                                :class="['button-quiz-base button-quiz-lesson', { 'passed': hasPassedQuiz(quiz.id) }]"
                                :title="hasPassedQuiz(quiz.id) ? 'تم اجتياز هذا الاختبار' : quiz.title"
                                :disabled="!canAttemptQuiz(quiz.id) || hasPassedQuiz(quiz.id)"
                            >
                                <QuizIcon class="w-4 h-4 me-1" aria-hidden="true"/>
                                {{ quiz.title || 'اختبار الدرس' }}
                                <span v-if="hasPassedQuiz(quiz.id)" class="ms-1 text-xxs opacity-80">(تم الاجتياز)</span>
                            </button>
                         </div>
                         <!-- Placeholder to maintain alignment -->
                         <div v-else class="h-[30px] flex-shrink-0 w-full sm:w-auto sm:min-w-[100px]"></div>
                    </li>
                </ul>
                 <!-- No lessons in module -->
                 <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic px-3 py-4 text-center">لا توجد دروس في هذه الوحدة بعد.</p>
            </div>
          </div>
       </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, shallowRef } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import { useSupabaseClient, useAsyncData, useRoute, useHead, navigateTo, createError, showError } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';

// Define QuizIcon inline component
const QuizIcon = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M11.983 1.907a.75.75 0 0 0-1.966 0l-5.25 3.031A.75.75 0 0 0 4 5.69v8.62a.75.75 0 0 0 .767.745l5.25-1.125 5.25 1.125A.75.75 0 0 0 16 14.31V5.69a.75.75 0 0 0-.767-.744L11.983 1.907ZM12.75 6.19a.75.75 0 0 0-1.5 0v2.447a1.5 1.5 0 0 1-1.045 1.435l-1.008.432a.75.75 0 1 0 .61 1.386l1.008-.432A3 3 0 0 0 12 11.82V13a.75.75 0 0 0 1.5 0V6.19Z" /></svg>`,
  props: ['class']
};

// --- Type Definitions ---
// Type for the result of the main fetch, combining course with related data
type CourseWithDetails = Tables<'study_courses'> & {
    category: Pick<Tables<'categories'>, 'name'> | null;
    modules: Array<Pick<Tables<'course_modules'>, 'id' | 'title' | 'module_number'>>;
    lessons: Array<Pick<Tables<'lessons'>, 'id' | 'title' | 'lesson_order' | 'module_number' | 'created_at'>>;
    quizzes: Array<Pick<Tables<'quizzes'>, 'id' | 'title' | 'lesson_id' | 'module_number' | 'course_id' | 'is_active'>>;
};
// Standard types for individual entities
type Course = Tables<'study_courses'>;
type Lesson = Pick<Tables<'lessons'>, 'id' | 'title' | 'lesson_order' | 'module_number' | 'created_at'>;
type CourseModuleInfo = Pick<Tables<'course_modules'>, 'id' | 'title' | 'module_number'>;
type QuizInfo = Pick<Tables<'quizzes'>, 'id' | 'title' | 'lesson_id' | 'module_number' | 'course_id' | 'is_active'>;
type CourseEnrollment = Tables<'course_enrollments'>;
type LessonCompletionInfo = Pick<Tables<'lesson_completions'>, 'lesson_id'>;
type QuizAttemptInfo = Pick<Tables<'quiz_attempts'>, 'id' | 'quiz_id' | 'passed' | 'submitted_at'>;

// Type for the structure returned by useAsyncData
type FetchedCoursePageData = {
    course: Course | null;
    modules: CourseModuleInfo[];
    lessons: Lesson[];
    quizzes: QuizInfo[];
    attempts: QuizAttemptInfo[];
    categoryName: string | null;
    enrollment: CourseEnrollment | null;
    completions: LessonCompletionInfo[];
};

// Type for grouping content in the template
interface ModuleGroup {
  moduleNumber: number | null;
  moduleTitle: string;
  lessons: Lesson[];
  quizzes: QuizInfo[];
}

// --- Setup ---
const supabase = useSupabaseClient<Database>();
const route = useRoute();
const userStore = useUserStore();
const { profile, isLoggedIn } = storeToRefs(userStore);

// Validate and get course ID from route params
const courseId = computed<number>(() => {
    const id = parseInt(route.params.courseId as string, 10);
    if (isNaN(id) || id <= 0) {
         showError({ statusCode: 400, statusMessage: `معرف الدورة غير صالح: "${route.params.courseId}"`, fatal: true });
         return -1; // Return invalid ID to prevent further execution
    }
    return id;
});

// --- Reactive State ---
const course = shallowRef<Course | null>(null);
const courseModulesData = shallowRef<CourseModuleInfo[]>([]);
const courseLessonsData = shallowRef<Lesson[]>([]);
const courseQuizzesData = shallowRef<QuizInfo[]>([]);
const userQuizAttempts = shallowRef<QuizAttemptInfo[]>([]);
const categoryName = shallowRef<string | null>(null);
const enrollment = shallowRef<CourseEnrollment | null>(null);
const completedLessonIds = shallowRef<number[]>([]);
const enrollLoading = ref(false);

// Halt setup if course ID is invalid
if (isNaN(courseId.value)) {
    console.error("Course ID is invalid, stopping component setup.");
}

// --- Data Fetching (useAsyncData) ---
// Fetches all necessary data for the course page.
// Structure:
// 1. Fetch main course data and directly related info (category, modules, lessons, quizzes) in one query,
//    explicitly defining relationships to avoid ambiguity.
// 2. Fetch user-specific data (enrollment, completions, attempts) in parallel if logged in.
const { data, pending, error, refresh } = await useAsyncData<FetchedCoursePageData>(
    // Unique key for caching, includes user ID for reactivity on login/logout
    `course-page-data-${courseId.value}-${profile.value?.id ?? 'guest'}`,
    async () => {
        const currentCourseId = courseId.value;
        if (isNaN(currentCourseId)) throw new Error('Invalid Course ID'); // Should already be handled, but good practice

        const currentUserId = profile.value?.id;
        console.log(`[useAsyncData] Fetching data for course ${currentCourseId}, User ${currentUserId ?? 'Guest'}`);

        try {
            // --- Step 1: Fetch Main Course Data with Embeds ---
            console.log("[useAsyncData] Fetching main course data with embeds...");
            const { data: courseWithDetails, error: courseFetchError } = await supabase
                .from('study_courses')
                .select(`
                    *,
                    category:categories ( name ),
                    modules:course_modules!course_id ( id, title, module_number ),
                    lessons:lessons!course_id ( id, title, lesson_order, module_number, created_at ),
                    quizzes:quizzes!course_id ( id, title, lesson_id, module_number, course_id, is_active )
                `)
                .eq('id', currentCourseId)
                .eq('is_active', true) // Ensure course is active
                .maybeSingle<CourseWithDetails>(); // Type assertion for clarity

            if (courseFetchError) {
                console.error("[useAsyncData] Error fetching main course data:", courseFetchError);
                // Handle specific embedding error
                if (courseFetchError.message.includes("more than one relationship")) {
                     throw createError({ statusCode: 500, statusMessage: `خطأ في ربط بيانات الدورة: ${courseFetchError.message}. يرجى مراجعة تعريف العلاقات بين الجداول.`, fatal: true });
                }
                // Handle other fetch errors
                throw createError({ statusCode: 500, statusMessage: `فشل جلب بيانات الدورة: ${courseFetchError.message}`, fatal: true });
            }
            if (!courseWithDetails) {
                console.warn(`[useAsyncData] Course ${currentCourseId} not found or inactive.`);
                throw createError({ statusCode: 404, message: 'الدورة المطلوبة غير موجودة أو غير نشطة.', fatal: true });
            }
            console.log(`[useAsyncData] Main data fetched. Modules: ${courseWithDetails.modules?.length ?? 0}, Lessons: ${courseWithDetails.lessons?.length ?? 0}, Quizzes: ${courseWithDetails.quizzes?.length ?? 0}`);

            // Extract data from the main fetch result
            const fetchedCourse: Course = { ...courseWithDetails, category: undefined, modules: undefined, lessons: undefined, quizzes: undefined };
            const fetchedModules = courseWithDetails.modules?.sort((a, b) => (a.module_number ?? Infinity) - (b.module_number ?? Infinity)) ?? [];
            const fetchedLessons = courseWithDetails.lessons?.sort((a, b) => { // Sort lessons properly
                const moduleCompare = (a.module_number ?? Infinity) - (b.module_number ?? Infinity);
                if (moduleCompare !== 0) return moduleCompare;
                const orderCompare = (a.lesson_order ?? Infinity) - (b.lesson_order ?? Infinity);
                 if (orderCompare !== 0) return orderCompare;
                return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
            }) ?? [];
            const fetchedQuizzes = courseWithDetails.quizzes?.filter(q => q.is_active) ?? []; // Filter active quizzes client-side as well
            const fetchedCategoryName = courseWithDetails.category?.name ?? null;

            // Prepare IDs for user-specific fetches
            const lessonIds = fetchedLessons.map(l => l.id);
            const quizIds = fetchedQuizzes.map(q => q.id);

            // --- Step 2: Fetch User-Specific Data (if logged in) ---
             console.log("[useAsyncData] Fetching user-specific data...");
            let fetchedEnrollment: CourseEnrollment | null = null;
            let fetchedCompletions: LessonCompletionInfo[] = [];
            let fetchedAttempts: QuizAttemptInfo[] = [];

            if (isLoggedIn.value && currentUserId) {
                const [enrollmentRes, completionsRes, attemptsRes] = await Promise.all([
                    supabase.from('course_enrollments').select('*').eq('user_id', currentUserId).eq('course_id', currentCourseId).maybeSingle(),
                    lessonIds.length > 0 ? supabase.from('lesson_completions').select('lesson_id').eq('user_id', currentUserId).in('lesson_id', lessonIds) : Promise.resolve({ data: [], error: null }),
                    quizIds.length > 0 ? supabase.from('quiz_attempts').select('id, quiz_id, passed, submitted_at').eq('user_id', currentUserId).in('quiz_id', quizIds) : Promise.resolve({ data: [], error: null })
                ]);

                // Log errors but don't fail the entire fetch for user data errors
                if (enrollmentRes.error) console.error("Enrollment fetch error:", enrollmentRes.error.message); else fetchedEnrollment = enrollmentRes.data;
                if (completionsRes.error) console.error("Completions fetch error:", completionsRes.error.message); else fetchedCompletions = completionsRes.data ?? [];
                if (attemptsRes.error) console.error("Attempts fetch error:", attemptsRes.error.message); else fetchedAttempts = attemptsRes.data ?? [];
                 console.log(`[useAsyncData] User data fetched. Enrolled: ${!!fetchedEnrollment}, Completions: ${fetchedCompletions.length}, Attempts: ${fetchedAttempts.length}`);
            } else {
                 console.log("[useAsyncData] User not logged in, skipping user-specific data fetch.");
            }

            // --- Step 3: Return the combined data structure ---
             console.log("[useAsyncData] Fetch process complete.");
            return {
                course: fetchedCourse,
                modules: fetchedModules,
                lessons: fetchedLessons,
                quizzes: fetchedQuizzes,
                categoryName: fetchedCategoryName,
                enrollment: fetchedEnrollment,
                completions: fetchedCompletions,
                attempts: fetchedAttempts,
            };

        } catch (err: any) {
            console.error("[useAsyncData] CRITICAL ERROR during data fetching:", err);
             // Re-throw errors created with createError to be handled by Nuxt/useAsyncData
             if (err.statusCode && err.fatal) {
                throw err;
             }
            // Show a generic error page for unexpected errors
            showError({ statusCode: err.statusCode || 500, message: `حدث خطأ غير متوقع أثناء تحميل بيانات الدورة: ${err.message || 'خطأ غير معروف'}`, fatal: true });
            // Return default structure on error (though showError should prevent this)
            return { course: null, modules: [], lessons: [], quizzes: [], attempts: [], categoryName: null, enrollment: null, completions: [] };
        }
    }, {
         // Default value while loading or on SSR without data
         default: (): FetchedCoursePageData => ({
             course: null, modules: [], lessons: [], quizzes: [], attempts: [],
             categoryName: null, enrollment: null, completions: []
         }),
         // Watch for user ID changes to refetch data on login/logout
         watch: [() => profile.value?.id]
    }
);

 // --- Watcher to update local refs when fetched data changes ---
 watch(data, (newData) => {
    console.log("[Watcher] Updating local state from fetched data.");
    course.value = newData?.course ?? null;
    courseModulesData.value = newData?.modules ?? [];
    courseLessonsData.value = newData?.lessons ?? [];
    courseQuizzesData.value = newData?.quizzes ?? [];
    userQuizAttempts.value = newData?.attempts ?? [];
    categoryName.value = newData?.categoryName ?? null;
    enrollment.value = newData?.enrollment ?? null;
    completedLessonIds.value = Array.isArray(newData?.completions) ? newData.completions.map(c => c.lesson_id) : [];
    console.log("[Watcher] Local state updated. Course:", !!course.value, "Lessons:", courseLessonsData.value.length, "Quizzes:", courseQuizzesData.value.length);
 }, { immediate: true }); // Immediate ensures it runs once on load

 // --- Computed Properties ---
const isEnrolled = computed(() => !!enrollment.value);
const totalLessonsCount = computed(() => courseLessonsData.value.length);
const completedLessonsCount = computed(() => completedLessonIds.value.length);

// Calculates progress percentage
const progressPercentage = computed(() => {
  if (totalLessonsCount.value === 0) return 0;
  const validCompletedCount = Math.min(completedLessonsCount.value, totalLessonsCount.value);
  return Math.round((validCompletedCount / totalLessonsCount.value) * 100);
});

// Creates a map of lesson ID to its associated quizzes for quick lookup
const lessonQuizzesMap = computed(() => {
    // console.log("[Computed lessonQuizzesMap] Generating map..."); // Keep logs minimal if not debugging
    const map = new Map<number, QuizInfo[]>();
    for (const quiz of courseQuizzesData.value) {
        if (quiz.lesson_id !== null && !isNaN(Number(quiz.lesson_id))) {
             const lessonIdNumber = Number(quiz.lesson_id);
            if (!map.has(lessonIdNumber)) {
                map.set(lessonIdNumber, []);
            }
            map.get(lessonIdNumber)!.push(quiz);
        }
    }
    map.forEach(quizzes => quizzes.sort((a, b) => (a.title || '').localeCompare(b.title || ''))); // Sort quizzes within each lesson
    // console.log("[Computed lessonQuizzesMap] Map generated. Size:", map.size);
    return map;
});

// Filters quizzes that are course-level (no module or lesson associated)
const courseLevelQuizzes = computed(() => {
    return courseQuizzesData.value
           .filter(q => q.lesson_id === null && q.module_number === null)
           .sort((a, b) => (a.title || '').localeCompare(b.title || ''));
});

// Groups lessons and module-level quizzes by module for display
const groupedContent = computed<ModuleGroup[]>(() => {
    // console.log("[Computed groupedContent] Generating groups...");
    const modulesMap: Map<number | string, ModuleGroup> = new Map();

    // Initialize with defined modules
    for (const moduleInfo of courseModulesData.value) {
        if (moduleInfo.module_number !== null) {
             modulesMap.set(moduleInfo.module_number, {
                 moduleNumber: moduleInfo.module_number,
                 moduleTitle: moduleInfo.title || `الوحدة ${moduleInfo.module_number}`,
                 lessons: [],
                 quizzes: [],
             });
        } else { console.warn(`Module ID ${moduleInfo.id} has null module_number.`); }
    }
    // Add 'general' group for items without a module number
    const generalGroupKey = 'general';
    modulesMap.set(generalGroupKey, { moduleNumber: null, moduleTitle: 'دروس أو اختبارات عامة', lessons: [], quizzes: [] });

    // Assign lessons
    for (const lesson of courseLessonsData.value) {
        const key = lesson.module_number !== null ? lesson.module_number : generalGroupKey;
        const group = modulesMap.get(key);
        if (group) { group.lessons.push(lesson); }
        else { modulesMap.get(generalGroupKey)?.lessons.push(lesson); } // Fallback
    }

    // Assign module-level quizzes (have module_number, no lesson_id)
    for (const quiz of courseQuizzesData.value) {
        if (quiz.module_number !== null && quiz.lesson_id === null) {
             const group = modulesMap.get(quiz.module_number);
             if (group) { group.quizzes.push(quiz); }
             else { console.warn(`Module quiz ${quiz.id} (module ${quiz.module_number}) has no matching group.`); }
        }
    }
    // Sort module quizzes
    modulesMap.forEach(group => group.quizzes.sort((a, b) => (a.title || '').localeCompare(b.title || '')));

    // Remove empty 'general' group
    const generalGroup = modulesMap.get(generalGroupKey);
    if (generalGroup && generalGroup.lessons.length === 0 && generalGroup.quizzes.length === 0) {
        modulesMap.delete(generalGroupKey);
    }

    // Sort groups (general first, then by module number)
    const sortedGroups = Array.from(modulesMap.values()).sort((a, b) => {
        if (a.moduleNumber === null) return -1; if (b.moduleNumber === null) return 1;
        return a.moduleNumber - b.moduleNumber;
    });
    // console.log("[Computed groupedContent] Groups generated:", sortedGroups.length);
    return sortedGroups;
});

 // --- Helper Functions ---
const isLessonCompleted = (lessonId: number): boolean => completedLessonIds.value.includes(lessonId);
const getCourseImageUrl = (url: string | null): string => url || '/images/placeholder-course.jpg'; // Default placeholder
const lessonLink = (lessonId: number | undefined): string => lessonId ? `/study/courses/${courseId.value}/lessons/${lessonId}` : '#';

// Checks if the user has passed a specific quiz based on the latest submitted attempt
const hasPassedQuiz = (quizId: number | bigint | undefined | null): boolean => {
    if (!quizId || !isLoggedIn.value) return false;
    const numericQuizId = Number(quizId);
    const attemptsForQuiz = userQuizAttempts.value
        .filter(att => att.quiz_id === numericQuizId && att.submitted_at !== null)
        .sort((a, b) => new Date(b.submitted_at!).getTime() - new Date(a.submitted_at!).getTime());
    return attemptsForQuiz.length > 0 && attemptsForQuiz[0].passed === true;
};

// Basic check if user can attempt a quiz (logged in and enrolled)
const canAttemptQuiz = (quizId: number | bigint | undefined | null): boolean => {
    return isLoggedIn.value && isEnrolled.value;
    // Add more complex logic here if needed (e.g., prerequisites, max attempts)
};

// --- Event Handlers ---
const handleEnroll = async (id: number | undefined | null) => {
    const targetCourseId = Number(id); // Ensure number
    if (!targetCourseId || !isLoggedIn.value || !profile.value?.id || isEnrolled.value || enrollLoading.value) return;
    enrollLoading.value = true;
    try {
      const { data: newEnrollment, error: enrollError } = await supabase
        .from('course_enrollments')
        .insert({ user_id: profile.value.id, course_id: targetCourseId })
        .select('*').single();
      if (enrollError) throw enrollError;
      await refresh(); // Refresh all data after enrollment
      // TODO: Replace alert with a user-friendly notification system
      console.log('Enrollment successful!');
      // alert('تم الانتساب بنجاح!');
    } catch (err:any) {
        console.error("Enrollment error:", err);
        // alert(`فشل الانتساب: ${err.message}`);
        // TODO: Show error notification
    } finally {
        enrollLoading.value = false;
    }
};

const handleUnenroll = async (id: number | undefined | null) => {
    const targetCourseId = Number(id); // Ensure number
    if (!targetCourseId || !isEnrolled.value || !profile.value?.id || enrollLoading.value) return;
    // Confirmation dialog
    if (!confirm('هل أنت متأكد من إلغاء الانتساب لهذه الدورة؟ سيتم حذف تقدمك المحفوظ المتعلق بهذه الدورة.')) return;
    enrollLoading.value = true;
    try {
      // Consider potential need for cascading deletes or manual cleanup of related data
      const { error: unenrollError } = await supabase
        .from('course_enrollments')
        .delete()
        .match({ user_id: profile.value.id, course_id: targetCourseId });
      if (unenrollError) throw unenrollError;
      await refresh(); // Refresh all data after unenrollment
      // TODO: Replace alert with a user-friendly notification system
      console.log('Unenrollment successful!');
      // alert('تم إلغاء الانتساب.');
    } catch (err:any) {
        console.error("Unenrollment error:", err);
        // alert(`فشل إلغاء الانتساب: ${err.message}`);
        // TODO: Show error notification
    } finally {
        enrollLoading.value = false;
    }
};

// Navigates to the last accessed lesson or the first lesson
const navigateToLastAccessed = () => {
     const targetCourseId = courseId.value;
    if (isNaN(targetCourseId) || !isEnrolled.value) return;
    const lastLessonId = enrollment.value?.last_accessed_lesson_id;
    const lessons = courseLessonsData.value; // Use the sorted list
    const firstLessonId = lessons.length > 0 ? lessons[0]?.id : undefined;

    const targetLessonId = lastLessonId && lessons.some(l => l.id === lastLessonId)
                           ? lastLessonId
                           : firstLessonId;

    if (targetLessonId) {
        navigateTo(lessonLink(targetLessonId));
    } else {
        console.warn("No lessons found to navigate to for last accessed/first lesson.");
        // alert('لا توجد دروس في هذه الدورة بعد.');
        // TODO: Show notification
    }
};

// Navigates to the quiz page
const goToQuiz = (quizId: number | bigint | undefined | null) => {
    if (!quizId) return;
    navigateTo(`/quizzes/${String(quizId)}`);
};

 // --- Meta Tags / Head ---
 // Updates page title and description based on course data, loading, or error state
 watch([course, pending, error], ([newCourse, loadingState, errorState]) => {
     let pageTitle = 'تفاصيل الدورة';
     let description = 'تصفح محتوى الدورة والدروس المتاحة.';

     if (loadingState) {
         pageTitle = 'جارٍ تحميل الدورة...';
         description = 'يتم الآن تحميل تفاصيل الدورة المطلوبة.';
     } else if (errorState && errorState.statusCode === 404) {
         pageTitle = 'الدورة غير متاحة';
         description = 'لم نتمكن من العثور على الدورة المطلوبة أو أنها غير نشطة حالياً.';
     } else if (errorState) {
         pageTitle = 'خطأ في تحميل الدورة';
         description = `حدث خطأ أثناء تحميل بيانات الدورة: ${errorState.message}`;
     } else if (newCourse) {
         pageTitle = `دورة: ${newCourse.title}`;
         description = newCourse.description?.substring(0, 160) || `تفاصيل ومحتوى دورة "${newCourse.title}".`;
     }

     useHead({
         title: pageTitle,
         meta: [
            { name: 'description', content: description },
            // Add more relevant meta tags (Open Graph, Twitter Cards) if desired
             { property: 'og:title', content: pageTitle },
             { property: 'og:description', content: description },
             { property: 'og:type', content: 'website' }, // Or 'article' if more appropriate
         ]
     });
 }, { immediate: true }); // Run immediately to set initial head tags

</script>

<style scoped>
/* Styles from the original component */
.button-primary {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-opacity-85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150;
}
.button-enroll { /* Alias for primary button */
  @apply button-primary;
}
.button-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150;
}

.button-quiz-base {
    @apply inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap transition-colors duration-150;
    min-height: 30px; /* Ensure consistent height */
}
.button-quiz-course {
    @apply button-quiz-base text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500;
}
.button-quiz-module {
    @apply button-quiz-base text-white bg-teal-600 hover:bg-teal-700 focus:ring-teal-500;
}
.button-quiz-lesson {
    @apply button-quiz-base text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-900/80 focus:ring-indigo-500 border border-indigo-200 dark:border-indigo-700/70;
}

/* Styling for passed quiz buttons */
.button-quiz-base.passed {
    @apply !bg-green-600 !text-white hover:!bg-green-700 focus:!ring-green-500 opacity-80 cursor-default pointer-events-none;
}
.button-quiz-lesson.passed {
    /* Slightly different 'passed' style for lesson quizzes */
    @apply !bg-green-100 dark:!bg-green-900/60 !text-green-700 dark:!text-green-300 !border-green-300 dark:!border-green-700/80 opacity-85;
}

/* Lesson item styling */
.lesson-completed { @apply bg-green-50 dark:bg-green-900/30 opacity-85 hover:opacity-95; }
.lesson-incomplete { @apply hover:bg-gray-50 dark:hover:bg-gray-700/50; }

/* Lesson status icon (circle with number or checkmark) */
.lesson-status-icon {
    @apply flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-semibold rounded-full;
}
.lesson-status-icon.completed {
    @apply bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100;
}
.lesson-status-icon.incomplete {
    @apply bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300;
}
.lesson-status-icon svg {
    @apply w-4 h-4; /* Ensure checkmark fits */
}

/* Lesson title link styling */
.lesson-title-link {
    @apply text-base text-gray-800 dark:text-gray-200
           hover:text-[var(--text-primary-hover-light)]
           dark:hover:text-[var(--text-primary-hover-dark)]
           truncate transition-colors duration-150;
}

/* Tiny text utility */
.text-xxs {
    font-size: 0.65rem; /* ~10.4px */
    line-height: 0.8rem; /* ~12.8px */
}

/* Ensure progress bar transition */
.progress-section .bg-primary {
    transition: width 0.5s ease-out;
}
/* Improve focus visibility (example) */
button:focus-visible, a:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>