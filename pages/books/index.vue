<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-6 border-b-2 border-olive-green pb-2">
      المكتبة الرقمية
    </h1>

    <!-- Search Input -->
    <div class="mb-8">
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
          placeholder="ابحث عن كتاب أو بحث..."
        />
      </div>
    </div>

    <!-- Loading State (Skeleton or Spinner) -->
    <!-- Show skeleton only on initial load maybe, or a smaller spinner during search/pagination -->
    <div v-if="pending && !currentPageData.length" class="space-y-12">
      <!-- Skeleton Section (Simplified for example) -->
      <section v-for="s in 1" :key="`skel-sec-${s}`" class="mb-12 animate-pulse">
         <div class="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
         <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <div v-for="i in booksPerPage" :key="`skel-card-${s}-${i}`" class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow p-4 h-48">
             <div class="h-24 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
             <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
             <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
           </div>
         </div>
       </section>
    </div>
     <!-- Centered Spinner for subsequent loads -->
     <div v-else-if="pending" class="flex justify-center items-center py-16">
        <svg class="animate-spin -ml-1 mr-3 h-8 w-8 text-olive-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
         <span class="text-gray-600 dark:text-gray-400">جاري التحميل...</span>
     </div>

    <!-- Error State -->
     <div v-else-if="error" class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-2xl mx-auto">
        <!-- Same error display as before -->
        <p class="text-red-600 dark:text-red-400 font-semibold mb-2 text-lg">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 inline-block align-middle me-1" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>
         حدث خطأ أثناء تحميل المكتبة.
       </p>
       <pre v-if="error.message" class="mt-1 text-xs text-left bg-red-100 dark:bg-red-800/30 p-2 rounded border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 whitespace-pre-wrap">{{ error.message }}</pre>
       <button @click="executeRefresh" class="mt-6 px-5 py-2 bg-olive-green text-white rounded hover:bg-opacity-80 transition-colors text-sm font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block align-middle me-1"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
         إعادة المحاولة
       </button>
     </div>

    <!-- No Books State (Overall / After Search) -->
    <div v-else-if="!pending && totalBooks === 0 && !searchQuery" class="text-center py-16 text-gray-500 dark:text-gray-400">
        <!-- Icon and message for empty library -->
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mb-4 mx-auto text-gray-400 dark:text-gray-500" aria-hidden="true">
          <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.27a.75.75 0 0 0-.624-.744A8.25 8.25 0 0 1 6 18.75a8.25 8.25 0 0 1-5.25-2.268v-2.156a.75.75 0 0 0 .51-.698A8.217 8.217 0 0 1 6 13.5a8.182 8.182 0 0 1 5.25 1.406v-1.406a8.182 8.182 0 0 1-5.25 1.406 8.217 8.217 0 0 1-4.74-.954.75.75 0 0 0-.51-.698V9.732a8.25 8.25 0 0 1 5.25-2.268 8.25 8.25 0 0 1 5.25 2.268V9.376a.75.75 0 0 0 .624.744v1.27Z" />
          <path d="M12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533v-1.27a.75.75 0 0 1 .624-.744A8.25 8.25 0 0 0 18 18.75a8.25 8.25 0 0 0 5.25-2.268v-2.156a.75.75 0 0 1-.51-.698A8.217 8.217 0 0 0 18 13.5a8.182 8.182 0 0 0-5.25 1.406v-1.406a8.182 8.182 0 0 0 5.25 1.406 8.217 8.217 0 0 0 4.74-.954.75.75 0 0 1 .51-.698V9.732a8.25 8.25 0 0 0-5.25-2.268 8.25 8.25 0 0 0-5.25 2.268V9.376a.75.75 0 0 1-.624.744v1.27Z" />
       </svg>
      <p class="text-lg">المكتبة فارغة حاليًا.</p>
    </div>
     <div v-else-if="!pending && totalBooks === 0 && searchQuery" class="text-center py-16 text-gray-500 dark:text-gray-400">
        <!-- Icon and message for no search results -->
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mb-4 mx-auto text-gray-400 dark:text-gray-500">
         <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
       </svg>
       <p class="text-lg">لم يتم العثور على نتائج للبحث "{{ searchQuery }}".</p>
       <p class="text-sm mt-1">حاول استخدام كلمات بحث أخرى.</p>
     </div>

    <!-- Data Display Sections (Now using paginated data) -->
    <div v-else class="space-y-12">
      <!-- Section: General Books -->
      <section v-if="generalBooks.length > 0">
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2 flex items-center">
          <!-- Icon -->
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 inline-block align-middle me-2 text-olive-green" aria-hidden="true">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.27a.75.75 0 0 0-.624-.744A8.25 8.25 0 0 1 6 18.75a8.25 8.25 0 0 1-5.25-2.268v-2.156a.75.75 0 0 0 .51-.698A8.217 8.217 0 0 1 6 13.5a8.182 8.182 0 0 1 5.25 1.406v-1.406a8.182 8.182 0 0 1-5.25 1.406 8.217 8.217 0 0 1-4.74-.954.75.75 0 0 0-.51-.698V9.732a8.25 8.25 0 0 1 5.25-2.268 8.25 8.25 0 0 1 5.25 2.268V9.376a.75.75 0 0 0 .624.744v1.27ZM12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533v-1.27a.75.75 0 0 1 .624-.744A8.25 8.25 0 0 0 18 18.75a8.25 8.25 0 0 0 5.25-2.268v-2.156a.75.75 0 0 1-.51-.698A8.217 8.217 0 0 0 18 13.5a8.182 8.182 0 0 0-5.25 1.406v-1.406a8.182 8.182 0 0 0 5.25 1.406 8.217 8.217 0 0 0 4.74-.954.75.75 0 0 1 .51-.698V9.732a8.25 8.25 0 0 0-5.25-2.268 8.25 8.25 0 0 0-5.25 2.268V9.376a.75.75 0 0 1-.624.744v1.27Z" />
           </svg>
           <span>الكتب العامة</span>
           <!-- Optional: Show count for this category on this page -->
           <!-- <span class="text-sm text-gray-500 dark:text-gray-400 mr-auto">({{ generalBooks.length }})</span> -->
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <BookCard
            v-for="book in generalBooks"
            :key="book.id"
            :book="book"
            @open-pdf="openPdfModal"
          />
        </div>
         <!-- Note: No need for "no books match search in this category" message here,
              as the main "no results" message covers it. If a category is empty
              on a specific page but exists in total, the section just won't render books. -->
      </section>

      <!-- Section: Research Papers -->
      <section v-if="researchPapers.length > 0">
         <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2 flex items-center">
           <!-- Icon -->
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 inline-block align-middle me-2 text-blue-muted" aria-hidden="true">
              <path d="M11.7 2.805a.75.75 0 0 1 .6 0A60.65 60.65 0 0 1 22.83 8.72a.75.75 0 0 1-.231 1.337 49.948 49.948 0 0 0-9.902 3.912l-.003.002c-.114.06-.227.119-.34.18a.75.75 0 0 1-.707 0A50.88 50.88 0 0 0 7.5 12.173v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 0 1 4.653-2.52.75.75 0 0 0 .65-1.351A56.12 56.12 0 0 0 6.823 6.512a.75.75 0 0 1-.231-1.337A60.653 60.653 0 0 1 11.7 2.805Z" />
              <path d="M12.94 14.193a.75.75 0 0 0-.94-.043A48.341 48.341 0 0 0 3.166 17.919a.75.75 0 0 0-.166.818 1.919 1.919 0 0 0 1.818 1.115 44.483 44.483 0 0 0 5.426-.031.75.75 0 0 0 .59-.73v-1.836a.75.75 0 0 0-.59-.73 45.99 45.99 0 0 1-4.303-.187v-.076a47.737 47.737 0 0 1 8.837-3.605Z" />
              <path d="M20.834 17.919a48.343 48.343 0 0 1-8.837 3.606v.075a45.99 45.99 0 0 0-4.303.187.75.75 0 0 1-.59.73v1.836a.75.75 0 0 1-.59.73 44.48 44.48 0 0 1-5.425.032 1.919 1.919 0 0 1-1.818-1.115.75.75 0 0 1 .166-.818 48.345 48.345 0 0 1 8.837-3.606.75.75 0 0 1 .94.044Z" />
           </svg>
           <span>الأبحاث</span>
         </h2>
         <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <BookCard
             v-for="book in researchPapers"
             :key="book.id"
             :book="book"
             @open-pdf="openPdfModal"
           />
         </div>
      </section>

      <!-- Section: Transcripts -->
      <section v-if="transcripts.length > 0">
         <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2 flex items-center">
            <!-- Icon -->
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 inline-block align-middle me-2 text-golden-calm" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.751c0-.265-.105-.52-.293-.712l-4.125-4.125a.75.75 0 0 0-.712-.293H9.375a.75.75 0 0 1-.75-.75V1.5H5.625Zm2.625.75V6h4.125a.75.75 0 0 0 .75-.75V3h-4.875ZM12 10.5a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Zm-1.5 2.25a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" clip-rule="evenodd" />
           </svg>
           <span>التفريغات</span>
         </h2>
         <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <BookCard
             v-for="book in transcripts"
             :key="book.id"
             :book="book"
             @open-pdf="openPdfModal"
           />
         </div>
      </section>

      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center items-center space-x-4 space-x-reverse">
         <button
            @click="changePage(currentPage - 1)"
            :disabled="currentPage === 1 || pending"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
         >
           السابق
         </button>
         <span class="text-sm text-gray-700 dark:text-gray-400">
            صفحة {{ currentPage }} من {{ totalPages }}
         </span>
         <button
            @click="changePage(currentPage + 1)"
            :disabled="currentPage === totalPages || pending"
             class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
         >
           التالي
         </button>
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
import { ref, computed, watch, onMounted } from 'vue';
import { useHead, useSupabaseClient, useAsyncData, useRouter } from '#imports';
import BookCard from '~/components/BookCard.vue';
import LazyPdfViewerModal from '~/components/PdfViewerModal.vue';
import type { Database, Tables } from '~/types/database.types';
// Import debounce if you have it installed, or use the simple implementation below
// import { debounce } from 'lodash-es';

type Book = Tables<'books'>;

// --- Configuration ---
const booksPerPage = ref(12); // How many books to show per page
const debounceWait = 300; // Milliseconds to wait after user stops typing

// --- Supabase & Router ---
const supabase = useSupabaseClient<Database>();
const router = useRouter(); // Needed if you want to sync search/page with URL query params

// --- State ---
const searchQuery = ref('');
const debouncedSearchQuery = ref(''); // Holds the query value used for fetching
const currentPage = ref(1);
const totalBooks = ref(0); // Total count of books matching the current search
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null); // For debounce timer

// PDF Modal State
const showPdfModal = ref(false);
const selectedPdfPath = ref<string | null>(null);
const selectedBookTitle = ref<string | null>(null);

// --- Debounce Function (Simple Implementation) ---
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

// Debounced function to update the query used for fetching
const updateDebouncedSearch = debounce(() => {
    // Reset to page 1 when search query changes
    if (debouncedSearchQuery.value !== searchQuery.value) {
        currentPage.value = 1;
    }
    debouncedSearchQuery.value = searchQuery.value.trim();
    // Optional: Update URL query params
    // router.push({ query: { q: debouncedSearchQuery.value || undefined, page: currentPage.value > 1 ? currentPage.value : undefined } });
}, debounceWait);

// Update search query on input and trigger debounced update
function handleSearchInput(event: Event) {
  searchQuery.value = (event.target as HTMLInputElement).value;
  updateDebouncedSearch();
}

// --- Data Fetching (Server-Side Pagination & Search) ---
const { data: paginatedBookData, pending, error, refresh } = await useAsyncData<{ data: Book[], count: number | null }>(
  'libraryBooksPaginated', // Key needs to be dynamic to refetch on changes
  async () => {
    const query = supabase
      .from('books')
      .select('id, title, description, cover_image_url, is_research, is_transcript, created_at, storage_path, linked_lesson_id', { count: 'exact' }); // Request total count

    const searchTerm = debouncedSearchQuery.value; // Use the debounced value
    if (searchTerm) {
      // Basic search: case-insensitive search in title OR description
      // For better performance with thousands of records, consider Supabase Full Text Search
      // https://supabase.com/docs/guides/database/full-text-search
      const searchPattern = `%${searchTerm}%`; // Pattern for ILIKE
       query.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);
      // Example using textSearch (requires setup in Supabase):
      // query.textSearch('fts', `'${searchTerm}'`); // Adjust 'fts' to your FTS column name
    }

    // Pagination
    const page = currentPage.value;
    const limit = booksPerPage.value;
    const rangeFrom = (page - 1) * limit;
    const rangeTo = rangeFrom + limit - 1;
    query.range(rangeFrom, rangeTo);

    // Ordering
    query.order('created_at', { ascending: false }); // Or order by title, etc.

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching paginated books:', error);
      throw error; // Propagate error to useAsyncData
    }

    return { data: data || [], count: count ?? 0 }; // Ensure data is array and count is number
  },
  {
    // Watch for changes in debounced search query and current page to trigger refetch
    watch: [debouncedSearchQuery, currentPage],
    lazy: false, // Load immediately
    default: () => ({ data: [], count: 0 }), // Sensible default
    server: true, // Execute on server for initial load
  }
);

// --- Computed Properties ---

// Get the current page's book data
const currentPageData = computed<Book[]>(() => paginatedBookData.value?.data ?? []);

// Get the total count from the fetched data
// Watch the paginatedBookData to update totalBooks whenever it changes
watch(paginatedBookData, (newData) => {
  totalBooks.value = newData?.count ?? 0;
}, { immediate: true }); // Run immediately on component mount

const totalPages = computed(() => {
  if (!totalBooks.value) return 0;
  return Math.ceil(totalBooks.value / booksPerPage.value);
});

// Categorize books *only on the current page*
const generalBooks = computed(() => {
  return currentPageData.value.filter(book => !book.is_research && !book.is_transcript);
});

const researchPapers = computed(() => {
  return currentPageData.value.filter(book => book.is_research);
});

const transcripts = computed(() => {
  return currentPageData.value.filter(book => book.is_transcript && !book.is_research);
});

// --- Methods ---

// Change page and trigger data refetch
function changePage(page: number) {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
    // Optional: Update URL query params
    // router.push({ query: { ...router.currentRoute.value.query, page: page > 1 ? page : undefined } });
  }
}

// Function to trigger a manual refresh (for error button)
function executeRefresh() {
  refresh();
}

// Initialize state from URL query params on mount (optional)
onMounted(() => {
    const queryParams = router.currentRoute.value.query;
    const initialSearch = queryParams.q as string | undefined;
    const initialPage = parseInt(queryParams.page as string | undefined ?? '1', 10);

    if (initialSearch) {
        searchQuery.value = initialSearch;
        debouncedSearchQuery.value = initialSearch; // Set both initially
    }
    if (!isNaN(initialPage) && initialPage > 0) {
        // We need to wait for the initial data fetch to know totalPages
        // A watcher or checking after the first fetch might be needed for robust URL -> page sync
        // For simplicity here, we just set it, but refresh might fetch page 1 first
        currentPage.value = initialPage;
    }
    // If state was loaded from URL, trigger initial fetch if needed (useAsyncData handles this via watch)
});


// Modal Methods (remain the same)
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

// --- SEO Meta (remains the same) ---
useHead({
  title: 'المكتبة الرقمية - موقع الشيخ إبراهيم بشندي',
  meta: [
    { name: 'description', content: 'تصفح وحمل كتب وأبحاث وتفريغات محاضرات ودروس الشيخ إبراهيم بشندي في مختلف العلوم الشرعية.' },
  ],
});

</script>

<style scoped>
/* Add specific styles for this page if needed */
input[type="search"]:focus {
  box-shadow: 0 0 0 2px theme('colors.olive-green' / 50%);
}

/* Styling for disabled pagination buttons */
button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>