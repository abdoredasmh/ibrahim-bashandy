<template>
  <div class="container mx-auto px-4 py-8">

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل بيانات الكتاب...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !book" class="text-center py-20">
      <!-- Error specific message from createError -->
       <h2 v-if="error?.statusCode === 404" class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
         الكتاب غير موجود
       </h2>
       <h2 v-else class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
         حدث خطأ
       </h2>
       <p class="text-gray-600 dark:text-gray-400 mb-6">
         {{ error?.statusMessage || 'لم نتمكن من العثور على الكتاب المطلوب أو حدث خطأ أثناء تحميله.' }}
       </p>
      <NuxtLink
        to="/books"
        class="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
        :style="{ backgroundColor: 'var(--color-olive-green)' }"
      >
        <NuxtIcon name="heroicons:arrow-right-circle-20-solid" class="w-5 h-5 ms-2" /> <!-- Changed icon -->
        العودة إلى المكتبة
      </NuxtLink>
    </div>

    <!-- Book Details Display -->
    <div v-else class="book-details">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Book Cover -->
        <div class="md:col-span-1">
           <div class="relative h-96 bg-cream-gray dark:bg-gray-700 flex items-center justify-center rounded-lg shadow-md overflow-hidden">
             <img
               v-if="book.cover_image_url && !imageError"
               :src="book.cover_image_url"
               :alt="`غلاف ${book.title}`"
               class="w-full h-full object-contain"
               @error="handleImageError"
             />
             <NuxtIcon
               v-else
               name="heroicons:book-open-solid"
               class="text-8xl text-gray-400 dark:text-gray-500"
               aria-hidden="true"
              />
              <!-- Badges -->
              <div class="absolute top-3 start-3 flex gap-2">
                <span v-if="book.is_research" class="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300 shadow">
                  بحث
                </span>
                <span v-if="book.is_transcript" class="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-green-900 dark:text-green-300 shadow">
                  تفريغ
                </span>
              </div>
           </div>
            <!-- Open/Download Buttons -->
           <div class="mt-4 flex flex-col space-y-2">
               <button
                 v-if="book.storage_path"
                 type="button"
                 @click="openPdfModal"
                 class="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                 :style="{ backgroundColor: 'var(--color-olive-green)' }"
               >
                 <NuxtIcon name="heroicons:eye-20-solid" class="w-5 h-5 me-2" aria-hidden="true" />
                 عرض الكتاب بالموقع
               </button>
                <a
                   v-if="pdfPublicUrl"
                   :href="pdfPublicUrl"
                   target="_blank"
                   download
                   class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-brown-dark dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                 >
                   <NuxtIcon name="heroicons:arrow-down-tray-20-solid" class="w-5 h-5 me-2"/>
                   تنزيل الملف
                 </a>
                 <p v-if="!book.storage_path" class="text-center text-sm text-red-500 dark:text-red-400 mt-2">
                   ملف الكتاب غير متاح حاليًا للعرض أو التنزيل.
                 </p>
           </div>
        </div>

        <!-- Book Info -->
        <div class="md:col-span-2">
          <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-4">
            {{ book.title }}
          </h1>
           <!-- Link to Original Lesson (for Transcripts) -->
           <div v-if="book.is_transcript && book.linked_lesson_id" class="mb-4">
             <NuxtLink
               :to="`/lessons/${book.linked_lesson_id}`"
               class="inline-flex items-center text-sm font-medium text-golden-calm hover:underline"
             >
               <NuxtIcon name="heroicons:link-20-solid" class="w-4 h-4 me-1" aria-hidden="true" />
               هذا تفريغ للدرس - اضغط هنا لعرض الدرس الأصلي
             </NuxtLink>
           </div>

          <div v-if="book.description" class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p class="whitespace-pre-wrap">{{ book.description }}</p>
          </div>
           <p v-else class="text-gray-500 dark:text-gray-400 italic">
             لا يوجد وصف متاح لهذا الكتاب.
           </p>
           <!-- Add more fields here if needed, e.g., author, publisher, date -->
        </div>
      </div>

      <!-- Comments Section -->
      <CommentSection
        :content-id="bookId"
        content-type="book"
       />

    </div>

    <!-- PDF Viewer Modal -->
    <LazyPdfViewerModal
      :show="showModal"
      :storage-path="book?.storage_path || null"
      :book-title="book?.title || null"
      @close="closePdfModal"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import CommentSection from '~/components/CommentSection.vue';
import LazyPdfViewerModal from '~/components/PdfViewerModal.vue'; // Lazy load modal

type Book = Tables<'books'>;

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const bookId = computed(() => Number(route.params.id)); // Ensure ID is a number

const imageError = ref(false);
const showModal = ref(false);
const pdfPublicUrl = ref<string | null>(null); // To store public URL for download button

function handleImageError() {
  imageError.value = true;
}

function openPdfModal() {
  // Fetch public URL for download button *before* opening modal
  // Or fetch it inside the modal if preferred (as currently implemented)
  showModal.value = true;
}

function closePdfModal() {
  showModal.value = false;
}

// --- Fetch Book Data ---
const { data: book, pending, error, refresh } = await useAsyncData<Book | null>(
  `book-${bookId.value}`, // Unique key including the book ID
  async () => {
    if (isNaN(bookId.value)) {
        console.error('Invalid Book ID:', route.params.id);
         throw createError({ statusCode: 400, statusMessage: 'معرف الكتاب غير صالح.' });
    }

    const { data, error: queryError } = await supabase
      .from('books')
      .select('*') // Select all columns for the book details page
      .eq('id', bookId.value)
      .maybeSingle(); // Use maybeSingle() to return null instead of error if not found

    if (queryError) {
      console.error('Error fetching book:', queryError);
      throw createError({ statusCode: 500, statusMessage: `فشل تحميل الكتاب: ${queryError.message}` });
    }
    if (!data) {
        throw createError({ statusCode: 404, statusMessage: 'الكتاب المطلوب غير موجود.' });
    }

    // --- Pre-fetch public URL for download button ---
    if (data.storage_path) {
        try {
            const { data: urlData, error: urlError } = await supabase.storage
                .from('library_files') // Ensure BUCKET_NAME is correct
                .getPublicUrl(data.storage_path);
            if (urlError) throw urlError;
            pdfPublicUrl.value = urlData.publicUrl;
        } catch (urlErr: any) {
            console.error("Failed to get public URL for download button:", urlErr);
            // Don't block rendering if this fails, download button just won't work initially
            pdfPublicUrl.value = null;
        }
    }

    return data;
  },
  {
    // Watch the bookId to refetch if the route parameter changes
    watch: [bookId]
  }
);

// --- SEO Meta ---
useHead(computed(() => ({
  title: book.value?.title || (pending.value ? 'تحميل...' : 'تفاصيل الكتاب'),
  meta: [
    {
      name: 'description',
      content: book.value?.description?.substring(0, 150) || `تفاصيل ${book.value?.title || 'الكتاب'}`
    }
    // Add OpenGraph tags later if needed
  ]
})));

</script>

<style scoped>
/* Use Tailwind's typography plugin for nice prose styles */
.prose :where(p):not(:where([class~="not-prose"] *)) {
    margin-top: 0.5em; /* Adjust spacing if needed */
    margin-bottom: 0.5em;
}
</style>