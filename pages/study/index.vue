<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-6 border-b-2 border-olive-green pb-2">
      الدورات الدراسية المنهجية
    </h1>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل الدورات المتاحة...</p>
    </div>

    <!-- Error State -->
     <div v-else-if="error" class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50 rounded-lg max-w-lg mx-auto">
         <div class="flex justify-center items-center text-red-600 dark:text-red-400 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6" aria-hidden="true">
                <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
            </svg>
            <h2 class="text-xl font-semibold ms-2">خطأ في تحميل الدورات</h2>
         </div>
        <p class="text-sm text-red-700 dark:text-red-300 mb-4">
          {{ error.message || 'حدث خطأ غير متوقع أثناء محاولة جلب قائمة الدورات. يرجى المحاولة مرة أخرى.' }}
        </p>
        <button @click="refresh" class="mt-4 px-4 py-1.5 bg-red-100 text-red-700 dark:bg-red-800/60 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800/80 transition-colors text-sm font-medium inline-flex items-center gap-1">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.984a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-2.432l.311.31a7 7 0 0 0 11.767-3.18.75.75 0 1 0-1.475-.292ZM4.688 8.576a5.5 5.5 0 0 1 9.201-2.466l.312.311h-2.433a.75.75 0 0 0 0 1.5h4.516a.75.75 0 0 0 .75-.75v-4.5a.75.75 0 0 0-1.5 0v2.432l-.311-.31a7 7 0 0 0-11.767 3.18.75.75 0 0 0 1.475.292Z" clip-rule="evenodd" /></svg>
          إعادة المحاولة
        </button>
     </div>

    <!-- No Courses Available State -->
    <!-- Explicitly check Array.isArray before checking length -->
    <div v-else-if="Array.isArray(courses) && courses.length === 0" class="text-center py-16 text-gray-500 dark:text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
      <p class="text-lg font-medium">لا توجد دورات دراسية متاحة حاليًا.</p>
      <p class="text-sm mt-1 text-gray-400 dark:text-gray-500">سيتم إضافة دورات جديدة قريبًا بإذن الله، تابعنا للمزيد.</p>
    </div>

    <!-- Courses Grid -->
     <!-- Render only if not pending, no error, and courses is an array with items -->
    <div v-else-if="Array.isArray(courses) && courses.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Pass plain course data, derived lesson count, and enrollment status -->
      <CourseCard
        v-for="course in courses"
        :key="course.id"
        :course="course"
        :lesson-count="course.lessons_count"
        :is-enrolled="userEnrollments.includes(course.id)"
        :enroll-loading="enrollLoadingState[course.id] || false"
        @enroll="handleEnroll"
      />
      <!-- Note: Pagination/Infinite Scroll might be needed for large number of courses -->
    </div>

     <!-- Fallback for unexpected states (e.g., data is not an array but not an error) -->
     <div v-else-if="!pending && !error">
        <p class="text-center py-10 text-gray-400 dark:text-gray-500 italic">حالة عرض الدورات غير معروفة.</p>
     </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import { useSupabaseClient, useAsyncData, useHead, navigateTo } from '#imports';
import CourseCard from '~/components/CourseCard.vue';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';
// import { useToast } from 'vue-toastification'; // Optional: For better UI feedback

// Define Types
interface CourseWithLessonCount extends Tables<'study_courses'> {
  // lessons relation is used only during fetch, final type has count directly
  lessons?: { count: number }[]; // Structure during fetch
  lessons_count: number; // Final count added after processing
}
type CourseEnrollment = Pick<Tables<'course_enrollments'>, 'course_id'>;

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const userStore = useUserStore();
const { profile, isLoggedIn } = storeToRefs(userStore); // Reactive refs
// const toast = useToast(); // Optional

// --- State ---
const courses = ref<CourseWithLessonCount[]>([]);
const userEnrollments = ref<number[]>([]); // Array of enrolled course IDs
// Reactive object to track loading state for individual enroll buttons
const enrollLoadingState = reactive<Record<number, boolean>>({});

// --- Data Fetching ---
// Fetch active courses with lesson counts and user's enrollments.
const { data, pending, error, refresh } = await useAsyncData(
    'studyCoursesAndEnrollmentsList', // Unique key for this fetch
    async () => {
        const userId = profile.value?.id; // Get current user ID
        console.log(`Fetching study data... User logged in: ${isLoggedIn.value}, User ID: ${userId}`);

        // Use Promise.allSettled to handle potential errors in parallel queries gracefully
        const results = await Promise.allSettled([
            // Query 1: Fetch Active Courses with Lesson Count using relation count
            supabase
                .from('study_courses')
                .select('*, lessons!inner(count)') // Use inner join count for accuracy
                .eq('is_active', true)
                .order('created_at', { ascending: false }), // Order by creation date, newest first

            // Query 2: Fetch User Enrollments (only if logged in)
            isLoggedIn.value && userId
                ? supabase
                    .from('course_enrollments')
                    .select('course_id') // Only need the course ID
                    .eq('user_id', userId)
                : Promise.resolve({ data: [], error: null }) // Return empty if not logged in
        ]);

        // Process Course Results
        let fetchedCourses: CourseWithLessonCount[] = [];
        if (results[0].status === 'fulfilled') {
            if (results[0].value.error) {
                 console.error('Supabase error fetching courses:', results[0].value.error);
                 throw new Error(`فشل جلب الدورات: ${results[0].value.error.message}`);
            }
            // Process the data: map course and extract lesson count
            fetchedCourses = (results[0].value.data || []).map(course => ({
                ...course,
                // Supabase relation count structure: lessons is an array with one object { count: number }
                lessons_count: course.lessons && course.lessons.length > 0 ? course.lessons[0].count : 0,
                lessons: undefined // Remove the temporary 'lessons' relation property
            }));
            console.log(`Courses fetched successfully: ${fetchedCourses.length}`);
        } else {
            // Handle promise rejection for course fetch
            console.error('Failed promise fetching courses:', results[0].reason);
            throw new Error(`فشل الاتصال لجلب الدورات: ${results[0].reason?.message || 'سبب غير معروف.'}`);
        }

        // Process Enrollment Results
        let fetchedEnrollmentsData: CourseEnrollment[] = [];
        if (results[1].status === 'fulfilled') {
             if (results[1].value.error) {
                 // Log error but don't fail the entire fetch, user might just not be logged in or have issues fetching enrollments
                 console.warn('Supabase error fetching enrollments:', results[1].value.error.message);
             } else {
                fetchedEnrollmentsData = results[1].value.data || [];
                console.log(`Enrollments fetched successfully: ${fetchedEnrollmentsData.length}`);
             }
        } else {
            // Log promise rejection for enrollment fetch, but continue
            console.warn('Failed promise fetching user enrollments:', results[1].reason);
        }

        // Return plain JavaScript objects structured for the component state
        return {
            courses: fetchedCourses, // Already processed
            enrollments: fetchedEnrollmentsData.map(e => e.course_id) // Return array of IDs
        };
    }, {
        // Default value prevents errors before data loads, matches return structure
        default: () => ({ courses: [], enrollments: [] }),
        // Watch the user ID. If it changes (login/logout), useAsyncData refetches.
        watch: [() => profile.value?.id],
        // server: false, // Consider uncommenting if SSR causes issues with user state consistency
    }
);

 // --- Update Local State Reactively ---
 // Watch the data from useAsyncData and update local refs.
 // Ensures the component's state reflects the fetched data.
 watch(data, (newData) => {
    if (newData) {
        // Directly assign the data. Assuming it's already plain.
        // Avoid heavy JSON.parse(stringify) unless strictly needed for reactivity issues.
        courses.value = newData.courses || [];
        userEnrollments.value = newData.enrollments || [];
        console.log("Local state updated via watch. Courses:", courses.value.length, "Enrollments:", userEnrollments.value.length);
    } else if (!pending.value) {
        // Handle case where data is null after loading (should be rare with default)
        console.warn("useAsyncData returned null data after loading.");
        courses.value = [];
        userEnrollments.value = [];
    }
 }, { immediate: true }); // `immediate: true` ensures the watcher runs on initial load


// --- Enrollment Action ---
async function handleEnroll(courseId: number) {
    if (!isLoggedIn.value || !profile.value?.id) {
        // toast.warning('يجب تسجيل الدخول أولاً للانتساب للدورة.'); // Optional
        alert('يجب تسجيل الدخول أولاً للانتساب للدورة.');
        navigateTo(`/login?redirect=${window.location.pathname}`); // Redirect to login, then back
        return;
    }

    // Prevent re-enrolling if already enrolled locally
    if (userEnrollments.value.includes(courseId)) {
        // toast.info('أنت منتسب بالفعل لهذه الدورة.'); // Optional
        alert('أنت منتسب بالفعل لهذه الدورة.');
        // Optionally navigate directly to the course page
        navigateTo(`/study/courses/${courseId}`);
        return;
    }

    // Set loading state for the specific button
    enrollLoadingState[courseId] = true;
    console.log(`Attempting to enroll user ${profile.value.id} in course ${courseId}...`);

    try {
        const { error: enrollError } = await supabase
            .from('course_enrollments')
            .insert({ user_id: profile.value.id, course_id: courseId })
            .select('course_id') // Minimal select to confirm insertion
            .single(); // Use single to expect one row or an error

        if (enrollError) {
             // Handle unique constraint violation (user might already be enrolled in DB but local state is stale)
             if (enrollError.code === '23505') { // PostgreSQL unique_violation code
                 console.warn(`Enrollment conflict for course ${courseId}. User likely already enrolled.`);
                 // toast.info('أنت منتسب بالفعل لهذه الدورة.'); // Optional
                 alert('أنت منتسب بالفعل لهذه الدورة.');
                 // Sync local state if needed
                 if (!userEnrollments.value.includes(courseId)) {
                     userEnrollments.value.push(courseId);
                 }
             } else {
                // Throw other Supabase errors
                throw enrollError;
             }
        } else {
            // Enrollment successful
            console.log(`Enrollment successful for course ${courseId}!`);
            // Update local state immediately for UI feedback
            userEnrollments.value.push(courseId);
            // toast.success('تم الانتساب للدورة بنجاح!'); // Optional
            alert('تم الانتساب للدورة بنجاح!');
            // Navigate to the course page after successful enrollment
            navigateTo(`/study/courses/${courseId}`);
        }
    } catch (err: any) {
        console.error(`Error enrolling in course ${courseId}:`, err);
        // toast.error(`فشل الانتساب للدورة: ${err.message || 'حدث خطأ غير متوقع.'}`); // Optional
        alert(`فشل الانتساب للدورة: ${err.message || 'حدث خطأ غير متوقع.'}`);
    } finally {
        // Reset loading state for the specific button regardless of outcome
        enrollLoadingState[courseId] = false;
    }
}


// --- SEO Meta Tags ---
useHead({
  title: 'الدورات الدراسية - موقع الشيخ إبراهيم بشندي',
  meta: [
    { name: 'description', content: 'تصفح والتحق بالدورات الدراسية المنهجية للشيخ إبراهيم بشندي في مختلف العلوم الشرعية كالعقيدة والفقه وأصوله والحديث وعلومه.' },
    { property: 'og:title', content: 'الدورات الدراسية - موقع الشيخ إبراهيم بشندي' },
    { property: 'og:description', content: 'دورات علمية منهجية ومتخصصة في العلوم الشرعية، متاحة للتعلم والدراسة.' },
    // Add other relevant meta tags if needed (e.g., og:image)
  ]
})
</script>

<style scoped>
/* Add component-specific styles here if necessary */
.grid {
    /* Consider adding container queries or fine-tuning responsive breakpoints if needed */
}
</style>