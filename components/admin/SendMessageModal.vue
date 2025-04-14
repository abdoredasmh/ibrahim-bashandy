<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-40">
       <!-- ... (Backdrop similar to ConfirmationModal) ... -->
       <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
         <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
       </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
           <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3">
                إرسال رسالة خاصة إلى {{ user?.full_name || user?.auth_email }}
              </DialogTitle>

              <form @submit.prevent="sendMessage">
                 <div class="mt-4 space-y-4">
                   <div>
                     <label for="message-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">عنوان الرسالة *</label>
                     <input type="text" id="message-title" v-model="messageTitle" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                   </div>
                   <div>
                     <label for="message-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">محتوى الرسالة *</label>
                     <textarea id="message-content" v-model="messageContent" rows="6" required placeholder="اكتب رسالتك هنا..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                   </div>
                   <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
                 </div>

                 <div class="mt-6 flex justify-start gap-3">
                    <button
                      type="submit"
                      :disabled="isLoading || !messageTitle.trim() || !messageContent.trim()"
                      class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                    >
                       <LoadingSpinner v-if="isLoading" class="w-5 h-5 text-white -ml-1 mr-2" />
                      {{ isLoading ? 'جارٍ الإرسال...' : 'إرسال الرسالة' }}
                    </button>
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      @click="closeModal"
                      :disabled="isLoading"
                    >
                      إلغاء
                    </button>
                 </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';
import {
  Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild
} from '@headlessui/vue';
import type { Database, Tables } from '~/types/database.types';
import { useSupabaseClient } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue';

// Define the user type expected by the modal
type UserProp = {
    id: string;
    full_name: string | null;
    auth_email?: string | null; // Optional email from auth
} | null;

const props = defineProps({
  user: {
    type: Object as PropType<UserProp>,
    required: true,
  },
  modelValue: { // For v-model support
    type: Boolean,
    default: false,
  }
});

const emit = defineEmits(['close', 'sent', 'update:modelValue']);

const supabase = useSupabaseClient<Database>();
const isOpen = ref(props.modelValue);
const messageTitle = ref('');
const messageContent = ref('');
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal;
  if (newVal) {
    // Reset form when modal opens
    messageTitle.value = '';
    messageContent.value = '';
    errorMessage.value = null;
    isLoading.value = false;
  }
});

function closeModal() {
  if (isLoading.value) return; // Prevent closing while submitting
  isOpen.value = false;
  emit('update:modelValue', false);
  emit('close');
}

async function sendMessage() {
  if (!props.user || !messageTitle.value.trim() || !messageContent.value.trim() || isLoading.value) {
      errorMessage.value = "الرجاء ملء العنوان والمحتوى.";
      return;
  }

  isLoading.value = true;
  errorMessage.value = null;

  try {
      const payload: Omit<Tables<'user_private_messages'>, 'id' | 'created_at' | 'is_read' | 'related_question_id' | 'user_reply_text' | 'user_replied_at' | 'admin_read_reply'> = {
          user_id: props.user.id,
          title: messageTitle.value.trim(),
          content: messageContent.value.trim(),
          source: 'admin_direct_message' // Indicate it's a direct message
      };

      const { error } = await supabase
          .from('user_private_messages')
          .insert(payload);

      if (error) throw error;

      emit('sent', true); // Emit success
      closeModal();

  } catch (err: any) {
      console.error("Error sending private message:", err);
      errorMessage.value = err.message || "فشل إرسال الرسالة.";
      emit('sent', false, errorMessage.value); // Emit failure with message
  } finally {
      isLoading.value = false;
  }
}
</script>