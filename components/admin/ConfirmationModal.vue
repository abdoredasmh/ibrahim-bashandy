<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                {{ config?.title || 'تأكيد الإجراء' }}
              </DialogTitle>
              <div class="mt-3">
                <p class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                  {{ config?.message || 'هل أنت متأكد من رغبتك في المتابعة؟' }}
                </p>
              </div>

              <div class="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3 justify-center sm:justify-start">
                <button
                  type="button"
                  :class="['inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800', config?.confirmClass || 'bg-red-600 hover:bg-red-700 focus:ring-red-500']"
                  @click="confirmAction"
                >
                  {{ config?.confirmText || 'تأكيد' }}
                </button>
                <button
                  type="button"
                  class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  @click="closeModal"
                >
                  {{ config?.cancelText || 'إلغاء' }}
                </button>
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
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
} from '@headlessui/vue'; // تأكد من تثبيت headlessui/vue

// Define the structure for the confirmation configuration
export interface ConfirmationConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmClass?: string; // e.g., 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
}

const props = defineProps<{
  config: ConfirmationConfig | null;
  modelValue?: boolean; // Optional v-model support
}>();

const emit = defineEmits(['confirm', 'close', 'update:modelValue']);

const isOpen = ref(props.modelValue ?? false);

watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) {
    isOpen.value = newVal;
  }
});

watch(() => props.config, (newConfig) => {
  if (newConfig) {
    isOpen.value = true; // Open modal when config is set
  }
}, { immediate: true });


function closeModal() {
  isOpen.value = false;
  emit('update:modelValue', false);
  emit('close');
}

function confirmAction() {
  emit('confirm');
  // Don't close modal here, let the parent close it after action execution
  // closeModal();
}
</script>