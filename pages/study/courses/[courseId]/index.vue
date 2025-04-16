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
                                 :title="hasPassedQuiz(quiz.id) ? `تم اجتياز الاختبار: ${quiz.title}` : quiz.title"
                                 :disabled="!canAttemptQuiz(quiz.id)"
                              >
                                 <!-- *** QuizIcon REMOVED *** -->
                                 {{ quiz.title || 'الاختبار النهائي' }}
                                 <span v-if="hasPassedQuiz(quiz.id)" class="ms-1.5 text-xxs opacity-80 text-green-100">(تم الاجتياز - عرض النتيجة)</span>
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
                           :title="hasPassedQuiz(quiz.id) ? `تم اجتياز الاختبار: ${quiz.title}` : quiz.title"
                           :disabled="!canAttemptQuiz(quiz.id)"
                       >
                           <!-- *** QuizIcon REMOVED *** -->
                            {{ quiz.title || `اختبار الوحدة ${moduleGroup.moduleNumber}` }}
                            <span v-if="hasPassedQuiz(quiz.id)" class="ms-1.5 text-xxs opacity-80 text-green-100">(تم الاجتياز - عرض النتيجة)</span>
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
                                :title="hasPassedQuiz(quiz.id) ? `تم اجتياز الاختبار: ${quiz.title}` : quiz.title"
                                :disabled="!canAttemptQuiz(quiz.id)"
                            >
                                <!-- *** QuizIcon REMOVED *** -->
                                {{ quiz.title || 'اختبار الدرس' }}
                                <span v-if="hasPassedQuiz(quiz.id)" class="ms-1 text-xxs opacity-80 text-indigo-800 dark:text-indigo-300">(تم الاجتياز - عرض النتيجة)</span>
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
// --- استيراد الوحدات والمكونات اللازمة ---
import { ref, computed, watch, shallowRef } from 'vue'; // لاستخدام حالة التفاعل والحساب والمراقبة
import type { Database, Tables } from '~/types/database.types'; // أنواع قاعدة بيانات Supabase المنشأة
import { useSupabaseClient, useAsyncData, useRoute, useHead, navigateTo, createError, showError } from '#imports'; // وظائف Nuxt و Supabase
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // مكون عرض التحميل
import { useUserStore } from '~/stores/user'; // مخزن Pinia لإدارة حالة المستخدم
import { storeToRefs } from 'pinia'; // لتحويل حالة المخزن إلى refs تفاعلية

// --- تعريف الأنواع (Types) ---
// أنواع مخصصة لتمثيل البيانات التي يتم جلبها والتعامل معها في الصفحة لزيادة الوضوح والأمان

// نوع مركب يجمع بيانات الدورة مع العلاقات المرتبطة بها (الفئة، الوحدات، الدروس، الاختبارات)
// يتم استخدامه بشكل أساسي لتحديد نوع البيانات المتوقع من الاستعلام الرئيسي في useAsyncData
type CourseWithDetails = Tables<'study_courses'> & {
    category: Pick<Tables<'categories'>, 'name'> | null; // اسم الفئة فقط
    modules: Array<Pick<Tables<'course_modules'>, 'id' | 'title' | 'module_number'>>; // معلومات أساسية للوحدات
    lessons: Array<Pick<Tables<'lessons'>, 'id' | 'title' | 'lesson_order' | 'module_number' | 'created_at'>>; // معلومات أساسية للدروس
    quizzes: Array<Pick<Tables<'quizzes'>, 'id' | 'title' | 'lesson_id' | 'module_number' | 'course_id' | 'is_active'>>; // معلومات أساسية للاختبارات
};

// أنواع قياسية لتمثيل الكيانات الفردية
type Course = Tables<'study_courses'>; // نوع الدورة الأساسي من الأنواع المنشأة
type Lesson = Pick<Tables<'lessons'>, 'id' | 'title' | 'lesson_order' | 'module_number' | 'created_at'>; // المعلومات الأساسية للدرس
type CourseModuleInfo = Pick<Tables<'course_modules'>, 'id' | 'title' | 'module_number'>; // المعلومات الأساسية للوحدة
type QuizInfo = Pick<Tables<'quizzes'>, 'id' | 'title' | 'lesson_id' | 'module_number' | 'course_id' | 'is_active'>; // المعلومات الأساسية للاختبار
type CourseEnrollment = Tables<'course_enrollments'>; // نوع سجل الانتساب
type LessonCompletionInfo = Pick<Tables<'lesson_completions'>, 'lesson_id'>; // معرف الدرس المكتمل فقط
type QuizAttemptInfo = Pick<Tables<'quiz_attempts'>, 'id' | 'quiz_id' | 'passed' | 'submitted_at'>; // معلومات أساسية عن محاولة الاختبار

// نوع الهيكل الكامل للبيانات التي يتم إرجاعها من useAsyncData
type FetchedCoursePageData = {
    course: Course | null;                 // بيانات الدورة الرئيسية
    modules: CourseModuleInfo[];         // قائمة الوحدات
    lessons: Lesson[];                   // قائمة الدروس
    quizzes: QuizInfo[];                 // قائمة الاختبارات النشطة (للدورة، الوحدة، الدرس)
    attempts: QuizAttemptInfo[];         // قائمة محاولات المستخدم للاختبارات في هذه الدورة
    categoryName: string | null;         // اسم الفئة
    enrollment: CourseEnrollment | null; // سجل انتساب المستخدم الحالي (إن وجد)
    completions: LessonCompletionInfo[]; // قائمة الدروس المكتملة للمستخدم الحالي
};

// نوع يستخدم لتجميع المحتوى (دروس واختبارات) حسب الوحدة في القالب
interface ModuleGroup {
  moduleNumber: number | null; // رقم الوحدة (أو null للدروس العامة)
  moduleTitle: string;         // عنوان الوحدة
  lessons: Lesson[];           // قائمة الدروس في هذه الوحدة
  quizzes: QuizInfo[];         // قائمة اختبارات الوحدة (Module-level quizzes)
}

// --- إعدادات أولية ---
const supabase = useSupabaseClient<Database>(); // عميل Supabase للتفاعل مع قاعدة البيانات
const route = useRoute();                     // للوصول إلى معلمات المسار (مثل courseId)
const userStore = useUserStore();             // للوصول إلى حالة المستخدم
const { profile, isLoggedIn } = storeToRefs(userStore); // الحصول على بيانات المستخدم وحالة تسجيل الدخول كـ refs تفاعلية

// --- الحصول على معرف الدورة والتحقق منه ---
const courseId = computed<number>(() => {
    // يقرأ معلمة 'courseId' من عنوان URL
    const id = parseInt(route.params.courseId as string, 10);
    // يتحقق إذا كان الرقم صالحًا (ليس NaN وأكبر من 0)
    if (isNaN(id) || id <= 0) {
         // يعرض خطأ فادحًا إذا كان المعرف غير صالح ويوقف تحميل الصفحة
         showError({ statusCode: 400, statusMessage: `معرف الدورة غير صالح: "${route.params.courseId}"`, fatal: true });
         return NaN; // إرجاع NaN للإشارة إلى مشكلة
    }
    return id; // إرجاع المعرف الصحيح
});

// --- تعريف الحالة التفاعلية المحلية للصفحة ---
// تُستخدم لتخزين البيانات التي تم جلبها وعرضها في القالب
const course = shallowRef<Course | null>(null); // بيانات الدورة الحالية (shallowRef لتحسين الأداء مع الكائنات الكبيرة)
const courseModulesData = shallowRef<CourseModuleInfo[]>([]); // قائمة بيانات الوحدات
const courseLessonsData = shallowRef<Lesson[]>([]);         // قائمة بيانات الدروس
const courseQuizzesData = shallowRef<QuizInfo[]>([]);         // قائمة بيانات الاختبارات
const userQuizAttempts = shallowRef<QuizAttemptInfo[]>([]);   // قائمة محاولات المستخدم
const categoryName = shallowRef<string | null>(null);        // اسم الفئة
const enrollment = shallowRef<CourseEnrollment | null>(null); // بيانات انتساب المستخدم
const completedLessonIds = shallowRef<number[]>([]);        // قائمة بمعرفات الدروس المكتملة
const enrollLoading = ref(false); // حالة التحميل لعمليات الانتساب/إلغاء الانتساب

// --- إيقاف مؤقت للإعداد إذا كان معرف الدورة غير صالح ---
if (isNaN(courseId.value)) {
    console.error("Course ID is invalid, stopping component setup.");
    // قد تحتاج لإضافة حالة خطأ هنا إذا لم يكن showError كافيًا
}

// --- جلب البيانات باستخدام useAsyncData ---
// هذه الوظيفة تجلب جميع البيانات اللازمة لعرض الصفحة بشكل غير متزامن.
// يتم تخزين النتائج مؤقتًا (cache) بناءً على المفتاح الفريد.
const { data, pending, error, refresh } = await useAsyncData<FetchedCoursePageData>(
    // مفتاح فريد لتخزين البيانات: يعتمد على معرف الدورة ومعرف المستخدم (للتحديث عند تسجيل الدخول/الخروج)
    `course-page-data-${courseId.value}-${profile.value?.id ?? 'guest'}`,
    // الدالة الفعلية التي تقوم بالجلب
    async () => {
        const currentCourseId = courseId.value;
        if (isNaN(currentCourseId)) {
             throw createError({ statusCode: 400, message: 'معرف الدورة غير صالح عند بدء الجلب.', fatal: true });
        }
        const currentUserId = profile.value?.id;
        console.log(`[useAsyncData] Fetching data for course ${currentCourseId}, User ${currentUserId ?? 'Guest'}`);

        try {
            // --- الخطوة 1: جلب بيانات الدورة الرئيسية والعلاقات المباشرة (وحدات، دروس) ---
            console.log("[useAsyncData] Fetching main course data, category, modules, lessons...");
            const { data: courseBaseData, error: courseFetchError } = await supabase
                .from('study_courses')
                .select(`
                    *,
                    category:categories ( name ),
                    modules:course_modules!course_id ( id, title, module_number ),
                    lessons:lessons!course_id ( id, title, lesson_order, module_number, created_at )
                `)
                .eq('id', currentCourseId)
                .eq('is_active', true) // التأكد من أن الدورة نشطة
                .single(); // توقع صف واحد فقط للدورة

            if (courseFetchError) {
                 console.error("[useAsyncData] Error fetching base course data:", courseFetchError);
                 throw createError({ statusCode: 500, statusMessage: `فشل جلب بيانات الدورة الرئيسية: ${courseFetchError.message}`, fatal: true });
            }
             if (!courseBaseData) {
                console.warn(`[useAsyncData] Course ${currentCourseId} not found or inactive.`);
                throw createError({ statusCode: 404, message: 'الدورة المطلوبة غير موجودة أو غير نشطة.', fatal: true });
            }

            // فصل البيانات التي تم جلبها
            const fetchedCourse: Course = { ...courseBaseData, category: undefined, modules: undefined, lessons: undefined };
            const fetchedModules = courseBaseData.modules?.sort((a, b) => (a.module_number ?? Infinity) - (b.module_number ?? Infinity)) ?? [];
            const fetchedLessons = courseBaseData.lessons?.sort((a, b) => { /* ... (نفس منطق الترتيب السابق للدروس) ... */
                const moduleCompare = (a.module_number ?? Infinity) - (b.module_number ?? Infinity);
                if (moduleCompare !== 0) return moduleCompare;
                const orderCompare = (a.lesson_order ?? Infinity) - (b.lesson_order ?? Infinity);
                 if (orderCompare !== 0) return orderCompare;
                return new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
             }) ?? [];
            const fetchedCategoryName = courseBaseData.category?.name ?? null;
            const lessonIds = fetchedLessons.map(l => l.id); // الحصول على معرفات الدروس لجلب اختباراتها

            // --- الخطوة 2: جلب جميع الاختبارات النشطة المرتبطة (بالدورة مباشرة أو بدروسها) ---
             console.log("[useAsyncData] Fetching course-level and lesson-level quizzes...");
            let fetchedQuizzes: QuizInfo[] = [];
            // جلب اختبارات الدورة (module/final)
            const { data: courseLinkedQuizzes, error: courseQuizError } = await supabase
                .from('quizzes')
                .select('id, title, lesson_id, module_number, course_id, is_active')
                .eq('course_id', currentCourseId) // المرتبطة مباشرة بالدورة
                .eq('is_active', true);

            if (courseQuizError) console.error("Error fetching course-linked quizzes:", courseQuizError.message);
            else fetchedQuizzes = fetchedQuizzes.concat(courseLinkedQuizzes ?? []);

            // جلب اختبارات الدروس (lesson)
            if (lessonIds.length > 0) {
                const { data: lessonLinkedQuizzes, error: lessonQuizError } = await supabase
                    .from('quizzes')
                    .select('id, title, lesson_id, module_number, course_id, is_active')
                    .in('lesson_id', lessonIds) // المرتبطة بالدروس في هذه الدورة
                    .eq('is_active', true);

                if (lessonQuizError) console.error("Error fetching lesson-linked quizzes:", lessonQuizError.message);
                else fetchedQuizzes = fetchedQuizzes.concat(lessonLinkedQuizzes ?? []);
            }
            // إزالة التكرارات المحتملة (غير مرجح لكن آمن)
            fetchedQuizzes = Array.from(new Map(fetchedQuizzes.map(q => [q.id, q])).values());
             console.log(`[useAsyncData] Total active quizzes fetched: ${fetchedQuizzes.length}`);


            // --- الخطوة 3: جلب البيانات الخاصة بالمستخدم (إذا كان مسجل الدخول) ---
             console.log("[useAsyncData] Fetching user-specific data...");
            let fetchedEnrollment: CourseEnrollment | null = null;
            let fetchedCompletions: LessonCompletionInfo[] = [];
            let fetchedAttempts: QuizAttemptInfo[] = [];
            const quizIds = fetchedQuizzes.map(q => q.id); // معرفات الاختبارات لجلب المحاولات

            if (isLoggedIn.value && currentUserId) {
                // تنفيذ الاستعلامات بشكل متوازي لتحسين الأداء
                const [enrollmentRes, completionsRes, attemptsRes] = await Promise.all([
                    supabase.from('course_enrollments').select('*').eq('user_id', currentUserId).eq('course_id', currentCourseId).maybeSingle(),
                    lessonIds.length > 0 ? supabase.from('lesson_completions').select('lesson_id').eq('user_id', currentUserId).in('lesson_id', lessonIds) : Promise.resolve({ data: [], error: null }),
                    quizIds.length > 0 ? supabase.from('quiz_attempts').select('id, quiz_id, passed, submitted_at').eq('user_id', currentUserId).in('quiz_id', quizIds) : Promise.resolve({ data: [], error: null })
                ]);

                // تسجيل الأخطاء دون إيقاف الجلب بالكامل
                if (enrollmentRes.error) console.error("Enrollment fetch error:", enrollmentRes.error.message); else fetchedEnrollment = enrollmentRes.data;
                if (completionsRes.error) console.error("Completions fetch error:", completionsRes.error.message); else fetchedCompletions = completionsRes.data ?? [];
                if (attemptsRes.error) console.error("Attempts fetch error:", attemptsRes.error.message); else fetchedAttempts = attemptsRes.data ?? [];
                 console.log(`[useAsyncData] User data fetched. Enrolled: ${!!fetchedEnrollment}, Completions: ${fetchedCompletions.length}, Attempts: ${fetchedAttempts.length}`);
            } else {
                 console.log("[useAsyncData] User not logged in, skipping user-specific data fetch.");
            }

            // --- الخطوة 4: إرجاع البيانات المجمعة ---
             console.log("[useAsyncData] Fetch process complete.");
            return {
                course: fetchedCourse,
                modules: fetchedModules,
                lessons: fetchedLessons,
                quizzes: fetchedQuizzes, // القائمة المدمجة للاختبارات
                categoryName: fetchedCategoryName,
                enrollment: fetchedEnrollment,
                completions: fetchedCompletions,
                attempts: fetchedAttempts,
            };

        } catch (err: any) {
             console.error("[useAsyncData] CRITICAL ERROR during data fetching:", err);
             if (err.statusCode && err.fatal) { throw err; } // إعادة رمي أخطاء createError
             showError({ statusCode: err.statusCode || 500, message: `حدث خطأ غير متوقع أثناء تحميل بيانات الدورة: ${err.message || 'خطأ غير معروف'}`, fatal: true });
             // إرجاع هيكل افتراضي فارغ في حالة الأخطاء غير المتوقعة
             return { course: null, modules: [], lessons: [], quizzes: [], attempts: [], categoryName: null, enrollment: null, completions: [] };
        }
    }, {
         // القيمة الافتراضية أثناء التحميل أو في حالة عدم وجود بيانات
         default: (): FetchedCoursePageData => ({
             course: null, modules: [], lessons: [], quizzes: [], attempts: [],
             categoryName: null, enrollment: null, completions: []
         }),
         // إعادة الجلب عند تغير معرف المستخدم (تسجيل الدخول/الخروج)
         watch: [() => profile.value?.id]
    }
);

// --- مراقبة البيانات المجلوبة وتحديث الحالة المحلية ---
// هذا الـ watcher يضمن تحديث الـ refs المحلية (مثل course, lessons, quizzes)
// كلما تغيرت البيانات المجلوبة بواسطة useAsyncData (بما في ذلك بعد refresh).
 watch(data, (newData) => {
    console.log("[Watcher] Updating local state from fetched data.");
    // تحديث كل ref بقيمته الجديدة أو القيمة الافتراضية إذا كانت null/undefined
    course.value = newData?.course ?? null;
    courseModulesData.value = Array.isArray(newData?.modules) ? newData.modules : [];
    courseLessonsData.value = Array.isArray(newData?.lessons) ? newData.lessons : [];
    courseQuizzesData.value = Array.isArray(newData?.quizzes) ? newData.quizzes : [];
    userQuizAttempts.value = Array.isArray(newData?.attempts) ? newData.attempts : [];
    categoryName.value = newData?.categoryName ?? null;
    enrollment.value = newData?.enrollment ?? null;
    completedLessonIds.value = Array.isArray(newData?.completions) ? newData.completions.map(c => c.lesson_id) : [];
    console.log("[Watcher] Local state updated. Course:", !!course.value, "Lessons:", courseLessonsData.value.length, "Quizzes:", courseQuizzesData.value.length);

    // التعامل مع حالة عدم وجود بيانات بعد التحميل
    if (!pending.value && !error.value && !newData?.course) {
       console.warn("[Watcher] No course data found after loading.");
       // يمكنك هنا إظهار رسالة خطأ محلية إذا أردت
    }

 }, { immediate: true }); // immediate: true يضمن التشغيل مرة واحدة فورًا عند تحميل المكون

// --- الخصائص المحسوبة (Computed Properties) ---
// تُستخدم لحساب قيم مشتقة من الحالة التفاعلية بطريقة فعالة

// هل المستخدم منتسب لهذه الدورة؟
const isEnrolled = computed(() => !!enrollment.value);
// إجمالي عدد الدروس في الدورة
const totalLessonsCount = computed(() => courseLessonsData.value.length);
// عدد الدروس التي أكملها المستخدم
const completedLessonsCount = computed(() => completedLessonIds.value.length);
// نسبة التقدم المئوية
const progressPercentage = computed(() => {
  if (totalLessonsCount.value === 0) return 0; // تجنب القسمة على صفر
  // التأكد من أن عدد الدروس المكتملة لا يتجاوز الإجمالي (احتياطي)
  const validCompletedCount = Math.min(completedLessonsCount.value, totalLessonsCount.value);
  return Math.round((validCompletedCount / totalLessonsCount.value) * 100);
});

// إنشاء خريطة (Map) لربط معرف الدرس بقائمة اختباراته لتسهيل الوصول في القالب
const lessonQuizzesMap = computed(() => {
    const map = new Map<number, QuizInfo[]>();
    // المرور على قائمة الاختبارات المجلوبة
    for (const quiz of courseQuizzesData.value) {
        // التحقق إذا كان الاختبار مرتبط بدرس (له lesson_id صالح)
        if (quiz.lesson_id !== null && !isNaN(Number(quiz.lesson_id))) {
             const lessonIdNumber = Number(quiz.lesson_id);
             // إذا لم يكن هناك مدخل لهذا الدرس بعد، قم بإنشائه
            if (!map.has(lessonIdNumber)) {
                map.set(lessonIdNumber, []);
            }
            // أضف الاختبار إلى قائمة اختبارات هذا الدرس
            map.get(lessonIdNumber)!.push(quiz);
        }
    }
    // ترتيب الاختبارات داخل كل درس أبجديًا حسب العنوان (اختياري)
    map.forEach(quizzes => quizzes.sort((a, b) => (a.title || '').localeCompare(b.title || '')));
    return map; // إرجاع الخريطة النهائية
});

// تصفية الاختبارات التي ليس لها lesson_id أو module_number (اختبارات مستوى الدورة)
const courseLevelQuizzes = computed(() => {
    return courseQuizzesData.value
           .filter(q => q.lesson_id === null && q.module_number === null) // الشرط الأساسي
           .sort((a, b) => (a.title || '').localeCompare(b.title || '')); // الترتيب الأبجدي
});

// تجميع المحتوى (الدروس واختبارات الوحدات) حسب الوحدة لعرضها بشكل منظم في القالب
const groupedContent = computed<ModuleGroup[]>(() => {
    const modulesMap: Map<number | string, ModuleGroup> = new Map(); // خريطة لتخزين مجموعات الوحدات

    // إضافة الوحدات المعرفة مسبقًا من courseModulesData إلى الخريطة
    for (const moduleInfo of courseModulesData.value) {
        if (moduleInfo.module_number !== null) {
             modulesMap.set(moduleInfo.module_number, {
                 moduleNumber: moduleInfo.module_number,
                 moduleTitle: moduleInfo.title || `الوحدة ${moduleInfo.module_number}`, // عنوان الوحدة أو عنوان افتراضي
                 lessons: [], // قائمة فارغة مبدئية للدروس
                 quizzes: [], // قائمة فارغة مبدئية لاختبارات الوحدة
             });
        } else { console.warn(`Module ID ${moduleInfo.id} has null module_number.`); } // تحذير إذا كان رقم الوحدة غير موجود
    }

    // إضافة مجموعة افتراضية للدروس/الاختبارات التي ليس لها رقم وحدة
    const generalGroupKey = 'general';
    modulesMap.set(generalGroupKey, { moduleNumber: null, moduleTitle: 'دروس أو اختبارات عامة', lessons: [], quizzes: [] });

    // توزيع الدروس على المجموعات الصحيحة بناءً على module_number
    for (const lesson of courseLessonsData.value) {
        const key = lesson.module_number !== null ? lesson.module_number : generalGroupKey; // تحديد المفتاح (رقم الوحدة أو 'general')
        const group = modulesMap.get(key); // الحصول على المجموعة المناسبة من الخريطة
        if (group) { group.lessons.push(lesson); } // إضافة الدرس للمجموعة
        else { modulesMap.get(generalGroupKey)?.lessons.push(lesson); } // إذا لم توجد مجموعة، إضافته للمجموعة العامة كاحتياط
    }

    // توزيع اختبارات الوحدات (لها module_number ولكن lesson_id هو null)
    for (const quiz of courseQuizzesData.value) {
        if (quiz.module_number !== null && quiz.lesson_id === null) {
             const group = modulesMap.get(quiz.module_number); // الحصول على مجموعة الوحدة
             if (group) { group.quizzes.push(quiz); } // إضافة الاختبار للمجموعة
             else { console.warn(`Module quiz ${quiz.id} (module ${quiz.module_number}) has no matching group.`); } // تحذير إذا لم توجد مجموعة
        }
    }
    // ترتيب اختبارات الوحدات داخل كل مجموعة أبجديًا
    modulesMap.forEach(group => group.quizzes.sort((a, b) => (a.title || '').localeCompare(b.title || '')));

    // حذف المجموعة العامة إذا كانت فارغة (لا تحتوي على دروس أو اختبارات)
    const generalGroup = modulesMap.get(generalGroupKey);
    if (generalGroup && generalGroup.lessons.length === 0 && generalGroup.quizzes.length === 0) {
        modulesMap.delete(generalGroupKey);
    }

    // تحويل الخريطة إلى مصفوفة وترتيب المجموعات (العامة أولاً، ثم حسب رقم الوحدة)
    const sortedGroups = Array.from(modulesMap.values()).sort((a, b) => {
        if (a.moduleNumber === null) return -1; // المجموعة العامة تأتي أولاً
        if (b.moduleNumber === null) return 1;
        return a.moduleNumber - b.moduleNumber; // ترتيب رقمي للوحدات الأخرى
    });

    return sortedGroups; // إرجاع المصفوفة المرتبة للمجموعات
});

 // --- الدوال المساعدة (Helper Functions) ---

// التحقق مما إذا كان الدرس قد اكتمل بواسطة المستخدم الحالي
const isLessonCompleted = (lessonId: number): boolean => completedLessonIds.value.includes(lessonId);

// الحصول على رابط صورة الدورة أو صورة افتراضية
const getCourseImageUrl = (url: string | null): string => url || '/images/placeholder-course.jpg'; // استخدام placeholder إذا لم يتوفر رابط

// إنشاء رابط لصفحة الدرس
const lessonLink = (lessonId: number | undefined): string => lessonId ? `/study/courses/${courseId.value}/lessons/${lessonId}` : '#'; // رابط آمن

// التحقق مما إذا كان المستخدم قد اجتاز اختبارًا معينًا (بناءً على آخر محاولة)
const hasPassedQuiz = (quizId: number | bigint | undefined | null): boolean => {
    if (!quizId || !isLoggedIn.value) return false; // لا يمكن التحقق بدون معرف اختبار أو تسجيل دخول
    const numericQuizId = Number(quizId); // تحويل إلى رقم
    // تصفية محاولات المستخدم لهذا الاختبار المحدد والتي تم إرسالها
    const attemptsForQuiz = userQuizAttempts.value
        .filter(att => att.quiz_id === numericQuizId && att.submitted_at !== null)
        // ترتيب المحاولات حسب تاريخ الإرسال (الأحدث أولاً)
        .sort((a, b) => new Date(b.submitted_at!).getTime() - new Date(a.submitted_at!).getTime());
    // إرجاع true إذا كان هناك محاولات وكانت آخر محاولة ناجحة (passed = true)
    return attemptsForQuiz.length > 0 && attemptsForQuiz[0].passed === true;
};

// التحقق المبدئي مما إذا كان بإمكان المستخدم محاولة إجراء الاختبار (مسجل ومنتسب)
const canAttemptQuiz = (quizId: number | bigint | undefined | null): boolean => {
    // يمكن إضافة شروط أكثر تعقيدًا هنا لاحقًا (مثل عدد المحاولات، المتطلبات السابقة)
    return isLoggedIn.value && isEnrolled.value;
};

// --- معالجات الأحداث (Event Handlers) ---

// معالج حدث النقر على زر "انتسب الآن"
const handleEnroll = async (id: number | undefined | null) => {
    const targetCourseId = Number(id); // التأكد من أنه رقم
    // التحقق من الشروط الأساسية قبل المتابعة
    if (!targetCourseId || !isLoggedIn.value || !profile.value?.id || isEnrolled.value || enrollLoading.value) return;
    enrollLoading.value = true; // تفعيل حالة التحميل
    try {
      // إدخال سجل جديد في جدول الانتساب
      const { data: newEnrollment, error: enrollError } = await supabase
        .from('course_enrollments')
        .insert({ user_id: profile.value.id, course_id: targetCourseId })
        .select('*').single(); // طلب إرجاع السجل الجديد (اختياري)
      if (enrollError) throw enrollError; // رمي الخطأ إذا حدث
      await refresh(); // إعادة جلب جميع بيانات الصفحة لتحديث الواجهة (بما في ذلك حالة الانتساب والتقدم)
      console.log('Enrollment successful!');
      // TODO: استبدال alert بنظام إشعارات أفضل (toast)
      // alert('تم الانتساب بنجاح!');
    } catch (err:any) {
        console.error("Enrollment error:", err);
        // TODO: إظهار رسالة خطأ للمستخدم
        // alert(`فشل الانتساب: ${err.message}`);
    } finally {
        enrollLoading.value = false; // إلغاء تفعيل حالة التحميل دائمًا
    }
};

// معالج حدث النقر على زر "إلغاء الانتساب"
const handleUnenroll = async (id: number | undefined | null) => {
    const targetCourseId = Number(id); // التأكد من أنه رقم
    // التحقق من الشروط الأساسية
    if (!targetCourseId || !isEnrolled.value || !profile.value?.id || enrollLoading.value) return;
    // طلب تأكيد من المستخدم قبل الحذف
    if (!confirm('هل أنت متأكد من إلغاء الانتساب لهذه الدورة؟ سيتم حذف تقدمك المحفوظ المتعلق بهذه الدورة.')) return;
    enrollLoading.value = true; // تفعيل حالة التحميل
    try {
      // حذف سجل الانتساب المطابق للمستخدم والدورة
      const { error: unenrollError } = await supabase
        .from('course_enrollments')
        .delete()
        .match({ user_id: profile.value.id, course_id: targetCourseId }); // شرط الحذف الدقيق
      if (unenrollError) throw unenrollError; // رمي الخطأ إذا حدث
      await refresh(); // إعادة جلب جميع بيانات الصفحة لتحديث الواجهة
      console.log('Unenrollment successful!');
      // TODO: استبدال alert بنظام إشعارات أفضل (toast)
      // alert('تم إلغاء الانتساب.');
    } catch (err:any) {
        console.error("Unenrollment error:", err);
        // TODO: إظهار رسالة خطأ للمستخدم
        // alert(`فشل إلغاء الانتساب: ${err.message}`);
    } finally {
        enrollLoading.value = false; // إلغاء تفعيل حالة التحميل دائمًا
    }
};

// معالج حدث النقر على زر "استئناف التعلم"
const navigateToLastAccessed = () => {
     const targetCourseId = courseId.value; // استخدام المعرف المحسوب
    if (isNaN(targetCourseId) || !isEnrolled.value) return; // التحقق من الصلاحية والانتساب

    // الحصول على معرف آخر درس تم الوصول إليه من بيانات الانتساب
    const lastLessonId = enrollment.value?.last_accessed_lesson_id;
    // الحصول على قائمة الدروس المرتبة
    const lessons = courseLessonsData.value;
    // الحصول على معرف أول درس في القائمة كاحتياط
    const firstLessonId = lessons.length > 0 ? lessons[0]?.id : undefined;

    // تحديد الدرس المستهدف: إما آخر درس تم الوصول إليه (إذا كان موجودًا وصالحًا) أو أول درس
    const targetLessonId = lastLessonId && lessons.some(l => l.id === lastLessonId)
                           ? lastLessonId
                           : firstLessonId;

    // الانتقال إلى صفحة الدرس المستهدف إذا تم تحديده
    if (targetLessonId) {
        navigateTo(lessonLink(targetLessonId)); // استخدام الدالة المساعدة لإنشاء الرابط
    } else {
        // إذا لم يتم العثور على أي دروس
        console.warn("No lessons found to navigate to for last accessed/first lesson.");
        // TODO: إظهار إشعار للمستخدم
        // alert('لا توجد دروس في هذه الدورة بعد.');
    }
};

// معالج حدث النقر على زر اختبار (لأي مستوى)
const goToQuiz = (quizId: number | bigint | undefined | null) => {
    if (!quizId) return; // التأكد من وجود معرف للاختبار
    // الانتقال إلى صفحة الاختبار باستخدام المعرف
    navigateTo(`/quizzes/${String(quizId)}`);
};

 // --- تحديث معلومات الرأس (Meta Tags / Head) ---
 // يراقب تغير بيانات الدورة وحالة التحميل والخطأ لتحديث عنوان الصفحة ووصفها ديناميكيًا
 watch([course, pending, error], ([newCourse, loadingState, errorState]) => {
     let pageTitle = 'تفاصيل الدورة'; // العنوان الافتراضي
     let description = 'تصفح محتوى الدورة والدروس المتاحة.'; // الوصف الافتراضي

     // تحديد العنوان والوصف بناءً على الحالة
     if (loadingState) {
         pageTitle = 'جارٍ تحميل الدورة...';
         description = 'يتم الآن تحميل تفاصيل الدورة المطلوبة.';
     } else if (errorState && errorState.statusCode === 404) { // خطأ 404 (غير موجود)
         pageTitle = 'الدورة غير متاحة';
         description = 'لم نتمكن من العثور على الدورة المطلوبة أو أنها غير نشطة حالياً.';
     } else if (errorState) { // أي خطأ آخر
         pageTitle = 'خطأ في تحميل الدورة';
         description = `حدث خطأ أثناء تحميل بيانات الدورة: ${errorState.message}`;
     } else if (newCourse) { // في حالة النجاح ووجود بيانات الدورة
         pageTitle = `دورة: ${newCourse.title}`; // استخدام عنوان الدورة
         // استخدام وصف الدورة (أو جزء منه) أو وصف افتراضي
         description = newCourse.description?.substring(0, 160) || `تفاصيل ومحتوى دورة "${newCourse.title}".`;
     }

     // استخدام useHead لتحديث معلومات الرأس
     useHead({
         title: pageTitle, // تعيين عنوان الصفحة
         meta: [
            { name: 'description', content: description }, // تعيين وصف الصفحة
            // إضافة علامات Open Graph لتحسين المشاركة على وسائل التواصل الاجتماعي (اختياري)
             { property: 'og:title', content: pageTitle },
             { property: 'og:description', content: description },
             { property: 'og:type', content: 'website' },
             // يمكنك إضافة og:image هنا إذا كان لديك رابط صورة الدورة
             // { property: 'og:image', content: getCourseImageUrl(newCourse?.image_url ?? null) },
         ]
     });
 }, { immediate: true }); // immediate: true لتطبيق التحديث فورًا عند تحميل المكون

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