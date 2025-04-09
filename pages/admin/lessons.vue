<!-- pages/admin/lessons.vue -->
<template>
  <div>
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">إدارة الدروس ({{ totalLessons }})</h1>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        :disabled="isListLoading || isDeleting !== null"
      >
        <span class="mr-2">+</span> إضافة درس جديد
      </button>
    </div>

    <!-- Filters, Search, and Sort Row -->
    <div class="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700">
      <!-- Search Input -->
      <div class="flex flex-col gap-1">
        <label for="search-term" class="text-xs font-medium text-gray-700 dark:text-gray-300">بحث بالعنوان:</label>
        <input
          id="search-term"
          type="text"
          v-model="searchTerm"
          :disabled="isListLoading"
          placeholder="ابحث..."
          @input="handleSearchInput"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-70"
        />
      </div>

      <!-- Filter by Category -->
      <div class="flex flex-col gap-1">
        <label for="filter-category" class="text-xs font-medium text-gray-700 dark:text-gray-300">التصنيف:</label>
        <select
          id="filter-category"
          v-model="filterCategory"
          :disabled="isListLoading || isLoadingFilters"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70"
        >
          <option :value="null">الكل</option>
          <option v-if="isLoadingFilters" disabled>جاري التحميل...</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
           <option v-if="!isLoadingFilters && categories.length === 0" disabled>لا توجد تصنيفات</option>
        </select>
      </div>

      <!-- Filter by Course -->
      <div class="flex flex-col gap-1">
         <label for="filter-course" class="text-xs font-medium text-gray-700 dark:text-gray-300">الدورة الدراسية:</label>
        <select
          id="filter-course"
          v-model="filterCourse"
          :disabled="isListLoading || isLoadingFilters"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70"
        >
          <option :value="null">الكل</option>
          <option v-if="isLoadingFilters" disabled>جاري التحميل...</option>
          <option v-for="course in courses" :key="course.id" :value="course.id">{{ course.title }}</option>
           <option v-if="!isLoadingFilters && courses.length === 0" disabled>لا توجد دورات</option>
        </select>
      </div>

       <!-- Sort Options -->
       <div class="flex flex-col gap-1">
           <label for="sort-by" class="text-xs font-medium text-gray-700 dark:text-gray-300">ترتيب حسب:</label>
           <div class="flex gap-2">
               <select
                 id="sort-by"
                 v-model="sortBy"
                 :disabled="isListLoading"
                 class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70"
               >
                 <option value="created_at">تاريخ الإنشاء</option>
                 <option value="title">العنوان</option>
               </select>
               <select
                 aria-label="Sort order"
                 v-model="sortOrder"
                 :disabled="isListLoading"
                 class="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70"
               >
                 <option value="desc">تنازلي</option>
                 <option value="asc">تصاعدي</option>
               </select>
           </div>
       </div>
    </div>

    <!-- Loading State for List -->
    <div v-if="isListLoading && !lessons?.length" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-2 text-gray-500 dark:text-gray-400">جاري تحميل الدروس...</p>
    </div>

    <!-- Fetch Error Message -->
    <div v-else-if="fetchError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">خطأ في جلب البيانات!</strong>
      <span class="block sm:inline"> حدث خطأ أثناء جلب الدروس. يرجى المحاولة مرة أخرى.</span>
       <button @click="() => fetchLessons(1)" class="ml-2 underline text-sm">إعادة المحاولة</button>
      <pre class="mt-2 text-xs whitespace-pre-wrap bg-red-50 p-2 rounded">{{ fetchError.message }}</pre>
    </div>

    <!-- Status Messages (Success/Action Error) -->
    <div v-if="successMessage" class="my-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded text-sm"> {{ successMessage }} </div>
    <div v-if="actionError" class="my-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm"> {{ actionError }} </div>

    <!-- Lessons Table -->
    <div v-if="!isListLoading && lessons && lessons.length > 0" class="bg-white dark:bg-gray-800 shadow overflow-x-auto sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
             <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              معاينة
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              العنوان
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              التصنيف
            </th>
             <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              الدورة الدراسية
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              تاريخ الإنشاء
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">الإجراءات</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 relative">
           <!-- Loading overlay for updates -->
           <div v-if="isListLoading" class="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-10">
               <LoadingSpinner class="w-6 h-6 text-primary-500" />
           </div>
          <tr v-for="lesson in lessons" :key="lesson.id" :class="{'opacity-50': isDeleting === lesson.id}">
             <td class="px-4 py-2 whitespace-nowrap">
               <button
                 v-if="lesson.youtube_url && getYoutubeThumbnail(lesson.youtube_url)"
                 @click="openVideoPreviewModal(lesson.youtube_url)"
                 class="w-20 h-14 overflow-hidden rounded group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                 title="مشاهدة معاينة الفيديو"
                 :disabled="isDeleting === lesson.id"
               >
                  <img
                   :src="getYoutubeThumbnail(lesson.youtube_url)"
                   :alt="`معاينة درس ${lesson.title}`"
                   class="w-full h-full object-cover transition-transform duration-200 ease-in-out group-hover:scale-110"
                   loading="lazy"
                 />
               </button>
               <div v-else class="w-20 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                 لا يوجد فيديو
               </div>
             </td>
            <td class="px-6 py-4">
               <div class="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs truncate" :title="lesson.title">{{ lesson.title }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ lesson.categories?.name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ lesson.study_courses?.title || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(lesson.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
              <button
                @click="openEditModal(lesson)"
                class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50"
                :disabled="isDeleting === lesson.id || isListLoading"
                title="تعديل الدرس"
              >
                تعديل
              </button>
              <button
                @click="confirmDelete(lesson)"
                class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                :disabled="isDeleting === lesson.id || isListLoading"
                title="حذف الدرس"
              >
                <LoadingSpinner v-if="isDeleting === lesson.id" class="w-4 h-4 inline-block" />
                <span v-else>حذف</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message when no lessons match filters -->
    <div v-else-if="!isListLoading && (!lessons || lessons.length === 0)" class="text-center py-10 text-gray-500 dark:text-gray-400">
        <p v-if="searchTerm || filterCategory || filterCourse">لا توجد دروس تطابق معايير البحث أو الفلترة الحالية.</p>
        <p v-else>لا توجد دروس لعرضها حالياً. قم بإضافة درس جديد.</p>
    </div>

     <!-- Pagination Controls -->
     <div v-if="totalPages > 1" class="mt-6 flex justify-center items-center space-x-2 rtl:space-x-reverse">
         <button
           @click="changePage(currentPage - 1)"
           :disabled="currentPage === 1 || isListLoading"
           class="px-3 py-1 text-sm rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
           السابق
         </button>
         <span class="text-sm text-gray-700 dark:text-gray-300">
           صفحة {{ currentPage }} من {{ totalPages }}
         </span>
         <button
           @click="changePage(currentPage + 1)"
           :disabled="currentPage === totalPages || isListLoading"
           class="px-3 py-1 text-sm rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
           التالي
         </button>
      </div>

    <!-- Modals -->
    <AdminLessonModal
      :show="showModal"
      :lesson-data="selectedLesson"
      :categories="categories"
      :courses="courses"
      :loading-filters="isLoadingFilters"
      @close="closeModal"
      @saved="handleSave"
    />
    <VideoPreviewModal
      :show="showVideoPreview"
      :video-url="previewVideoUrl"
      @close="closeVideoPreviewModal"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import AdminLessonModal from '~/components/admin/AdminLessonModal.vue';
import VideoPreviewModal from '~/components/admin/VideoPreviewModal.vue'; // Ensure this exists
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

// --- Constants ---
const PAGE_SIZE = 10; // Number of lessons per page
const SEARCH_DEBOUNCE_MS = 400;

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Composables ---
const supabase = useSupabaseClient<Database>() as SupabaseClient<Database>; // Ensure correct typing

// --- State ---

// List Loading & Data
const isListLoading = ref(true); // Indicates list loading (initial or update)
const fetchError = ref<PostgrestError | null>(null); // For list fetch errors
const lessons = ref<LessonWithRelations[] | null>(null); // Holds lessons for the current page
const totalLessons = ref(0); // Total lessons matching current filters

// Filters, Search, Sort
const searchTerm = ref('');
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const filterCategory = ref<number | null>(null);
const filterCourse = ref<number | null>(null);
const sortBy = ref<'created_at' | 'title'>('created_at');
const sortOrder = ref<'asc' | 'desc'>('desc');

// Filter Options Data
const categories = ref<Tables<'categories'>[]>([]);
const courses = ref<Tables<'study_courses'>[]>([]);
const isLoadingFilters = ref(true); // Loading state for categories/courses

// Pagination
const currentPage = ref(1);

// Actions State
const isDeleting = ref<number | null>(null); // ID of the lesson being deleted
const successMessage = ref<string | null>(null); // Success feedback
const actionError = ref<string | null>(null); // Error feedback for actions

// Modal State
const showModal = ref(false);
const selectedLesson = ref<LessonWithRelations | null>(null);
const showVideoPreview = ref(false);
const previewVideoUrl = ref<string | null>(null);

// --- Define Types ---
type LessonWithRelations = Tables<'lessons'> & {
  categories: Pick<Tables<'categories'>, 'name'> | null;
  study_courses: Pick<Tables<'study_courses'>, 'title'> | null;
};

// --- Computed Properties ---
const totalPages = computed(() => {
  if (totalLessons.value === 0) return 1;
  return Math.ceil(totalLessons.value / PAGE_SIZE);
});

// --- Functions ---

/** Fetch Categories and Courses for filters and modal */
const fetchFilterOptions = async () => {
  isLoadingFilters.value = true;
  try {
    const [catResult, courseResult] = await Promise.all([
      supabase.from('categories').select('id, name').order('name'),
      supabase.from('study_courses').select('id, title').order('title')
    ]);

    if (catResult.error) throw catResult.error;
    if (courseResult.error) throw courseResult.error;

    categories.value = catResult.data || [];
    courses.value = courseResult.data || [];

  } catch (err: any) {
    console.error("Error fetching filter options:", err);
    actionError.value = "فشل تحميل بيانات الفلاتر (التصنيفات/الدورات).";
    // Keep existing data if fetch fails partially? Or clear? Decide based on UX.
    // categories.value = [];
    // courses.value = [];
  } finally {
    isLoadingFilters.value = false;
  }
};

/** Fetch Lessons based on current state (filters, sort, pagination) */
const fetchLessons = async (page = currentPage.value) => {
  isListLoading.value = true;
  fetchError.value = null;
  clearMessages(false); // Keep potential actionError

  const rangeFrom = (page - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;

  try {
    let query = supabase
      .from('lessons')
      .select(`
        id, title, description, youtube_url, audio_url, pdf_transcript_url,
        category_id, course_id, created_at,
        categories!lessons_category_id_fkey ( name ),
        study_courses!fk_course ( title )
      `, { count: 'exact' })
      .order(sortBy.value, { ascending: sortOrder.value === 'asc' })
      .range(rangeFrom, rangeTo);

    // Apply Filters
    if (filterCategory.value !== null) {
      query = query.eq('category_id', filterCategory.value);
    }
    if (filterCourse.value !== null) {
      query = query.eq('course_id', filterCourse.value);
    }

    // Apply Search (on title)
    const trimmedSearch = searchTerm.value.trim();
    if (trimmedSearch) {
      query = query.ilike('title', `%${trimmedSearch}%`);
    }

    // Execute Query
    const { data, error, count } = await query;

    if (error) throw error;

    lessons.value = data as LessonWithRelations[] | null;
    totalLessons.value = count ?? 0;
    currentPage.value = page;

    // Adjust page if current page becomes invalid after filtering/deletion
    if (page > totalPages.value && totalPages.value > 0) {
      changePage(totalPages.value); // This will trigger another fetch via watch
    }

  } catch (err: any) {
    console.error('Error fetching lessons:', err);
    fetchError.value = err as PostgrestError;
    lessons.value = null;
    totalLessons.value = 0;
  } finally {
    isListLoading.value = false;
  }
};

/** Debounced search handler */
const handleSearchInput = () => {
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        if (currentPage.value !== 1) currentPage.value = 1; // Reset page, triggers watch
        else fetchLessons(1); // Fetch directly if already on page 1
    }, SEARCH_DEBOUNCE_MS);
};

/** Change page and trigger fetch */
const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value && newPage !== currentPage.value && !isListLoading.value) {
    currentPage.value = newPage; // Watcher will trigger fetch
  }
};

// Modal Handling
const openAddModal = () => { if (!isListLoading.value && isDeleting.value === null) { selectedLesson.value = null; showModal.value = true; clearMessages(); } };
const openEditModal = (lesson: LessonWithRelations) => { if (!isListLoading.value && isDeleting.value === null) { selectedLesson.value = { ...lesson }; showModal.value = true; clearMessages(); } };
const closeModal = () => { showModal.value = false; selectedLesson.value = null; };
const openVideoPreviewModal = (url: string | null | undefined) => { if (url && !isDeleting.value) { previewVideoUrl.value = url; showVideoPreview.value = true; } };
const closeVideoPreviewModal = () => { showVideoPreview.value = false; previewVideoUrl.value = null; };

/** Handle successful save from modal */
const handleSave = async () => {
  closeModal();
  setSuccessMessage('تم حفظ الدرس بنجاح.');
  // Refetch current page to show updated data
  await fetchLessons(currentPage.value);
};

/** Confirm and delete a lesson */
const confirmDelete = async (lesson: LessonWithRelations) => {
  if (isDeleting.value !== null || isListLoading.value) return;

  if (window.confirm(`هل أنت متأكد أنك تريد حذف الدرس "${lesson.title}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
    isDeleting.value = lesson.id;
    clearMessages();

    try {
      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id);

      if (deleteError) throw deleteError;

      setSuccessMessage('تم حذف الدرس بنجاح.');
      // Refetch current page. It might shift items or reduce total pages.
      await fetchLessons(currentPage.value);

    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      setActionError(`فشل حذف الدرس: ${err.message || 'خطأ غير معروف'}.`);
    } finally {
      isDeleting.value = null;
    }
  }
};

// --- Helper Functions ---
const formatDate = (dateString: string | null): string => { /* ... (same as before) ... */ if (!dateString) return '-'; try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'تاريخ غير صالح'; return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return 'خطأ تنسيق'; } };
const getYoutubeVideoId = (url: string | null | undefined): string | null => { /* ... (same as before) ... */ if (!url) return null; try { const urlObj = new URL(url); if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1); if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) return urlObj.searchParams.get('v'); } catch (e) { /* fallback for non-URL strings */ } const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/; const match = url.match(regex); return match?.[1] || null; };
const getYoutubeThumbnail = (url: string | null | undefined): string | null => { const videoId = getYoutubeVideoId(url); return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null; };
const setSuccessMessage = (msg: string) => { successMessage.value = msg; actionError.value = null; setTimeout(() => { successMessage.value = null; }, 4000); };
const setActionError = (msg: string) => { actionError.value = msg; successMessage.value = null; setTimeout(() => { actionError.value = null; }, 6000); };
const clearMessages = (clearActionErr = true) => { successMessage.value = null; if (clearActionErr) actionError.value = null; };

// --- Watchers ---
// Watch filters, search, and sort changes to refetch data, resetting to page 1
watch([filterCategory, filterCourse, searchTerm, sortBy, sortOrder], () => {
    if (currentPage.value !== 1) {
        currentPage.value = 1; // Reset page, which triggers the currentPage watcher
    } else {
        fetchLessons(1); // Fetch page 1 directly if already there
    }
});

// Watch currentPage changes to fetch the new page
watch(currentPage, (newPage) => {
    fetchLessons(newPage);
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  isListLoading.value = true; // Ensure loading state is true initially
  isLoadingFilters.value = true;
  await Promise.all([
    fetchLessons(1),         // Fetch initial lessons page
    fetchFilterOptions()     // Fetch categories and courses
  ]);
  // Loading states are handled within respective functions
});

</script>

<style scoped>
/* Add specific styles if needed */
.max-w-xs { max-width: 20rem; /* Adjust as needed for title truncation */ }
</style>