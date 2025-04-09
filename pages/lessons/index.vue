// pages/lessons/index.vue

<template>
  <div class="container mx-auto px-4 py-8"> 
    <h1 class="text-3xl font-bold text-center text-brown-dark dark:text-brown-dark mb-10 border-b-2 border-olive-green pb-2"> 
      الدروس العامة
    </h1>

    <!-- حالة التحميل -->
    <div v-if="pending" class="text-center py-10">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-olive-green"></div>
      <p class="mt-4 text-gray-600 dark:text-gray-400">جارٍ تحميل الدروس العامة...</p> 
    </div>

    <!-- حالة الخطأ -->
    <div v-else-if="error" class="text-center py-10 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-2xl mx-auto"> 
      <p class="text-red-600 dark:text-red-400 font-semibold mb-2 text-lg"> 
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 inline-block align-middle me-1" aria-hidden="true">
          <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" />
        </svg>
        عذرًا، حدث خطأ أثناء تحميل الدروس العامة.
      </p>
      <pre v-if="error.message" class="mt-1 text-xs text-left bg-red-100 dark:bg-red-800/30 p-2 rounded border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 whitespace-pre-wrap">{{ error.message }}</pre> {/* تنسيق أفضل لرسالة الخطأ التقنية */}
      <button @click="refresh" class="mt-6 px-5 py-2 bg-olive-green text-white rounded hover:bg-opacity-80 transition-colors text-sm font-medium"> 
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 inline-block align-middle me-1">
           <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
         </svg>
        إعادة المحاولة
      </button>
    </div>

    <!-- عرض الدروس العامة -->
    <div v-else-if="lessons && lessons.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- استخدام مكون بطاقة الدرس -->
      <LessonCard v-for="lesson in lessons" :key="lesson.id" :lesson="lesson" />
    </div>

    <!-- حالة عدم وجود دروس عامة -->
    <div v-else class="text-center py-16 text-gray-500 dark:text-gray-400"> 
      <!-- استبدال Icon بـ SVG -->
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-12 h-12 mb-4 mx-auto text-gray-400 dark:text-gray-500" aria-hidden="true"> {/* تعديل اللون مباشرة */}
        <path d="M3.41 1.86L2 3.27l4.22 4.22c-.15.19-.22.44-.22.71v10c0 .55.45 1 1 1h12c.34 0 .65-.17.83-.42L20.73 21l1.41-1.41L3.41 1.86M7 18V9.54l8.46 8.46H7m5-8l-2-2H7V8l3.18 3.18L12 10m5 0v-.73L15.27 7.54C15.61 7.2 16.09 7 16.63 7H17v-.5a.5.5 0 0 1 .5-.5h.5a.5.5 0 0 1 .5.5V7h.5a.5.5 0 0 1 .5.5V12h-2v-2z"/>
      </svg>
      <p class="text-lg">لا توجد دروس عامة متاحة حاليًا.</p>
    </div>
  </div>

</template>

<script setup lang="ts">
import { useSupabaseClient, useAsyncData, useHead } from '#imports'
import LessonCard from '~/components/LessonCard.vue' // تأكد من وجود هذا المكون
import type { Database, Tables } from '~/types/database.types' // تأكد من تحديث الأنواع

// استخدم النوع الصحيح من الأنواع التي تم إنشاؤها
type Lesson = Pick<Tables<'lessons'>, 'id' | 'title' | 'description' | 'youtube_url'>;

const client = useSupabaseClient<Database>() // تحديد نوع العميل

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
  }, {
    default: () => [] // إضافة قيمة افتراضية لـ data
  }
);

// تعريف عنوان الصفحة والوصف
useHead({
  title: 'الدروس العامة - موقع الشيخ إبراهيم بشندي', // تحديث العنوان
  meta: [
    { name: 'description', content: 'تصفح قائمة الدروس العامة للشيخ إبراهيم بشندي وشاهد أحدث المحاضرات.' } // إضافة وصف مناسب
  ]
})
</script>

<style scoped>
/* لا توجد أنماط خاصة هنا */
</style>