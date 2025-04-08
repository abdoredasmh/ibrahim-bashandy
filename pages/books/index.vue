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
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2">
          <NuxtIcon name="heroicons:book-open" class="inline-block align-middle me-2 text-olive-green" />
          الكتب العامة
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
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2">
          <NuxtIcon name="heroicons:academic-cap" class="inline-block align-middle me-2 text-blue-muted" />
          الأبحاث
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
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2">
           <NuxtIcon name="heroicons:document-text" class="inline-block align-middle me-2 text-golden-calm" />
          التفريغات
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