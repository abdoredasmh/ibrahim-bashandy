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
        <!-- استبدال NuxtIcon بـ SVG -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true">
           <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 0 0 1.5h4.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 1 0-1.02 1.1l2.1 1.95H9.25a.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" />
        </svg>
        <span>العودة إلى المكتبة</span>
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
             <!-- استبدال NuxtIcon بـ SVG -->
             <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-8xl text-gray-400 dark:text-gray-500" aria-hidden="true">
               <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.27a.75.75 0 0 0-.624-.744A8.25 8.25 0 0 1 6 18.75a8.25 8.25 0 0 1-5.25-2.268v-2.156a.75.75 0 0 0 .51-.698A8.217 8.217 0 0 1 6 13.5a8.182 8.182 0 0 1 5.25 1.406v-1.406a8.182 8.182 0 0 1-5.25 1.406 8.217 8.217 0 0 1-4.74-.954.75.75 0 0 0-.51-.698V9.732a8.25 8.25 0 0 1 5.25-2.268 8.25 8.25 0 0 1 5.25 2.268V9.376a.75.75 0 0 0 .624.744v1.27ZM12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533v-1.27a.75.75 0 0 1 .624-.744A8.25 8.25 0 0 0 18 18.75a8.25 8.25 0 0 0 5.25-2.268v-2.156a.75.75 0 0 1-.51-.698A8.217 8.217 0 0 0 18 13.5a8.182 8.182 0 0 0-5.25 1.406v-1.406a8.182 8.182 0 0 0 5.25 1.406 8.217 8.217 0 0 0 4.74-.954.75.75 0 0 1 .51-.698V9.732a8.25 8.25 0 0 0-5.25-2.268 8.25 8.25 0 0 0-5.25 2.268V9.376a.75.75 0 0 1-.624.744v1.27Z" />
             </svg>
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
                 <!-- استبدال NuxtIcon بـ SVG -->
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true">
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
                   class="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-brown-dark dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                 >
                   <!-- استبدال NuxtIcon بـ SVG -->
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true">
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
               <!-- استبدال NuxtIcon بـ SVG -->
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1" aria-hidden="true">
                  <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.665l3-3Z" />
                  <path d="M8.603 17.007a4 4 0 0 0 5.656-5.656l-3-3a4 4 0 0 0-5.865-.225.75.75 0 0 0 1.138.977 2.5 2.5 0 0 1 3.665.142l3 3a2.5 2.5 0 0 1-3.536 3.536l-1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 5.656 5.656Z" />
               </svg>
               <span>هذا تفريغ للدرس - اضغط هنا لعرض الدرس الأصلي</span>
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
      <!-- عرض قسم التعليقات فقط إذا كان bookId صالحاً وتم تحميل الكتاب -->
      <CommentSection
        v-if="!isNaN(bookId) && book"
        :book-id="bookId"
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
// تأكد من تحويل ID إلى رقم بشكل صحيح
const bookId = computed(() => {
    const idParam = route.params.id;
    const id = Array.isArray(idParam) ? Number(idParam[0]) : Number(idParam);
    return isNaN(id) ? -1 : id; // Return -1 if conversion fails
});


const imageError = ref(false);
const showModal = ref(false);
const pdfPublicUrl = ref<string | null>(null); // To store public URL for download button

function handleImageError() {
  imageError.value = true;
}

function openPdfModal() {
  showModal.value = true;
}

function closePdfModal() {
  showModal.value = false;
}

// --- Fetch Book Data ---
const { data: book, pending, error, refresh } = await useAsyncData<Book | null>(
  `book-${bookId.value}`, // Unique key including the book ID
  async () => {
    if (bookId.value === -1) {
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
                .from('library_files') // تأكد من اسم الـ Bucket الصحيح
                .getPublicUrl(data.storage_path);
            if (urlError) throw urlError;
            pdfPublicUrl.value = urlData.publicUrl;
        } catch (urlErr: any) {
            console.error("Failed to get public URL for download button:", urlErr);
            pdfPublicUrl.value = null;
        }
    } else {
        pdfPublicUrl.value = null; // Ensure it's null if no storage path
    }

    return data;
  },
  {
    watch: [bookId] // Watch the bookId to refetch if the route parameter changes
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