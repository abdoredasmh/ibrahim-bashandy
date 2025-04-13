<template>
   <!-- Backdrop -->
   <div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="closeModal">
      <!-- Modal Content -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
         <div class="p-6">
            <!-- Header -->
            <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
               <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                  {{ isEditing ? 'تعديل الدورة' : 'إضافة دورة جديدة' }}
               </h3>
               <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
               <!-- Title -->
               <div>
                  <label for="course-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">العنوان *</label>
                  <input type="text" id="course-title" v-model="formData.title" required class="admin-input">
               </div>

               <!-- Description -->
               <div>
                  <label for="course-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</label>
                  <textarea id="course-description" v-model="formData.description" rows="4" class="admin-input"></textarea>
               </div>

               <!-- Category -->
               <div>
                 <label for="course-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الفئة (اختياري)</label>
                 <select id="course-category" v-model="formData.category_id" class="admin-select">
                   <option :value="null">-- اختر فئة --</option>
                   <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                 </select>
               </div>

               <!-- YouTube Playlist URL -->
                <div>
                  <label for="course-youtube-playlist" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط قائمة تشغيل يوتيوب (اختياري)</label>
                  <input type="url" id="course-youtube-playlist" v-model="formData.youtube_playlist_url" class="admin-input" placeholder="https://www.youtube.com/playlist?list=...">
               </div>

                <!-- Image URL (or File Upload) -->
                <div>
                  <label for="course-image-url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط صورة الغلاف (اختياري)</label>
                   <input type="url" id="course-image-url" v-model="formData.image_url" class="admin-input" placeholder="https://...">
                   <!-- Alternative: File Upload Component for Image -->
                   <!-- <input type="file" @change="handleImageUpload" accept="image/*"> -->
                   <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">أدخل رابطًا مباشرًا للصورة أو اترك الحقل فارغًا لاستخدام صورة افتراضية.</p>
               </div>

                <!-- Is Active Checkbox -->
                <div class="flex items-center">
                  <input id="is_active" v-model="formData.is_active" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600">
                  <label for="is_active" class="ms-2 block text-sm text-gray-900 dark:text-gray-300">نشر الدورة (مرئية للطلاب)</label>
                </div>


               <!-- Error Message -->
               <div v-if="errorMessage" class="text-red-600 dark:text-red-400 text-sm">
                  {{ errorMessage }}
               </div>

               <!-- Actions -->
               <div class="pt-4 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700">
                  <button type="button" @click="closeModal" :disabled="formLoading" class="button-secondary">إلغاء</button>
                  <button type="submit" :disabled="formLoading" class="button-primary">
                     <span v-if="formLoading">جاري الحفظ...</span>
                     <span v-else>{{ isEditing ? 'حفظ التعديلات' : 'إضافة الدورة' }}</span>
                  </button>
               </div>
            </form>
         </div>
      </div>
   </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import type { Database, Tables } from '~/types/database.types';

type Course = Tables<'study_courses'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;
type CourseInsert = Tables<'study_courses'>['Insert'];
type CourseUpdate = Tables<'study_courses'>['Update'];

const props = defineProps<{
  courseData: Course | null; // Null when adding, object when editing
  categories: Category[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void; // Emitted on successful save
}>();

const supabase = useSupabaseClient<Database>();
const formLoading = ref(false);
const errorMessage = ref('');

const isEditing = computed(() => !!props.courseData?.id);

// Initialize form data
const formData = reactive<Partial<Course>>({ // Use Partial for easier initialization
    title: '',
    description: null,
    category_id: null,
    youtube_playlist_url: null,
    image_url: null,
    is_active: false, // Default to inactive
});

// Watch prop changes to populate form for editing
watch(() => props.courseData, (newCourse) => {
  if (newCourse) {
    // Populate form with existing data for editing
    formData.title = newCourse.title;
    formData.description = newCourse.description;
    formData.category_id = newCourse.category_id;
    formData.youtube_playlist_url = newCourse.youtube_playlist_url;
    formData.image_url = newCourse.image_url;
    formData.is_active = newCourse.is_active ?? false; // Handle null case for is_active
  } else {
    // Reset form for adding
    formData.title = '';
    formData.description = null;
    formData.category_id = null;
    formData.youtube_playlist_url = null;
    formData.image_url = null;
    formData.is_active = false;
  }
  errorMessage.value = ''; // Clear error on prop change
}, { immediate: true }); // Run immediately on component mount


async function handleSubmit() {
    formLoading.value = true;
    errorMessage.value = '';

    // Prepare data, ensuring empty strings become null for optional fields
    const dataToSubmit = {
        title: formData.title,
        description: formData.description || null,
        category_id: formData.category_id || null,
        youtube_playlist_url: formData.youtube_playlist_url || null,
        image_url: formData.image_url || null,
        is_active: formData.is_active || false, // Ensure boolean
    };


    try {
         if (isEditing.value && props.courseData?.id) {
            // Update existing course
            const { error } = await supabase
                .from('study_courses')
                .update(dataToSubmit as CourseUpdate) // Type assertion
                .eq('id', props.courseData.id);
            if (error) throw error;
            console.log('Course updated successfully!');
        } else {
            // Insert new course
             const { error } = await supabase
                .from('study_courses')
                .insert(dataToSubmit as CourseInsert); // Type assertion
            if (error) throw error;
            console.log('Course added successfully!');
        }
        emit('saved');
        emit('close');

    } catch (err: any) {
        console.error('Error saving course:', err.message);
        errorMessage.value = `فشل حفظ الدورة: ${err.message}`;
    } finally {
        formLoading.value = false;
    }
}

function closeModal() {
  if (!formLoading.value) {
    emit('close');
  }
}
</script>

<style scoped>
/* Reuse admin input/select/button styles or define specific ones */
 .admin-input, .admin-select {
     @apply block w-full p-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500;
}
 .button-primary {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-olive-green hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-olive-green disabled:opacity-50;
}
.button-secondary {
   @apply px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500 disabled:opacity-50;
}
</style>