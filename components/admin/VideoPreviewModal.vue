<!-- components/admin/VideoPreviewModal.vue -->
<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-[60]"> 

      <TransitionChild
        as="div"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      />

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-4 text-left align-middle shadow-xl transition-all">
               <DialogTitle
                  as="h3"
                  class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex justify-between items-center"
                >
                  <span>معاينة الفيديو</span>
                  <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                     </svg>
                  </button>
                </DialogTitle>
              <div class="mt-4 aspect-video">
                 <iframe
                   v-if="embedUrl"
                   :src="embedUrl"
                   frameborder="0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                   allowfullscreen
                   class="w-full h-full"
                 ></iframe>
                 <div v-else class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                    لا يمكن تحميل الفيديو.
                 </div>
              </div>

              <!-- <div class="mt-4 flex justify-end">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 dark:bg-blue-900 px-4 py-2 text-sm font-medium text-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  @click="closeModal"
                >
                  إغلاق
                </button>
              </div> -->
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';

const props = defineProps<{
  show: boolean;
  videoUrl: string | null;
}>();

const emit = defineEmits(['close']);

const getYoutubeVideoId = (url: string | null | undefined): string | null => {
   if (!url) return null;
   try {
     const urlObj = new URL(url);
     if (urlObj.hostname === 'youtu.be') {
       return urlObj.pathname.slice(1);
     }
     if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
       return urlObj.searchParams.get('v');
     }
   } catch (e) {
     const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
     const match = url.match(regex);
     if (match && match[1]) {
        return match[1];
     }
   }
   return null;
 };

const embedUrl = computed(() => {
  const videoId = getYoutubeVideoId(props.videoUrl);
  if (!videoId) return null;
  // إضافة ?autoplay=1 لتشغيل الفيديو تلقائيًا عند فتح المودال (اختياري)
  // إضافة &modestbranding=1 لإخفاء شعار يوتيوب قليلًا
  // إضافة &rel=0 لمنع عرض الفيديوهات المقترحة من قنوات أخرى في النهاية
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
});

function closeModal() {
  emit('close');
}
</script>