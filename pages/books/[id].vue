<template>
  <div class="container mx-auto px-4 py-8">

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل بيانات الكتاب...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !book" class="text-center py-20">
      <h2 v-if="(error as any)?.statusCode === 404" class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
         الكتاب غير موجود
      </h2>
      <h2 v-else class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
         حدث خطأ
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
         {{ (error as any)?.statusMessage || 'لم نتمكن من العثور على الكتاب المطلوب أو حدث خطأ أثناء تحميله.' }}
      </p>
      <NuxtLink
        to="/books"
        class="button-primary"
      >
        <!-- SVG Icon -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true">
           <title>العودة للمكتبة</title>
           <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 0 0 1.5h4.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 1 0-1.02 1.1l2.1 1.95H9.25a.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
        </svg>
        <span>العودة إلى المكتبة</span>
      </NuxtLink>
    </div>

    <!-- Book Details Display -->
    <div v-else class="book-details">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <!-- Book Cover & Actions Column -->
        <div class="md:col-span-1">
           <div class="relative aspect-[3/4] bg-cream-gray dark:bg-gray-700 flex items-center justify-center rounded-lg shadow-md overflow-hidden">
             <img
               v-if="book.cover_image_url && !imageError"
               :src="book.cover_image_url"
               :alt="`غلاف ${book.title}`"
               class="w-full h-full object-contain"
               loading="lazy"
               decoding="async"
               @error="handleImageError"
             />
             <!-- Placeholder SVG -->
             <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-8xl text-gray-400 dark:text-gray-500 w-24 h-24" aria-hidden="true">
                <title>غلاف كتاب بديل</title>
                <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.27a.75.75 0 0 0-.624-.744A8.25 8.25 0 0 1 6 18.75a8.25 8.25 0 0 1-5.25-2.268v-2.156a.75.75 0 0 0 .51-.698A8.217 8.217 0 0 1 6 13.5a8.182 8.182 0 0 1 5.25 1.406v-1.406a8.182 8.182 0 0 1-5.25 1.406 8.217 8.217 0 0 1-4.74-.954.75.75 0 0 0-.51-.698V9.732a8.25 8.25 0 0 1 5.25-2.268 8.25 8.25 0 0 1 5.25 2.268V9.376a.75.75 0 0 0 .624.744v1.27ZM12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533v-1.27a.75.75 0 0 1 .624-.744A8.25 8.25 0 0 0 18 18.75a8.25 8.25 0 0 0 5.25-2.268v-2.156a.75.75 0 0 1-.51-.698A8.217 8.217 0 0 0 18 13.5a8.182 8.182 0 0 0-5.25 1.406v-1.406a8.182 8.182 0 0 0 5.25 1.406 8.217 8.217 0 0 0 4.74-.954.75.75 0 0 1 .51-.698V9.732a8.25 8.25 0 0 0-5.25-2.268 8.25 8.25 0 0 0-5.25 2.268V9.376a.75.75 0 0 1-.624.744v1.27Z" />
             </svg>
              <!-- Badges -->
              <div class="absolute top-3 start-3 flex flex-wrap gap-2">                 <span v-if="book.is_research" class="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  بحث
                </span>
                <span v-if="book.is_transcript" class="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
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
                 class="button-primary w-full"
               >
                 <!-- SVG Icon -->
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true">
                   <title>عرض بالموقع</title>
                   <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                   <path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.18l.879-.879a.75.75 0 0 1 1.06 0l.879.879A1.651 1.651 0 0 1 3.482 10c0 .311.102.613.284.879l-.879.879a.75.75 0 0 1-1.06 0l-.879-.879A1.651 1.651 0 0 1 .664 10.59ZM19.336 9.41a1.651 1.651 0 0 1 0 1.18l-.879.879a.75.75 0 0 1-1.06 0l-.879-.879A1.651 1.651 0 0 1 16.518 10c0-.311-.102-.613-.284-.879l.879-.879a.75.75 0 0 1 1.06 0l.879.879A1.651 1.651 0 0 1 19.336 9.41Z" clip-rule="evenodd" />
                   <path fill-rule="evenodd" d="M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm-5.017-9.836a.75.75 0 0 1 1.06 0l.879.879a4.652 4.652 0 0 1 6.156 0l.879-.879a.75.75 0 1 1 1.06 1.06l-.879.879a4.652 4.652 0 0 1-6.156 0l-.879-.879a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                 </svg>
                 <span>عرض الكتاب بالموقع</span>
               </button>
               <a
                   v-if="pdfPublicUrl"
                   :href="pdfPublicUrl"
                   target="_blank"
                   download
                   class="button-secondary w-full"
                   rel="noopener noreferrer"
                 >
                   <!-- SVG Icon -->
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true">
                      <title>تنزيل الملف</title>
                      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                   </svg>
                   <span>تنزيل الملف</span>
                 </a>
                 <p v-if="!book.storage_path" class="text-center text-sm text-red-500 dark:text-red-400 mt-2">
                   ملف الكتاب غير متاح حاليًا للعرض أو التنزيل.
                 </p>
           </div>
        </div>

        <!-- Book Info Column -->
        <div class="md:col-span-2">
          <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-4">
            {{ book.title }}
          </h1>
           <!-- Link to Original Lesson (for Transcripts) -->
           <div v-if="book.is_transcript && book.linked_lesson_id" class="mb-4">
             <NuxtLink
               :to="`/lessons/${book.linked_lesson_id}`"
               class="inline-flex items-center text-sm font-medium text-golden-calm hover:underline focus:outline-none focus:ring-2 focus:ring-golden-calm focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
               aria-label="عرض الدرس الأصلي المرتبط بهذا التفريغ"
             >
               <!-- SVG Icon -->
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1" aria-hidden="true">
                  <title>رابط الدرس الأصلي</title>
                  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.665l3-3Z" />
                  <path d="M8.603 17.007a4 4 0 0 0 5.656-5.656l-3-3a4 4 0 0 0-5.865-.225.75.75 0 0 0 1.138.977 2.5 2.5 0 0 1 3.665.142l3 3a2.5 2.5 0 0 1-3.536 3.536l-1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 5.656 5.656Z" />
               </svg>
               <span>هذا تفريغ للدرس - اضغط هنا لعرض الدرس الأصلي</span>
             </NuxtLink>
           </div>

           <!-- Description -->
           <div v-if="book.description" class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
             <!-- Using <p> with whitespace CSS is safer than v-html unless HTML is intended -->
             <p class="whitespace-pre-wrap">{{ book.description }}</p>
             <!-- If HTML content is expected and sanitized: -->
             <!-- <div v-html="sanitizedDescription"></div> -->
           </div>
           <p v-else class="text-gray-500 dark:text-gray-400 italic">
             لا يوجد وصف متاح لهذا الكتاب.
           </p>

           <!-- TODO: Add more fields here if needed, e.g., author, publisher, date -->
           <!-- Example: -->
           <!-- <div class="mt-6 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p v-if="book.author"><strong>المؤلف:</strong> {{ book.author }}</p>
                <p v-if="book.publication_year"><strong>سنة النشر:</strong> {{ book.publication_year }}</p>
           </div> -->
        </div>
      </div>

      <!-- Comments Section -->
      <!-- Ensure bookId is valid before rendering comments -->
      <CommentSection
        v-if="book && book.id"
        :book-id="book.id"
      />

    </div>

    <!-- PDF Viewer Modal (Lazy Loaded) -->
    <LazyPdfViewerModal
      :show="showModal"
      :storage-path="book?.storage_path || null"
      :book-title="book?.title || 'عرض الكتاب'"
      @close="closePdfModal"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { Database, Tables } from '~/types/database.types';
import type { PostgrestError } from '@supabase/postgrest-js'; // Import specific error type
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import CommentSection from '~/components/CommentSection.vue';
// Lazy import handled by Nuxt's <Lazy... prefix
// import LazyPdfViewerModal from '~/components/PdfViewerModal.vue';

// Define component type for clarity if needed elsewhere
interface Book extends Tables<'books'> {}

// --- Constants ---
// TODO: Move to runtime config or .env file
const STORAGE_BUCKET_NAME = 'book-files';

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const route = useRoute();
const { $toast } = useNuxtApp(); // Example if using a toast notification plugin

// --- Route Parameter Validation (Nuxt specific) ---
definePageMeta({
  validate: async (route) => {
    const id = route.params.id;
    // Check if id is a string, consists only of digits, and converts to a positive number
    return typeof id === 'string' && /^\d+$/.test(id) && parseInt(id, 10) > 0;
  }
});

// --- Reactive State ---
const bookId = computed(() => +route.params.id); // Convert validated param to number
const imageError = ref(false);
const showModal = ref(false);
const pdfPublicUrl = ref<string | null>(null);

// --- Helper Functions ---
function handleImageError() {
  console.warn(`Failed to load cover image for book ID ${bookId.value}. Displaying placeholder.`);
  imageError.value = true;
}

function openPdfModal() {
  if (!book.value?.storage_path) {
    console.warn('Attempted to open PDF modal, but no storage path available.');
    // Optionally show a user message (e.g., using a toast)
    $toast?.error('ملف الكتاب غير متاح للعرض حاليًا.'); // Example toast
    return;
  }
  showModal.value = true;
}

function closePdfModal() {
  showModal.value = false;
}

// --- Data Fetching ---
const { data: book, pending, error, refresh } = await useAsyncData<Book | null, Error>(
  `book-${bookId.value}`, // Key remains the same
  async () => {
    // Reset dependent state before fetching
    pdfPublicUrl.value = null;
    imageError.value = false; // Reset image error on new fetch/refresh

    // Fetch book data
    const { data: bookData, error: queryError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId.value)
      .maybeSingle(); // Use maybeSingle to handle null case gracefully

    if (queryError) {
      console.error(`Supabase query error fetching book ID ${bookId.value}:`, queryError);
      // Throw a Nuxt-compatible error
      throw createError({ statusCode: 500, statusMessage: `فشل تحميل الكتاب: ${queryError.message}`, fatal: true });
    }

    if (!bookData) {
      console.warn(`Book with ID ${bookId.value} not found.`);
      throw createError({ statusCode: 404, statusMessage: 'الكتاب المطلوب غير موجود.', fatal: true });
    }

    // --- Pre-fetch public URL for download ---
    if (bookData.storage_path) {
        try {
            const { data: urlData, error: urlError } = await supabase.storage
                .from(STORAGE_BUCKET_NAME)
                .getPublicUrl(bookData.storage_path);

            if (urlError) throw urlError; // Throw to be caught below

            if (urlData?.publicUrl) {
                pdfPublicUrl.value = urlData.publicUrl;
            } else {
                console.warn(`Received null publicUrl for path: ${bookData.storage_path}`);
            }

        } catch (urlErr: any) {
            // Log the error but don't block the page load
            console.error(`Failed to get public download URL for storage path "${bookData.storage_path}":`, urlErr.message || urlErr);
            // pdfPublicUrl remains null, download button won't render based on v-if
             // Optionally inform user via non-blocking method (e.g., toast)
             // $toast?.warning('لم نتمكن من إنشاء رابط التنزيل حاليًا.');
        }
    } else {
        console.log(`Book ID ${bookId.value} has no storage_path defined.`);
    }

    return bookData; // Return the fetched book data
  },
  {
    // Watch the bookId computed property. If it changes (navigation), data re-fetches.
    watch: [bookId],
    // immediate: true is the default and usually desired.
  }
);

// --- SEO Meta ---
// Use computed for dynamic updates based on fetched data or state
const pageTitle = computed(() => {
    if (pending.value) return 'جاري التحميل...';
    if (error.value || !book.value) return 'خطأ - الكتاب غير موجود';
    return book.value.title;
});

const pageDescription = computed(() => {
    if (pending.value) return 'جاري تحميل تفاصيل الكتاب...';
    if (error.value || !book.value) return 'حدث خطأ أثناء تحميل الكتاب أو أن الكتاب غير موجود.';
    return book.value.description?.substring(0, 160) || `تفاصيل ومعلومات عن كتاب ${book.value.title}`;
});

useHead({
  title: pageTitle, // Use computed property
  meta: [
    { name: 'description', content: pageDescription }, // Use computed property
    // Consider adding Open Graph and Twitter Card meta tags for better sharing
    { property: 'og:title', content: pageTitle },
    { property: 'og:description', content: pageDescription },
    { property: 'og:type', content: 'book' }, // More specific type
    // Add image only if available and no error
    ...(book.value?.cover_image_url && !imageError.value
        ? [{ property: 'og:image', content: book.value.cover_image_url }]
        : []
    ),
    // Twitter card tags
    { name: 'twitter:card', content: 'summary_large_image' }, // Use 'summary' if no good image
    { name: 'twitter:title', content: pageTitle },
    { name: 'twitter:description', content: pageDescription },
     ...(book.value?.cover_image_url && !imageError.value
        ? [{ name: 'twitter:image', content: book.value.cover_image_url }]
        : []
    ),
  ]
});

// --- Watchers ---
// Watch for the book data changing to reset specific UI states if needed
// Note: imageError and pdfPublicUrl are already reset within useAsyncData's fetcher function
// watch(book, (newBookData, oldBookData) => {
//    if (newBookData?.id !== oldBookData?.id) {
//       // Reset component-specific state not handled by useAsyncData internals if necessary
//       console.log(`Book changed from ${oldBookData?.id} to ${newBookData?.id}`);
//    }
// });

</script>

<style scoped>
/* Define reusable component classes using @apply */
.badge {
  @apply text-xs font-medium px-2.5 py-0.5 rounded-full shadow-sm whitespace-nowrap; /* Adjusted size, added whitespace-nowrap */
  /* Ensure badges don't overlap text too much if wrapping occurs */
}

.button-base {
 @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed; /* Added disabled states */
}

/* Primary button using the CSS variable defined in tailwind.config.js */
.button-primary {
  @apply button-base border-transparent text-white bg-primary hover:bg-primary-700 focus:ring-primary-500 dark:text-beige-light dark:bg-primary dark:hover:bg-opacity-80;
}

/* Secondary/Download button */
.button-secondary {
  @apply button-base border-gray-300 dark:border-gray-600 text-brown-dark dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-primary-500;
}

/* Tailwind's typography plugin prose adjustments */
.prose :where(p):not(:where([class~="not-prose"] *)) {
    margin-top: 0.75em; /* Slightly more spacing */
    margin-bottom: 0.75em;
}

/* Improve image container */
.aspect-\[3\/4\] { /* Common book cover aspect ratio */
    aspect-ratio: 3 / 4;
}

/* Ensure SVGs scale correctly and don't shrink */
svg {
    flex-shrink: 0;
}
</style>