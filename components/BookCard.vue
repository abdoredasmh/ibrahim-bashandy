<template>
  <div
    class="book-card-link block bg-beige-light dark:bg-cream-gray rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer"
    @click="navigateTo(`/books/${book.id}`)"
  >
    <div class="flex flex-col h-full">
      <!-- Book Cover Image Area -->
      <div class="relative h-48 bg-cream-gray dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
        <img
          v-if="book.cover_image_url && !imageError"
          :src="book.cover_image_url"
          :alt="`غلاف ${book.title}`"
          class="w-full h-full object-cover"
          @error.stop="handleImageError"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="text-6xl text-gray-400 dark:text-gray-500 w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4v16c0 .6.4 1 1 1h13v-2H8V5h12V3H7c-.6 0-1 .4-1 1zm3 2h8v2H9V6zm0 4h8v2H9v-2zm0 4h5v2H9v-2z"/>
          </svg>
        </div>

        <!-- Badges -->
        <div class="absolute top-2 start-2 flex gap-1">
          <span
            v-if="book.is_research"
            class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300"
          >
            بحث
          </span>
          <span
            v-if="book.is_transcript"
            class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300"
          >
            تفريغ
          </span>
        </div>
      </div>

      <!-- Book Details -->
      <div class="p-4 flex flex-col flex-grow">
        <h3
          class="text-lg font-semibold text-brown-dark dark:text-brown-dark mb-2 line-clamp-2"
          :title="book.title"
        >
          {{ book.title }}
        </h3>

        <p
          v-if="book.description"
          class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow"
        >
          {{ book.description }}
        </p>
        <div v-else class="flex-grow"></div>

        <!-- Links/Actions -->
        <div class="mt-auto flex flex-col space-y-2">
          <!-- Link to Original Lesson -->
          <NuxtLink
            v-if="book.is_transcript && book.linked_lesson_id"
            :to="`/lessons/${book.linked_lesson_id}`"
            @click.stop
            class="inline-flex items-center justify-center px-4 py-2 border border-golden-calm text-sm font-medium rounded-md text-golden-calm hover:bg-golden-calm hover:text-white dark:border-golden-calm dark:text-golden-calm dark:hover:bg-golden-calm dark:hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-golden-calm dark:focus:ring-offset-cream-gray transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 me-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M12.293 2.293a1 1 0 011.414 0L18 6.586V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h8.586a1 1 0 01.707.293zM11 6a1 1 0 00-1 1v3.586l-.293-.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 10-1.414-1.414L12 10.586V7a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            عرض الدرس الأصلي
          </NuxtLink>

          <!-- زر عرض الكتاب -->
          <NuxtLink
            :to="`/books/${book.id}`"
            @click.stop
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-cream-gray transition-colors duration-200"
            :style="{ backgroundColor: 'var(--color-olive-green)' }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 me-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 3a1 1 0 00-1 1v12a1 1 0 001.707.707l5.586-5.586a1 1 0 000-1.414L11.707 4.293A1 1 0 0010 5v8a1 1 0 11-2 0V4a1 1 0 011-1z" />
            </svg>
            عرض الكتاب
          </NuxtLink>

          <p v-if="!book.storage_path" class="text-xs text-center text-red-500 dark:text-red-400 mt-1">
            ملف الكتاب غير متاح حاليًا.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, type PropType } from 'vue';
import { navigateTo } from '#imports';
import type { Database } from '~/types/database.types';

type Book = Database['public']['Tables']['books']['Row'];

const props = defineProps({
  book: {
    type: Object as PropType<Book>,
    required: true,
  },
});

const imageError = ref(false);

function handleImageError() {
  imageError.value = true;
}
</script>

<style scoped>
button[style*="--color-olive-green"],
a[style*="--color-olive-green"] {
  color: white;
}
.dark button[style*="--color-olive-green"],
.dark a[style*="--color-olive-green"] {
  color: var(--color-beige-light);
}
.book-card-link button,
.book-card-link a {
  position: relative;
  z-index: 1;
}
</style>
