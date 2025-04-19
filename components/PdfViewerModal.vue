<template>
  <ClientOnly>
    <TransitionRoot appear :show="show" as="div">
      <Dialog as="div" @close="closeModal" class="relative z-50">
        <!-- Backdrop -->
        <TransitionChild
          as="div"
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
              as="div"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <!-- Modal Panel -->
              <DialogPanel class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-beige-light dark:bg-cream-gray p-6 text-end shadow-xl transition-all flex flex-col max-h-[90vh]">
                <!-- Header: Title & Close Button -->
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-brown-dark dark:text-brown-dark mb-4 flex justify-between items-center flex-shrink-0">
                  <!-- Close Button -->
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
                  <!-- Title -->
                  <span class="truncate">{{ bookTitle || 'عرض المستند' }}</span>
                </DialogTitle>

                <!-- PDF Viewer Area -->
                <div class="mt-2 flex-grow border border-cream-gray dark:border-gray-700 rounded overflow-hidden flex flex-col min-h-[400px]">
                  <!-- Loading State -->
                  <div v-if="loading" class="flex items-center justify-center h-full p-8" aria-live="polite">
                    <LoadingSpinner />
                    <p class="ms-3 text-gray-600 dark:text-gray-400">جارٍ تحميل الملف...</p>
                  </div>

                  <!-- Error State -->
                  <div v-else-if="pdfUrlError" class="flex flex-col items-center justify-center h-full p-8 text-red-600 dark:text-red-400 text-center" aria-live="assertive">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mb-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <title>خطأ</title>
                      <path fill-rule="evenodd" d="M8.257 3.099c.763-1.36 2.683-1.36 3.446 0l6.518 11.636c.75 1.34-.213 3.01-1.723 3.01H3.462c-1.51 0-2.473-1.67-1.723-3.01L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-6a1 1 0 00-.993.883L9 8v3a1 1 0 001.993.117L11 11V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                    <p class="font-semibold">حدث خطأ أثناء تحميل الملف.</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ pdfUrlError }}</p> {/* Display user-friendly error */}
                    <button @click="fetchPublicUrl" class="mt-4 button-secondary text-sm">
                      إعادة المحاولة
                    </button>
                  </div>

                  <!-- PDF Iframe -->
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
  </ClientOnly>
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
import type { StorageError } from '@supabase/storage-js'; // Import StorageError type
import LoadingSpinner from '~/components/LoadingSpinner.vue';

const props = defineProps({
  show: Boolean,
  storagePath: String,
  bookTitle: String
});

const emit = defineEmits(['close']);

const supabase = useSupabaseClient<Database>();
const pdfPublicUrl = ref<string | null>(null);
const loading = ref(false);
const pdfUrlError = ref<string | null>(null); // Will store user-friendly message

const BUCKET_NAME = 'book-files';

// Function to translate storage errors to user-friendly messages
function getUserFriendlyErrorMessage(error: StorageError | Error): string {
   // Log the original error for debugging

  if ('statusCode' in error) { // Check if it's a StorageError
    switch (error.statusCode) {
      case '404':
        return 'الملف المطلوب غير موجود. قد يكون تم حذفه أو تغيير مساره.';
      case '403':
        return 'ليس لديك الصلاحية للوصول إلى هذا الملف.';
      case '400': // Example for potentially bad path or similar
        return 'حدث خطأ في طلب الملف. يرجى التحقق من صحة الرابط.';
      // Add other common Supabase Storage error codes as needed
      default:
        return `حدث خطأ غير متوقع (${error.statusCode}). يرجى المحاولة مرة أخرى.`;
    }
  }
  // Generic fallback
  return error.message || 'حدث خطأ غير معروف أثناء محاولة الوصول للملف.';
}

async function fetchPublicUrl() {
  if (!process.client) return;

  // Improved check for invalid storagePath
  if (!props.storagePath || props.storagePath.trim() === '') {
    pdfPublicUrl.value = null;
    pdfUrlError.value = 'لم يتم توفير مسار صالح للملف.';
    loading.value = false;
    return;
  }

  loading.value = true;
  pdfUrlError.value = null;
  pdfPublicUrl.value = null;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(props.storagePath);

    // Handle Supabase storage error specifically
    if (error) throw error; // Throw the specific StorageError

    if (!data?.publicUrl) {
      // This case might indicate an issue even without a direct 'error' object
      throw new Error('لم يتم استلام رابط عام صالح للملف من الخادم.');
    }

    pdfPublicUrl.value = data.publicUrl;

  } catch (err: any) {
    // Use the helper function to get a user-friendly message
    pdfUrlError.value = getUserFriendlyErrorMessage(err);
    pdfPublicUrl.value = null;

  } finally {
    loading.value = false;
  }
}

watch(() => props.show, (isVisible) => {
  if (isVisible) fetchPublicUrl();
  else {
    // Reset state when modal closes
    pdfPublicUrl.value = null;
    pdfUrlError.value = null;
    loading.value = false;
  }
});

// Re-fetch if the path changes while the modal is open
watch(() => props.storagePath, (newPath, oldPath) => {
  if (props.show && newPath !== oldPath && newPath) {
     fetchPublicUrl();
  } else if (props.show && !newPath) {
      // Handle case where path becomes invalid while modal is open
      pdfPublicUrl.value = null;
      pdfUrlError.value = 'تمت إزالة مسار الملف.';
      loading.value = false;
  }
});

function closeModal() {
  emit('close');
}
</script>

<style scoped>
.button-base {
  @apply inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-cream-gray transition-colors duration-200 shadow-sm;
}

.button-primary {
  @apply button-base border-transparent text-white bg-primary hover:bg-primary-700 focus:ring-primary-500 dark:text-beige-light dark:bg-primary dark:hover:bg-opacity-80;
}

.button-secondary {
  @apply button-base border-gray-300 dark:border-gray-600 text-brown-dark dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-primary-500;
}

.button-close {
  @apply inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 dark:bg-red-800 px-3 py-1.5 text-sm font-medium text-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-cream-gray;
}

iframe {
  display: block;
}
</style>