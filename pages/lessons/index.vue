<!-- pages/lessons/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">

    <!-- حالة التحميل الأولي -->
    <div v-if="pending && currentPage === 1" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive-green"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل السلاسل والدروس...</p>
    </div>

    <!-- حالة الخطأ العام عند التحميل الأولي -->
    <div v-else-if="error && currentPage === 1" class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-2xl mx-auto">
       <p class="text-red-600 dark:text-red-400 font-semibold mb-2 text-lg">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 inline-block align-middle me-1" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
         عذرًا، حدث خطأ أثناء التحميل.
       </p>
       <pre v-if="error.message" class="mt-1 text-xs text-left bg-red-100 dark:bg-red-800/30 p-2 rounded border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 whitespace-pre-wrap">{{ error.message }}</pre>
       <button @click="refreshInitialData" class="mt-6 px-5 py-2 bg-olive-green text-white rounded hover:bg-opacity-80 transition-colors text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block align-middle me-1"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
         إعادة المحاولة
       </button>
     </div>

    <!-- عرض السلاسل (الفئات) والدروس -->
    <div v-else-if="allCategoriesWithLessons && allCategoriesWithLessons.length > 0" class="space-y-12">
      <div v-for="category in allCategoriesWithLessons" :key="category.id" class="category-section">
        <h2 class="text-2xl font-semibold mb-4 text-brown-dark dark:text-beige-light border-b border-gray-300 dark:border-gray-700 pb-2">
          {{ category.name }}
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ms-2">({{ category.totalLessonsCount }} درس)</span>
        </h2>

        <!-- عرض الدروس لهذه الفئة -->
        <div v-if="category.lessons && category.lessons.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
          <LessonCard
            v-for="lesson in category.lessons"
            :key="lesson.id"
            :lesson="lesson"
          />
        </div>
         <p v-else class="text-gray-500 dark:text-gray-400 mt-4">لا توجد دروس متاحة حاليًا في هذه السلسلة.</p>

         <!-- زر ومؤشر تحميل المزيد من الدروس للسلسلة الحالية -->
         <div v-if="category.loadedLessonsCount < category.totalLessonsCount" class="mt-6 text-center">
             <button
                @click="loadMoreLessonsForCategory(category.id)"
                :disabled="category.isLoadingMoreLessons"
                class="text-olive-green hover:underline font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <span v-if="!category.isLoadingMoreLessons">
                    تحميل المزيد من الدروس
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 inline-block align-middle ms-1">
                       <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                     </svg>
                </span>
                <span v-else>
                     <div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-olive-green me-1 align-middle"></div>
                     جارٍ التحميل...
                </span>
             </button>
         </div>
          <p v-if="category.errorLoadingMore" class="mt-2 text-center text-sm text-red-600 dark:text-red-400">
             حدث خطأ أثناء تحميل المزيد من الدروس.
          </p>

      </div>

      <!-- عنصر مراقبة التحميل اللانهائي للسلاسل -->
       <div ref="infiniteScrollTriggerElement" class="h-10 flex justify-center items-center">
            <!-- مؤشر تحميل المزيد من السلاسل (يظهر هنا عند الاقتراب) -->
           <div v-if="loadingMoreCategories && !noMoreCategories" class="text-center py-6">
               <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-olive-green"></div>
               <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">جارٍ تحميل المزيد من السلاسل...</p>
           </div>
       </div>

       <!-- رسالة عند انتهاء تحميل كل السلاسل -->
       <div v-if="noMoreCategories && !pending && !loadingMoreCategories" class="text-center py-6 text-gray-500 dark:text-gray-400">
           ~ نهاية قائمة السلاسل ~
       </div>
       <!-- رسالة خطأ عند تحميل المزيد من السلاسل -->
        <div v-if="error && currentPage > 1" class="text-center py-6 text-red-600 dark:text-red-400">
          حدث خطأ أثناء تحميل المزيد من السلاسل. حاول التمرير للأسفل مرة أخرى.
        </div>

    </div>

    <!-- حالة عدم وجود أي فئات أو دروس بعد التحميل الأولي -->
    <div v-else-if="!pending && (!allCategoriesWithLessons || allCategoriesWithLessons.length === 0)" class="text-center py-16 text-gray-500 dark:text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mb-4 mx-auto text-gray-400 dark:text-gray-500" aria-hidden="true"><path d="M3.41 1.86L2 3.27l4.22 4.22c-.15.19-.22.44-.22.71v10c0 .55.45 1 1 1h12c.34 0 .65-.17.83-.42L20.73 21l1.41-1.41L3.41 1.86M7 18V9.54l8.46 8.46H7m5-8l-2-2H7V8l3.18 3.18L12 10m5 0v-.73L15.27 7.54C15.61 7.2 16.09 7 16.63 7H17v-.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5V7h.5a.5.5 0 0 1 .5.5V12h-2v-2z"/></svg>
      <p class="text-lg">لا توجد سلاسل دروس متاحة حاليًا.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useSupabaseClient, useHead } from '#imports';
import LessonCard from '~/components/LessonCard.vue';
import type { Database, Tables } from '~/types/database.types';

// Define Types
type Lesson = Pick<Tables<'lessons'>, 'id' | 'title' | 'description' | 'youtube_url' | 'created_at'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;

interface CategoryWithLessons extends Category {
  lessons: Lesson[];                 // الدروس المحملة حاليًا لهذه السلسلة
  totalLessonsCount: number;        // العدد الإجمالي للدروس في قاعدة البيانات لهذه السلسلة
  loadedLessonsCount: number;       // عدد الدروس التي تم تحميلها وعرضها حاليًا
  isLoadingMoreLessons: boolean;    // هل يتم حاليًا تحميل المزيد من الدروس لهذه السلسلة؟
  errorLoadingMore: boolean;        // هل حدث خطأ أثناء تحميل المزيد من الدروس؟
}

// Constants
const INITIAL_LESSONS_TO_SHOW = 8; // عدد الدروس لعرضه مبدئيًا لكل سلسلة
const LESSONS_PER_PAGE = 12;       // عدد الدروس لتحميلها في كل مرة "تحميل المزيد"
const CATEGORIES_PER_PAGE = 5;     // عدد السلاسل لتحميلها في كل مرة تمرير لانهائي

// Supabase client
const client = useSupabaseClient<Database>();

// Reactive State
const allCategoriesWithLessons = ref<CategoryWithLessons[]>([]); // Holds ALL fetched categories and their lessons
const pending = ref(true);        // Initial loading state
const error = ref<any>(null);     // Stores any fetch error (for initial load or loading more categories)
const currentPage = ref(1);       // Current page for category pagination
const loadingMoreCategories = ref(false); // State for loading more categories via infinite scroll
const noMoreCategories = ref(false); // Flag when all categories are loaded

// --- Data Fetching Logic ---

/**
 * Fetches a page of categories and the initial batch of lessons for each.
 * Also fetches the total lesson count for each category.
 */
const fetchCategoriesAndLessons = async (page: number = 1): Promise<CategoryWithLessons[]> => {
  console.log(`Fetching categories page ${page}...`);
  const from = (page - 1) * CATEGORIES_PER_PAGE;
  const to = from + CATEGORIES_PER_PAGE - 1;

  // 1. Fetch categories for the current page
  const { data: categoriesData, error: categoriesError } = await client
    .from('categories')
    .select('id, name')
    // TODO: Add any necessary filters (e.g., type)
    .order('created_at', { ascending: false }) // Or order by name, etc.
    .range(from, to);

  if (categoriesError) throw categoriesError;
  if (!categoriesData || categoriesData.length === 0) {
      console.log("No more categories found.");
      noMoreCategories.value = true;
      return []; // No more categories to fetch
  }

  console.log(`Fetched ${categoriesData.length} categories for page ${page}. Fetching initial lessons and counts...`);

  // 2. Fetch initial lessons and total count for each fetched category
  const categoriesWithLessonsPromises = categoriesData.map(async (category) => {
    try {
      const { data: lessonsData, error: lessonsError, count } = await client
        .from('lessons')
        .select('id, title, description, youtube_url, created_at', { count: 'exact' }) // Get total count
        .eq('category_id', category.id)
        .is('course_id', null) // Ensure it's a general lesson, not part of a course
        .order('created_at', { ascending: false }) // Or desired lesson order
        .limit(INITIAL_LESSONS_TO_SHOW);          // Fetch only the initial batch

      if (lessonsError) {
        console.error(`Error fetching initial lessons for category ${category.id}:`, lessonsError);
        // Return category with 0 lessons and count if fetch fails
        return {
            ...category,
            lessons: [],
            totalLessonsCount: 0,
            loadedLessonsCount: 0,
            isLoadingMoreLessons: false,
            errorLoadingMore: false,
        };
      }

      const totalCount = count ?? 0;
      const initialLessons = lessonsData || [];

      return {
          ...category,
          lessons: initialLessons,
          totalLessonsCount: totalCount,
          loadedLessonsCount: initialLessons.length,
          isLoadingMoreLessons: false,
          errorLoadingMore: false,
      };
    } catch (err) {
        // Catch potential errors during the process for this specific category
        console.error(`Failed processing category ${category.id}:`, err);
         return {
            ...category,
            lessons: [],
            totalLessonsCount: 0,
            loadedLessonsCount: 0,
            isLoadingMoreLessons: false,
            errorLoadingMore: true, // Indicate an error occurred for this category
        };
    }
  });

  return await Promise.all(categoriesWithLessonsPromises);
};

/**
 * Loads the next batch of lessons for a specific category.
 */
const loadMoreLessonsForCategory = async (categoryId: number) => {
    const category = allCategoriesWithLessons.value.find(c => c.id === categoryId);
    if (!category || category.isLoadingMoreLessons || category.loadedLessonsCount >= category.totalLessonsCount) {
        return; // Exit if category not found, already loading, or all lessons loaded
    }

    console.log(`Loading more lessons for category ${categoryId}...`);
    category.isLoadingMoreLessons = true;
    category.errorLoadingMore = false; // Reset error state

    try {
        const from = category.loadedLessonsCount; // Start fetching after the last loaded lesson
        const to = from + LESSONS_PER_PAGE - 1;

        const { data: newLessons, error: lessonsError } = await client
            .from('lessons')
            .select('id, title, description, youtube_url, created_at')
            .eq('category_id', category.id)
            .is('course_id', null)
            .order('created_at', { ascending: false }) // Ensure consistent ordering
            .range(from, to);

        if (lessonsError) throw lessonsError;

        if (newLessons && newLessons.length > 0) {
            category.lessons.push(...newLessons); // Append new lessons
            category.loadedLessonsCount += newLessons.length; // Update loaded count
        }
        // If newLessons is empty or null, it might mean we've reached the end unexpectedly
        // or there was an issue. The button should naturally disappear if loadedCount >= totalCount.

    } catch (err: any) {
        console.error(`Error loading more lessons for category ${categoryId}:`, err);
        category.errorLoadingMore = true; // Set error state for this category
        // Optionally: display a message to the user near the button
    } finally {
        category.isLoadingMoreLessons = false;
    }
};


// --- Infinite Scrolling Logic for Categories ---
const infiniteScrollTriggerElement = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const loadMoreCategories = async () => {
    if (loadingMoreCategories.value || noMoreCategories.value || error.value) return; // Prevent multiple loads or loading if no more data or if there was a previous error loading more

    loadingMoreCategories.value = true;
    error.value = null; // Clear previous 'load more' error before trying again
    console.log("Loading more categories...");
    try {
        currentPage.value++; // Go to the next page
        const newCategories = await fetchCategoriesAndLessons(currentPage.value);
        if (newCategories.length > 0) {
             allCategoriesWithLessons.value.push(...newCategories); // Append new categories
        }
        // noMoreCategories flag is set inside fetchCategoriesAndLessons if needed
    } catch (err: any) {
        console.error("Error loading more categories:", err);
        error.value = err; // Store the error to display a message
        currentPage.value--; // Optional: Roll back page number on error? Or allow retry on next scroll.
    } finally {
        loadingMoreCategories.value = false;
    }
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  await refreshInitialData(); // Load initial data when component mounts

  // Setup Intersection Observer for infinite category loading
  if (infiniteScrollTriggerElement.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !pending.value) { // Only trigger if not initial loading
          console.log("Infinite scroll trigger intersected!");
          loadMoreCategories(); // Load more categories when trigger is visible
        }
      },
      { threshold: 0.1 } // Trigger when 10% of the element is visible
    );
    observer.observe(infiniteScrollTriggerElement.value);
    console.log("Infinite scroll observer attached.");
  } else {
      console.warn("Infinite scroll trigger element not found on mount.");
  }
});

onUnmounted(() => {
  // Clean up Observer when component unmounts
  if (observer && infiniteScrollTriggerElement.value) {
    observer.unobserve(infiniteScrollTriggerElement.value);
    console.log("Infinite scroll observer disconnected.");
  }
  observer = null;
});


// --- Helper Functions ---
/**
 * Fetches the initial set of data (first page of categories and their lessons).
 * Resets state before fetching.
 */
const refreshInitialData = async () => {
    console.log("Refreshing initial data...");
    pending.value = true;
    error.value = null;
    noMoreCategories.value = false;
    currentPage.value = 1;
    allCategoriesWithLessons.value = []; // Clear existing data

     try {
      const initialData = await fetchCategoriesAndLessons(1);
      allCategoriesWithLessons.value = initialData;
       // Check if the first fetch already means no more categories
       if (initialData.length < CATEGORIES_PER_PAGE) {
          noMoreCategories.value = true;
       }
    } catch (err: any) {
      console.error("Error during initial data refresh:", err)
      error.value = err; // Catch initial fetch error
    } finally {
      pending.value = false; // End initial loading state
    }
};

// --- SEO ---
useHead({
  title: 'سلاسل الدروس - موقع الشيخ إبراهيم بشندي', // Added Title
  meta: [
    { name: 'description', content: 'تصفح واستمع إلى سلاسل الدروس والمحاضرات العامة للشيخ إبراهيم بشندي في مختلف العلوم الشرعية.' }
    // Add other relevant meta tags (keywords, canonical, etc.) if needed
  ]
})

</script>

<style scoped>
/* Add a subtle bottom border between category sections */
.category-section:not(:last-child) {
  border-bottom: 1px solid theme('colors.gray.200');
  @apply dark:border-gray-700;
  padding-bottom: theme('spacing.12'); /* pb-12 */
}

/* Scoped styles remain as they were */
</style>