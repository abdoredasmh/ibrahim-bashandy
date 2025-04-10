<template>
  <div class="container mx-auto px-4 ">

    <!-- Loading State -->
    <div v-if="pending" class="text-center py-20">
      <LoadingSpinner />
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل بيانات الدرس...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !lesson" class="text-center py-20 max-w-2xl mx-auto">
      <h2 v-if="error?.statusCode === 404" class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
        الدرس غير موجود
      </h2>
      <h2 v-else class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4">
        حدث خطأ
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ error?.statusMessage || 'لم نتمكن من العثور على الدرس المطلوب أو حدث خطأ أثناء تحميله.' }}
      </p>
      <NuxtLink
        to="/lessons"
        class="inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors"
        :style="{ backgroundColor: 'var(--color-olive-green)' }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true" focusable="false">
          <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" />
        </svg>
        <span>العودة إلى قائمة الدروس</span>
      </NuxtLink>
    </div>

    <!-- Lesson Details Display -->
    <div v-else class="lesson-details max-w-5xl mx-auto space-y-6">
      <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark text-center sm:text-right">
        {{ lesson.title }}
      </h1>

      <!-- Video Section with Navigation Buttons -->
      <div class="video-section flex items-center gap-2 sm:gap-4">
        <!-- Previous Button -->
        <div class="flex-shrink-0">
          <NuxtLink
            v-if="lesson.category_id && previousLesson"
            :to="`/lessons/${previousLesson.id}`"
            class="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            :title="`الدرس السابق: ${previousLesson.title}`"
            aria-label="الدرس السابق"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 sm:w-6 sm:h-6">
              <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
          <div v-else class="w-11 h-11 sm:w-14 sm:h-14"></div>
        </div>

        <!-- Video Player -->
        <div class="flex-grow min-w-0">
          <div v-if="youtubeVideoId" class="relative w-full rounded-lg overflow-hidden shadow-lg bg-black h-[250px] sm:h-[350px] md:h-[500px] lg:h-[600px]">
            <iframe
              :src="`https://www.youtube.com/embed/${youtubeVideoId}`"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
              class="absolute inset-0 w-full h-full"
              title="مشغل فيديو الدرس"
            ></iframe>
          </div>
          <div v-else-if="lesson.youtube_url" class="p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200 text-sm">
            <p>تعذر استخلاص معرف الفيديو من الرابط: <code class="break-all">{{ lesson.youtube_url }}</code>.</p>
            <p class="mt-1">قد يكون الرابط غير صحيح أو بتنسيق غير مدعوم.</p>
          </div>
          <div v-else class="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 text-sm">
            <p>لا يوجد رابط يوتيوب متاح لهذا الدرس.</p>
          </div>
        </div>

        <!-- Next Button -->
        <div class="flex-shrink-0">
          <NuxtLink
            v-if="lesson.category_id && nextLesson"
            :to="`/lessons/${nextLesson.id}`"
            class="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
            :title="`الدرس التالي: ${nextLesson.title}`"
            aria-label="الدرس التالي"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 sm:w-6 sm:h-6">
              <path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
          <div v-else class="w-11 h-11 sm:w-14 sm:h-14"></div>
        </div>
      </div>

      <!-- Description -->
      <div class="description-section">
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-3">عن الدرس:</h2>
        <div v-if="lesson.description" class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
          <p class="whitespace-pre-wrap">{{ lesson.description }}</p>
        </div>
        <p v-else class="text-gray-500 dark:text-gray-400 italic">
          لا يوجد وصف متاح لهذا الدرس.
        </p>
      </div>

      <!-- Linked Books -->
      <div class="downloads-section p-5 bg-beige-light dark:bg-cream-gray rounded-lg shadow-sm border border-cream-gray dark:border-gray-700">
        <h3 class="text-lg font-semibold text-brown-dark dark:text-brown-dark mb-4">ملفات مرتبطة:</h3>
        <div v-if="linkedBooks.length > 0" class="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div v-for="book in linkedBooks" :key="book.id">
            <button
              v-if="book.storage_path"
              @click="openPdfModal(book.storage_path, book.title)"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors"
              :style="{ backgroundColor: 'var(--color-olive-green)' }"
              :title="`عرض ${book.title}`"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true" focusable="false">
                <path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 8.75a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
                <path fill-rule="evenodd" d="M9 3.5a.5.5 0 0 0-.5.5v2.75A1.75 1.75 0 0 0 10.25 8.5h2.75a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-3ZM11 5.75v1.75a.25.25 0 0 0 .25.25h1.75a.25.25 0 0 0 .25-.25V5.75H11Z" clip-rule="evenodd" />
              </svg>
              <span>عرض: {{ book.title }} ({{ book.is_research ? 'بحث' : (book.is_transcript ? 'تفريغ' : 'كتاب') }})</span>
            </button>
            <span v-else class="text-xs text-gray-400 italic">({{ book.title }} - لا يوجد ملف مرفق)</span>
          </div>
        </div>
        <p v-else class="text-sm text-gray-500 dark:text-gray-400">
          لا توجد ملفات إضافية متاحة للتحميل لهذا الدرس.
        </p>
      </div>

      <!-- Comments -->
      <CommentSection
        v-if="lessonId !== -1 && lesson"
        :lesson-id="lessonId"
      />
    </div>

    <!-- PDF Modal -->
    <ClientOnly>
      <LazyPdfViewerModal
        :show="showPdfModal"
        :storage-path="currentPdfPath"
        :book-title="currentPdfTitle"
        @close="closePdfModal"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
// --- Script section remains exactly the same as the previous version ---
// --- (Fetching logic based on category_id and button styling is already correct) ---
import { ref, computed, defineAsyncComponent, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import CommentSection from '~/components/CommentSection.vue';
const LazyPdfViewerModal = defineAsyncComponent(() => import('~/components/PdfViewerModal.vue'));

type Lesson = Omit<Tables<'lessons'>, 'audio_url' | 'pdf_transcript_url'>;
type Book = Tables<'books'>;
type NavLesson = Pick<Lesson, 'id' | 'title'> | null;

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const lessonId = computed(() => {
  const id = Number(route.params.id);
  return isNaN(id) ? -1 : id;
});

const showPdfModal = ref(false);
const currentPdfPath = ref<string | null>(null);
const currentPdfTitle = ref('');

interface FetchedData {
  lesson: Lesson | null;
  linkedBooks: Book[];
  previousLesson: NavLesson;
  nextLesson: NavLesson;
}

const { data: fetchedData, pending, error, refresh } = await useAsyncData<FetchedData>(
  `lesson-details-catnav-${lessonId.value}`,
  async () => {
    const currentId = lessonId.value;
    if (currentId === -1) {
      throw createError({ statusCode: 400, statusMessage: 'معرف الدرس غير صالح.' });
    }

    const { data: currentLessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('id, title, description, youtube_url, category_id, course_id, created_at')
      .eq('id', currentId)
      .maybeSingle();

    if (lessonError) {
      console.error('Error fetching lesson:', lessonError);
      throw createError({ statusCode: 500, statusMessage: `حدث خطأ أثناء تحميل بيانات الدرس.` });
    }
    if (!currentLessonData) {
      throw createError({ statusCode: 404, statusMessage: 'الدرس المطلوب غير موجود.' });
    }

    let previousLessonData: NavLesson = null;
    let nextLessonData: NavLesson = null;
    let booksData: Book[] = [];
    const currentCategoryId = currentLessonData.category_id;

    const fetches: Promise<any>[] = [
        supabase
            .from('books')
            .select('id, title, storage_path, is_research, is_transcript')
            .eq('linked_lesson_id', currentId)
    ];

    if (currentCategoryId !== null) {
        console.log(`Lesson belongs to category ${currentCategoryId}. Fetching prev/next...`);
        fetches.push(
            supabase
                .from('lessons')
                .select('id, title')
                .eq('category_id', currentCategoryId)
                // .filter('course_id', 'is', null) // Optional: Uncomment to exclude course lessons
                .lt('id', currentId)
                .order('id', { ascending: false })
                .limit(1)
                .maybeSingle()
        );
        fetches.push(
            supabase
                .from('lessons')
                .select('id, title')
                .eq('category_id', currentCategoryId)
                // .filter('course_id', 'is', null) // Optional: Uncomment to exclude course lessons
                .gt('id', currentId)
                .order('id', { ascending: true })
                .limit(1)
                .maybeSingle()
        );
    } else {
         console.log('Lesson does not belong to a category. Skipping prev/next fetch.');
    }

    const results = await Promise.all(fetches);

    const booksResult = results[0];
    if (booksResult.error) {
      console.error('Error fetching linked books:', booksResult.error.message);
    } else {
      booksData = booksResult.data ?? [];
    }

    if (currentCategoryId !== null && results.length === 3) {
        const prevResult = results[1];
        const nextResult = results[2];

        if (prevResult.error) {
             console.error('Error fetching previous lesson by category:', prevResult.error.message);
        } else {
            previousLessonData = prevResult.data;
             console.log('Fetched Previous Lesson Data (Category Nav):', previousLessonData);
        }

        if (nextResult.error) {
            console.error('Error fetching next lesson by category:', nextResult.error.message);
        } else {
            nextLessonData = nextResult.data;
            console.log('Fetched Next Lesson Data (Category Nav):', nextLessonData);
        }
    }

    return {
      lesson: currentLessonData,
      linkedBooks: booksData,
      previousLesson: previousLessonData,
      nextLesson: nextLessonData
    };
  },
  {
    watch: [lessonId],
  }
);

const lesson = computed(() => fetchedData.value?.lesson ?? null);
const linkedBooks = computed(() => fetchedData.value?.linkedBooks ?? []);
const previousLesson = computed(() => fetchedData.value?.previousLesson ?? null);
const nextLesson = computed(() => fetchedData.value?.nextLesson ?? null);

const youtubeVideoId = computed(() => {
   if (!lesson.value?.youtube_url) return null;
  try {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = lesson.value.youtube_url.match(regex);
    return (match && match[1]) ? match[1] : null;
  } catch (e) {
    console.error('Invalid YouTube URL format:', lesson.value.youtube_url, e);
    return null;
  }
});

useHead(computed(() => {
  const title = lesson.value?.title ? `درس: ${lesson.value.title}` : (pending.value ? 'جارٍ التحميل...' : 'تفاصيل الدرس');
  const baseDescription = lesson.value?.description?.substring(0, 100) || `شاهد تفاصيل درس ${lesson.value?.title || ''}.`;
  let linkedItemsDescription = '';
  if (linkedBooks.value.length > 0) {
      const itemTypes = linkedBooks.value
          .map(book => book.is_research ? 'بحث' : (book.is_transcript ? 'تفريغ' : 'كتاب'))
          .join(', ');
      linkedItemsDescription = ` يتضمن ملفات مرتبطة: ${itemTypes}.`;
  }
  const fullDescription = (baseDescription + linkedItemsDescription).substring(0, 160);

  return {
    title: title,
    meta: [
      { name: 'description', content: fullDescription },
      { property: 'og:title', content: title },
      { property: 'og:description', content: fullDescription },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: typeof window !== 'undefined' ? window.location.href : '' },
    ]
  };
}));

function openPdfModal(path: string | null | undefined, title: string | null | undefined) {
  if (path && typeof path === 'string') {
    currentPdfPath.value = path;
    currentPdfTitle.value = title || 'ملف مرتبط';
    showPdfModal.value = true;
  } else {
      console.warn("Attempted to open PDF modal with invalid path:", path);
  }
}

function closePdfModal() {
  showPdfModal.value = false;
}

watchEffect(() => {
    console.log('[WatchEffect Debug - Category Nav]');
    console.log('  Current Lesson ID:', lessonId.value);
    console.log('  Lesson Data:', lesson.value);
    console.log('  Lesson Category ID:', lesson.value?.category_id);
    console.log('  Previous Lesson Data:', previousLesson.value);
    console.log('  Next Lesson Data:', nextLesson.value);
    console.log('  Show Buttons Condition:', !!(lesson.value?.category_id && (previousLesson.value || nextLesson.value)));
});
</script>

<style scoped>
/* Styles remain the same */
.prose :where(p):not(:where([class~="not-prose"] *)) { margin-top: 0.75em; margin-bottom: 0.75em; line-height: 1.7; }
code { word-break: break-all; font-size: 0.875em; background-color: rgba(0,0,0,0.05); padding: 0.1em 0.3em; border-radius: 0.25rem; }
.dark code { background-color: rgba(255,255,255,0.1); }
</style>