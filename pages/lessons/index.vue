// pages/lessons/index.vue

<template>
  <div>
    <h1 class="text-3xl font-bold text-center text-brown-dark mb-10">الدروس العامة</h1> {/* تم تغيير العنوان */}

    <!-- حالة التحميل -->
    <div v-if="pending" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive-green"></div>
      <p class="mt-4 text-gray-600">جارٍ تحميل الدروس العامة...</p>
    </div>

    <!-- حالة الخطأ -->
    <div v-else-if="error" class="text-center py-10 px-4">
      <p class="text-red-600 font-semibold mb-2">عذرًا، حدث خطأ أثناء تحميل الدروس العامة.</p>
      <pre class="text-xs text-left bg-red-50 p-2 rounded border border-red-200 text-red-700 whitespace-pre-wrap">{{ error.message }}</pre>
      <button @click="refresh" class="mt-6 px-5 py-2 bg-olive-green text-white rounded hover:bg-opacity-80 transition-colors">
        إعادة المحاولة
      </button>
    </div>

    <!-- عرض الدروس العامة -->
    <div v-else-if="lessons && lessons.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- استخدام مكون بطاقة الدرس -->
      <LessonCard v-for="lesson in lessons" :key="lesson.id" :lesson="lesson" />
    </div>

    <!-- حالة عدم وجود دروس عامة -->
    <div v-else class="text-center py-16 text-gray-500">
      <Icon name="mdi:video-off-outline" size="48" class="mb-4 mx-auto" />
      <p>لا توجد دروس عامة متاحة حاليًا.</p>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { useSupabaseClient, useAsyncData, useHead } from '#imports'
import LessonCard from '~/components/LessonCard.vue' // تأكد من وجود هذا المكون
// import type { Database } from '~/types/database.types'
// type Lesson = Database['public']['Tables']['lessons']['Row'];
type Lesson = any; // استخدم any مؤقتًا إذا لم تكن الأنواع مهيأة

const client = useSupabaseClient() // <Database>()

// جلب قائمة الدروس **العامة فقط**
const { data: lessons, pending, error, refresh } = await useAsyncData<Lesson[]>(
  'publicLessons', // مفتاح جديد خاص بالدروس العامة
  async () => {
    console.log("Fetching public lessons from Supabase..."); // للتصحيح
    const { data, error } = await client
      .from('lessons')
      .select('id, title, description, youtube_url') // اختر الأعمدة اللازمة لـ LessonCard
      // --- فلترة الدروس التي ليس لها course_id ---
      .is('course_id', null) // جلب فقط التي course_id هو NULL
      .order('created_at', { ascending: false }); // ترتيب بالأحدث افتراضيًا

    if (error) {
      console.error('Error fetching public lessons:', error);
      throw error; // ألقِ الخطأ ليتم التعامل معه بواسطة useAsyncData
    }
    console.log("Public lessons fetched:", data?.length); // للتصحيح
    return data || []; // أعد البيانات أو مصفوفة فارغة
  }
);

// تعريف عنوان الصفحة
useHead({
  title: 'الدروس العامة - موقع الشيخ إبراهيم بشندي' // تحديث العنوان
})
</script>

<style scoped>
/* لا توجد أنماط خاصة هنا */
</style>