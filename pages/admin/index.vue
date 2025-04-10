<template>
  <div class="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
        📊 لوحة الإحصائيات
      </h1>
      <button
        @click="forceRefresh"
        :disabled="isLoading"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
      >
        <svg v-if="isLoading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0115.357 2m0 0H15" />
        </svg>
        {{ isLoading ? 'جاري التحديث...' : 'تحديث' }}
      </button>
    </div>

    <!-- حالة التحميل الأولية -->
    <div v-if="isLoading && !stats.totalUsers" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      <div v-for="n in 12" :key="`skel-${n}`" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow animate-pulse">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
    </div>

    <!-- حالة الخطأ -->
    <div v-else-if="error" class="text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-6 rounded-lg shadow border border-red-200 dark:border-red-800">
      <h3 class="text-lg font-semibold mb-2">حدث خطأ!</h3>
      <p class="mb-4">لم نتمكن من جلب بيانات لوحة الإحصائيات.</p>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">الخطأ: {{ error.message || 'غير معروف' }}</p>
      <button
        @click="forceRefresh"
        :disabled="isLoading"
        class="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center mx-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
           <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m-15.357-2a8.001 8.001 0 0115.357 2m0 0H15" />
        </svg>
        إعادة المحاولة
      </button>
    </div>

    <!-- عرض الإحصائيات -->
    <div v-else class="space-y-8">
      <!-- قسم المستخدمين والنشاط -->
      <section>
        <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700">
          المستخدمون والتفاعل
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AdminStatCard title="إجمالي المستخدمين" :value="stats.totalUsers" icon="users" link-to="/admin/users" :is-loading="isLoading" tooltip="إجمالي عدد المستخدمين المسجلين" />
          <AdminStatCard title="إجمالي التعليقات" :value="stats.totalComments" icon="comments" link-to="/admin/comments" :is-loading="isLoading" tooltip="إجمالي عدد التعليقات على الدروس"/>
          <AdminStatCard title="التسجيلات بالدورات" :value="stats.totalEnrollments" icon="graduation-cap" link-to="/admin/enrollments" :is-loading="isLoading" tooltip="إجمالي عدد مرات تسجيل المستخدمين في الدورات" />
          <AdminStatCard title="إكمالات الدروس" :value="stats.totalCompletions" icon="check-circle" link-to="/admin/completions" :is-loading="isLoading" tooltip="إجمالي عدد الدروس التي تم إكمالها بواسطة المستخدمين"/>
        </div>
      </section>

      <!-- قسم المحتوى -->
      <section>
        <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700">
          المحتوى التعليمي
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AdminStatCard title="إجمالي الكتب" :value="stats.totalBooks" icon="book" link-to="/admin/books" :is-loading="isLoading" tooltip="إجمالي عدد الكتب المتاحة"/>
          <AdminStatCard title="إجمالي الدروس" :value="stats.totalLessons" icon="video" link-to="/admin/lessons" :is-loading="isLoading" tooltip="إجمالي عدد الدروس المتاحة"/>
          <AdminStatCard title="إجمالي الدورات" :value="stats.totalCourses" icon="chalkboard-teacher" link-to="/admin/courses" :is-loading="isLoading" tooltip="إجمالي عدد الدورات التدريبية المتاحة"/>
          <AdminStatCard title="إجمالي الاختبارات" :value="stats.totalQuizzes" icon="question-circle" link-to="/admin/quizzes" :is-loading="isLoading" tooltip="إجمالي عدد الاختبارات المتاحة"/>
        </div>
      </section>

      <!-- قسم التفاعل والاستفسارات -->
      <section>
        <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700">
          الاستفسارات والتنبيهات
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          <AdminStatCard title="أسئلة للشيخ" :value="stats.totalQuestionsToSheikh" icon="question" link-to="/admin/questions-sheikh" :is-loading="isLoading" tooltip="إجمالي الأسئلة الموجهة للشيخ"/>
          <AdminStatCard
            title="أسئلة بانتظار الرد"
            :value="stats.unansweredQuestions"
            icon="clock"
            :warning="stats.unansweredQuestions !== null && stats.unansweredQuestions > 0"
            link-to="/admin/questions-sheikh?filter=unanswered"
            :is-loading="isLoading"
            tooltip="عدد الأسئلة الموجهة للشيخ ولم يتم الرد عليها بعد"
           />
          <AdminStatCard
            title="إشعارات غير مقروءة"
            :value="stats.unreadNotifications"
            icon="bell"
            :warning="stats.unreadNotifications !== null && stats.unreadNotifications > 0"
            link-to="/admin/notifications"
            :is-loading="isLoading"
            tooltip="عدد الإشعارات الهامة التي لم يتم الاطلاع عليها"
           />
          <AdminStatCard title="محاولات الاختبارات" :value="stats.totalQuizAttempts" icon="file-alt" link-to="/admin/quiz-attempts" :is-loading="isLoading" tooltip="إجمالي عدد المحاولات التي أجراها المستخدمون للاختبارات"/>
        </div>
      </section>

      <!-- قسم إحصائيات الموقع (اختياري) -->
      <section v-if="stats.totalLessonViews !== null || stats.totalBookDownloads !== null">
         <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-300 dark:border-gray-700">
           إحصائيات الموقع
         </h2>
         <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
           <AdminStatCard v-if="stats.totalLessonViews !== null" title="مشاهدات الدروس" :value="stats.totalLessonViews" icon="eye" :is-loading="isLoading" tooltip="إجمالي عدد مرات مشاهدة الدروس"/>
           <AdminStatCard v-if="stats.totalBookDownloads !== null" title="تحميلات الكتب" :value="stats.totalBookDownloads" icon="download" :is-loading="isLoading" tooltip="إجمالي عدد مرات تحميل الكتب"/>
           <!-- أضف المزيد حسب الحاجة -->
         </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSupabaseClient } from '#imports' // Nuxt 3 auto-import
import type { Database } from '~/types/database.types'; // Adjust path if needed
import type { PostgrestError } from '@supabase/supabase-js';
import AdminStatCard from '~/components/admin/AdminStatCard.vue'; // Adjust path if needed

// تحديد نوع الإحصائيات
interface DashboardStats {
  totalUsers: number | null;
  totalComments: number | null;
  totalEnrollments: number | null;
  totalCompletions: number | null;
  totalBooks: number | null;
  totalLessons: number | null;
  totalCourses: number | null;
  totalQuizzes: number | null;
  totalQuestionsToSheikh: number | null;
  unansweredQuestions: number | null;
  unreadNotifications: number | null;
  totalQuizAttempts: number | null;
  totalLessonViews: number | null;
  totalBookDownloads: number | null;
}

// Layout & Middleware
definePageMeta({
  layout: 'admin',
  middleware: 'admin' // Assuming 'admin' middleware handles auth
});

const supabase = useSupabaseClient<Database>();
const stats = ref<DashboardStats>({
  totalUsers: null,
  totalComments: null,
  totalEnrollments: null,
  totalCompletions: null,
  totalBooks: null,
  totalLessons: null,
  totalCourses: null,
  totalQuizzes: null,
  totalQuestionsToSheikh: null,
  unansweredQuestions: null,
  unreadNotifications: null,
  totalQuizAttempts: null,
  totalLessonViews: null,
  totalBookDownloads: null,
});
const isLoading = ref(true);
const error = ref<Error | PostgrestError | null>(null);
const lastFetched = ref<number | null>(null);
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 دقائق كاش

// دالة لجلب العد بشكل فعال وآمن
async function fetchCount(
    tableName: keyof Database['public']['Tables'],
    filter?: (query: any) => any
): Promise<number> {
  try {
    let query = supabase.from(tableName).select('*', { count: 'exact', head: true });
    if (filter) {
      query = filter(query);
    }
    const { count, error: countError } = await query;

    if (countError) {
      console.error(`Supabase count error for ${tableName}:`, countError.message);
      // لا ترمي الخطأ هنا، فقط أرجع قيمة تدل على الفشل ليتم التعامل معها في Promise.allSettled
      throw countError; // ارمِ الخطأ ليتم التقاطه بواسطة allSettled
    }
    return count ?? 0;
  } catch (err: any) {
    console.error(`Unexpected error fetching count for ${tableName}:`, err);
    // ارمِ الخطأ ليتم التقاطه
    throw err instanceof Error ? err : new Error(`Failed to fetch count for ${tableName}`);
  }
}

// دالة لجلب جميع الإحصائيات مع معالجة الأخطاء والكاش
async function fetchAllStats(force = false) {
  const now = Date.now();
  // التحقق من الكاش إلا إذا كان التحديث إجباريًا
  if (!force && lastFetched.value && (now - lastFetched.value < CACHE_DURATION_MS)) {
    console.log("Using cached stats.");
    return; // استخدم البيانات الموجودة في الكاش
  }

  isLoading.value = true;
  error.value = null; // إعادة تعيين الخطأ

  // تعريف المهام مع مفاتيحها لتسهيل الربط
  const tasks = [
    { key: 'totalUsers', promise: fetchCount('profiles') },
    { key: 'totalComments', promise: fetchCount('comments') },
    { key: 'totalEnrollments', promise: fetchCount('course_enrollments') },
    { key: 'totalCompletions', promise: fetchCount('lesson_completions') },
    { key: 'totalBooks', promise: fetchCount('books') },
    { key: 'totalLessons', promise: fetchCount('lessons') },
    { key: 'totalCourses', promise: fetchCount('study_courses') },
    { key: 'totalQuizzes', promise: fetchCount('quizzes') },
    { key: 'totalQuestionsToSheikh', promise: fetchCount('questions_to_sheikh') },
    { key: 'unansweredQuestions', promise: fetchCount('questions_to_sheikh', q => q.eq('is_answered', false)) },
    { key: 'unreadNotifications', promise: fetchCount('notifications', q => q.eq('is_read', false).is('user_id', null)) }, // .is('user_id', null) لتحديد الاشعارات العامة ربما؟ أو إزالته إذا كانت لكل المستخدمين
    { key: 'totalQuizAttempts', promise: fetchCount('quiz_attempts') },
    // إحصائيات اختيارية
    { key: 'totalLessonViews', promise: fetchCount('site_stats', q => q.eq('type', 'lesson_view')) },
    { key: 'totalBookDownloads', promise: fetchCount('site_stats', q => q.eq('type', 'book_download')) },
  ];

  try {
    const results = await Promise.allSettled(tasks.map(task => task.promise));
    let firstError: Error | PostgrestError | null = null;

    results.forEach((result, index) => {
      const taskKey = tasks[index].key as keyof DashboardStats;

      if (result.status === 'fulfilled') {
        stats.value[taskKey] = result.value;
      } else {
        // سجل الخطأ للإحصائية المحددة
        console.error(`Failed to fetch stat for ${taskKey}:`, result.reason);
        stats.value[taskKey] = null; // اعرض null عند الفشل
        // سجل أول خطأ يحدث لعرضه للمستخدم
        if (!firstError) {
          firstError = result.reason instanceof Error ? result.reason : new Error(String(result.reason));
        }
      }
    });

    if (firstError) {
        error.value = firstError; // اعرض الخطأ العام الأول الذي حدث
    } else {
        lastFetched.value = Date.now(); // تم التحديث بنجاح، سجل وقت الجلب
    }

  } catch (err: any) {
     // هذا الـ catch لالتقاط أخطاء غير متوقعة جداً (نادر مع allSettled)
     console.error("An unexpected error occurred outside Promise.allSettled:", err);
     if (!error.value) error.value = err instanceof Error ? err : new Error("Unknown error during fetching process");
  } finally {
    isLoading.value = false;
  }
}

// دالة لإجبار التحديث وتجاوز الكاش
function forceRefresh() {
  lastFetched.value = null; // مسح وقت الجلب الأخير لإجبار التحديث
  fetchAllStats(true);
}

// جلب البيانات عند تحميل المكون
onMounted(() => {
  fetchAllStats();
});
</script>

<style scoped>
/* إضافة انتقالات بسيطة للبطاقات */
.grid > * {
  transition: all 0.3s ease-in-out;
}
.grid > *:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* تخصيص إضافي إذا لزم الأمر */
</style>