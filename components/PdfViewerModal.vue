<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
       
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75" />
      </TransitionChild>

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
            <DialogPanel class="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-beige-light dark:bg-cream-gray p-6 text-end shadow-xl transition-all flex flex-col" style="height: 90vh;">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-brown-dark dark:text-brown-dark mb-4 flex justify-between items-center">
                 <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-red-100 dark:bg-red-900 px-4 py-2 text-sm font-medium text-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-cream-gray"
                    @click="closeModal"
                  >
                    <NuxtIcon name="heroicons:x-mark-20-solid" class="w-5 h-5" />
                    إغلاق
                  </button>
                 <span>{{ bookTitle || 'عرض المستند' }}</span>
              </DialogTitle>

              <!-- PDF Viewer Area -->
              <div class="mt-2 flex-grow border border-cream-gray dark:border-gray-700 rounded overflow-hidden">
                <div v-if="loading" class="flex items-center justify-center h-full">
                   <LoadingSpinner />
                   <p class="ms-2 text-gray-600 dark:text-gray-400">جارٍ تحميل الملف...</p>
                </div>
                <div v-else-if="pdfUrlError" class="flex flex-col items-center justify-center h-full text-red-600 dark:text-red-400">
                  <NuxtIcon name="heroicons:exclamation-triangle-solid" class="w-12 h-12 mb-2"/>
                  <p>حدث خطأ أثناء تحميل رابط الملف.</p>
                   <p class="text-sm text-gray-500 mt-1">{{ pdfUrlError }}</p>
                </div>
                <iframe
                  v-else-if="pdfPublicUrl"
                  :src="pdfPublicUrl"
                  class="w-full h-full border-none"
                  frameborder="0"
                  title="عارض PDF"
                >
                  <p>متصفحك لا يدعم عرض ملفات PDF المضمنة. يمكنك <a :href="pdfPublicUrl" target="_blank" download>تنزيل الملف</a> بدلاً من ذلك.</p>
                </iframe>
                 <div v-else class="flex items-center justify-center h-full text-gray-500">
                    <p>لم يتم تحديد ملف لعرضه.</p>
                 </div>
              </div>

              <!-- Optional: Add download button -->
               <div class="mt-4 text-start">
                 <a
                   v-if="pdfPublicUrl && !pdfUrlError"
                   :href="pdfPublicUrl"
                   target="_blank"
                   download
                   class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-cream-gray"
                   :style="{ backgroundColor: 'var(--color-olive-green)' }"
                 >
                   <NuxtIcon name="heroicons:arrow-down-tray-20-solid" class="w-5 h-5 me-2"/>
                   تنزيل الملف
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
import { ref, watch, computed } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue'; // Make sure @headlessui/vue is installed
import type { Database } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';

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
    default: null,
  }
});

const emit = defineEmits(['close']);

const supabase = useSupabaseClient<Database>();
const pdfPublicUrl = ref<string | null>(null);
const loading = ref(false);
const pdfUrlError = ref<string | null>(null);

// --- Bucket Name (Confirm this matches your Supabase bucket) ---
const BUCKET_NAME = 'library-files';

// Function to fetch the public URL when the modal opens or storagePath changes
async function fetchPublicUrl() {
  if (!props.storagePath) {
    pdfPublicUrl.value = null;
    pdfUrlError.value = null;
    loading.value = false;
    return;
  }

  loading.value = true;
  pdfUrlError.value = null;
  pdfPublicUrl.value = null; // Reset URL

  try {
    console.log(`Fetching URL for path: ${props.storagePath} in bucket: ${BUCKET_NAME}`);
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(props.storagePath); // Use the path directly

    if (error) {
      console.error('Error getting public URL:', error);
      throw new Error(`لا يمكن الوصول إلى الملف: ${error.message}`);
    }

    if (data && data.publicUrl) {
       console.log('Public URL obtained:', data.publicUrl);
      // Sometimes Supabase returns a URL that might need encoding, but usually it's fine.
      // Let's test with the direct URL first.
      pdfPublicUrl.value = data.publicUrl;
      // Optional: Pre-fetch or check if the URL is valid? Maybe not necessary for iframe.
    } else {
        throw new Error('لم يتم إرجاع رابط عام للملف.');
    }

  } catch (err: any) {
     console.error('Caught error in fetchPublicUrl:', err);
     pdfUrlError.value = err.message || 'حدث خطأ غير متوقع.';
     pdfPublicUrl.value = null;
  } finally {
    loading.value = false;
  }
}

// Watch for changes in `show` prop to trigger URL fetch when modal opens
watch(() => props.show, (newValue) => {
  if (newValue) {
    fetchPublicUrl(); // Fetch URL when modal becomes visible
  } else {
     // Optionally clear state when modal hides
     pdfPublicUrl.value = null;
     pdfUrlError.value = null;
     loading.value = false;
  }
});

// Watch for changes in storagePath in case the same modal is reused for different books quickly
watch(() => props.storagePath, (newPath, oldPath) => {
   // Only refetch if the modal is already showing and the path actually changed
   if (props.show && newPath !== oldPath) {
       fetchPublicUrl();
   }
});


function closeModal() {
  emit('close');
}

</script>

<style scoped>
/* Add any specific styles for the modal if needed */
iframe {
  min-height: 400px; /* Ensure iframe has a minimum height */
}
</style>