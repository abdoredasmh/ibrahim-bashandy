<template>
  <!-- Root element for the transition -->
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">

      <!-- Backdrop -->
      <TransitionChild
        as="div"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <!-- No inner element needed here -->
      </TransitionChild>

      <!-- Full-screen container to center the panel -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">

          <!-- Modal panel -->
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

              <!-- Form Content -->
              <form @submit.prevent="saveLesson" class="space-y-4">

                <!-- Title Field -->
                <div>
                  <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">العنوان *</label>
                  <input
                    type="text"
                    id="title"
                    v-model="form.title"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    aria-describedby="title-error"
                  />
                   <p v-if="validationErrors.title" class="mt-1 text-xs text-red-500" id="title-error">{{ validationErrors.title }}</p>
                </div>

                <!-- Description Field -->
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</label>
                  <textarea
                    id="description"
                    rows="4"
                    v-model="form.description"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  ></textarea>
                </div>

                <!-- YouTube URL Field -->
                <div>
                   <label for="youtube_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط يوتيوب *</label>
                   <input
                      type="url"
                      id="youtube_url"
                      v-model="form.youtube_url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      aria-describedby="youtube-error"
                    />
                   <p v-if="validationErrors.youtube_url" class="mt-1 text-xs text-red-500" id="youtube-error">{{ validationErrors.youtube_url }}</p>
                </div>

                <!-- Audio URL Field -->
                 <div>
                    <label for="audio_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط الصوت (MP3)</label>
                    <input type="url" id="audio_url" v-model="form.audio_url" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                 </div>

                 <!-- PDF Transcript URL Field -->
                  <div>
                     <label for="pdf_transcript_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط التفريغ (PDF)</label>
                     <input type="url" id="pdf_transcript_url" v-model="form.pdf_transcript_url" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                  </div>

                 <!-- Category Select Field -->
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

                  <!-- Course Select Field -->
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

                <!-- General Error Message -->
                <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">
                  خطأ: {{ errorMessage }}
                </p>

                <!-- Action Buttons -->
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
              </form> <!-- End of form -->
            </DialogPanel>
          </TransitionChild>

        </div> <!-- End of flex container -->
      </div> <!-- End of fixed inset container -->

    </Dialog>
  </TransitionRoot>
</template>
<script setup lang="ts">
import { ref, watch, computed, onMounted, reactive } from 'vue'; // أضفنا reactive
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/vue';
import type { Database, Tables } from '~/types/database.types';

// تحديد الأنواع (كما هي)
type Lesson = Tables<'lessons'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;
type Course = Pick<Tables<'study_courses'>, 'id' | 'title'>;

const props = defineProps<{
  show: boolean;
  lessonData: Lesson | null;
}>();

const emit = defineEmits(['close', 'saved']);

const supabase = useSupabaseClient<Database>();

// حالة النموذج
const form = ref<Partial<Lesson>>({});
const isSaving = ref(false);
const errorMessage = ref<string | null>(null);

// --- جديد: حالة أخطاء التحقق من الصحة ---
const validationErrors = reactive({
    title: '',
    youtube_url: ''
});

// حالة جلب القوائم المنسدلة (كما هي)
const categories = ref<Category[]>([]);
const courses = ref<Course[]>([]);
const loadingCategories = ref(false);
const loadingCourses = ref(false);

// حساب ما إذا كنا في وضع التعديل (كما هو)
const isEditing = computed(() => !!props.lessonData && !!props.lessonData.id); // تأكد من وجود ID أيضًا

// --- تعديل: دالة لإعادة تعيين النموذج ومسح الأخطاء ---
const resetForm = () => {
    form.value = {
        title: '',
        description: '',
        youtube_url: '',
        audio_url: '',
        pdf_transcript_url: '',
        category_id: null,
        course_id: null,
    };
    errorMessage.value = null;
    validationErrors.title = '';
    validationErrors.youtube_url = '';
};

// مشاهدة التغييرات في lessonData (تحديث لاستخدام resetForm)
watch(() => props.lessonData, (newLesson) => {
  if (newLesson) {
    form.value = { ...newLesson }; // نسخ البيانات للتعديل
    // مسح الأخطاء عند فتح المودال للتعديل
    errorMessage.value = null;
    validationErrors.title = '';
    validationErrors.youtube_url = '';
  } else {
    resetForm(); // إعادة تعيين النموذج بالكامل عند الإضافة
  }
}, { immediate: true, deep: true }); // deep: true قد تساعد إذا كان newLesson يتغير داخليًا


// إغلاق Modal (كما هو)
function closeModal() {
  if (!isSaving.value) {
    emit('close');
    // لا حاجة لاستدعاء resetForm هنا لأن watch سيعيد تعيينه عند تغيير props.lessonData إلى null
  }
}

// جلب الفئات والدورات (كما هو)
async function fetchDropdownData() { /* ... */ }

// جلب البيانات عند تحميل المكون (كما هو)
onMounted(() => { fetchDropdownData(); });

// --- جديد: دالة التحقق من الصحة ---
const validateForm = (): boolean => {
    let isValid = true;
    // مسح الأخطاء القديمة
    validationErrors.title = '';
    validationErrors.youtube_url = '';
    errorMessage.value = null;

    // التحقق من العنوان
    if (!form.value.title?.trim()) {
        validationErrors.title = 'حقل العنوان مطلوب.';
        isValid = false;
    }

    // التحقق من رابط يوتيوب
    if (!form.value.youtube_url?.trim()) {
        validationErrors.youtube_url = 'حقل رابط يوتيوب مطلوب.';
        isValid = false;
    } else {
        // تحقق بسيط من شكل الرابط (يمكن تحسينه)
        try {
            const url = new URL(form.value.youtube_url);
            if (!['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname)) {
                validationErrors.youtube_url = 'يجب أن يكون رابط يوتيوب صالحًا.';
                isValid = false;
            }
        } catch (_) {
            validationErrors.youtube_url = 'صيغة الرابط غير صحيحة.';
            isValid = false;
        }
    }

    return isValid;
};

// --- تعديل: حفظ الدرس (إضافة أو تعديل) ---
async function saveLesson() {
  console.log('Attempting to save lesson...'); // <-- للتأكيد
  // 1. التحقق من الصحة أولاً
  if (!validateForm()) {
      console.log('Validation failed.');
      return; // إيقاف الحفظ إذا لم يكن النموذج صالحًا
  }

  isSaving.value = true;
  errorMessage.value = null; // مسح أي خطأ عام قديم

  // 2. تحضير البيانات (Payload)
  const lessonPayload: Omit<Lesson, 'id' | 'created_at'> = { // استخدام Omit لاستبعاد id و created_at
    title: form.value.title!, // نحن متأكدون أنه موجود بسبب validateForm
    description: form.value.description || null,
    youtube_url: form.value.youtube_url!, // نحن متأكدون أنه موجود
    audio_url: form.value.audio_url || null,
    pdf_transcript_url: form.value.pdf_transcript_url || null,
    category_id: form.value.category_id ? Number(form.value.category_id) : null,
    course_id: form.value.course_id ? Number(form.value.course_id) : null,
  };
  console.log('Payload to send:', JSON.stringify(lessonPayload, null, 2));

  try {
    let error: any = null;
    let data: any = null; // لالتقاط البيانات العائدة

    if (isEditing.value && form.value.id) {
      // 3. وضع التعديل
       console.log(`Attempting UPDATE for lesson ID: ${form.value.id}`);
       const result = await supabase
        .from('lessons')
        .update(lessonPayload)
        .eq('id', form.value.id)
        .select() // <-- مهم جدًا: .select() لطلب البيانات المحدثة
       error = result.error;
       data = result.data;
    } else {
      // 4. وضع الإضافة
      console.log('Attempting INSERT for new lesson');
      const result = await supabase
        .from('lessons')
        .insert(lessonPayload)
        .select(); // <-- مهم جدًا: .select() لطلب الصف الجديد
      error = result.error;
      data = result.data;
    }

    console.log('Supabase response error:', JSON.stringify(error, null, 2));
    console.log('Supabase response data:', JSON.stringify(data, null, 2));

    // 5. التحقق من الخطأ بعد استدعاء Supabase
    if (error) {
        // إذا حدث خطأ، قم برميه ليتم التقاطه بواسطة catch
        throw error;
    }

    // 6. التحقق من البيانات المُعادة (للتأكد من أن شيئًا ما تغير بالفعل)
    if (!data || data.length === 0) {
        // هذا لا ينبغي أن يحدث إذا لم يكن هناك خطأ، لكنه فحص إضافي
        console.warn('Supabase call successful but no data returned.');
        // يمكنك رمي خطأ مخصص هنا إذا أردت
        // throw new Error("تمت العملية بنجاح لكن لم يتم إرجاع بيانات للتأكيد.");
    }

    // 7. نجح الحفظ!
    console.log('Save successful, emitting saved event.');
    emit('saved'); // أخبر المكون الأب بالنجاح

  } catch (err: any) {
    console.error('Error during save operation:', JSON.stringify(err, null, 2));
    // (نفس كود عرض الأخطاء المخصص)
    if (err.message?.includes('duplicate key value violates unique constraint')) { /* ... */ }
    else if (err.message?.includes('violates foreign key constraint')) { /* ... */ }
    else if (err.code === '23502') { // Not-null violation
        errorMessage.value = `فشل حفظ الدرس: حقل مطلوب مفقود في قاعدة البيانات. (${err.message})`;
    }
    else if (err.code === '42501') { // permission denied (RLS)
         errorMessage.value = `فشل حفظ الدرس: ليس لديك الصلاحية الكافية. تحقق من RLS. (${err.message})`;
    }
     else {
         errorMessage.value = `فشل حفظ الدرس: ${err.message || 'خطأ غير متوقع'}`;
    }
  } finally {
    isSaving.value = false; // إيقاف حالة الحفظ دائمًا
    console.log('saveLesson finished.');
  }
}
</script>

<style scoped>
/* يمكنك إضافة أي تنسيقات خاصة هنا إذا احتجت */
</style>