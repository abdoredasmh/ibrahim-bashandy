<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-8 border-b-2 border-olive-green pb-2">
      المكتبة الرقمية
    </h1>

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل المكتبة...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-600 dark:text-red-400 text-lg">
        حدث خطأ أثناء تحميل الكتب. يرجى المحاولة مرة أخرى لاحقًا.
      </p>
      <p class="text-sm text-gray-500 mt-2">{{ error.message }}</p>
       <button @click="refresh" class="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
         إعادة المحاولة
       </button>
    </div>

    <!-- No Books State (Overall) -->
    <div v-else-if="allBooks.length === 0" class="text-center py-10">
      <p class="text-gray-600 dark:text-gray-400 text-lg">
        لا توجد مواد متاحة حاليًا في المكتبة.
      </p>
    </div>

    <!-- Data Display Sections -->
    <div v-else>
      <!-- Section: General Books -->
      <section v-if="generalBooks.length > 0" class="mb-12">
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2 flex items-center">
           <!-- SVG for heroicons:book-open -->
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 inline-block align-middle me-2 text-olive-green" aria-hidden="true">
              <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.27a.75.75 0 0 0-.624-.744A8.25 8.25 0 0 1 6 18.75a8.25 8.25 0 0 1-5.25-2.268v-2.156a.75.75 0 0 0 .51-.698A8.217 8.217 0 0 1 6 13.5a8.182 8.182 0 0 1 5.25 1.406v-1.406a8.182 8.182 0 0 1-5.25 1.406 8.217 8.217 0 0 1-4.74-.954.75.75 0 0 0-.51-.698V9.732a8.25 8.25 0 0 1 5.25-2.268 8.25 8.25 0 0 1 5.25 2.268V9.376a.75.75 0 0 0 .624.744v1.27ZM12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533v-1.27a.75.75 0 0 1 .624-.744A8.25 8.25 0 0 0 18 18.75a8.25 8.25 0 0 0 5.25-2.268v-2.156a.75.75 0 0 1-.51-.698A8.217 8.217 0 0 0 18 13.5a8.182 8.182 0 0 0-5.25 1.406v-1.406a8.182 8.182 0 0 0 5.25 1.406 8.217 8.217 0 0 0 4.74-.954.75.75 0 0 1 .51-.698V9.732a8.25 8.25 0 0 0-5.25-2.268 8.25 8.25 0 0 0-5.25 2.268V9.376a.75.75 0 0 1-.624.744v1.27Z" />
           </svg>
           <span>الكتب العامة</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <BookCard
            v-for="book in generalBooks"
            :key="book.id"
            :book="book"
            @open-pdf="openPdfModal"
          />
        </div>
      </section>

      <!-- Section: Research Papers -->
      <section v-if="researchPapers.length > 0" class="mb-12">
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2 flex items-center">
           <!-- SVG for heroicons:academic-cap -->
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
      <section v-if="transcripts.length > 0" class="mb-12">
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2 flex items-center">
           <!-- SVG for heroicons:document-text -->
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
import { ref, computed } from 'vue';
import BookCard from '~/components/BookCard.vue';
import LazyPdfViewerModal from '~/components/PdfViewerModal.vue'; // Will be created next
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // Assuming you have a simple spinner component
import type { Database } from '~/types/database.types';

type Book = Database['public']['Tables']['books']['Row'];

const supabase = useSupabaseClient<Database>();

// State for PDF Modal
const showPdfModal = ref(false);
const selectedPdfPath = ref<string | null>(null);
const selectedBookTitle = ref<string | null>(null); // To show title in Modal

function openPdfModal(book: Book) {
  if (book.storage_path) {
    selectedPdfPath.value = book.storage_path;
    selectedBookTitle.value = book.title;
    showPdfModal.value = true;
  } else {
    // Handle case where storage_path is null (optional)
    console.warn(`Book "${book.title}" does not have a storage path.`);
    // You could show an alert to the user here
  }
}

function closePdfModal() {
  showPdfModal.value = false;
  selectedPdfPath.value = null;
  selectedBookTitle.value = null;
}

// --- Data Fetching ---
const { data: allBooks, pending, error, refresh } = await useAsyncData<Book[]>(
  'allBooks', // Changed key to reflect fetching all
  async () => {
    const { data, error } = await supabase
      .from('books')
      .select('id, title, description, cover_image_url, is_research, is_transcript, created_at, storage_path, linked_lesson_id') // Fetch new fields
      .order('created_at', { ascending: false }); // Order by newest first (adjust if needed)

    if (error) {
      console.error('Error fetching books:', error);
      throw error;
    }
    return data || [];
  }, {
    default: () => [] // Provide a default empty array
  }
);

// --- Computed properties for filtering ---
const generalBooks = computed(() => {
  return allBooks.value.filter(book => !book.is_research && !book.is_transcript);
});

const researchPapers = computed(() => {
  return allBooks.value.filter(book => book.is_research && !book.is_transcript);
});

const transcripts = computed(() => {
  return allBooks.value.filter(book => book.is_transcript);
});

// --- SEO Meta ---
useHead({
  title: 'المكتبة الرقمية',
  meta: [
    { name: 'description', content: 'تصفح وتحميل كتب وأبحاث وتفريغات الشيخ إبراهيم بشندي.' }
  ]
});

</script>

<style scoped>
/* Add specific styles for this page if needed */
</style>