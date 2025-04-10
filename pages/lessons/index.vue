<template>
  <div class="container mx-auto px-10 ">

    <!-- Filter Bar -->
    <div class="mb-8">
      <div class="flex flex-wrap items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 ms-2">تصفية حسب السلسلة:</span>
        <!-- All Button -->
        <button
          @click="selectCategory(null)"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-olive-green',
            selectedCategoryId === null
              ? 'bg-olive-green text-white shadow'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          الكل
        </button>
        <!-- Category Buttons -->
        <button
          v-for="filterCat in filterCategories"
          :key="filterCat.id"
          @click="selectCategory(filterCat.id)"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-olive-green',
            selectedCategoryId === filterCat.id
              ? 'bg-olive-green text-white shadow'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ filterCat.name }}
        </button>
         <!-- Loading/Error for Filters -->
          <div v-if="loadingFilters" class="text-sm text-gray-500">جار تحميل الفلاتر...</div>
          <div v-if="filterError" class="text-sm text-red-500">خطأ تحميل الفلاتر.</div>
      </div>
    </div>

    <!-- Loading State (Initial or Filter Change) -->
     <div v-if="pending" class="text-center py-10"> 
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive-green"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">
           {{ selectedCategoryId ? 'جارٍ تحميل دروس السلسلة المختارة...' : 'جارٍ تحميل السلاسل والدروس...' }}
        </p>
    </div>

    <!-- Error State (Initial or Filter Change) -->
     <div v-else-if="error" class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-2xl mx-auto">
       <p class="text-red-600 dark:text-red-400 font-semibold mb-2 text-lg">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 inline-block align-middle me-1" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
          {{ selectedCategoryId ? 'عذرًا، حدث خطأ أثناء تحميل دروس السلسلة.' : 'عذرًا، حدث خطأ أثناء التحميل الأولي.' }}
       </p>
       <pre v-if="error.message" class="mt-1 text-xs text-left bg-red-100 dark:bg-red-800/30 p-2 rounded border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 whitespace-pre-wrap">{{ error.message }}</pre>
       <button @click="refreshInitialData" class="mt-6 px-5 py-2 bg-olive-green text-white rounded hover:bg-opacity-80 transition-colors text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block align-middle me-1"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          {{ selectedCategoryId ? 'إعادة تحميل السلسلة' : 'إعادة المحاولة' }}
       </button>
     </div>

    <!-- Display Categories and Lessons -->
    <div v-else-if="allCategoriesWithLessons && allCategoriesWithLessons.length > 0" class="space-y-12">
      <div v-for="category in allCategoriesWithLessons" :key="category.id" class="category-section">
        <h2 class="text-2xl font-semibold mb-4 text-brown-dark dark:text-beige-light border-b border-gray-300 dark:border-gray-700 pb-2">
          {{ category.name }}
          <span class="text-sm font-normal text-gray-500 dark:text-gray-400 ms-2">({{ category.totalLessonsCount }} درس)</span>
        </h2>

        <!-- Display lessons for this category -->
        <div v-if="category.lessons && category.lessons.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
          <LessonCard
            v-for="lesson in category.lessons"
            :key="lesson.id"
            :lesson="lesson"
          />
        </div>
         <p v-else class="text-gray-500 dark:text-gray-400 mt-4">لا توجد دروس متاحة حاليًا في هذه السلسلة.</p>

         <!-- Load More Lessons Button for the current category -->
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

       <!-- Infinite Scroll Trigger for Categories (Only active when NO filter is selected) -->
        <div ref="infiniteScrollTriggerElement" v-show="selectedCategoryId === null" class="h-10 flex justify-center items-center">
           <div v-if="loadingMoreCategories && !noMoreCategories" class="text-center py-6">
               <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-olive-green"></div>
               <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">جارٍ تحميل المزيد من السلاسل...</p>
           </div>
        </div>

       <!-- Message when all categories are loaded (Only shown when NO filter is selected) -->
       <div v-if="noMoreCategories && selectedCategoryId === null && !pending && !loadingMoreCategories" class="text-center py-6 text-gray-500 dark:text-gray-400">
           ~ نهاية قائمة السلاسل ~
       </div>
       <!-- Error message when loading more categories (Only shown when NO filter is selected) -->
        <div v-if="error && currentPage > 1 && selectedCategoryId === null" class="text-center py-6 text-red-600 dark:text-red-400">
          حدث خطأ أثناء تحميل المزيد من السلاسل. حاول التمرير للأسفل مرة أخرى.
        </div>

    </div>

    <!-- No categories/lessons found state -->
    <div v-else-if="!pending && (!allCategoriesWithLessons || allCategoriesWithLessons.length === 0)" class="text-center py-16 text-gray-500 dark:text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mb-4 mx-auto text-gray-400 dark:text-gray-500" aria-hidden="true"><path d="M3.41 1.86L2 3.27l4.22 4.22c-.15.19-.22.44-.22.71v10c0 .55.45 1 1 1h12c.34 0 .65-.17.83-.42L20.73 21l1.41-1.41L3.41 1.86M7 18V9.54l8.46 8.46H7m5-8l-2-2H7V8l3.18 3.18L12 10m5 0v-.73L15.27 7.54C15.61 7.2 16.09 7 16.63 7H17v-.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5V7h.5a.5.5 0 0 1 .5.5V12h-2v-2z"/></svg>
      <p class="text-lg">
         {{ selectedCategoryId ? 'لا توجد دروس متاحة حاليًا في هذه السلسلة.' : 'لا توجد سلاسل دروس متاحة حاليًا.' }}
      </p>
      <button v-if="selectedCategoryId" @click="selectCategory(null)" class="mt-4 text-sm text-olive-green hover:underline">
         عرض كل السلاسل
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'; // Added watch
import { useSupabaseClient, useHead } from '#imports';
import LessonCard from '~/components/LessonCard.vue';
import type { Database, Tables } from '~/types/database.types';

// Define Types
type Lesson = Pick<Tables<'lessons'>, 'id' | 'title' | 'description' | 'youtube_url' | 'created_at'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;

interface CategoryWithLessons extends Category {
  lessons: Lesson[];
  totalLessonsCount: number;
  loadedLessonsCount: number;
  isLoadingMoreLessons: boolean;
  errorLoadingMore: boolean;
}

// Constants
const INITIAL_LESSONS_TO_SHOW = 8;
const LESSONS_PER_PAGE = 12;
const CATEGORIES_PER_PAGE = 5;

// Supabase client
const client = useSupabaseClient<Database>();

// Reactive State
const filterCategories = ref<Category[]>([]); // Categories for the filter bar
const loadingFilters = ref(false);
const filterError = ref<any>(null);
const selectedCategoryId = ref<number | null>(null); // null means 'All'

const allCategoriesWithLessons = ref<CategoryWithLessons[]>([]);
const pending = ref(true); // Main loading state (initial or after filter change)
const error = ref<any>(null); // Main error state
const currentPage = ref(1); // Category pagination page (used when 'All' is selected)
const loadingMoreCategories = ref(false);
const noMoreCategories = ref(false);

// --- Filter Categories Fetch ---
const fetchFilterCategories = async () => {
    loadingFilters.value = true;
    filterError.value = null;
    try {
        const { data, error } = await client
            .from('categories')
            .select('id, name')
            // TODO: Add .eq('type', 'lesson') if you have types distinguishing lesson categories
            .order('name', { ascending: true }); // Order alphabetically for filter bar

        if (error) throw error;
        filterCategories.value = data || [];
        console.log("Filter categories loaded:", filterCategories.value);
    } catch (err) {
        console.error("Error fetching filter categories:", err);
        filterError.value = err;
    } finally {
        loadingFilters.value = false;
    }
};

// --- Main Data Fetching Logic ---
const fetchCategoriesAndLessons = async (page: number = 1, categoryId: number | null = null): Promise<CategoryWithLessons[]> => {
  console.log(`Fetching data. Page: ${page}, Selected Category ID: ${categoryId}`);
  const from = (page - 1) * CATEGORIES_PER_PAGE;
  const to = from + CATEGORIES_PER_PAGE - 1;

  // 1. Build Category Query based on filter
  let categoryQuery = client.from('categories').select('id, name');

  if (categoryId !== null) {
    // If a specific category is selected, fetch only that one
    categoryQuery = categoryQuery.eq('id', categoryId);
    console.log(`Fetching specific category: ${categoryId}`);
  } else {
    // If 'All' is selected, fetch categories paginated
    categoryQuery = categoryQuery
      // .eq('type', 'lesson') // Optional: If you need to filter category types
      .order('created_at', { ascending: false })
      .range(from, to);
      console.log(`Fetching category page ${page} (range ${from}-${to})`);
  }

  const { data: categoriesData, error: categoriesError } = await categoryQuery;

  if (categoriesError) throw categoriesError;

  // Handle case where filtered category doesn't exist or no more categories for 'All'
  if (!categoriesData || categoriesData.length === 0) {
      if (categoryId !== null) {
          console.warn(`Filtered category ${categoryId} not found.`);
          // Optionally, clear the selection or show a specific message
          // selectedCategoryId.value = null; // Example: revert to 'All'
          // throw new Error(`السلسلة المختارة غير موجودة.`);
          return []; // Return empty to show "No lessons found" message
      } else {
          console.log("No more categories found for pagination.");
          noMoreCategories.value = true; // Set flag for 'All' view
          return [];
      }
  }

  console.log(`Fetched ${categoriesData.length} categories. Fetching lessons and counts...`);

  // 2. Fetch initial lessons and total count for each fetched category
  const categoriesWithLessonsPromises = categoriesData.map(async (category) => {
    // This part remains the same as before
    try {
      const { data: lessonsData, error: lessonsError, count } = await client
        .from('lessons')
        .select('id, title, description, youtube_url, created_at', { count: 'exact' })
        .eq('category_id', category.id)
        .is('course_id', null)
        .order('created_at', { ascending: false })
        .limit(INITIAL_LESSONS_TO_SHOW);

      if (lessonsError) {
        console.error(`Error fetching initial lessons for category ${category.id}:`, lessonsError);
        return { ...category, lessons: [], totalLessonsCount: 0, loadedLessonsCount: 0, isLoadingMoreLessons: false, errorLoadingMore: true };
      }
      const totalCount = count ?? 0;
      const initialLessons = lessonsData || [];
      return { ...category, lessons: initialLessons, totalLessonsCount: totalCount, loadedLessonsCount: initialLessons.length, isLoadingMoreLessons: false, errorLoadingMore: false };
    } catch (err) {
        console.error(`Failed processing category ${category.id}:`, err);
        return { ...category, lessons: [], totalLessonsCount: 0, loadedLessonsCount: 0, isLoadingMoreLessons: false, errorLoadingMore: true };
    }
  });

  return await Promise.all(categoriesWithLessonsPromises);
};

// --- Load More Lessons (Remains the same) ---
const loadMoreLessonsForCategory = async (categoryId: number) => {
    const category = allCategoriesWithLessons.value.find(c => c.id === categoryId);
    if (!category || category.isLoadingMoreLessons || category.loadedLessonsCount >= category.totalLessonsCount) return;

    console.log(`Loading more lessons for category ${categoryId}...`);
    category.isLoadingMoreLessons = true;
    category.errorLoadingMore = false;

    try {
        const from = category.loadedLessonsCount;
        const to = from + LESSONS_PER_PAGE - 1;
        const { data: newLessons, error: lessonsError } = await client
            .from('lessons')
            .select('id, title, description, youtube_url, created_at')
            .eq('category_id', category.id)
            .is('course_id', null)
            .order('created_at', { ascending: false })
            .range(from, to);

        if (lessonsError) throw lessonsError;
        if (newLessons && newLessons.length > 0) {
            category.lessons.push(...newLessons);
            category.loadedLessonsCount += newLessons.length;
        }
    } catch (err: any) {
        console.error(`Error loading more lessons for category ${categoryId}:`, err);
        category.errorLoadingMore = true;
    } finally {
        category.isLoadingMoreLessons = false;
    }
};

// --- Infinite Scrolling for Categories (Only when 'All' is selected) ---
const infiniteScrollTriggerElement = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const loadMoreCategories = async () => {
    // *** Add check for selectedCategoryId ***
    if (loadingMoreCategories.value || noMoreCategories.value || error.value || selectedCategoryId.value !== null) {
         console.log("Skipping load more categories (loading, no more, error, or filter active).");
         return;
    }

    loadingMoreCategories.value = true;
    error.value = null;
    console.log("Loading more categories...");
    try {
        currentPage.value++;
        // *** Pass null for categoryId to fetch paginated categories ***
        const newCategories = await fetchCategoriesAndLessons(currentPage.value, null);
        if (newCategories.length > 0) {
             allCategoriesWithLessons.value.push(...newCategories);
        }
        // noMoreCategories flag handled inside fetchCategoriesAndLessons
    } catch (err: any) {
        console.error("Error loading more categories:", err);
        error.value = err;
        currentPage.value--;
    } finally {
        loadingMoreCategories.value = false;
    }
};

// --- Initial Data Load and Refresh ---
const refreshInitialData = async () => {
    console.log("Refreshing data with selected category:", selectedCategoryId.value);
    pending.value = true; // Set main loading state
    error.value = null;
    noMoreCategories.value = false; // Reset no more flag
    currentPage.value = 1; // Reset page count
    allCategoriesWithLessons.value = []; // Clear existing data

     try {
      // *** Pass the currently selected category ID (or null) ***
      const initialData = await fetchCategoriesAndLessons(1, selectedCategoryId.value);
      allCategoriesWithLessons.value = initialData;
       // Check if no more applies (only relevant if 'All' was selected)
       if (selectedCategoryId.value === null && initialData.length < CATEGORIES_PER_PAGE) {
          noMoreCategories.value = true;
       }
    } catch (err: any) {
      console.error("Error during data refresh:", err)
      error.value = err;
    } finally {
      pending.value = false; // End loading state
    }
};

// --- Filter Selection ---
const selectCategory = (categoryId: number | null) => {
  if (selectedCategoryId.value === categoryId) return; // Do nothing if already selected

  console.log(`Selecting category: ${categoryId === null ? 'All' : categoryId}`);
  selectedCategoryId.value = categoryId;
  // Re-fetch data based on the new selection
  refreshInitialData();
};


// --- Lifecycle Hooks ---
onMounted(async () => {
  await fetchFilterCategories(); // Fetch filter buttons first
  await refreshInitialData(); // Then load initial data ('All' by default)

  // Setup Intersection Observer
  if (infiniteScrollTriggerElement.value) {
    observer = new IntersectionObserver(
      (entries) => {
        // *** Trigger only if 'All' is selected and trigger is visible ***
        if (entries[0].isIntersecting && !pending.value && selectedCategoryId.value === null) {
          console.log("Infinite scroll trigger intersected (All view)!");
          loadMoreCategories();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(infiniteScrollTriggerElement.value);
    console.log("Infinite scroll observer attached.");
  } else {
      console.warn("Infinite scroll trigger element not found on mount.");
  }
});

onUnmounted(() => {
  if (observer && infiniteScrollTriggerElement.value) {
    observer.unobserve(infiniteScrollTriggerElement.value);
    console.log("Infinite scroll observer disconnected.");
  }
  observer = null;
});

// --- SEO ---
useHead({
  title: 'سلاسل الدروس - موقع الشيخ إبراهيم بشندي',
  meta: [
    { name: 'description', content: 'تصفح واستمع إلى سلاسل الدروس والمحاضرات العامة للشيخ إبراهيم بشندي في مختلف العلوم الشرعية.' }
  ]
})

</script>

<style scoped>
.category-section:not(:last-child) {
  border-bottom: 1px solid theme('colors.gray.200');
  @apply dark:border-gray-700;
  padding-bottom: theme('spacing.12'); /* pb-12 */
}
</style>