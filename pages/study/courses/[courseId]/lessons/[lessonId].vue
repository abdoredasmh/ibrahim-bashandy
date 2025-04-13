<template>
  <div class="container mx-auto px-4 py-8">

    <!-- 1. Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل بيانات الدرس...</p>
    </div>

    <!-- 2. Error State -->
    <!-- يعرض رسالة خطأ واضحة في حالة فشل useAsyncData أو عدم العثور على الدرس/الدورة -->
    <div v-else-if="error || !lesson" class="text-center py-20 max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
        <!-- يستخدم رسالة الخطأ من useAsyncData أو رسالة عامة -->
        {{ error?.data?.statusMessage || error?.message || 'خطأ في الوصول للدرس' }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        لم نتمكن من العثور على الدرس المطلوب ضمن هذه الدورة، أو أن الدورة غير نشطة، أو أنك لا تملك صلاحية الوصول إليه. يرجى التأكد من الرابط أو العودة للدورة.
      </p>
      <NuxtLink
        :to="courseIdParam ? `/study/courses/${courseIdParam}` : '/study'"
        class="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" /></svg>
        <span>العودة للدورة</span>
      </NuxtLink>
    </div>

    <!-- 3. Lesson Details Display (Render only if fetch succeeded and lesson exists) -->
    <div v-else class="lesson-details max-w-5xl mx-auto space-y-6">

      <!-- Course Context Header -->
      <div v-if="courseInfo" class="mb-4 text-sm text-center md:text-right">
        <NuxtLink :to="`/study/courses/${courseInfo.id}`" class="text-gray-600 dark:text-gray-400 hover:text-olive-green transition-colors duration-200">
          دورة: {{ courseInfo.title }}
        </NuxtLink>
      </div>

      <!-- Lesson Title -->
      <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark text-center sm:text-right">
        <!-- استخدام optional chaining للأمان -->
        {{ lesson.title || 'درس بدون عنوان' }}
      </h1>

      <!-- Video Section with Integrated Navigation -->
      <div class="video-section flex items-center gap-2 sm:gap-4">
        <!-- Previous Lesson Button -->
        <div class="flex-shrink-0">
          <NuxtLink v-if="previousLesson && courseIdParam" :to="`/study/courses/${courseIdParam}/lessons/${previousLesson.id}`" class="nav-button" :title="`الدرس السابق: ${previousLesson.title}`" aria-label="الدرس السابق">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="nav-icon" aria-hidden="true"> <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" /></svg>
          </NuxtLink>
          <!-- Placeholder لضمان نفس التباعد حتى لو لم يوجد زر -->
          <div v-else class="nav-placeholder" aria-hidden="true"></div>
        </div>

        <!-- Video Player Container -->
        <div class="flex-grow min-w-0">
          <!-- ** نقطة مهمة للفيديو ** -->
          <!-- يتم عرض iframe فقط إذا تم استخلاص youtubeVideoId بنجاح من lesson.youtube_url -->
          <div v-if="youtubeVideoId" class="relative w-full rounded-lg overflow-hidden shadow-lg bg-black aspect-video">
            <iframe
              :src="`https://www.youtube.com/embed/${youtubeVideoId}`"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
              class="absolute inset-0 w-full h-full"
              title="مشغل فيديو الدرس"
              aria-label="مشغل فيديو الدرس"
            ></iframe>
          </div>
          <!-- Fallback 1: إذا كان lesson.youtube_url موجوداً لكن لم نستطع استخلاص ID (رابط غير صالح) -->
          <div v-else-if="lesson.youtube_url" class="video-error-box p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-md">
            <p class="font-semibold">رابط يوتيوب غير صالح أو غير متوفر.</p>
            <p class="mt-1 text-sm">الرجاء التأكد من أن الرابط في قاعدة البيانات هو رابط يوتيوب صحيح (مثل youtube.com/watch?v=... أو youtu.be/... أو youtube.com/embed/... أو youtube.com/shorts/...).</p>
            <p class="mt-1 text-sm">الرابط المسجل حالياً:</p>
            <code class="block break-all mt-1 text-xs bg-yellow-200 dark:bg-yellow-800 px-1 rounded">{{ lesson.youtube_url }}</code>
          </div>
          <!-- Fallback 2: إذا كان lesson.youtube_url فارغاً أو null -->
          <div v-else class="video-error-box p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-md">
            <p>لا يوجد رابط فيديو متاح لهذا الدرس.</p>
          </div>
        </div>

        <!-- Next Lesson Button -->
        <div class="flex-shrink-0">
          <NuxtLink v-if="nextLesson && courseIdParam" :to="`/study/courses/${courseIdParam}/lessons/${nextLesson.id}`" class="nav-button" :title="`الدرس التالي: ${nextLesson.title}`" aria-label="الدرس التالي">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="nav-icon" aria-hidden="true"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>
          </NuxtLink>
          <!-- Placeholder -->
          <div v-else class="nav-placeholder" aria-hidden="true"></div>
        </div>
      </div>

      <!-- Mark as Complete / Completed Status / Enroll Prompt -->
      <!-- *** استخدم ClientOnly لأن هذا الجزء يعتمد على حالة المستخدم التي قد تختلف بين السيرفر والعميل *** -->
      <ClientOnly>
        <div class="text-center mt-6">
          <!-- Case 1: Logged in AND Enrolled -->
          <div v-if="isLoggedIn && isEnrolledInCourse">
            <!-- Button to mark complete -->
            <button v-if="!isLessonCompleted" @click="markLessonComplete" :disabled="completeLoading" class="button-complete">
              <span v-if="completeLoading">
                <LoadingSpinner class="w-5 h-5 inline me-2 animate-spin" aria-hidden="true" />
                جاري التحديث...
              </span>
              <span v-else class="inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd" /></svg>
                تمييز الدرس كمكتمل
              </span>
            </button>
            <!-- Display completed status -->
            <div v-else class="inline-flex items-center px-4 py-2 border border-green-300 dark:border-green-700 rounded-md text-sm font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true"><path fill-rule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.48 4.774L6.52 10.91a.75.75 0 1 0-1.04 1.08l2.18 2.108a.75.75 0 0 0 1.076-.015l4.145-5.682Z" clip-rule="evenodd" /></svg>
              تم إكمال هذا الدرس
            </div>
            <!-- Error message for marking complete action -->
            <p v-if="completeError" class="text-xs text-red-500 dark:text-red-400 mt-2">{{ completeError }}</p>
          </div>
          <!-- Case 2: Logged in BUT NOT Enrolled -->
          <div v-else-if="isLoggedIn && !isEnrolledInCourse && courseIdParam" class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg max-w-md mx-auto">
            <p class="text-sm text-yellow-800 dark:text-yellow-200">يجب الانتساب للدورة أولاً لتتمكن من تتبع تقدمك ووضع علامة اكتمال على الدروس.</p>
            <button @click="handleEnroll(courseIdParam)" :disabled="enrollLoading" class="button-enroll mt-3">
              <span v-if="enrollLoading">
                <LoadingSpinner class="w-5 h-5 inline me-2 animate-spin" aria-hidden="true" />
                جاري الانتساب...
              </span>
              <span v-else>انتسب للدورة الآن</span>
            </button>
            <p v-if="enrollError" class="text-xs text-red-500 dark:text-red-400 mt-1">{{ enrollError }}</p>
          </div>
          <!-- Case 3: Not Logged In -->
          <div v-else-if="!isLoggedIn" class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg max-w-md mx-auto">
            <p class="text-sm text-blue-800 dark:text-blue-200 mb-3">سجل الدخول أو أنشئ حساباً لتتمكن من الانتساب لهذه الدورة وتتبع تقدمك.</p>
            <NuxtLink :to="`/login?redirect=${route.fullPath}`" class="button-login">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1" aria-hidden="true"><path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z" clip-rule="evenodd" /></svg>
              تسجيل الدخول / إنشاء حساب
            </NuxtLink>
          </div>
        </div>
        <template #fallback>
          <!-- Placeholder shown during SSR and before client hydration -->
          <div class="text-center mt-6 h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md max-w-xs mx-auto"></div>
        </template>
      </ClientOnly>

      <!-- Description Section -->
      <div class="description-section pt-6 border-t border-gray-200 dark:border-gray-700" v-if="lesson.description">
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-beige-light mb-3">عن الدرس:</h2>
        <!-- ใช้ prose لتنسيق النص الطويل بشكل أفضل -->
        <div class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {{ lesson.description }}
        </div>
      </div>
      <div v-else class="description-section pt-6 border-t border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 italic">لا يوجد وصف متاح لهذا الدرس.</div>

      <!-- Downloads & Linked Books Section -->
      <!-- تأكد من وجود كتب مرتبطة قبل عرض القسم -->
      <div v-if="linkedBooks && linkedBooks.length > 0" class="downloads-section p-5 bg-beige-light dark:bg-cream-gray rounded-lg shadow-sm border border-cream-gray dark:border-gray-700">
        <h3 class="text-lg font-semibold text-brown-dark dark:text-brown-dark mb-4">ملفات وكتب مرتبطة:</h3>
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <!-- Iteration over linked books -->
          <div v-for="book in linkedBooks" :key="book.id">
            <!-- Button to open PDF if path exists -->
            <button v-if="book.storage_path" @click="openPdfModal(book.storage_path, book.title)" class="button-secondary inline-flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" aria-hidden="true"><path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 8.75a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M9 3.5a.5.5 0 0 0-.5.5v2.75A1.75 1.75 0 0 0 10.25 8.5h2.75a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-3ZM11 5.75v1.75a.25.25 0 0 0 .25.25h1.75a.25.25 0 0 0 .25-.25V5.75H11Z" clip-rule="evenodd" /></svg>
              <span>عرض: {{ book.title }} <span class="text-xs opacity-75">({{ getBookType(book) }})</span></span>
            </button>
            <!-- Fallback if no file attached -->
            <span v-else class="inline-flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 italic px-4 py-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 opacity-50" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clip-rule="evenodd" /></svg>
              <span>{{ book.title }} (لا يوجد ملف مرفق)</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Comments Section -->
      <!-- *** استخدم ClientOnly لأن قسم التعليقات تفاعلي ويعتمد على المستخدم *** -->
      <ClientOnly>
        <!-- استخدم v-if للتأكد من وجود lesson.id قبل تمريره للمكون -->
        <CommentSection v-if="lesson?.id" :lesson-id="lesson.id" class="pt-6 border-t border-gray-200 dark:border-gray-700"/>
        <template #fallback>
          <!-- Placeholder for comments section while loading on client -->
          <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
            <div class="h-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>
        </template>
      </ClientOnly>

    </div>

    <!-- PDF Viewer Modal -->
    <!-- *** استخدم ClientOnly لأن المودال يتفاعل مع المستخدم ويحمل مكون ثقيل (عارض PDF) -->
    <ClientOnly>
      <LazyPdfViewerModal
        :show="showPdfModal"
        :storage-path="selectedPdfPath"
        :book-title="selectedBookTitle"
        @close="closePdfModal"
      />
       <template #fallback>
         <!-- عادة لا نحتاج fallback مرئي للمودال المخفي -->
         <div></div>
      </template>
    </ClientOnly>

  </div>
</template>

<script setup lang="ts">
// --- Imports ---
import { ref, computed, watch, shallowRef, defineAsyncComponent } from 'vue';
import { useRoute, useSupabaseClient, useAsyncData, useHead, showError, navigateTo, createError } from '#imports';
import type { Database, Tables, Enums } from '~/types/database.types'; // تأكد من صحة المسار
import { useUserStore } from '~/stores/user'; // تأكد من صحة المسار
import { storeToRefs } from 'pinia';
// import { useToast } from 'vue-toastification'; // يمكنك تفعيله لإظهار رسائل للمستخدم

// --- Component Imports ---
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // تأكد من صحة المسار
import CommentSection from '~/components/CommentSection.vue'; // تأكد من صحة المسار
// Lazy load modal component for better performance
const LazyPdfViewerModal = defineAsyncComponent(() => import('~/components/PdfViewerModal.vue')); // تأكد من صحة المسار

// --- Composables & Store ---
const route = useRoute();
const supabase = useSupabaseClient<Database>();
const userStore = useUserStore();
const { profile, isLoggedIn } = storeToRefs(userStore);
// const toast = useToast(); // يمكنك تفعيله لإظهار رسائل للمستخدم

console.log(`--- LESSON PAGE [${route.params.lessonId}] SETUP STARTED ---`);

// --- Types ---
type Lesson = Tables<'lessons'>;
type Book = Tables<'books'>;
type NavLessonInfo = Pick<Tables<'lessons'>, 'id' | 'title'> | null;
type CourseInfo = Pick<Tables<'study_courses'>, 'id' | 'title'> | null;
type LessonCompletion = Pick<Tables<'lesson_completions'>, 'lesson_id'>;
type CourseEnrollment = Tables<'course_enrollments'>;

// --- Route Params with Validation ---
// Computed properties to safely get and validate route parameters
const courseIdParam = computed<number | null>(() => {
    const rawParam = route.params.courseId as string;
    if (!rawParam) {
        console.error("Lesson Page: Invalid course ID parameter: Parameter is missing.");
        showError({ statusCode: 400, statusMessage: 'معرف الدورة مفقود من الرابط.', fatal: true });
        return null;
    }
    const id = parseInt(rawParam, 10);
    if (isNaN(id) || id <= 0) {
        console.error("Lesson Page: Invalid course ID parameter:", rawParam);
        showError({ statusCode: 400, statusMessage: `معرف الدورة غير صالح: "${rawParam}"`, fatal: true });
        return null;
    }
    return id;
});
const lessonIdParam = computed<number | null>(() => {
    const rawParam = route.params.lessonId as string;
     if (!rawParam) {
        console.error("Lesson Page: Invalid lesson ID parameter: Parameter is missing.");
        showError({ statusCode: 400, statusMessage: 'معرف الدرس مفقود من الرابط.', fatal: true });
        return null;
    }
    const id = parseInt(rawParam, 10);
    if (isNaN(id) || id <= 0) {
        console.error("Lesson Page: Invalid lesson ID parameter:", rawParam);
        showError({ statusCode: 400, statusMessage: `معرف الدرس غير صالح: "${rawParam}"`, fatal: true });
        return null;
    }
    return id;
});

// --- State ---
// Use shallowRef for potentially large objects/arrays fetched from DB for performance
const lesson = shallowRef<Lesson | null>(null);
const linkedBooks = shallowRef<Book[]>([]);
const previousLesson = shallowRef<NavLessonInfo>(null);
const nextLesson = shallowRef<NavLessonInfo>(null);
const courseInfo = shallowRef<CourseInfo>(null);
const lessonCompletion = shallowRef<LessonCompletion | null>(null); // User's completion status for this lesson
const enrollment = shallowRef<CourseEnrollment | null>(null); // User's enrollment status for the course

// State for UI actions
const completeLoading = ref(false); // Loading state for marking lesson complete
const completeError = ref<string | null>(null); // Error message for marking lesson complete
const enrollLoading = ref(false); // Loading state for the enroll button on this page
const enrollError = ref<string | null>(null); // Error message for enrolling

// State for PDF Modal
const showPdfModal = ref(false);
const selectedPdfPath = ref<string | null>(null);
const selectedBookTitle = ref<string | null>(null);

// --- Initial Validation ---
// If computed params returned null, showError was already called and execution might halt.
if (courseIdParam.value === null || lessonIdParam.value === null) {
     console.error("Lesson Page Setup: Halting due to invalid route parameters detected earlier.");
     // No need to call showError again if it was called in computed and fatal: true was set.
}

// --- Data Fetching with useAsyncData ---
// Fetches all necessary data for the lesson page.
// Key ensures data is refetched if course, lesson, or user changes.
const { data, pending, error, refresh } = await useAsyncData(
  `lessonData-${courseIdParam.value}-${lessonIdParam.value}-${profile.value?.id ?? 'guest'}`,
  async () => {
    // Re-validate params inside fetcher as computed values might change between setup and fetch execution
    const currentLessonId = lessonIdParam.value;
    const currentCourseId = courseIdParam.value;
    const currentUserId = profile.value?.id;

    // Guard against invalid IDs at the time of fetching
    if (currentCourseId === null || currentLessonId === null) {
      console.error("Fetcher Error: Invalid course or lesson ID at fetch time.");
      // Throw an error that useAsyncData will catch and put into the `error` ref
      throw createError({ statusCode: 400, statusMessage: 'المعرفات المطلوبة غير صالحة لجلب البيانات.', fatal: true });
    }

    console.log(`--- Fetching lesson data for Course ${currentCourseId}, Lesson ${currentLessonId}, User ${currentUserId || 'Guest'} ---`);

    try {
      // 1. Fetch Primary Lesson Data (Lesson + Course Info) - CRITICAL
      // Ensures the lesson exists, belongs to the specified course, and the course is active.
      const { data: lessonCourseData, error: lessonCourseError } = await supabase
        .from('lessons')
        .select(`
            *,
            course:study_courses!inner (id, title, is_active)
        `)
        .eq('id', currentLessonId)
        .eq('course_id', currentCourseId)
        .eq('course.is_active', true) // Essential check: only load lessons from active courses
        .maybeSingle(); // Use maybeSingle as the lesson might not exist or course might be inactive

      // Handle errors during the primary fetch
      if (lessonCourseError) {
        console.error("DB Error fetching lesson/course:", lessonCourseError);
        throw createError({ statusCode: 500, statusMessage: `خطأ في جلب بيانات الدرس الرئيسية: ${lessonCourseError.message}`, fatal: true });
      }
      // Handle case where lesson is not found or course is inactive/doesn't match
      if (!lessonCourseData) {
        console.warn(`Lesson ${currentLessonId} not found in active course ${currentCourseId}, or course inactive.`);
        throw createError({ statusCode: 404, statusMessage: 'الدرس المطلوب غير موجود أو لا ينتمي لدورة نشطة.', fatal: true });
      }

      // Successfully fetched primary data
      const fetchedLesson: Lesson = lessonCourseData;
      const fetchedCourseInfo: CourseInfo = lessonCourseData.course as CourseInfo;
      const currentOrder: number | null = fetchedLesson.lesson_order; // Needed for prev/next logic

      // 2. Fetch Secondary Data in Parallel for better performance
      // These are less critical than the main lesson data.
      const fetchPromises = [
        // Linked books/files
        supabase.from('books').select('*').eq('linked_lesson_id', currentLessonId),
        // Previous lesson (if order exists)
        currentOrder !== null
           ? supabase.from('lessons').select('id, title').eq('course_id', currentCourseId).lt('lesson_order', currentOrder).order('lesson_order', { ascending: false }).limit(1).maybeSingle()
           : Promise.resolve({ data: null, error: null }), // Resolve immediately if no order
        // Next lesson (if order exists)
        currentOrder !== null
           ? supabase.from('lessons').select('id, title').eq('course_id', currentCourseId).gt('lesson_order', currentOrder).order('lesson_order', { ascending: true }).limit(1).maybeSingle()
           : Promise.resolve({ data: null, error: null }), // Resolve immediately if no order
        // User's completion status for THIS lesson (only if logged in)
        isLoggedIn.value && currentUserId
            ? supabase.from('lesson_completions').select('lesson_id').eq('user_id', currentUserId).eq('lesson_id', currentLessonId).maybeSingle()
            : Promise.resolve({ data: null, error: null }), // Resolve immediately if not logged in
        // User's enrollment status for THIS course (only if logged in)
        isLoggedIn.value && currentUserId
            ? supabase.from('course_enrollments').select('*').eq('user_id', currentUserId).eq('course_id', currentCourseId).maybeSingle()
            : Promise.resolve({ data: null, error: null }) // Resolve immediately if not logged in
      ];

      // Use Promise.allSettled to wait for all promises, even if some fail
      const results = await Promise.allSettled(fetchPromises);

      // Helper function to safely process results from allSettled
      const processResult = <T>(index: number, name: string, defaultValue: T): T => {
        const result = results[index];
        if (result.status === 'fulfilled') {
            // Check for Supabase-specific error within the successful promise
            if (result.value.error) {
                 console.error(`Supabase Error fetching ${name}:`, result.value.error.message);
                 // Depending on severity, you might throw or just return default
                 return defaultValue; // Return default on non-critical fetch errors
            }
            return result.value.data ?? defaultValue; // Return data or default value if data is null/undefined
        } else {
            // Promise itself was rejected
            console.error(`Failed fetching ${name} (Promise rejected):`, result.reason);
            return defaultValue; // Return default on promise rejection
        }
      };

      // Process the results using the helper
      const fetchedBooks = processResult<Book[]>(0, 'linked books', []);
      const fetchedPreviousLesson = processResult<NavLessonInfo>(1, 'previous lesson', null);
      const fetchedNextLesson = processResult<NavLessonInfo>(2, 'next lesson', null);
      const fetchedCompletion = processResult<LessonCompletion | null>(3, 'completion status', null);
      const fetchedEnrollment = processResult<CourseEnrollment | null>(4, 'enrollment status', null);

      // 3. Update Last Accessed Lesson (Fire-and-forget, non-critical)
      // Update only if the user is enrolled in this course
      if (fetchedEnrollment?.id && fetchedLesson.id) {
          console.log(`Attempting to update last accessed lesson for enrollment ${fetchedEnrollment.id} to lesson ${fetchedLesson.id}`);
          // No need to await this, it can happen in the background
          supabase
            .from('course_enrollments')
            .update({ last_accessed_lesson_id: fetchedLesson.id, updated_at: new Date().toISOString() }) // Also update timestamp
            .eq('id', fetchedEnrollment.id)
            .then(({ error: updateError }) => {
                if (updateError) console.error('Failed to update last_accessed_lesson_id:', updateError.message);
                else console.log(`Successfully updated last_accessed_lesson_id.`);
            });
      } else if (isLoggedIn.value && fetchedLesson.id) {
           console.log('User is logged in but not enrolled in this course, skipping last_accessed_lesson update.');
      }

      console.log('--- Lesson data fetch successful ---');
      // 4. Return the combined data structure for useAsyncData
      return {
          lesson: fetchedLesson,
          linkedBooks: fetchedBooks,
          previousLesson: fetchedPreviousLesson,
          nextLesson: fetchedNextLesson,
          courseInfo: fetchedCourseInfo,
          lessonCompletion: fetchedCompletion,
          enrollment: fetchedEnrollment
      };

    } catch (err: any) {
        // Catch errors from DB calls or createError calls within the try block
      console.error('!!! CRITICAL ERROR in useAsyncData lesson fetch !!!:', err);
      // Ensure the error is propagated correctly for useAsyncData's `error` ref
      if (err.statusCode && err.fatal) {
          throw err; // Re-throw the H3Error created by createError or showError
      }
      // Wrap unexpected errors in a fatal H3Error
      throw createError({
        statusCode: err.statusCode || 500, // Use existing status code if available
        statusMessage: `حدث خطأ غير متوقع أثناء تحميل بيانات الدرس: ${err.message || 'خطأ غير معروف'}`,
        fatal: true // Make it fatal to ensure the error page is shown
      });
    }
  }, {
    // Default value structure should match the expected return type of the fetcher
    default: () => ({
        lesson: null, linkedBooks: [], previousLesson: null, nextLesson: null,
        courseInfo: null, lessonCompletion: null, enrollment: null
    }),
    // Watch for changes in user ID, lesson ID, or course ID to trigger a refetch
    watch: [() => profile.value?.id, () => route.params.lessonId, () => route.params.courseId]
  }
);

// --- Update Local State when Async Data Changes ---
// Watch the `data` ref returned by `useAsyncData` and update the local `shallowRef`s.
// This ensures the template reacts to data updates (initial load, refresh, route change).
 watch(data, (newData) => {
    console.log("Lesson page useAsyncData watcher triggered. New data received:", !!newData);
    if (newData) {
        // Update local state with the fetched data
        lesson.value = newData.lesson;
        linkedBooks.value = newData.linkedBooks;
        previousLesson.value = newData.previousLesson;
        nextLesson.value = newData.nextLesson;
        courseInfo.value = newData.courseInfo;
        lessonCompletion.value = newData.lessonCompletion;
        enrollment.value = newData.enrollment;
    } else if (!pending.value && !error.value) {
        // Reset state only if data is null, not pending, and no error occurred
        // This handles cases like navigating away where data might become null briefly
        lesson.value = null;
        linkedBooks.value = [];
        previousLesson.value = null;
        nextLesson.value = null;
        courseInfo.value = null;
        lessonCompletion.value = null;
        enrollment.value = null;
    }
 }, { immediate: true }); // `immediate: true` ensures the watcher runs once immediately on component mount

// --- Computed Properties ---

// Check if the user is enrolled in the current course
const isEnrolledInCourse = computed(() => !!enrollment.value);

// Check if the user has marked the current lesson as completed
const isLessonCompleted = computed(() => !!lessonCompletion.value);

// Extracts YouTube Video ID from the lesson's URL.
// Handles various common YouTube URL formats. Returns null if URL is missing or invalid.
const youtubeVideoId = computed<string | null>(() => {
   const url = lesson.value?.youtube_url;
   if (!url) {
      // console.log("No YouTube URL provided for this lesson.");
      return null;
   }
   try {
     // Regex to capture video ID from various YouTube URL formats
     // Covers: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID, youtube.com/v/ID
     // Also handles URLs with additional parameters (&list=..., &t=...)
     const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/;
     const match = url.match(regex);
     if (match && match[1]) {
       // console.log(`Extracted YouTube ID: ${match[1]} from URL: ${url}`);
       return match[1];
     } else {
       console.warn(`Could not extract YouTube ID from URL: ${url}`);
       return null;
     }
   } catch (e) {
     console.error("Error parsing YouTube URL:", url, e);
     return null; // Return null on any parsing error
   }
});

// --- Actions ---

// Action to mark the current lesson as complete for the logged-in user
async function markLessonComplete() {
     // Prevent action if not logged in, no lesson, already completed, or already loading
     if (!isLoggedIn.value || !profile.value?.id || !lesson.value?.id || isLessonCompleted.value || completeLoading.value) return;

     completeLoading.value = true;
     completeError.value = null; // Reset previous error

     console.log(`Attempting to mark lesson ${lesson.value.id} as complete for user ${profile.value.id}`);

     try {
         const { data: newCompletion, error: insertError } = await supabase
             .from('lesson_completions')
             .insert({
                 user_id: profile.value.id,
                 lesson_id: lesson.value.id
                 // completed_at will default to now() in the database
             })
             .select('lesson_id') // Select something to confirm insert
             .single(); // Expecting a single row back

         if (insertError) {
            // Handle potential race condition or duplicate entry (e.g., user clicks twice fast)
            if (insertError.code === '23505') { // PostgreSQL unique violation code
               console.warn('Lesson already marked complete in DB (unique constraint violation), syncing local state.');
               // Ensure local state reflects completion even if insert failed due to existing record
               if (!lessonCompletion.value) {
                   lessonCompletion.value = { lesson_id: lesson.value.id };
               }
               // Optionally: show a success message anyway or just log
               // toast?.success('تم تحديث حالة الدرس بنجاح.');
            }
            else {
                // Throw other database errors
                throw insertError;
            }
         }
         else if (newCompletion) {
            // Update local state on successful insert
            lessonCompletion.value = newCompletion;
            console.log("Lesson successfully marked complete!");
             // Optionally: Show success message
             // toast?.success('تم تمييز الدرس كمكتمل بنجاح!');
         }
     } catch (err: any) {
         console.error("Error marking lesson complete:", err);
         completeError.value = `فشل تحديث الحالة: ${err.message || 'حدث خطأ غير متوقع.'}`;
         // Optionally: Show error toast
         // toast?.error(completeError.value);
     }
     finally {
         completeLoading.value = false; // Ensure loading state is reset
     }
}

// Action to enroll the user in the current course (used by the button shown when logged in but not enrolled)
async function handleEnroll(id: number | null) {
     // Prevent action if ID is invalid, not logged in, already enrolled, or already loading
     if (id === null || !isLoggedIn.value || !profile.value?.id || isEnrolledInCourse.value || enrollLoading.value) return;

     enrollLoading.value = true;
     enrollError.value = null; // Reset previous error

     console.log(`Attempting to enroll user ${profile.value.id} in course ${id}`);

     try {
       const { data: newEnrollment, error: enrollSupabaseError } = await supabase
         .from('course_enrollments')
         .insert({
             user_id: profile.value.id,
             course_id: id
             // enrolled_at will default to now()
         })
         .select('*') // Select the new enrollment record
         .single();

       if (enrollSupabaseError) {
           // Handle potential duplicate enrollment attempts
           if (enrollSupabaseError.code === '23505') {
                console.warn("Enrollment conflict detected (unique constraint violation). User might already be enrolled. Refreshing data.");
                // toast?.info('أنت منتسب لهذه الدورة بالفعل. جاري تحديث الصفحة...');
                await refresh(); // Refresh data to get the existing enrollment
           } else {
               // Throw other database errors
               throw enrollSupabaseError;
           }
       } else if (newEnrollment) {
           // Update local state immediately
           enrollment.value = newEnrollment;
           console.log("Enrollment successful!");
           // Show success message
           alert('تم الانتساب بنجاح!'); // Simple alert, replace with toast if preferred
           // toast?.success('تم الانتساب للدورة بنجاح!');
           // Refresh might be needed if other parts of the page depend on enrollment details fetched initially
           // await refresh(); // Consider if a full refresh is necessary after enrollment
       }
     } catch (err:any) {
         console.error("Enrollment error on lesson page:", err);
         enrollError.value = `فشل الانتساب: ${err.message || 'حدث خطأ غير متوقع.'}`;
         // Show error message
         alert(enrollError.value); // Simple alert, replace with toast if preferred
         // toast?.error(enrollError.value);
     }
     finally {
         enrollLoading.value = false; // Ensure loading state is reset
     }
}

// --- PDF Modal Functions ---

// Opens the PDF viewer modal with the specified file path and title
function openPdfModal(path: string | null | undefined, title: string | null | undefined) {
   if (path) {
     selectedPdfPath.value = path;
     selectedBookTitle.value = title || 'ملف مرتبط'; // Default title if none provided
     showPdfModal.value = true;
     console.log(`Opening PDF modal for path: ${path}`);
   } else {
     console.warn("Attempted to open PDF modal with no path for book:", title);
     // Optionally show an error/info message to the user
     // toast?.warning(`لا يوجد ملف PDF مرفق لـ: ${title || 'الكتاب المحدد'}`);
   }
}

// Closes the PDF viewer modal and resets its state
function closePdfModal() {
  showPdfModal.value = false;
  selectedPdfPath.value = null;
  selectedBookTitle.value = null;
  console.log("PDF modal closed.");
}

// --- Utility Functions ---

// Determines the display type string based on book flags
function getBookType(book: Book): string {
     // Prioritize more specific types first
     if (book?.is_research && book?.is_transcript) return 'بحث وتفريغ'; // Handle combined case if possible
     if (book?.is_research) return 'بحث';
     if (book?.is_transcript) return 'تفريغ';
     // Default to 'كتاب' if no specific flag is set or if it's just a book
     return 'كتاب';
}

// --- SEO Meta Tags ---
// Set page title and meta description dynamically based on lesson data, loading, or error state.
 watch([lesson, courseInfo, pending, error], ([newLesson, newCourse, loadingState, errorState]) => {
    let pageTitle = 'تفاصيل الدرس';
    let description = 'عرض تفاصيل الدرس والمحتوى المرتبط به ضمن دورات الشيخ.';

    if (loadingState) {
        pageTitle = 'جارٍ تحميل الدرس...';
        description = 'يتم الآن تحميل بيانات الدرس.';
    } else if (errorState || !newLesson) {
        pageTitle = 'الدرس غير متاح';
        description = errorState?.data?.statusMessage || errorState?.message || 'لم يتم العثور على الدرس المطلوب أو حدث خطأ.';
    } else {
        // Construct title and description from available data
        const lessonTitle = newLesson.title || 'درس بدون عنوان';
        const courseTitle = newCourse?.title;
        pageTitle = courseTitle ? `${lessonTitle} - ${courseTitle}` : lessonTitle;

        // Generate a concise description, using lesson description if available
        const lessonDesc = newLesson.description;
        if (lessonDesc) {
            description = lessonDesc.substring(0, 160).trim() + (lessonDesc.length > 160 ? '...' : '');
        } else {
            description = `شاهد درس "${lessonTitle}"${courseTitle ? ` ضمن دورة "${courseTitle}"` : ''}.`;
        }
    }

     // Use Nuxt's useHead composable to update meta tags
     useHead({
         title: pageTitle,
         meta: [
            { name: 'description', content: description },
            // Open Graph / Facebook
            { property: 'og:title', content: pageTitle },
            { property: 'og:description', content: description },
            { property: 'og:type', content: 'video.other' }, // More specific than 'website'
            { property: 'og:url', content: route.fullPath }, // Current page URL
            // { property: 'og:image', content: '...' }, // TODO: Add image if available (e.g., course thumbnail or default)
            // Twitter Card
            { name: 'twitter:card', content: 'summary_large_image' }, // Or 'summary' if no large image
            { name: 'twitter:title', content: pageTitle },
            { name: 'twitter:description', content: description },
            // { name: 'twitter:image', content: '...' }, // TODO: Add image if available
         ]
     });
 }, { immediate: true }); // Run immediately to set initial tags

</script>

<style scoped>
/* Reusing styles from the original component */
.nav-button {
  @apply p-2 sm:p-3 rounded-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900;
}
.nav-icon {
  @apply w-5 h-5 sm:w-6 sm:h-6;
}
.nav-placeholder {
  /* Ensure placeholder takes same space as button */
  @apply p-2 sm:p-3 w-[36px] h-[36px] sm:w-[44px] sm:h-[44px];
}
.video-error-box {
  @apply p-4 border rounded-md text-sm;
}
.button-complete {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}
.button-enroll {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}
.button-login {
  @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out;
}
.button-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900 transition-colors duration-150 ease-in-out;
}

/* Improve prose readability */
.prose :where(p):not(:where([class~="not-prose"] *)) {
  margin-top: 0.75em;
  margin-bottom: 0.75em;
  line-height: 1.7; /* Adjust line height for better readability */
}

/* Style for code blocks within text */
code {
  word-break: break-all; /* Prevent long URLs from breaking layout */
  font-size: 0.875em;
  background-color: rgba(0,0,0,0.05);
  padding: 0.1em 0.3em;
  border-radius: 0.25rem;
}
.dark code {
  background-color: rgba(255,255,255,0.1);
}

/* Ensure loading spinner size is consistent in buttons */
.button-complete .animate-spin,
.button-enroll .animate-spin {
  width: 1.25rem; /* Adjust size as needed */
  height: 1.25rem;
}

/* Ensure aspect ratio for video player */
.aspect-video {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
}
.aspect-video iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>