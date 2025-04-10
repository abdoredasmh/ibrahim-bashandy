<template>
  <div class="container mx-auto px-4 ">
    <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-6 border-b-2 border-olive-green pb-2">
      المكتبة الرقمية
    </h1>

    <!-- Search and Filter Bar -->
    <div class="mb-8 space-y-4">
      <!-- Search Input -->
      <div>
        <label for="library-search" class="sr-only">ابحث في المكتبة</label>
        <div class="relative">
          <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            type="search"
            id="library-search"
            :value="searchQuery"
            @input="handleSearchInput"
            class="block w-full p-3 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-olive-green focus:border-olive-green dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-olive-green/70 dark:focus:border-olive-green/70"
            placeholder="ابحث في الكتب والأبحاث والتفريغات..."
            aria-label="بحث في المكتبة"
          />
        </div>
      </div>
      <!-- Filter Buttons -->
      <div class="flex flex-wrap items-center gap-2 pt-2">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300 ms-2 hidden sm:inline">تصفية حسب الفئة:</span>
        <!-- All Button -->
        <button
          @click="selectCategory(null)"
          :disabled="pending || loadingMore"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-olive-green disabled:opacity-50 disabled:cursor-not-allowed',
            selectedCategoryId === null
              ? 'bg-olive-green text-white shadow'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          كل الفئات
        </button>
        <!-- Category Buttons -->
        <button
          v-for="filterCat in filterCategories"
          :key="filterCat.id"
          @click="selectCategory(filterCat.id)"
          :disabled="pending || loadingMore"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-olive-green disabled:opacity-50 disabled:cursor-not-allowed',
            selectedCategoryId === filterCat.id
              ? 'bg-olive-green text-white shadow'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ filterCat.name }}
        </button>
         <!-- Loading/Error for Filters -->
          <div v-if="loadingFilters" class="text-xs text-gray-500">جار تحميل الفئات...</div>
          <div v-if="filterError" class="text-xs text-red-500">خطأ تحميل الفئات.</div>
      </div>
    </div>

    <!-- Loading State (Initial) -->
    <div v-if="pending" class="text-center py-20">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive-green"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل الكتب...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error && books.length === 0" class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-2xl mx-auto">
        <p class="text-red-600 dark:text-red-400 font-semibold mb-2 text-lg">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 inline-block align-middle me-1" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
         حدث خطأ أثناء تحميل المكتبة.
       </p>
       <pre v-if="error.message" class="mt-1 text-xs text-left bg-red-100 dark:bg-red-800/30 p-2 rounded border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 whitespace-pre-wrap">{{ error.message }}</pre>
       <button @click="retryFetch" class="mt-6 px-5 py-2 bg-olive-green text-white rounded hover:bg-opacity-80 transition-colors text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block align-middle me-1"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
         إعادة المحاولة
       </button>
     </div>

    <!-- No Books Found State -->
    <div v-else-if="!pending && books.length === 0" class="text-center py-16 text-gray-500 dark:text-gray-400">
      <div v-if="searchQuery || selectedCategoryId !== null">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mb-4 mx-auto text-gray-400 dark:text-gray-500">
             <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
           </svg>
           <p class="text-lg">لم يتم العثور على نتائج تطابق بحثك أو الفلتر المطبق.</p>
           <p v-if="searchQuery" class="text-sm mt-1">حاول تبسيط كلمات البحث أو تغيير الفئة.</p>
           <button v-if="selectedCategoryId !== null || searchQuery" @click="resetFiltersAndSearch" class="mt-4 text-sm text-olive-green hover:underline">
               عرض كل الكتب
           </button>
      </div>
      <div v-else>
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mb-4 mx-auto text-gray-400 dark:text-gray-500" aria-hidden="true">
            <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.27a.75.75 0 0 0-.624-.744A8.25 8.25 0 0 1 6 18.75a8.25 8.25 0 0 1-5.25-2.268v-2.156a.75.75 0 0 0 .51-.698A8.217 8.217 0 0 1 6 13.5a8.182 8.182 0 0 1 5.25 1.406v-1.406a8.182 8.182 0 0 1-5.25 1.406 8.217 8.217 0 0 1-4.74-.954.75.75 0 0 0-.51-.698V9.732a8.25 8.25 0 0 1 5.25-2.268 8.25 8.25 0 0 1 5.25 2.268V9.376a.75.75 0 0 0 .624.744v1.27ZM12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533v-1.27a.75.75 0 0 1 .624-.744A8.25 8.25 0 0 0 18 18.75a8.25 8.25 0 0 0 5.25-2.268v-2.156a.75.75 0 0 1-.51-.698A8.217 8.217 0 0 0 18 13.5a8.182 8.182 0 0 0-5.25 1.406v-1.406a8.182 8.182 0 0 0 5.25 1.406 8.217 8.217 0 0 0 4.74-.954.75.75 0 0 1 .51-.698V9.732a8.25 8.25 0 0 0-5.25-2.268 8.25 8.25 0 0 0-5.25 2.268V9.376a.75.75 0 0 1-.624.744v1.27Z" />
         </svg>
         <p class="text-lg">المكتبة فارغة حاليًا.</p>
      </div>
    </div>

    <!-- Books Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <BookCard
        v-for="book in books"
        :key="book.id"
        :book="book"
        @open-pdf="openPdfModal"
      />
    </div>

    <!-- Infinite Scroll Trigger & Loading Indicator -->
    <div ref="infiniteScrollTrigger" class="h-10 flex justify-center items-center mt-10">
       <div v-if="loadingMore" class="flex items-center space-x-2 space-x-reverse text-gray-600 dark:text-gray-400">
           <svg class="animate-spin h-5 w-5 text-olive-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
             <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           <span>جارٍ تحميل المزيد...</span>
       </div>
       <div v-else-if="!pending && books.length > 0 && noMoreBooks" class="text-sm text-gray-500 dark:text-gray-400">
          ~ نهاية القائمة ~
       </div>
        <div v-else-if="error && books.length > 0" class="text-sm text-red-600 dark:text-red-400">
            حدث خطأ أثناء تحميل المزيد.
        </div>
    </div>

    <!-- PDF Viewer Modal -->
    <LazyPdfViewerModal
      :show="showPdfModal"
      :storage-path="selectedPdfPath"
      :book-title="selectedBookTitle"
      @close="closePdfModal"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useHead, useSupabaseClient } from '#imports';
import BookCard from '~/components/BookCard.vue';
import LazyPdfViewerModal from '~/components/PdfViewerModal.vue'; // Ensure this component exists
import type { Database, Tables } from '~/types/database.types';

// Define Types
type Book = Tables<'books'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;

// --- Configuration ---
const BOOKS_PER_PAGE = 16; // How many books to load per batch
const DEBOUNCE_WAIT = 400; // Milliseconds for search debounce

// --- Supabase & State ---
const client = useSupabaseClient<Database>();

const books = ref<Book[]>([]);                   // Array to hold all currently loaded books
const filterCategories = ref<Category[]>([]);      // Categories for the filter bar
const selectedCategoryId = ref<number | null>(null); // null means 'All Categories'

const searchQuery = ref('');                  // Input value for search
const debouncedSearchQuery = ref('');         // Debounced value used for fetching
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null); // Debounce timer ID

const currentPage = ref(1);                     // Current page/batch number for infinite scroll
const totalBooksCount = ref(0);                 // Total books matching current filters in DB
const noMoreBooks = ref(false);                 // Flag if all matching books have been loaded

const pending = ref(true);                    // Main loading state (initial load or after filter/search change)
const loadingMore = ref(false);                 // Loading state for infinite scroll batch fetching
const error = ref<any>(null);                 // Stores any fetch error
const loadingFilters = ref(false);              // Loading state for filter categories
const filterError = ref<any>(null);              // Error state for filter categories

// PDF Modal State
const showPdfModal = ref(false);
const selectedPdfPath = ref<string | null>(null);
const selectedBookTitle = ref<string | null>(null);

// --- Debounce Function ---
function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | null;
  return function executedFunction(...args: any[]) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// --- Data Fetching ---

/**
 * Fetches a batch of books based on current filters, search, and page.
 * @param page - The page number (batch) to fetch.
 */
const fetchBooksBatch = async (page: number) => {
  console.log(`Fetching books batch ${page} with search: "${debouncedSearchQuery.value}" and category: ${selectedCategoryId.value}`);
  const limit = BOOKS_PER_PAGE;
  const rangeFrom = (page - 1) * limit;
  const rangeTo = rangeFrom + limit - 1;

  let query = client
    .from('books')
    .select('id, title, description, cover_image_url, is_research, is_transcript, created_at, storage_path, category_id', { count: 'exact' }); // Select category_id if filtering by it

  // Apply Category Filter
  if (selectedCategoryId.value !== null) {
    query = query.eq('category_id', selectedCategoryId.value);
  }

  // Apply Search Filter (using OR for title and description)
  const searchTerm = debouncedSearchQuery.value;
  if (searchTerm) {
    const searchPattern = `%${searchTerm}%`;
    query = query.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);
    // Consider Full-Text Search for performance with very large datasets
    // query = query.textSearch('fts_column', `'${searchTerm}'`);
  }

  // Apply Ordering and Pagination
  query = query.order('created_at', { ascending: false }).range(rangeFrom, rangeTo);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching books batch:', error);
    throw error;
  }

  console.log(`Fetched batch ${page}: ${data?.length ?? 0} books. Total count: ${count}`);
  return { data: data || [], count: count ?? 0 };
};

/**
 * Loads the initial set of data (first batch of books and total count).
 * Resets state before fetching.
 */
const loadInitialBooks = async () => {
  console.log("Loading initial books...");
  pending.value = true;
  error.value = null;
  currentPage.value = 1;
  books.value = []; // Clear existing books
  noMoreBooks.value = false;
  totalBooksCount.value = 0;

  try {
    const { data, count } = await fetchBooksBatch(1);
    books.value = data;
    totalBooksCount.value = count;
    // Check if all books were loaded in the first batch
    if (data.length >= count) {
      noMoreBooks.value = true;
    }
  } catch (err: any) {
    error.value = err;
  } finally {
    pending.value = false;
  }
};

/**
 * Fetches and appends the next batch of books for infinite scroll.
 */
const loadMoreBooks = async () => {
  if (loadingMore.value || noMoreBooks.value || pending.value) {
      // console.log("Skipping loadMoreBooks (already loading, no more books, or initial load pending).");
      return;
  }

  loadingMore.value = true;
  error.value = null; // Clear previous 'load more' errors specifically
  const nextPage = currentPage.value + 1;

  try {
    const { data, count } = await fetchBooksBatch(nextPage);
    if (data.length > 0) {
      books.value.push(...data);
      currentPage.value = nextPage; // Only increment page if data was successfully loaded
      // Update total count if it changed (though ideally it shouldn't change often mid-session)
       if (totalBooksCount.value !== count) {
           console.warn("Total book count changed during load more:", count);
           totalBooksCount.value = count;
       }
    }
    // Check if we've loaded all books
    if (books.value.length >= totalBooksCount.value) {
      noMoreBooks.value = true;
      console.log("All books loaded.");
    }
  } catch (err: any) {
    error.value = err; // Set general error, maybe show a toast or specific indicator?
    console.error("Error in loadMoreBooks:", err);
  } finally {
    loadingMore.value = false;
  }
};

/**
 * Fetches the categories to display in the filter bar.
 */
const fetchFilterCategories = async () => {
    loadingFilters.value = true;
    filterError.value = null;
    try {
        // Fetch categories that actually have books associated with them
        // This requires a more complex query or fetching all and filtering later
        // Simple approach: Fetch all potential categories for now
        const { data, error } = await client
            .from('categories')
            .select('id, name')
             // .eq('type', 'book_category') // Filter if you have types
            .order('name', { ascending: true });

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

// --- Event Handlers & Triggers ---

// Called when search input changes
const handleSearchInput = (event: Event) => {
  searchQuery.value = (event.target as HTMLInputElement).value;
  // Debounce the actual state update and data fetch trigger
  if (searchTimeout.value) clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    if (debouncedSearchQuery.value !== searchQuery.value.trim()) {
      console.log('Search query changed, debounced:', searchQuery.value.trim());
      debouncedSearchQuery.value = searchQuery.value.trim();
      loadInitialBooks(); // Trigger full refresh
    }
  }, DEBOUNCE_WAIT);
};

// Called when a filter category button is clicked
const selectCategory = (categoryId: number | null) => {
  if (selectedCategoryId.value === categoryId) return; // No change

  console.log(`Category filter changed to: ${categoryId}`);
  selectedCategoryId.value = categoryId;
  loadInitialBooks(); // Trigger full refresh with new filter
};

// Retry fetching initial data on error
const retryFetch = () => {
  loadInitialBooks();
};

// Reset search and filters
const resetFiltersAndSearch = () => {
    searchQuery.value = '';
    debouncedSearchQuery.value = '';
    selectedCategoryId.value = null;
    loadInitialBooks(); // Trigger full refresh
};


// --- Infinite Scroll Setup ---
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  // Fetch initial data and filters
  fetchFilterCategories();
  loadInitialBooks();

  // Setup Intersection Observer
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        console.log("Infinite scroll trigger intersected!");
        loadMoreBooks(); // Load next batch when trigger is visible
      }
    },
    { threshold: 0.1 } // Adjust threshold as needed
  );

  if (infiniteScrollTrigger.value) {
    observer.observe(infiniteScrollTrigger.value);
    console.log("Infinite scroll observer attached.");
  } else {
     console.warn("Infinite scroll trigger element not found on mount.");
     // Attempt to attach later if needed, or ensure it renders reliably
     watch(infiniteScrollTrigger, (newEl) => {
         if (newEl && observer) {
             observer.observe(newEl);
              console.log("Infinite scroll observer attached after element render.");
         }
     });
  }
});

onUnmounted(() => {
  // Clean up observer
  if (observer && infiniteScrollTrigger.value) {
    observer.unobserve(infiniteScrollTrigger.value);
     console.log("Infinite scroll observer disconnected.");
  }
   observer = null;
  // Clear debounce timer
  if (searchTimeout.value) {
      clearTimeout(searchTimeout.value);
  }
});

// --- Computed Properties for Template ---
const totalBooksFound = computed(() => totalBooksCount.value); // Simplified

// --- Modal Methods ---
function openPdfModal(book: Book) {
  if (book.storage_path) {
    selectedPdfPath.value = book.storage_path;
    selectedBookTitle.value = book.title ?? 'مستند PDF';
    showPdfModal.value = true;
  } else {
    console.warn(`Book "${book.title}" does not have a storage path.`);
    alert(`عذرًا، لا يوجد ملف مرتبط بهذا الكتاب (${book.title}).`);
  }
}

function closePdfModal() {
  showPdfModal.value = false;
}

// --- SEO ---
useHead({
  title: 'المكتبة الرقمية - موقع الشيخ إبراهيم بشندي',
  meta: [
    { name: 'description', content: 'تصفح وحمل كتب وأبحاث وتفريغات محاضرات ودروس الشيخ إبراهيم بشندي في مختلف العلوم الشرعية.' },
  ],
});

</script>

<style scoped>
input[type="search"]:focus {
  box-shadow: 0 0 0 2px theme('colors.olive-green' / 50%);
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>