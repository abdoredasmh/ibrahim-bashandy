<template>
  <div class="bg-white rounded-lg shadow border border-cream-gray overflow-hidden group transition-shadow hover:shadow-lg">
    <NuxtLink :to="`/lessons/${lesson.id}`" class="block">
      <!-- منطقة الصورة المصغرة من يوتيوب -->
      <div class="h-40 bg-black flex items-center justify-center relative overflow-hidden">
        <!-- نعرض صورة يوتيوب المصغرة الافتراضية بناءً على videoId -->
        <img
          v-if="videoId"
          :src="`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`"
          :alt="lesson.title"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy" 
        />
        <!-- أيقونة احتياطية إذا لم نستطع استخراج videoId -->
        <Icon v-else name="mdi:youtube-tv" size="60" class="text-gray-400" />

        <!-- أيقونة تشغيل فوق الصورة -->
        <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300">
           <Icon name="mdi:play-circle" size="50" class="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
        </div>
      </div>

      <!-- منطقة النص -->
      <div class="p-4">
        <h3 class="font-semibold text-lg mb-2 line-clamp-2 text-brown-dark group-hover:text-olive-green transition-colors">
          {{ lesson.title }}
        </h3>
        <p class="text-sm text-gray-600 line-clamp-3 mb-3">
          {{ lesson.description || 'لا يوجد وصف متاح لهذا الدرس.' }}
        </p>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// تعريف الخاصية (prop) لاستقبال بيانات الدرس
const props = defineProps({
  lesson: {
    type: Object as () => any, // استخدم any مؤقتًا أو النوع الصحيح
    required: true
  }
});

// دالة لاستخراج معرف الفيديو من رابط يوتيوب
function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    // سيناريو الرابط العادي (youtube.com/watch?v=...)
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      return urlObj.searchParams.get('v');
    }
    // سيناريو الرابط المختصر (youtu.be/...)
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.substring(1); // إزالة '/' الأولى
    }
  } catch (e) {
    console.error("Error parsing YouTube URL:", e);
  }
  // إذا لم يكن أيًا مما سبق، أو حدث خطأ
  return null;
}

// خاصية محسوبة للحصول على videoId
const videoId = computed(() => getYouTubeVideoId(props.lesson.youtube_url));

</script>

<style scoped>
/* كلاسات لقص النص */
.line-clamp-2 { /* ... */ }
.line-clamp-3 { /* ... */ }
</style>