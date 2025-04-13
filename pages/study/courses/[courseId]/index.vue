<template>
  <div class="container mx-auto px-4 py-8">

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل تفاصيل الدورة...</p>
    </div>

    <!-- Error State -->
     <div v-else-if="error || !course" class="text-center py-20 max-w-2xl mx-auto">
        <h2 v-if="error?.statusCode === 404 || !course" class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
            الدورة غير موجودة أو غير متاحة
        </h2>
        <h2 v-else class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
            حدث خطأ
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
            {{ error?.message || 'لم نتمكن من العثور على الدورة المطلوبة.' }}
        </p>
        <NuxtLink
            to="/study"
            class="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green"
        >
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" /></svg>
            <span>العودة إلى قائمة الدورات</span>
        </NuxtLink>
     </div>

    <!-- Course Details -->
    <div v-else-if="!pending && course" class="course-details space-y-8 md:space-y-12">
       <header class="md:flex md:items-start md:gap-8 p-4 sm:p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-lg shadow-sm border dark:border-gray-700/50">
          <!-- Course Image -->
          <div class="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mb-4 md:mb-0">
               <img :src="getCourseImageUrl(course.image_url)" :alt="`غلاف دورة: ${course.title}`" class="w-full aspect-video object-cover rounded-lg shadow">
          </div>
          <!-- Course Info & Actions -->
          <div class="flex-grow">
               <h1 class="text-3xl font-bold text-brown-dark dark:text-beige-light mb-3">{{ course.title }}</h1>
               <p v-if="course.description" class="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">{{ course.description }}</p>
               <p class="text-sm text-gray-500 dark:text-gray-400 mb-5" v-if="categoryName">
                  الفئة: <span class="font-medium">{{ categoryName }}</span>
               </p>

               <!-- Enrollment & Progress -->
               <!-- Wrap in ClientOnly because enrollment status depends on client state -->
               <ClientOnly>
                   <div class="space-y-3">
                       <!-- Enrollment Actions -->
                       <div v-if="isLoggedIn">
                           <button v-if="!isEnrolled" @click="handleEnroll(course.id)" :disabled="enrollLoading" class="button-enroll w-full sm:w-auto">
                                <span v-if="enrollLoading">جاري الانتساب...</span>
                                <span v-else>انتسب الآن</span>
                           </button>
                           <div v-else class="space-y-3"> 
                               <p class="text-green-600 dark:text-green-400 font-semibold text-base">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 inline-block align-middle me-1"><path fill-rule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.48 4.774L6.52 10.91a.75.75 0 1 0-1.04 1.08l2.18 2.108a.75.75 0 0 0 1.076-.015l4.145-5.682Z" clip-rule="evenodd" /></svg>
                                  أنت منتسب لهذه الدورة
                               </p>

                               <!-- Progress Bar Section -->
                                <div v-if="totalLessonsCount > 0" class="progress-section">
                                    <div class="flex justify-between mb-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                                       <span>التقدم</span>
                                       <span>{{ progressPercentage }}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                                       <div class="bg-olive-green h-2.5 rounded-full transition-all duration-500 ease-out" :style="{ width: progressPercentage + '%' }"></div>
                                    </div>
                                     <p class="text-xs text-gray-500 dark:text-gray-400 mt-1"> {{ completedLessonsCount }} / {{ totalLessonsCount }} درس مكتمل</p>
                                </div>
                                <div v-else class="text-xs text-gray-500 dark:text-gray-400 italic"> (لم تتم إضافة دروس لهذه الدورة بعد)</div>


                               <div class="flex items-center gap-4 pt-2">
                                    <button @click="navigateToLastAccessed" class="button-secondary flex-grow sm:flex-grow-0">
                                         استئناف التعلم
                                    </button>
                                    <button @click="handleUnenroll(course.id)" :disabled="enrollLoading" class="text-xs text-red-500 hover:underline disabled:opacity-50">إلغاء الانتساب</button>
                               </div>
                           </div>
                       </div>
                        <NuxtLink v-else to="/login" class="button-enroll w-full sm:w-auto">
                            سجل الدخول للانتساب
                        </NuxtLink>
                   </div>
                   <template #fallback>
                       <!-- Simple placeholder for SSR/initial client load -->
                        <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse w-full sm:w-40"></div>
                   </template>
                </ClientOnly>
          </div>
       </header>

       <!-- Course Content (Lessons) -->
       <section class="course-content">
          <h2 class="text-2xl font-semibold text-brown-dark dark:text-beige-light mb-4">محتوى الدورة</h2>
          <div v-if="!Array.isArray(courseLessons) || courseLessons.length === 0" class="text-center py-6 text-gray-500 dark:text-gray-400">
              سيتم إضافة دروس لهذه الدورة قريبًا.
          </div>
          <ul v-else class="space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <li v-for="(lesson, index) in courseLessons" :key="lesson.id"
                  :class="[
                    'flex items-center justify-between p-3 rounded-md transition-colors',
                    isLessonCompleted(lesson.id) // Check completion status
                       ? 'bg-green-50 dark:bg-green-900/30 opacity-75 hover:opacity-90' // Style for completed
                       : 'hover:bg-gray-50 dark:hover:bg-gray-800/50' // Style for incomplete
                  ]">
                  <div class="flex items-center space-x-3 rtl:space-x-reverse">
                      <!-- Lesson Number/Icon -->
                      <span :class="[
                         'flex items-center justify-center flex-shrink-0 w-6 h-6 text-xs font-semibold rounded-full',
                          isLessonCompleted(lesson.id) ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                         ]">
                         <!-- Show checkmark if completed, otherwise number -->
                         <svg v-if="isLessonCompleted(lesson.id)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.208Z" clip-rule="evenodd" /></svg>
                          <span v-else>{{ index + 1 }}</span>
                      </span>
                      <!-- Lesson Title Link -->
                      <NuxtLink :to="`/study/courses/${courseId}/lessons/${lesson.id}`" class="text-base text-gray-800 dark:text-gray-200 hover:text-olive-green dark:hover:text-olive-green/80">
                          {{ lesson.title }}
                      </NuxtLink>
                    </div>
                   <!-- Optional: Play icon or duration -->
                   <!-- <span class="text-gray-400 dark:text-gray-500 text-xs">▶ 10:30</span> -->
              </li>
          </ul>
       </section>

        <!-- TODO: Add Quizzes / Comments sections -->

    </div>
    <!-- Fallback -->
    <div v-else-if="!pending && !error"> <p class="text-center py-10 text-gray-400">حالة غير معروفة.</p> </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, shallowRef } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import { useSupabaseClient, useAsyncData, useRoute, useHead, navigateTo, createError, showError } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';

// Define Types
type Course = Tables<'study_courses'>;
type Lesson = Pick<Tables<'lessons'>, 'id' | 'title' | 'lesson_order'>;
type CourseEnrollment = Tables<'course_enrollments'>;
type LessonCompletionInfo = Pick<Tables<'lesson_completions'>, 'lesson_id'>; // Type for completion data

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const userStore = useUserStore();
const { profile, isLoggedIn } = storeToRefs(userStore);

const courseId = computed<number>(() => { // Ensure it returns number or throws
    const id = parseInt(route.params.courseId as string, 10);
    if (isNaN(id) || id <= 0) {
         showError({ statusCode: 400, statusMessage: `معرف الدورة غير صالح: "${route.params.courseId}"` });
         // Return a dummy value or handle it, though showError should stop execution
         return -1; // Or throw new Error - showError is better for page level
    }
    return id;
});

// State
const course = shallowRef<Course | null>(null);
const courseLessons = shallowRef<Lesson[]>([]);
const categoryName = shallowRef<string | null>(null);
const enrollment = shallowRef<CourseEnrollment | null>(null);
const completedLessonIds = shallowRef<number[]>([]); // Store only the IDs
const enrollLoading = ref(false);

// --- Validate ID ---
if (isNaN(courseId.value)) {
    // showError already called in computed, this is a safeguard
    console.error("Course ID is invalid, stopping setup.");
}

// --- Fetch Data ---
// Type for the data structure returned by useAsyncData's fetcher function
type FetchedCoursePageData = {
    course: Course | null;
    lessons: Lesson[];
    categoryName: string | null;
    enrollment: CourseEnrollment | null;
    completions: LessonCompletionInfo[]; // Include completions
};

const { data, pending, error, refresh } = await useAsyncData<FetchedCoursePageData>(
    `course-page-data-${courseId.value}-${profile.value?.id ?? 'guest'}`,
    async () => {
        const currentCourseId = courseId.value;
        const currentUserId = profile.value?.id;

        if (isNaN(currentCourseId)) { throw new Error('Invalid Course ID in fetcher'); }

        console.log(`Fetching data for course ${currentCourseId}, User ${currentUserId}`);
        try {
            // 1. Fetch Course first
            const { data: fetchedCourseData, error: courseError } = await supabase
                .from('study_courses')
                .select('*')
                .eq('id', currentCourseId)
                .eq('is_active', true)
                .maybeSingle();

            if (courseError) throw new Error(courseError.message);
            if (!fetchedCourseData) throw Object.assign(new Error('Course not found or inactive.'), { statusCode: 404 });

            const fetchedCourse: Course = fetchedCourseData;

            // 2. Fetch Lessons, Category Name, Enrollment, Completions in parallel
            const lessonIdsInCourseQuery = supabase.from('lessons').select('id').eq('course_id', currentCourseId); // Subquery to get lesson IDs

            const fetches = [
                // Lessons (ordered)
                supabase.from('lessons').select('id, title, lesson_order').eq('course_id', currentCourseId).order('lesson_order', { ascending: true, nullsFirst: false }),
                // Category Name
                fetchedCourse.category_id ? supabase.from('categories').select('name').eq('id', fetchedCourse.category_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
                // Enrollment
                 (isLoggedIn.value && currentUserId) ? supabase.from('course_enrollments').select('*').eq('user_id', currentUserId).eq('course_id', currentCourseId).maybeSingle() : Promise.resolve({ data: null, error: null }),
                // Completions (fetch IDs only)
                (isLoggedIn.value && currentUserId)
                 ? supabase.from('lesson_completions').select('lesson_id').eq('user_id', currentUserId)
                    // Efficiently filter completions for lessons belonging to this course
                    .in('lesson_id', (await lessonIdsInCourseQuery).data?.map(l => l.id) ?? [])
                 : Promise.resolve({ data: [], error: null })
            ];

             const results = await Promise.allSettled(fetches);

             // Process results safely
             const fetchedLessons = results[0].status === 'fulfilled' ? results[0].value.data || [] : [];
             const fetchedCategoryName = results[1].status === 'fulfilled' ? results[1].value.data?.name : null;
             const fetchedEnrollment = results[2].status === 'fulfilled' ? results[2].value.data : null;
             const fetchedCompletions = results[3].status === 'fulfilled' ? results[3].value.data || [] : [];

             // Log errors
             if (results[0].status === 'rejected') console.error("Lessons fetch error:", results[0].reason);
             if (results[1].status === 'rejected') console.error("Category fetch error:", results[1].reason);
             if (results[2].status === 'rejected') console.error("Enrollment fetch error:", results[2].reason);
             if (results[3].status === 'rejected') console.error("Completions fetch error:", results[3].reason);


            return {
                course: fetchedCourse,
                lessons: fetchedLessons,
                categoryName: fetchedCategoryName,
                enrollment: fetchedEnrollment,
                completions: fetchedCompletions // Return completions data
            };

        } catch (err: any) {
            console.error("Error fetching course page data:", err);
            if (err.statusCode) { throw err; }
            throw new Error(err.message || 'An unknown error occurred.');
        }
    }, {
         default: (): FetchedCoursePageData => ({ course: null, lessons: [], categoryName: null, enrollment: null, completions: [] }),
         watch: [() => profile.value?.id]
    }
);

// Update local state
 watch(data, (newData) => {
    console.log("Course Page Watcher Triggered. New data received:", !!newData);
    course.value = newData?.course ?? null;
    courseLessons.value = newData?.lessons ?? [];
    categoryName.value = newData?.categoryName ?? null;
    enrollment.value = newData?.enrollment ?? null;
    // Extract only the IDs for easier checking
    completedLessonIds.value = (newData?.completions ?? []).map(c => c.lesson_id);
    console.log("Updated completed lesson IDs:", completedLessonIds.value);
 }, { immediate: true });


// --- Computed Properties ---
const isEnrolled = computed(() => !!enrollment.value);

const completedLessonsCount = computed(() => completedLessonIds.value.length);
const totalLessonsCount = computed(() => Array.isArray(courseLessons.value) ? courseLessons.value.length : 0);

const progressPercentage = computed(() => {
  if (totalLessonsCount.value === 0) return 0;
  // Ensure completed count doesn't exceed total (can happen with race conditions/errors)
  const validCompletedCount = Math.min(completedLessonsCount.value, totalLessonsCount.value);
  return Math.round((validCompletedCount / totalLessonsCount.value) * 100);
});

// --- Helper Functions ---
const isLessonCompleted = (lessonId: number): boolean => {
    return completedLessonIds.value.includes(lessonId);
};
 function getCourseImageUrl(imageUrl: string | null): string {
    return imageUrl || '/images/placeholder-course.jpg';
 }

// --- Actions (Enroll, Unenroll, Navigate) ---
async function handleEnroll(id: number | undefined) {
     if (!id) return;
    if (!isLoggedIn.value || !profile.value?.id) { alert('يجب تسجيل الدخول أولاً.'); navigateTo('/login'); return; }
    if (isEnrolled.value) return;
    enrollLoading.value = true;
    try {
      const { data: newEnrollment, error: enrollError } = await supabase.from('course_enrollments').insert({ user_id: profile.value.id, course_id: id }).select('*').single();
      if (enrollError) throw enrollError;
      enrollment.value = newEnrollment; // Update enrollment state
      alert('تم الانتساب بنجاح!');
    } catch (err:any) { console.error(err); alert(`فشل الانتساب: ${err.message}`); }
    finally { enrollLoading.value = false; }
}

async function handleUnenroll(id: number | undefined) {
    if (!id) return;
    if (!isEnrolled.value || !profile.value?.id) return;
    if (!confirm('هل أنت متأكد من إلغاء الانتساب لهذه الدورة؟')) return;
    enrollLoading.value = true; // Use same loading state for simplicity
    try {
      const { error: unenrollError } = await supabase.from('course_enrollments').delete().match({ user_id: profile.value.id, course_id: id });
      if (unenrollError) throw unenrollError;
      enrollment.value = null; // Update enrollment state
      completedLessonIds.value = []; // Also reset completion progress for this course visually
      alert('تم إلغاء الانتساب.');
    } catch (err:any) { console.error(err); alert(`فشل إلغاء الانتساب: ${err.message}`); }
    finally { enrollLoading.value = false; }
}

function navigateToLastAccessed() {
    // 1. احصل على معرف الدورة الحالي (من computed prop)
    const targetCourseId = courseId.value;
    // 2. تحقق فوري من صلاحية معرف الدورة
    if (isNaN(targetCourseId)) {
        console.error("navigateToLastAccessed: Invalid targetCourseId"); // أضف console.error
        return; // توقف إذا كان المعرف غير صالح
    }

    // 3. احصل على معرف آخر درس تم الوصول إليه من حالة الانتساب
    const lastLessonId = enrollment.value?.last_accessed_lesson_id;
    // 4. احصل على قائمة الدروس الحالية للدورة (من ref)
    const lessons = courseLessons.value; // يفترض أن هذا ref يحتوي على مصفوفة الدروس

    // 5. تحقق من أن lessons هي مصفوفة بالفعل (احتياطي إضافي)
    const isLessonsArray = Array.isArray(lessons);
    const firstLessonId = (isLessonsArray && lessons.length > 0) ? lessons[0].id : null;

    // *** أضف console.log هنا للتشخيص ***
    console.log('navigateToLastAccessed called:');
    console.log('  targetCourseId:', targetCourseId);
    console.log('  enrollment:', enrollment.value); // اطبع كائن الانتساب كاملاً
    console.log('  lastLessonId:', lastLessonId);
    console.log('  isLessonsArray:', isLessonsArray);
    console.log('  courseLessons count:', isLessonsArray ? lessons.length : 'N/A');
    console.log('  firstLessonId:', firstLessonId);
    // *** نهاية console.log ***

    // 6. منطق التوجيه
    if (lastLessonId) {
        // إذا كان هناك آخر درس مسجل، اذهب إليه
        console.log(`Navigating to last accessed lesson: ${lastLessonId}`);
        navigateTo(`/study/courses/${targetCourseId}/lessons/${lastLessonId}`);
    } else if (firstLessonId) {
        // إذا لم يكن هناك آخر درس مسجل، ولكن توجد دروس، اذهب للدرس الأول
        console.log(`Navigating to first lesson: ${firstLessonId}`);
        navigateTo(`/study/courses/${targetCourseId}/lessons/${firstLessonId}`);
    } else {
        // إذا لم يكن هناك آخر درس مسجل ولا توجد دروس أصلاً
        console.log("No lessons found in the course.");
        alert('لا توجد دروس في هذه الدورة بعد.');
    }
}


// --- SEO Meta ---
 watch(course, (newCourse) => {
     const pageTitle = ref('تفاصيل الدورة');
     let description = 'تصفح دروس الدورة.';
     if (newCourse) {
         pageTitle.value = `دورة: ${newCourse.title}`;
         description = newCourse.description?.substring(0, 160) || `تفاصيل دورة ${newCourse.title} للشيخ إبراهيم بشندي.`;
     } else if (!pending.value) { // Only update if not loading and course is null
          pageTitle.value = 'الدورة غير متاحة';
          description = 'لم نتمكن من العثور على الدورة المطلوبة.';
     }
     useHead({
         title: pageTitle.value,
         meta: [{ name: 'description', content: description }]
     });
 }, { immediate: true });

</script>

<style scoped>
 /* Re-use button styles */
 .button-enroll { @apply inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green disabled:opacity-50 disabled:cursor-not-allowed; }
 .button-view { @apply inline-flex items-center justify-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500; }
 .button-secondary { @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500; }
</style>