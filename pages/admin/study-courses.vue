<template>
  <div>
    <!-- Header and Add Button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">إدارة الدورات الدراسية</h1>
      <button @click="openAddCourseModal" class="button-primary" :disabled="loadingFilters">
        <span v-if="loadingFilters">تحميل...</span>
        <span v-else>إضافة دورة جديدة</span>
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="pending" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">جارٍ تحميل قائمة الدورات...</p>
    </div>

    <!-- Error Loading -->
     <div v-else-if="error" class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md mx-auto">
        <p class="text-red-600 dark:text-red-400 font-semibold mb-2">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 inline-block align-middle me-1" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
         خطأ تحميل الدورات
        </p>
        <pre class="mt-1 text-xs text-left bg-red-100 dark:bg-red-800/30 p-2 rounded border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 whitespace-pre-wrap">{{ error.message }}</pre>
        <button @click="refresh" class="mt-4 px-4 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900 transition-colors text-sm font-medium">
          إعادة المحاولة
        </button>
     </div>

    <!-- Empty State -->
    <!-- *** MODIFIED: Check !pending and Array.isArray before checking length *** -->
    <div v-else-if="!pending && Array.isArray(courses) && courses.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto mb-2 text-gray-400">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
      لا توجد دورات دراسية مضافة حتى الآن.
    </div>

    <!-- Courses Table -->
     <!-- *** MODIFIED: Check !pending and Array.isArray and length > 0 before rendering table *** -->
    <div v-else-if="!pending && Array.isArray(courses) && courses.length > 0" class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
             <th scope="col" class="table-header"></th> <!-- For Image -->
            <th scope="col" class="table-header">العنوان</th>
            <th scope="col" class="table-header">الفئة</th>
             <th scope="col" class="table-header text-center">الحالة</th> <!-- Active Status -->
            <th scope="col" class="table-header">تاريخ الإضافة</th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">إجراءات</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
           <!-- v-for is now safe because we ensured 'courses' is a non-empty array -->
          <tr v-for="course in courses" :key="course.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="px-4 py-2 whitespace-nowrap">
              <img :src="getCourseImageUrl(course.image_url)" :alt="course.title ?? 'صورة الدورة'" class="h-10 w-16 object-cover rounded border border-gray-200 dark:border-gray-700" v-if="course.image_url"/>
              <div v-else class="h-10 w-16 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm16.5-5.818V18" /></svg>
              </div>
            </td>
            <td class="table-cell font-medium text-gray-900 dark:text-white">{{ course.title }}</td>
            <td class="table-cell">{{ getCategoryName(course.category_id) || '-' }}</td>
             <td class="table-cell text-center">
               <button @click="toggleCourseStatus(course)" :title="course.is_active ? 'إلغاء تفعيل الدورة' : 'تفعيل الدورة'">
                 <span v-if="course.is_active" class="badge-green">نشط</span>
                 <span v-else class="badge-red">غير نشط</span>
               </button>
             </td>
            <td class="table-cell">
              {{ formatDate(course.created_at) }}
            </td>
            <td class="table-cell text-right font-medium space-x-2 rtl:space-x-reverse whitespace-nowrap">
               <!-- TODO: Link to manage course lessons/details page -->
               <!-- <NuxtLink :to="`/admin/study-courses/${course.id}/manage`" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200">إدارة المحتوى</NuxtLink> -->
               <button @click="openEditCourseModal(course)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">تعديل</button>
               <button @click="handleDeleteCourse(course)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Fallback/Unknown state (optional) -->
     <div v-else-if="!pending && !error">
        <p class="text-center py-10 text-gray-400">حالة غير متوقعة.</p>
     </div>


    <!-- Add/Edit Course Modal -->
    <LazyAdminCourseAddEditModal
       v-if="showCourseModal"
       :course-data="selectedCourseForEdit"
       :categories="filterCategories"
       @close="closeCourseModal"
       @saved="handleCourseSaved"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent, watch } from 'vue'; // Added watch
import type { Database, Tables } from '~/types/database.types';
import { useSupabaseClient, useAsyncData } from '#imports'; // Import useAsyncData
import LoadingSpinner from '~/components/LoadingSpinner.vue';

// Import Modal Lazily
const LazyAdminCourseAddEditModal = defineAsyncComponent(() => import('~/components/admin/CourseAddEditModal.vue'));

// Define Types
type Course = Tables<'study_courses'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;

definePageMeta({ layout: 'admin', middleware: 'admin' });

const supabase = useSupabaseClient<Database>();

// State
const courses = ref<Course[]>([]); // Local state holding the courses
const filterCategories = ref<Category[]>([]); // For modal and display
const pending = ref(true); // Combined loading state (synced with useAsyncData)
const error = ref<any>(null); // Combined error state (synced with useAsyncData)
const showCourseModal = ref(false);
const selectedCourseForEdit = ref<Course | null>(null);
const loadingFilters = ref(true); // Still used for Add button disable state

// Fetch Courses using useAsyncData
const { data: courseData, pending: coursePending, error: courseError, refresh: refreshCourses } = await useAsyncData(
    'adminCourses', // Unique key
    async () => {
        console.log("Fetching courses via useAsyncData...");
         const { data, error: fetchError } = await supabase
            .from('study_courses')
            .select('*')
            .order('created_at', { ascending: false });

         if (fetchError) {
            console.error('Error fetching courses (useAsyncData):', fetchError.message);
            throw fetchError; // Let useAsyncData handle the error state
         }
         console.log("Courses fetched (useAsyncData):", data?.length);
         return data || [];
    }, {
        default: () => [], // Provide a default empty array
       // server: false // Optional: uncomment to fetch only on client
    }
);

// Fetch Categories (still needed for modal/display) using useAsyncData
 const { data: categoryData, pending: catPending, error: catError, refresh: refreshCategories } = await useAsyncData(
    'adminCourseCategories', // Unique key
    async () => {
        console.log("Fetching categories via useAsyncData...");
        const { data, error: fetchCatError } = await supabase
            .from('categories')
            // .eq('type', 'study_course') // Filter if needed
            .select('id, name')
            .order('name');
         if (fetchCatError) {
             console.error('Error fetching categories (useAsyncData):', fetchCatError.message);
             throw fetchCatError; // Let useAsyncData handle
         }
         console.log("Categories fetched (useAsyncData):", data?.length);
         return data || [];
    }, {
        default: () => [],
        // server: false
    }
 );

// Sync useAsyncData state with local refs
watch(coursePending, (newPending) => { pending.value = newPending; }, { immediate: true });
watch(courseError, (newError) => { error.value = newError; }, { immediate: true });
watch(courseData, (newData) => { courses.value = newData || []; }, { immediate: true });

watch(catPending, (newPending) => { loadingFilters.value = newPending; }, { immediate: true });
// Optional: Handle category fetch error if needed for UI feedback
// watch(catError, (newError) => { /* handle category specific error */ });
watch(categoryData, (newData) => { filterCategories.value = newData || []; }, { immediate: true });


// Helper Functions
function getCategoryName(categoryId: number | null): string | null {
    // *** MODIFIED: Add safety check for filterCategories array ***
    if (!categoryId || !Array.isArray(filterCategories.value)) return null;
    const category = filterCategories.value.find(c => c.id === categoryId);
    return category ? category.name : `فئة #${categoryId}`;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return 'تاريخ غير صالح'; }
}

function getCourseImageUrl(imageUrl: string | null): string {
    return imageUrl || '/images/placeholder-course.jpg'; // Adjust placeholder path
}

// Toggle Course Status
async function toggleCourseStatus(course: Course) {
    const newStatus = !course.is_active;
    const confirmationMessage = newStatus
        ? `هل أنت متأكد من تفعيل الدورة "${course.title}"؟ ستصبح مرئية للطلاب.`
        : `هل أنت متأكد من إلغاء تفعيل الدورة "${course.title}"؟ لن تكون مرئية للطلاب.`;

    if (!confirm(confirmationMessage)) return;

    try {
        const { error: updateError } = await supabase
            .from('study_courses')
            .update({ is_active: newStatus })
            .eq('id', course.id)
             .select('id') // Select something to ensure the update happened
             .single(); // Expect a single row back or error

        if (updateError) throw updateError;

        // Update local state immediately for better UX *after* successful DB update
        const index = courses.value.findIndex(c => c.id === course.id);
        if (index !== -1) {
            courses.value[index].is_active = newStatus;
        }
         alert(`تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} الدورة بنجاح.`);

    } catch (err: any) {
        console.error('Error toggling course status:', err.message);
        alert(`فشل تغيير حالة الدورة: ${err.message}`);
        // Optionally refresh data from DB on error to revert optimistic update
        // refreshCourses();
    }
}

// Modal Handling
function openAddCourseModal() {
    selectedCourseForEdit.value = null;
    showCourseModal.value = true;
}
function openEditCourseModal(course: Course) {
    selectedCourseForEdit.value = { ...course };
    showCourseModal.value = true;
}
function closeCourseModal() {
    showCourseModal.value = false;
    selectedCourseForEdit.value = null;
}
async function handleCourseSaved() {
    closeCourseModal();
    await refreshCourses(); // Use useAsyncData's refresh
}

 // Delete Action
 async function handleDeleteCourse(course: Course) {
     if (!confirm(`هل أنت متأكد من حذف الدورة "${course.title}"؟ سيتم فك ارتباط جميع دروسها واختباراتها (لن يتم حذف الدروس/الاختبارات نفسها).`)) {
         return;
     }

     try {
         const { error: deleteError } = await supabase
             .from('study_courses')
             .delete()
             .eq('id', course.id);

         if (deleteError) throw deleteError;

         alert('تم حذف الدورة بنجاح.');
         await refreshCourses(); // Use useAsyncData's refresh
     } catch (err: any) {
         console.error('Error deleting course:', err.message);
         alert(`فشل حذف الدورة: ${err.message}`);
     }
 }

// Refresh function for error button
async function refresh() {
     await Promise.all([ // Refresh both in parallel if needed
         refreshCourses(),
         refreshCategories()
     ]);
}

// Initial data fetch is triggered by useAsyncData on mount

</script>

<style scoped>
/* Re-use admin table styles */
.table-header {
  @apply px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider;
}
.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 align-middle;
}
.button-primary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green disabled:opacity-50;
}
 .badge-base {
   @apply px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer;
}
.badge-green {
   @apply badge-base bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}
 .badge-red {
   @apply badge-base bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200;
}
</style>