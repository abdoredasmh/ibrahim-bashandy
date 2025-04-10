<template>
  <TransitionRoot appear :show="true" as="div"> 
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <!-- Backdrop -->
      <TransitionChild as="div" enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100" leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75" />
      </TransitionChild>

      <!-- Modal Container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
         
          <TransitionChild as="div" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <!-- Modal Panel -->
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-beige-light dark:bg-cream-gray p-6 text-end shadow-xl transition-all flex flex-col max-h-[90vh]">
              <!-- Header -->
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-brown-dark dark:text-brown-dark mb-4 flex justify-between items-center flex-shrink-0">
                <button type="button" class="button-close" @click="closeModal" aria-label="إغلاق">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><title>إغلاق</title><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                  <span class="hidden sm:inline ms-1">إغلاق</span>
                </button>
                <span class="truncate">تعديل الكتاب: {{ initialData.title }}</span>
              </DialogTitle>

              <!-- Form -->
              <form @submit.prevent="handleSubmit" class="mt-2 flex-grow space-y-4 overflow-y-auto px-1">
                <!-- Title -->
                <div>
                  <label for="edit-book-title" class="form-label">العنوان *</label>
                  <input type="text" id="edit-book-title" v-model="formData.title" required class="form-input">
                </div>

                <!-- Description -->
                <div>
                  <label for="edit-book-description" class="form-label">الوصف</label>
                  <textarea id="edit-book-description" v-model="formData.description" rows="3" class="form-input"></textarea>
                </div>

                <!-- Type (Research/Transcript) -->
                <div class="flex space-x-4 rtl:space-x-reverse">
                   <div class="flex items-center">
                     <input id="edit-is_research" v-model="formData.is_research" type="checkbox" class="form-checkbox">
                     <label for="edit-is_research" class="ms-2 form-label-inline">هل هو بحث؟</label>
                   </div>
                   <div class="flex items-center">
                     <input id="edit-is_transcript" v-model="formData.is_transcript" type="checkbox" class="form-checkbox">
                     <label for="edit-is_transcript" class="ms-2 form-label-inline">هل هو تفريغ؟</label>
                   </div>
                </div>

                 <!-- Linked Lesson -->
                <div>
                  <label for="edit-linked-lesson" class="form-label">ربط بدرس (اختياري)</label>
                  <select id="edit-linked-lesson" v-model="formData.linked_lesson_id" class="form-select">
                    <option :value="null">-- لا يوجد ربط --</option>
                    <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
                      {{ lesson.title }}
                    </option>
                  </select>
                </div>

                <!-- PDF File Upload -->
                <div>
                  <label for="edit-book-file" class="form-label">
                     ملف الكتاب (PDF)
                     <span class="text-xs text-gray-500 dark:text-gray-400">(اختياري: اختر ملفًا جديدًا لاستبدال الملف الحالي)</span>
                  </label>
                  <input type="file" id="edit-book-file" @change="handleFileChange" accept=".pdf" class="form-file-input">
                  <p v-if="newBookFile" class="mt-1 text-xs text-indigo-600 dark:text-indigo-400">الملف الجديد المختار: {{ newBookFile.name }}</p>
                  <p v-else-if="initialData.storage_path" class="mt-1 text-xs text-green-600 dark:text-green-400">الملف الحالي: {{ initialData.storage_path.split('/').pop() }}</p>
                  <p v-else class="mt-1 text-xs text-red-500 dark:text-red-400">لا يوجد ملف مرفق حاليًا.</p>
                </div>

                 <!-- Cover Image Upload (Optional) - Add similar logic if needed -->

                <!-- Error Message -->
                <div v-if="errorMessage" class="text-red-600 dark:text-red-400 text-sm bg-red-100 dark:bg-red-900/30 p-3 rounded-md">
                  {{ errorMessage }}
                </div>

              <!-- Form Actions -->
               <div class="pt-4 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                 <button type="button" @click="closeModal" :disabled="formLoading" class="button-secondary">
                   إلغاء
                 </button>
                 <button type="submit" :disabled="formLoading" class="button-primary">
                   <span v-if="formLoading">جاري الحفظ...</span>
                   <span v-else>حفظ التعديلات</span>
                 </button>
               </div>
              </form> <!-- End Form -->
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>


<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle,
} from '@headlessui/vue';
import type { Database } from '~/types/database.types';

// Define Types
type Book = Database['public']['Tables']['books']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];
type BookUpdate = Database['public']['Tables']['books']['Update'];

// Props definition
const props = defineProps<{
  book: Book; // Pass the whole book object for editing
  lessons: Lesson[];
}>();

// Emits definition
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'book-updated'): void;
}>();

// Supabase and State
const supabase = useSupabaseClient<Database>();
const formLoading = ref(false);
const errorMessage = ref('');
const newBookFile = ref<File | null>(null); // To track the NEWLY selected file
const initialData = reactive({ ...props.book }); // Copy initial data to avoid modifying prop directly

// Form data bound to the form fields
const formData = reactive<Omit<BookUpdate, 'id' | 'created_at' | 'storage_path'>>({
  title: '',
  description: '',
  is_research: false,
  is_transcript: false,
  linked_lesson_id: null,
  cover_image_url: null, // Add if you manage cover images
});

// Configuration
const STORAGE_BUCKET_NAME = 'book-files'; // Ensure this matches

// --- Initialize Form Data ---
onMounted(() => {
    // Populate form with initial data when component mounts
    formData.title = initialData.title;
    formData.description = initialData.description || '';
    formData.is_research = initialData.is_research || false;
    formData.is_transcript = initialData.is_transcript || false;
    formData.linked_lesson_id = initialData.linked_lesson_id;
    formData.cover_image_url = initialData.cover_image_url; // Add if needed
});

// --- File Handling ---
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    if (target.files[0].type === 'application/pdf') {
      newBookFile.value = target.files[0];
      errorMessage.value = '';
    } else {
      newBookFile.value = null;
      target.value = ''; // Clear the input
      errorMessage.value = 'الرجاء اختيار ملف PDF فقط.';
    }
  } else {
    newBookFile.value = null;
  }
}

// --- Form Submission (Update) ---
async function handleSubmit() {
  formLoading.value = true;
  errorMessage.value = '';
  let updatedStoragePath = initialData.storage_path; // Start with the current path
  const oldStoragePath = initialData.storage_path; // Keep track of the old path for deletion

  try {
    // 1. Upload NEW file if selected (and delete old one)
    if (newBookFile.value) {
        const file = newBookFile.value;
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const filePath = `public/${uniqueFileName}`; // Match your policy

        console.log(`Attempting to upload new file to: ${filePath}`);
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET_NAME)
            .upload(filePath, file);

        if (uploadError) throw new Error(`فشل رفع الملف الجديد: ${uploadError.message}`);

        updatedStoragePath = uploadData.path; // Get the path of the newly uploaded file
        console.log(`New file uploaded successfully: ${updatedStoragePath}`);

        // Delete the OLD file from storage AFTER successful upload of the new one
        if (oldStoragePath && oldStoragePath !== updatedStoragePath) { // Check if old path exists and is different
             console.log(`Attempting to remove old file: ${oldStoragePath}`);
             const { error: deleteError } = await supabase.storage
                 .from(STORAGE_BUCKET_NAME)
                 .remove([oldStoragePath]);
             if (deleteError) {
                 console.warn(`Could not delete old file ${oldStoragePath}:`, deleteError.message);
                 // Inform user, but don't block the update process
                 alert(`تم تحديث بيانات الكتاب ورفع الملف الجديد، ولكن فشل حذف الملف القديم (${oldStoragePath}) من التخزين.`);
             } else {
                  console.log(`Old file ${oldStoragePath} removed successfully.`);
             }
        }
    }
    // else: No new file selected, updatedStoragePath remains the initial path

    // (Optional) Handle new cover image upload/old deletion here

    // 2. Prepare data for DB update
    const bookDataToUpdate: BookUpdate = {
        ...formData,
        storage_path: updatedStoragePath, // Use the potentially updated path
         // cover_image_url: // Add updated cover URL if applicable
    };
     // Ensure linked_lesson_id is null if empty string
    if (bookDataToUpdate.linked_lesson_id === '') {
       bookDataToUpdate.linked_lesson_id = null;
    }

    // 3. Update book record in the database
    console.log(`Updating book ID ${initialData.id} with data:`, bookDataToUpdate);
    const { error: updateError } = await supabase
      .from('books')
      .update(bookDataToUpdate)
      .eq('id', initialData.id); // Use the initial ID from props

    if (updateError) {
        console.error("DB Update Error:", updateError);
        // If DB update fails, should we try to delete the newly uploaded file? Complex rollback.
        // For simplicity, report error. Manual cleanup might be needed.
         if (newBookFile.value && updatedStoragePath) {
             console.error(`CRITICAL: DB update failed after uploading new file: ${updatedStoragePath}. Manual cleanup of this file might be needed.`);
         }
         throw new Error(`فشل تحديث بيانات الكتاب: ${updateError.message}`);
    }

    // 4. Success
    console.log('Book updated successfully!');
    // Show success toast/message
    emit('book-updated');
    emit('close');

  } catch (err: any) {
    console.error('Error in handleSubmit (Edit):', err);
    errorMessage.value = err.message || 'حدث خطأ غير متوقع.';
  } finally {
    formLoading.value = false;
  }
}

// --- Close Modal ---
function closeModal() {
  if (!formLoading.value) {
    emit('close');
  }
}
</script>

<style scoped>
/* Add scoped styles, potentially reusing styles from Add modal */
.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 text-right mb-1;
}
.form-label-inline {
  @apply block text-sm text-gray-900 dark:text-gray-300;
}
.form-input, .form-select, .form-textarea {
   @apply mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm text-right;
}
.form-checkbox {
   @apply h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600;
}
.form-file-input {
   @apply mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100
          dark:file:bg-gray-600 dark:file:text-gray-200 dark:hover:file:bg-gray-500;
}
.button-primary, .button-secondary, .button-close { /* Ensure these match global styles */
    /* Add definitions if not globally available */
}
.button-close { /* Example definition */
  @apply inline-flex items-center justify-center rounded-md border border-transparent bg-red-100 dark:bg-red-800 px-3 py-1.5 text-sm font-medium text-red-900 dark:text-red-100 hover:bg-red-200 dark:hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-cream-gray;
}
.button-primary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50;
}
.button-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 disabled:opacity-50;
}
</style>