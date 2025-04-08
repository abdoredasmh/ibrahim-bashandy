<template>
  <div class="container mx-auto px-4 py-8"> 

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
        {/* SVG أيقونة العودة */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true" focusable="false">
          <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" />
        </svg>
        <span>العودة إلى قائمة الدروس</span>
      </NuxtLink>
    </div>

    <!-- Lesson Details Display -->
    <div v-else class="lesson-details max-w-5xl mx-auto space-y-8">
      <h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark text-center sm:text-right"> 
        {{ lesson.title }}
      </h1>

      
      <div class="video-section">
        <div v-if="youtubeVideoId"  class="relative w-full rounded-lg overflow-hidden shadow-lg bg-black
            h-[250px] sm:h-[350px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
           
       
          {/* هذا يجعل الفيديو كبيراً قدر الإمكان ضمن المساحة المخصصة للمحتوى الرئيسي */}
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

     
      <div class="description-section">
        <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-3">عن الدرس:</h2>
        <div v-if="lesson.description" class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
         
          <p class="whitespace-pre-wrap">{{ lesson.description }}</p>
        </div>
        <p v-else class="text-gray-500 dark:text-gray-400 italic">
          لا يوجد وصف متاح لهذا الدرس.
        </p>
      </div>

      
      <div class="downloads-section p-5 bg-beige-light dark:bg-cream-gray rounded-lg shadow-sm border border-cream-gray dark:border-gray-700">
          <h3 class="text-lg font-semibold text-brown-dark dark:text-brown-dark mb-4">ملفات مرتبطة:</h3>
          <div v-if="lesson.audio_url || lesson.pdf_transcript_url" class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
               <a v-if="lesson.audio_url" :href="lesson.audio_url" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-muted hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-muted dark:focus:ring-offset-gray-800 transition-opacity">
                 
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true" focusable="false">
                    <path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z" />
                    <path d="M5.5 13.5A.5.5 0 0 1 6 13h8a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5Z" />
                    <path d="M3 10a2 2 0 0 1 2-2h1.25a.75.75 0 0 0 0-1.5H5a3.5 3.5 0 0 0-3.5 3.5v1.584A3.996 3.996 0 0 0 5 16h10a4 4 0 0 0 4-4V8.5a.75.75 0 0 0-1.5 0V12a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 3 12v-2Z" />
                  </svg>
                  <span>تحميل الصوت (MP3)</span>
               </a>
               <a v-if="lesson.pdf_transcript_url" :href="lesson.pdf_transcript_url" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors"
                  :style="{ backgroundColor: 'var(--color-olive-green)' }">
                   {/* SVG أيقونة الملف */}
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true" focusable="false">
                     <path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 8.75a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
                     <path fill-rule="evenodd" d="M9 3.5a.5.5 0 0 0-.5.5v2.75A1.75 1.75 0 0 0 10.25 8.5h2.75a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-3ZM11 5.75v1.75a.25.25 0 0 0 .25.25h1.75a.25.25 0 0 0 .25-.25V5.75H11Z" clip-rule="evenodd" />
                   </svg>
                   <span>تحميل التفريغ (PDF)</span>
               </a>
          </div>
          <p v-else class="text-sm text-gray-500 dark:text-gray-400">
              لا توجد ملفات إضافية متاحة للتحميل لهذا الدرس.
          </p>
      </div>

      
           <!-- عرض قسم التعليقات فقط إذا كان lessonId صالحاً وتم تحميل الدرس -->
      <CommentSection
        v-if="lessonId !== -1 && lesson"
        :lesson-id="lessonId"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import CommentSection from '~/components/CommentSection.vue';

type Lesson = Tables<'lessons'>;

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const lessonId = computed(() => {
  const id = Number(route.params.id);
  return isNaN(id) ? -1 : id; // Return -1 or handle appropriately if NaN
});

// --- Fetch Lesson Data ---
const { data: lesson, pending, error, refresh } = await useAsyncData<Lesson | null>(
  `lesson-${lessonId.value}`, // Unique key for asyncData
  async () => {
    if (lessonId.value === -1) {
      console.error('Invalid Lesson ID from route:', route.params.id);
      throw createError({ statusCode: 400, statusMessage: 'معرف الدرس غير صالح.' });
    }

    const { data, error: queryError } = await supabase
      .from('lessons')
      .select('*') // Select all columns for the lesson
      .eq('id', lessonId.value)
      .maybeSingle(); // Returns null if not found, instead of error

    if (queryError) {
      console.error('Error fetching lesson:', queryError);
      // Avoid exposing detailed DB errors to the client if possible
      throw createError({ statusCode: 500, statusMessage: `حدث خطأ أثناء تحميل بيانات الدرس.` });
    }
    if (!data && !queryError) { // Check specifically for not found
        throw createError({ statusCode: 404, statusMessage: 'الدرس المطلوب غير موجود.' });
    }
    return data;
  },
  {
    watch: [lessonId], // Refetch if lessonId changes
    // Consider adding server: false if this data isn't critical for SSR SEO
    // server: false,
  }
);

// --- YouTube Video ID Extraction ---
const youtubeVideoId = computed(() => {
  if (!lesson.value?.youtube_url) return null;
  try {
    // Regex to capture video ID from various YouTube URL formats
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = lesson.value.youtube_url.match(regex);
    if (match && match[1]) {
        return match[1];
    }

    // Fallback/Logging if regex fails but URL exists
    console.warn('Could not extract YouTube video ID using regex from URL:', lesson.value.youtube_url);
    // Simple backup checks (less robust)
    const url = new URL(lesson.value.youtube_url);
     if (url.hostname === 'youtu.be') {
       return url.pathname.slice(1);
     }
     if (url.hostname.includes('youtube.com') && url.searchParams.has('v')) {
       return url.searchParams.get('v');
     }
    return null; // Return null if no ID found

  } catch (e) {
    // Catch potential errors from new URL() if the URL is malformed
    console.error('Invalid YouTube URL format:', lesson.value.youtube_url, e);
    return null;
  }
});

// --- SEO Meta ---
useHead(computed(() => {
  const title = lesson.value?.title
    ? `درس: ${lesson.value.title}`
    : (pending.value ? 'جارٍ التحميل...' : 'تفاصيل الدرس');
  const description = lesson.value?.description?.substring(0, 160) // Max length for description meta
    || `شاهد واستمع إلى تفاصيل درس ${lesson.value?.title || ''}, وتفاعل مع المحتوى.`;

  return {
    title: title,
    meta: [
      { name: 'description', content: description },
      // Add more meta tags like Open Graph if needed
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      // You might want to add an og:image based on the lesson or a default one
      // { property: 'og:image', content: 'your_image_url' },
      { property: 'og:type', content: 'article' }, // Or 'video.other' if focusing on the video
      { property: 'og:url', content: typeof window !== 'undefined' ? window.location.href : '' }, // Get current URL client-side
    ]
  };
}));

</script>

<style scoped>
/* Using Tailwind utilities primarily, scoped styles can be added for complex overrides */

/* Improve prose readability slightly */
.prose :where(p):not(:where([class~="not-prose"] *)) {
    margin-top: 0.75em; /* Slightly more space between paragraphs */
    margin-bottom: 0.75em;
    line-height: 1.7; /* Improve line spacing */
}

/* Ensure code blocks within messages wrap correctly */
code {
    word-break: break-all;
    font-size: 0.875em; /* Slightly smaller code font */
    background-color: rgba(0,0,0,0.05);
    padding: 0.1em 0.3em;
    border-radius: 0.25rem;
}
.dark code {
    background-color: rgba(255,255,255,0.1);
}

/* يمكن إضافة تنسيقات مخصصة هنا إذا لزم الأمر */
</style>