<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <!-- Backdrop -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75" />
      </TransitionChild>

      <!-- Modal Container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <!-- Modal Panel -->
            <DialogPanel class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-beige-light dark:bg-cream-gray p-6 text-end shadow-xl transition-all flex flex-col max-h-[90vh]"> {/* Changed height to max-h */}
              <!-- Header: Title & Close Button -->
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-brown-dark dark:text-brown-dark mb-4 flex justify-between items-center flex-shrink-0">
                {/* Close Button */}
                <button
                  type="button"
                  class="button-close" 
                  @click="closeModal"
                  aria-label="إغلاق العارض"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <title>إغلاق</title>
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  <span class="hidden sm:inline ms-1">إغلاق</span> 
                </button>
                {/* Title */}
                <span class="truncate">{{ bookTitle || 'عرض المستند' }}</span>
              </DialogTitle>

              <!-- PDF Viewer Area -->
              <div class="mt-2 flex-grow border border-cream-gray dark:border-gray-700 rounded overflow-hidden flex flex-col min-h-[400px]"> 
                <!-- Loading State -->
                <div v-if="loading" class="flex items-center justify-center h-full p-8">
                  <LoadingSpinner />
                  <p class="ms-3 text-gray-600 dark:text-gray-400">جارٍ تحميل الملف...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="pdfUrlError" class="flex flex-col items-center justify-center h-full p-8 text-red-600 dark:text-red-400 text-center">
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <title>خطأ</title>
                      <path fill-rule="evenodd" d="M8.257 3.099c.763-1.36 2.683-1.36 3.446 0l6.518 11.636c.75 1.34-.213 3.01-1.723 3.01H3.462c-1.51 0-2.473-1.67-1.723-3.01L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-6a1 1 0 00-.993.883L9 8v3a1 1 0 001.993.117L11 11V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                   </svg>
                  <p class="font-semibold">حدث خطأ أثناء تحميل رابط الملف.</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ pdfUrlError }}</p>
                  <button @click="fetchPublicUrl" class="mt-4 button-secondary text-sm">
                     إعادة المحاولة
                  </button>
                </div>

                <!-- iFrame Viewer -->
                <iframe
                  v-else-if="pdfPublicUrl"
                  :src="pdfPublicUrl"
                  class="w-full h-full border-none flex-grow" 
                  frameborder="0"
                  :title="`عارض PDF لـ ${bookTitle || 'المستند'}`"
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups" 
                >
                  <p class="p-4 text-center text-gray-600 dark:text-gray-400">متصفحك لا يدعم عرض PDF في إطار. حاول استخدام زر التنزيل.</p> 
                </iframe>

                <!-- No File State -->
                <div v-else class="flex items-center justify-center h-full p-8 text-gray-500 dark:text-gray-400">
                  <p>لم يتم تحديد ملف لعرضه.</p>
                </div>
              </div>

              <!-- Footer: Download Button -->
              <div class="mt-4 text-start flex-shrink-0">
                <a
                  v-if="pdfPublicUrl && !pdfUrlError"
                  :href="pdfPublicUrl"
                  target="_blank"
                  download
                  class="button-primary" 
                  rel="noopener noreferrer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 me-2" fill="currentColor" viewBox="0 0 20 20">
                    <title>تنزيل</title>
                    <path fill-rule="evenodd" d="M3 14.25A2.25 2.25 0 015.25 12h9.5A2.25 2.25 0 0117 14.25v1.5A2.25 2.25 0 0114.75 18h-9.5A2.25 2.25 0 013 15.75v-1.5zM10 3a.75.75 0 01.75.75v6.19l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.22 2.22V3.75A.75.75 0 0110 3z" clip-rule="evenodd" />
                  </svg>
                  <span>تنزيل الملف</span>
                </a>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import type { Database } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';

// Props definition remains the same
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  storagePath: {
    type: String as () => string | null,
    default: null,
  },
  bookTitle: {
    type: String as () => string | null,
    default: 'المستند', // Provide a default title
  }
});

const emit = defineEmits(['close']);

const supabase = useSupabaseClient<Database>();
const pdfPublicUrl = ref<string | null>(null);
const loading = ref(false);
const pdfUrlError = ref<string | null>(null);

// --- Configuration ---
// Ideally, get this from Nuxt config or .env
const BUCKET_NAME = 'library_files'; // Double-check this matches your Supabase bucket name

// --- Fetch PDF Public URL ---
async function fetchPublicUrl() {
  if (!props.storagePath) {
    pdfPublicUrl.value = null;
    pdfUrlError.value = 'لم يتم توفير مسار للملف.';
    loading.value = false;
    return;
  }

  loading.value = true;
  pdfUrlError.value = null;
  pdfPublicUrl.value = null; // Reset URL before fetching

  try {
    console.debug(`Fetching URL for path: ${props.storagePath} in bucket: ${BUCKET_NAME}`);
    // Note: getPublicUrl doesn't throw an error for non-existent files by default,
    // it returns an error object. We handle that below.
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(props.storagePath); // Use the path directly

    // Handle potential errors from the Supabase client call
    if (error) {
        console.error('Supabase storage error getting public URL:', error);
        // Check for common errors
        if (error.message.includes('Object not found')) {
           throw new Error('الملف المحدد غير موجود في التخزين.');
        }
        throw new Error(`فشل في الوصول إلى الملف: ${error.message}`);
    }

    // Validate the returned data
    if (data && data.publicUrl) {
        console.debug('Public URL obtained:', data.publicUrl);
        pdfPublicUrl.value = data.publicUrl;
        // You could add a check here to see if the URL is reachable,
        // but it adds complexity and network requests. Let the iframe handle it.
    } else {
        // This case might occur if the path exists but something else went wrong
        console.warn('No public URL returned from Supabase despite no error.');
        throw new Error('لم يتم استلام رابط عام صالح للملف.');
    }

  } catch (err: any) {
     console.error('Error fetching or processing public URL:', err);
     pdfUrlError.value = err.message || 'حدث خطأ غير متوقع أثناء تحميل الملف.';
     pdfPublicUrl.value = null; // Ensure URL is null on error
  } finally {
    loading.value = false;
  }
}

// --- Watchers ---
// Fetch URL when modal becomes visible
watch(() => props.show, (isVisible) => {
  if (isVisible) {
    fetchPublicUrl();
  } else {
     // Clear state when modal hides to prevent showing old data briefly if reopened quickly
     pdfPublicUrl.value = null;
     pdfUrlError.value = null;
     loading.value = false;
  }
});

// Re-fetch if storagePath changes while modal is open
watch(() => props.storagePath, (newPath, oldPath) => {
   if (props.show && newPath !== oldPath) {
       fetchPublicUrl();
   }
});

// --- Actions ---
function closeModal() {
  emit('close');
}

</script>

<style scoped>
/* Reuse button styles if defined globally or define locally */
.button-base {
 @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-cream-gray transition-colors duration-200 shadow-sm;
}

.button-primary {
  @apply button-base border-transparent text-white bg-primary hover:bg-primary-700 focus:ring-primary-500 dark:text-beige-light dark:bg-primary dark:hover:bg-opacity-80;
}

.button-secondary {
  @apply button-base border-gray-300 dark:border-gray-600 text-brown-dark dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-primary-500;
}

/* Specific style for the close button in the modal header */
.button-close {
  @apply inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 dark:bg-red-800 px-3 py-1.5 text-sm font-medium text-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-cream-gray;
  /* Optional: Adjust padding/size */
}

/* Ensure iframe takes available space */
iframe {
  display: block; /* Remove potential extra space below iframe */
}
</style>