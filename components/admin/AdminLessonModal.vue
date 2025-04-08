// components/admin/AdminLessonModal.vue
<template>
  <!-- Root element for the transition -->
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50"> {/* زيادة z-index */}
      {/* Backdrop */}
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" /> {/* تعديل الخلفية */}
      </TransitionChild>

      {/* Full-screen container to center the panel */}
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          {/* Modal panel */}
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 mb-4">
                {{ isEditing ? 'تعديل الدرس' : 'إضافة درس جديد' }}
              </DialogTitle>

              {/* Form Content */}
              <form @submit.prevent="saveLesson" class="space-y-4">
                {/* حقل العنوان */}
                <div>
                  <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">العنوان *</label>
                  <input
                    type="text"
                    id="title"
                    v-model="form.title"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {/* حقل الوصف */}
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</label>
                  <textarea
                    id="description"
                    rows="4"
                    v-model="form.description"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  ></textarea>
                </div>

                {/* حقل رابط يوتيوب */}
                <div>
                   <label for="youtube_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط يوتيوب</label>
                   <input type="url" id="youtube_url" v-model="form.youtube_url" placeholder="https://www.youtube.com/watch?v=..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                </div>

                {/* حقل رابط الصوت */}
                 <div>
                    <label for="audio_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط الصوت (MP3)</label>
                    <input type="url" id="audio_url" v-model="form.audio_url" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                 </div>

                 {/* حقل رابط التفريغ */}
                  <div>
                     <label for="pdf_transcript_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط التفريغ (PDF)</label>
                     <input type="url" id="pdf_transcript_url" v-model="form.pdf_transcript_url" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                  </div>

                 {/* قائمة منسدلة للفئة */}
                  <div>
                      <label for="category_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الفئة</label>
                      <select
                          id="category_id"
                          v-model="form.category_id"
                          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                          <option :value="null">-- اختر فئة (اختياري) --</option>
                          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                              {{ cat.name }}
                          </option>
                      </select>
                      <p v-if="loadingCategories" class="text-xs text-gray-500 mt-1">جار تحميل الفئات...</p>
                  </div>

                  {/* قائمة منسدلة للدورة */}
                   <div>
                       <label for="course_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الدورة الدراسية</label>
                       <select
                           id="course_id"
                           v-model="form.course_id"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       >
                           <option :value="null">-- درس عام (بدون دورة) --</option>
                           <option v-for="course in courses" :key="course.id" :value="course.id">
                               {{ course.title }}
                           </option>
                       </select>
                        <p v-if="loadingCourses" class="text-xs text-gray-500 mt-1">جار تحميل الدورات...</p>
                   </div>

                {/* رسالة الخطأ */}
                <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">
                  خطأ: {{ errorMessage }}
                </p>

                {/* أزرار الإجراءات */}
                <div class="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse">
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    @click="closeModal"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    :disabled="isSaving"
                    class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                  >
                     <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                       <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                    {{ isSaving ? 'جاري الحفظ...' : (isEditing ? 'حفظ التعديلات' : 'إضافة الدرس') }}
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import type { Database, Tables } from '~/types/database.types';

// تحديد الأنواع
type Lesson = Tables<'lessons'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;
type Course = Pick<Tables<'study_courses'>, 'id' | 'title'>;

const props = defineProps<{
  show: boolean;
  lessonData: Lesson | null; // بيانات الدرس للتعديل (null للإضافة)
}>();

const emit = defineEmits(['close', 'saved']);

const supabase = useSupabaseClient<Database>();

// حالة النموذج
const form = ref<Partial<Lesson>>({}); // استخدم Partial للسماح بالقيم الأولية الفارغة
const isSaving = ref(false);
const errorMessage = ref<string | null>(null);

// حالة جلب القوائم المنسدلة
const categories = ref<Category[]>([]);
const courses = ref<Course[]>([]);
const loadingCategories = ref(false);
const loadingCourses = ref(false);

// حساب ما إذا كنا في وضع التعديل
const isEditing = computed(() => !!props.lessonData);

// مشاهدة التغييرات في lessonData لتحديث النموذج عند فتح Modal للتعديل
watch(() => props.lessonData, (newLesson) => {
  if (newLesson) {
    // نسخ البيانات للتعديل
    form.value = { ...newLesson };
  } else {
    // إعادة تعيين النموذج للإضافة
    form.value = {
        title: '',
        description: '',
        youtube_url: '',
        audio_url: '',
        pdf_transcript_url: '',
        category_id: null,
        course_id: null,
    };
  }
  errorMessage.value = null; // مسح أي خطأ سابق
}, { immediate: true }); // شغله فوراً عند تحميل المكون

// إغلاق Modal
function closeModal() {
  if (!isSaving.value) { // لا تغلق إذا كان الحفظ جارياً
    emit('close');
  }
}

// جلب الفئات والدورات للقوائم المنسدلة
async function fetchDropdownData() {
    loadingCategories.value = true;
    loadingCourses.value = true;
    try {
        const [catResult, courseResult] = await Promise.all([
            supabase.from('categories').select('id, name').order('name'),
            supabase.from('study_courses').select('id, title').order('title')
        ]);

        if (catResult.error) throw catResult.error;
        categories.value = catResult.data || [];

        if (courseResult.error) throw courseResult.error;
        courses.value = courseResult.data || [];

    } catch (err: any) {
        console.error("Error fetching dropdown data:", err);
        errorMessage.value = "فشل تحميل بيانات الفئات أو الدورات.";
    } finally {
        loadingCategories.value = false;
        loadingCourses.value = false;
    }
}

// جلب البيانات عند تحميل المكون
onMounted(() => {
    fetchDropdownData();
});

// حفظ الدرس (إضافة أو تعديل)
async function saveLesson() {
  isSaving.value = true;
  errorMessage.value = null;

  // تحضير البيانات للحفظ (إزالة أي حقول غير ضرورية إذا لزم الأمر)
  const lessonPayload: Partial<Lesson> = {
    title: form.value.title,
    description: form.value.description || null, // تأكد من إرسال null إذا كان فارغاً
    youtube_url: form.value.youtube_url || null,
    audio_url: form.value.audio_url || null,
    pdf_transcript_url: form.value.pdf_transcript_url || null,
    // تأكد من أن القيم هي أرقام أو null
    category_id: form.value.category_id ? Number(form.value.category_id) : null,
    course_id: form.value.course_id ? Number(form.value.course_id) : null,
  };

  try {
    let error: any = null;
    if (isEditing.value && form.value.id) {
      // وضع التعديل
      const { error: updateError } = await supabase
        .from('lessons')
        .update(lessonPayload)
        .eq('id', form.value.id);
      error = updateError;
    } else {
      // وضع الإضافة
      // يمكنك إضافة user_id هنا إذا كان مطلوباً في الجدول
      const { error: insertError } = await supabase
        .from('lessons')
        .insert(lessonPayload);
      error = insertError;
    }

    if (error) throw error;

    // نجح الحفظ
    emit('saved'); // أخبر المكون الأب بالنجاح

  } catch (err: any) {
    console.error('Error saving lesson:', err);
    errorMessage.value = err.message || 'حدث خطأ غير متوقع.';
  } finally {
    isSaving.value = false;
  }
}
</script>