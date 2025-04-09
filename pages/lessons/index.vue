<!-- pages/lessons/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">

    <!-- حالة التحميل الأولي -->
    <div v-if="pending && currentPage === 1" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive-green"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل السلاسل والدروس...</p>
    </div>

    <!-- حالة الخطأ العام -->
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
        </h2>

        <!-- عرض الدروس لهذه الفئة -->
        <div v-if="category.lessons && category.lessons.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
           <!-- عرض الدروس بناءً على حالة 'showAll' -->
          <LessonCard
            v-for="lesson in (category.showAll ? category.lessons : category.lessons.slice(0, initialLessonsToShow))"
            :key="lesson.id"
            :lesson="lesson"
          />
        </div>
         <p v-else class="text-gray-500 dark:text-gray-400">لا توجد دروس متاحة حاليًا في هذه السلسلة.</p>

         <!-- زر عرض المزيد / أقل -->
         <div v-if="category.hasMore" class="mt-4 text-center">
             <button @click="toggleShowMore(category.id)" class="text-olive-green hover:underline font-medium text-sm">
                <span v-if="category.showAll">عرض أقل</span>
                <span v-else>عرض المزيد</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 inline-block align-middle ms-1 transition-transform duration-200" :class="{'rotate-180': category.showAll}">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
             </button>
         </div>

      </div>

      <!-- عنصر مراقبة التحميل اللانهائي للسلاسل -->
       <div ref="infiniteScrollTriggerElement" class="h-10"></div> <!-- عنصر فارغ للرصد -->
       <!-- مؤشر تحميل المزيد من السلاسل -->
       <div v-if="loadingMoreCategories && !noMoreCategories" class="text-center py-6">
           <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-olive-green"></div>
           <p class="text-sm text-gray-500 mt-2">جارٍ تحميل المزيد من السلاسل...</p>
       </div>
       <!-- رسالة عند انتهاء تحميل كل السلاسل -->
       <div v-if="noMoreCategories && !pending" class="text-center py-6 text-gray-500 dark:text-gray-400">
           ~ نهاية القائمة ~
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
import { ref, onMounted, onUnmounted, watch } from 'vue' // أضفنا onUnmounted و watch
import { useSupabaseClient, useHead } from '#imports' // أزلنا useAsyncData
import LessonCard from '~/components/LessonCard.vue'
import type { Database, Tables } from '~/types/database.types'

// Define Types
type Lesson = Pick<Tables<'lessons'>, 'id' | 'title' | 'description' | 'youtube_url' | 'created_at'>
type Category = Pick<Tables<'categories'>, 'id' | 'name'>

interface CategoryWithLessons extends Category {
  lessons: Lesson[]; // قائمة الدروس - ستُملأ دائمًا
  hasMore: boolean; // هل هناك دروس أكثر مما هو معروض؟
  showAll: boolean; // هل يجب عرض كل الدروس؟
}

const client = useSupabaseClient<Database>()
const initialLessonsToShow = ref(4); // Number of lessons to show initially per category
const categoriesPerPage = ref(5); // How many categories to fetch per infinite scroll load
const currentPage = ref(1); // Current page for category pagination

// State
const allCategoriesWithLessons = ref<CategoryWithLessons[]>([]); // Holds ALL fetched categories and their lessons
const pending = ref(true); // Initial loading state
const error = ref<any>(null); // Stores any fetch error
const loadingMoreCategories = ref(false); // State for loading more categories
const noMoreCategories = ref(false); // Flag when all categories are loaded

// --- Data Fetching Logic ---
const fetchCategoriesAndLessons = async (page: number = 1): Promise<CategoryWithLessons[]> => {
  console.log(`Fetching categories page ${page}...`);
  const from = (page - 1) * categoriesPerPage.value;
  const to = from + categoriesPerPage.value - 1;

  // 1. Fetch categories for the current page
  const { data: categoriesData, error: categoriesError } = await client
    .from('categories')
    .select('id, name')
    // Add filters if needed (e.g., only categories of type 'lesson_series')
    .order('name') // Or order by another criteria
    .range(from, to);

  if (categoriesError) throw categoriesError;
  if (!categoriesData || categoriesData.length === 0) {
      console.log("No more categories found.");
      noMoreCategories.value = true; // Set the flag
      return []; // No more categories to fetch
  }

  console.log(`Fetched ${categoriesData.length} categories for page ${page}. Fetching their lessons...`);

  // 2. Fetch initial lessons for each fetched category
  const categoriesWithLessonsPromises = categoriesData.map(async (category) => {
    const { data: lessonsData, error: lessonsError, count } = await client
      .from('lessons')
      .select('id, title, description, youtube_url, created_at', { count: 'exact' }) // Fetch count
      .eq('category_id', category.id)
      .is('course_id', null)
      .order('created_at', { ascending: false })
      .limit(initialLessonsToShow.value); // Fetch only the initial amount

    if (lessonsError) {
      console.error(`Error fetching lessons for category ${category.id}:`, lessonsError);
      return { ...category, lessons: [], hasMore: false, showAll: false }; // Return empty lessons on error
    }

    const totalLessonsCount = count ?? 0;
    const hasMoreLessons = totalLessonsCount > initialLessonsToShow.value;

    return {
        ...category,
        lessons: lessonsData || [],
        hasMore: hasMoreLessons, // Determine if there are more lessons
        showAll: false // Initially don't show all
    };
  });

  return await Promise.all(categoriesWithLessonsPromises);
};

// --- Infinite Scrolling Logic ---
const infiniteScrollTriggerElement = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const loadMoreCategories = async () => {
    if (loadingMoreCategories.value || noMoreCategories.value) return; // Prevent multiple simultaneous loads or loading if no more data

    loadingMoreCategories.value = true;
    console.log("Loading more categories...");
    try {
        currentPage.value++; // Go to the next page
        const newCategories = await fetchCategoriesAndLessons(currentPage.value);
        if (newCategories.length > 0) {
             allCategoriesWithLessons.value.push(...newCategories); // Append new categories
        }
    } catch (err: any) {
        console.error("Error loading more categories:", err);
        // Handle error display if needed, maybe stop trying to load more
        error.value = err; // Store the error
    } finally {
        loadingMoreCategories.value = false;
    }
};

// Set up Intersection Observer when component mounts
onMounted(async () => {
  pending.value = true; // Start initial loading state
  error.value = null;
  noMoreCategories.value = false;
  currentPage.value = 1; // Reset page on mount
  allCategoriesWithLessons.value = []; // Clear previous data

  try {
      const initialData = await fetchCategoriesAndLessons(1);
      allCategoriesWithLessons.value = initialData;
      if (initialData.length < categoriesPerPage.value) {
          noMoreCategories.value = true; // No more if first fetch got less than a full page
      }
  } catch (err: any) {
      error.value = err; // Catch initial fetch error
  } finally {
      pending.value = false; // End initial loading state
  }


  // Setup Intersection Observer
  if (infiniteScrollTriggerElement.value) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("Infinite scroll trigger intersected!");
          loadMoreCategories(); // Load more when trigger is visible
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );
    observer.observe(infiniteScrollTriggerElement.value);
  }
});

// Clean up Observer when component unmounts
onUnmounted(() => {
  if (observer && infiniteScrollTriggerElement.value) {
    observer.unobserve(infiniteScrollTriggerElement.value);
    console.log("Infinite scroll observer disconnected.");
  }
});


// --- Show More/Less Lessons Logic ---
const toggleShowMore = async (categoryId: number) => {
    const category = allCategoriesWithLessons.value.find(c => c.id === categoryId);
    if (!category) return;

    // If currently not showing all and haven't loaded all lessons yet
    if (!category.showAll && category.hasMore) {
        console.log(`Fetching all lessons for category ${categoryId}...`);
        // Indicate loading specifically for this category (optional)
        // category.loadingAll = true; // Needs adding 'loadingAll' to interface

        try {
            const { data, error } = await client
                .from('lessons')
                .select('id, title, description, youtube_url, created_at')
                .eq('category_id', category.id)
                .is('course_id', null)
                .order('created_at', { ascending: false }); // Fetch ALL lessons

            if (error) throw error;

            category.lessons = data || []; // Replace with all lessons
            category.showAll = true; // Set flag to show all
            // category.hasMore might become false now, but we leave it based on initial check

        } catch (err: any) {
            console.error(`Error fetching all lessons for category ${categoryId}:`, err);
            // Show error to user?
        } finally {
            // category.loadingAll = false;
        }
    } else {
        // Just toggle the display state if all lessons are already loaded
        category.showAll = !category.showAll;
        console.log(`Toggled showAll for category ${categoryId} to ${category.showAll}`);
    }
};

// Refresh initial data on error
const refreshInitialData = async () => {
    console.log("Refreshing initial data...");
    pending.value = true;
    error.value = null;
    noMoreCategories.value = false;
    currentPage.value = 1; // Reset to first page
    allCategoriesWithLessons.value = []; // Clear existing data
     try {
      const initialData = await fetchCategoriesAndLessons(1);
      allCategoriesWithLessons.value = initialData;
       if (initialData.length < categoriesPerPage.value) {
          noMoreCategories.value = true;
      }
    } catch (err: any) {
      error.value = err;
    } finally {
      pending.value = false;
    }
};

// SEO
useHead({
  meta: [ { name: 'description', content: 'تصفح سلاسل الدروس العامة للشيخ إبراهيم بشندي وشاهد أحدث المحاضرات.' } ]
})
</script>

<style scoped>
.category-section:not(:last-child) {
  border-bottom: 1px solid theme('colors.gray.200');
  @apply dark:border-gray-700;
  padding-bottom: theme('spacing.12'); /* pb-12 */
}
</style>