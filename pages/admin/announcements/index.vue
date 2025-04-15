<template>
  <div class="p-4 md:p-6 lg:p-8">
    <h1 class="text-2xl font-bold text-brown-dark dark:text-beige-light mb-6 border-b border-cream-gray dark:border-gray-700 pb-3">
      إدارة المواعيد والإعلانات
    </h1>

    <!-- Form Section -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-cream-gray dark:border-gray-700 max-w-2xl mx-auto">
      <h2 class="text-xl font-semibold text-brown-dark dark:text-beige-light mb-5">
        إضافة إعلان أو موعد جديد
      </h2>

      <form @submit.prevent="handleSubmit">
        <div class="space-y-5">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">العنوان <span class="text-red-500">*</span></label>
            <input
              v-model="formData.title"
              type="text"
              id="title"
              required
              class="w-full px-4 py-2 border border-cream-gray dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              placeholder="عنوان واضح للإعلان أو الموعد"
            />
          </div>

          <!-- Details -->
          <div>
            <label for="details" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التفاصيل</label>
            <textarea
              v-model="formData.details"
              id="details"
              rows="4"
              class="w-full px-4 py-2 border border-cream-gray dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              placeholder="وصف إضافي، مكان الموعد، ملاحظات..."
            ></textarea>
          </div>

          <!-- Type -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">النوع <span class="text-red-500">*</span></label>
            <select
              v-model="formData.type"
              id="type"
              required
              class="w-full px-4 py-2 border border-cream-gray dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="lecture">محاضرة / درس</option>
              <option value="announcement">إعلان عام</option>
            </select>
          </div>

          <!-- Date and Time -->
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">التاريخ والوقت (اختياري)</label>
            <input
              v-model="formData.date"
              type="datetime-local"
              id="date"
              class="w-full px-4 py-2 border border-cream-gray dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              placeholder="تاريخ ووقت الموعد (إن وجد)"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">اترك الحقل فارغاً إذا كان مجرد إعلان بدون تاريخ محدد.</p>
          </div>

          <!-- Link -->
          <div>
            <label for="link" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رابط إضافي (اختياري)</label>
            <input
              v-model="formData.link"
              type="url"
              id="link"
              class="w-full px-4 py-2 border border-cream-gray dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/details"
            />
          </div>

          <!-- Is Published -->
          <div class="flex items-center">
            <input
              v-model="formData.is_published"
              id="is_published"
              type="checkbox"
              class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-600 dark:border-gray-500"
            />
            <label for="is_published" class="ms-2 block text-sm text-gray-900 dark:text-gray-300">
              نشر هذا الإعلان (جعله مرئياً للعامة)
            </label>
          </div>
        </div>

        <!-- Feedback Messages -->
         <div v-if="successMessage" class="mt-4 p-3 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 rounded-md text-sm">
            {{ successMessage }}
         </div>
         <div v-if="errorMessage" class="mt-4 p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-md text-sm">
           خطأ: {{ errorMessage }}
         </div>

        <!-- Submit Button -->
        <div class="mt-6 pt-5 border-t border-cream-gray dark:border-gray-700">
          <button
            type="submit"
            :disabled="isLoading"
            class="inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 dark:focus:ring-offset-gray-800"
          >
            <svg v-if="isLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            {{ isLoading ? 'جاري الحفظ...' : 'حفظ الإعلان' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Placeholder for listing announcements (can be added later) -->
    <!-- <div class="mt-10">
      <h2 class="text-xl font-semibold text-brown-dark dark:text-beige-light mb-4">الإعلانات الحالية</h2>
    
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSupabaseClient } from '#imports'; // useSupabaseClient comes from @nuxtjs/supabase

definePageMeta({
  layout: 'admin', // Assuming you have an 'admin' layout
  middleware: ['admin-auth'] // Assuming you have auth middleware for admin routes
});

const client = useSupabaseClient();
const isLoading = ref(false);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

const formData = ref({
  title: '',
  details: '',
  type: 'announcement', // Default type
  date: '', // Stored as string from datetime-local
  link: '',
  is_published: false,
});

const resetForm = () => {
  formData.value = {
    title: '',
    details: '',
    type: 'announcement',
    date: '',
    link: '',
    is_published: false,
  };
};

const handleSubmit = async () => {
  isLoading.value = true;
  successMessage.value = null;
  errorMessage.value = null;

  try {
    // Prepare data for Supabase
    const dataToInsert = {
      title: formData.value.title,
      details: formData.value.details || null, // Use null if empty
      type: formData.value.type,
      date: formData.value.date ? new Date(formData.value.date).toISOString() : null, // Convert to ISO or null
      link: formData.value.link || null,
      is_published: formData.value.is_published,
    };

    const { error } = await client
      .from('announcements')
      .insert([dataToInsert]);

    if (error) {
      throw error;
    }

    successMessage.value = 'تم حفظ الإعلان بنجاح!';
    resetForm(); // Clear form after successful submission

  } catch (error: any) {
    console.error('Error saving announcement:', error);
    errorMessage.value = error.message || 'حدث خطأ غير متوقع أثناء حفظ الإعلان.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    filter: invert(0.6); /* Adjust based on light/dark mode if needed */
}
.dark input[type="datetime-local"]::-webkit-calendar-picker-indicator {
     filter: invert(0.8);
}
</style>