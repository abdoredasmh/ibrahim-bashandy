<!-- pages/admin/lessons.vue -->
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">إدارة الدروس</h1>
      <button
        @click="openAddModal"
        class="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        :disabled="pending"
      >
        <span class="mr-2">+</span> إضافة درس جديد
      </button>
    </div>

    <!-- مؤشر التحميل -->
    <div v-if="pending" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-2 text-gray-500 dark:text-gray-400">جاري تحميل الدروس...</p>
    </div>

    <!-- رسالة الخطأ -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">خطأ!</strong>
      <span class="block sm:inline"> حدث خطأ أثناء جلب الدروس: {{ typeof error === 'object' && error.message ? error.message : 'خطأ غير معروف' }}</span>
      <!-- عرض الخطأ المفصل للمساعدة في التشخيص -->
      <pre v-if="error && typeof error === 'object'" class="mt-2 text-xs whitespace-pre-wrap bg-red-50 p-2 rounded">{{ JSON.stringify(error, null, 2) }}</pre>
    </div>

    <!-- رسالة نجاح العمليات (اختياري) -->
    <div v-if="successMessage" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
       {{ successMessage }}
    </div>

     <!-- رسالة خطأ العمليات (اختياري) -->
     <div v-if="actionError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
       {{ actionError }}
     </div>

    <!-- جدول الدروس -->
    <div v-if="!pending && lessons && lessons.length > 0" class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
             <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              معاينة
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              العنوان
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              التصنيف
            </th>
             <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              الدورة الدراسية
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              تاريخ الإنشاء
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">الإجراءات</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="lesson in lessons" :key="lesson.id">
             <td class="px-4 py-2 whitespace-nowrap">
               <button
                 v-if="lesson.youtube_url && getYoutubeThumbnail(lesson.youtube_url)"
                 @click="openVideoPreviewModal(lesson.youtube_url)"
                 class="w-20 h-14 overflow-hidden rounded group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                 title="مشاهدة معاينة الفيديو"
               >
                  <img
                   :src="getYoutubeThumbnail(lesson.youtube_url)"
                   :alt="`معاينة درس ${lesson.title}`"
                   class="w-full h-full object-cover transition-transform duration-200 ease-in-out group-hover:scale-110"
                   loading="lazy"
                 />
               </button>
               <div v-else class="w-20 h-14 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                 لا يوجد فيديو
               </div>
             </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ lesson.title }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ lesson.categories?.name || '-' }} <!-- عرض اسم التصنيف -->
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ lesson.study_courses?.title || '-' }} <!-- عرض اسم الدورة -->
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(lesson.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 space-x-reverse">
              <button
                @click="openEditModal(lesson)"
                class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50"
                :disabled="isDeleting === lesson.id"
              >
                تعديل
              </button>
              <button
                @click="confirmDelete(lesson)"
                class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                :disabled="isDeleting === lesson.id"
              >
                <span v-if="isDeleting === lesson.id">جاري الحذف...</span>
                <span v-else>حذف</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

     <!-- رسالة عند عدم وجود دروس -->
    <div v-else-if="!pending && (!lessons || lessons.length === 0)" class="text-center py-10 text-gray-500 dark:text-gray-400">
      لا توجد دروس لعرضها حالياً. قم بإضافة درس جديد.
    </div>

    <!-- Modal الإضافة والتعديل -->
    <AdminLessonModal
      :show="showModal"
      :lesson-data="selectedLesson"
      @close="closeModal"
      @saved="handleSave"
    />

     <!-- مودال معاينة الفيديو -->
    <VideoPreviewModal
      :show="showVideoPreview"
      :video-url="previewVideoUrl"
      @close="closeVideoPreviewModal"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'; // أضفنا onMounted
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import AdminLessonModal from '~/components/admin/AdminLessonModal.vue';
import VideoPreviewModal from '~/components/admin/VideoPreviewModal.vue'; // تأكد من وجود هذا

// تعريف الميتا والتخطيط والوسيط
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
});

// Supabase client
const supabase = useSupabaseClient<Database>();

// حالة جلب البيانات الأولية
const pending = ref(true);
const error = ref<any>(null); // لتخزين خطأ الجلب الأولي

// حالة عمليات الحذف/التعديل/الإضافة
const isDeleting = ref<number | null>(null); // لتتبع الدرس الذي يتم حذفه حاليًا وعرض مؤشر
const successMessage = ref<string | null>(null); // لعرض رسالة نجاح مؤقتة
const actionError = ref<string | null>(null); // لعرض خطأ العملية (حذف/تعديل) مؤقتًا

// تعريف نوع lessons بشكل أدق
type LessonWithRelations = Tables<'lessons'> & {
  categories: { name: string } | null;
  study_courses: { title: string } | null;
}
const lessons = ref<LessonWithRelations[] | null>(null);

// حالة مودال الإضافة/التعديل
const showModal = ref(false);
const selectedLesson = ref<LessonWithRelations | null>(null);

// حالة مودال معاينة الفيديو
const showVideoPreview = ref(false);
const previewVideoUrl = ref<string | null>(null);

// --- دوال العمليات ---

// جلب الدروس
const fetchLessons = async () => {
  // لا نغير pending هنا بالضرورة إلا في التحميل الأولي
  // قد نرغب في مؤشر تحميل منفصل للتحديثات
  error.value = null; // مسح خطأ الجلب الأولي
  try {
    const { data, error: fetchError } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        description,
        youtube_url,
        audio_url,
        pdf_transcript_url,
        category_id,
        course_id,
        created_at,
        categories!lessons_category_id_fkey ( name ),
        study_courses!fk_course ( title )
      `)
      .order('created_at', { ascending: false });

    if (fetchError) {
      // رمي الخطأ لمعالجته في catch الخاص بـ fetchLessons
       throw fetchError;
    }
    lessons.value = data as LessonWithRelations[] | null;
  } catch (err: any) {
    console.error('Detailed Error fetching lessons:', JSON.stringify(err, null, 2));
    console.error('Error Object:', err);
    error.value = err; // تخزين خطأ الجلب
    lessons.value = null; // أفرغ القائمة عند الخطأ
  }
};

// فتح مودال الإضافة
const openAddModal = () => {
  if (isDeleting.value) return; // منع الفتح أثناء الحذف
  selectedLesson.value = null;
  showModal.value = true;
  clearMessages(); // مسح الرسائل القديمة عند فتح المودال
};

// فتح مودال التعديل
const openEditModal = (lesson: LessonWithRelations) => {
  if (isDeleting.value) return; // منع الفتح أثناء الحذف
  selectedLesson.value = { ...lesson };
  showModal.value = true;
  clearMessages(); // مسح الرسائل القديمة عند فتح المودال
};

// إغلاق مودال الإضافة/التعديل
const closeModal = () => {
  showModal.value = false;
  selectedLesson.value = null;
};

// التعامل مع حدث الحفظ من المودال (إضافة أو تعديل)
const handleSave = async () => {
  closeModal();
  setSuccessMessage('تم حفظ الدرس بنجاح.');
  // أعد جلب قائمة الدروس لتحديثها
  // يجب أن ننتظر fetchLessons إذا أردنا عرض حالة تحميل للتحديث
  await fetchLessons();
};

// تأكيد وحذف الدرس
const confirmDelete = async (lesson: LessonWithRelations) => {
  if (isDeleting.value) return; // منع الحذف المتعدد لنفس العنصر

  if (window.confirm(`هل أنت متأكد أنك تريد حذف الدرس "${lesson.title}"؟ لا يمكن التراجع عن هذا الإجراء.`)) {
    isDeleting.value = lesson.id; // تفعيل حالة الحذف لهذا الدرس
    clearMessages(); // مسح الرسائل السابقة

    try {
      // --- !!! استخدام await هنا ضروري !!! ---
      const { error: deleteError } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lesson.id);

      // التحقق من وجود خطأ بعد انتهاء العملية
      if (deleteError) {
        // رمي الخطأ ليتم التقاطه في catch
        throw deleteError;
      }

      // --- النجاح ---
      setSuccessMessage('تم حذف الدرس بنجاح.');

      // إزالة الدرس من القائمة المحلية فوراً لتحديث الواجهة بسرعة
      // أو الاعتماد على fetchLessons فقط
      lessons.value = lessons.value?.filter(l => l.id !== lesson.id) ?? null;

      // اختياري: إعادة جلب القائمة للتأكد من التزامن مع قاعدة البيانات
      // قد لا يكون ضرورياً إذا وثقنا بالفلترة المحلية
      // await fetchLessons();


    } catch (err: any) {
      console.error('Error deleting lesson:', JSON.stringify(err, null, 2));
      setActionError(`فشل حذف الدرس: ${err.message || 'خطأ غير معروف'}. تأكد من صلاحيات الحذف (RLS).`);
      // يمكنك عرض تفاصيل أكثر للمشرف إذا لزم الأمر
    } finally {
      isDeleting.value = null; // إلغاء حالة الحذف بغض النظر عن النتيجة
    }
  }
};

// --- دوال مساعدة ---

// تنسيق التاريخ
const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return 'تاريخ غير صالح';
    }
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'خطأ في التنسيق';
  }
};

// الحصول على ID يوتيوب
const getYoutubeVideoId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try { const urlObj = new URL(url); if (urlObj.hostname === 'youtu.be') { return urlObj.pathname.slice(1); } if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) { return urlObj.searchParams.get('v'); } } catch (e) { const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/; const match = url.match(regex); if (match && match[1]) { return match[1]; } } return null;
};

// الحصول على صورة مصغرة
const getYoutubeThumbnail = (url: string | null | undefined): string | null => {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

// فتح مودال الفيديو
const openVideoPreviewModal = (url: string | null | undefined) => {
  if (!url || isDeleting.value) return;
  previewVideoUrl.value = url;
  showVideoPreview.value = true;
};

// إغلاق مودال الفيديو
const closeVideoPreviewModal = () => {
  showVideoPreview.value = false;
  previewVideoUrl.value = null;
};

// تعيين رسالة نجاح مؤقتة
const setSuccessMessage = (msg: string) => {
    successMessage.value = msg;
    actionError.value = null; // مسح أي خطأ قديم
    setTimeout(() => { successMessage.value = null; }, 4000); // إخفاء الرسالة بعد 4 ثوان
};

// تعيين رسالة خطأ عملية مؤقتة
const setActionError = (msg: string) => {
    actionError.value = msg;
    successMessage.value = null; // مسح أي نجاح قديم
    setTimeout(() => { actionError.value = null; }, 6000); // إخفاء الرسالة بعد 6 ثوان
};

// مسح رسائل الحالة
const clearMessages = () => {
    successMessage.value = null;
    actionError.value = null;
};

// --- تحميل البيانات الأولية ---
onMounted(async () => {
  await fetchLessons(); // انتظر الجلب الأولي
  pending.value = false; // إلغاء حالة التحميل الأولي بعد الانتهاء
});

</script>

<style scoped>
/* يمكنك إضافة أي تنسيقات خاصة هنا إذا احتجت */
</style>