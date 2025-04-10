<!-- components/admin/AdminLessonModal.vue -->
<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">

      <!-- Backdrop -->
      <TransitionChild
        as="div"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm"
        enter="duration-300 ease-out" enter-from="opacity-0" enter-to="opacity-100"
        leave="duration-200 ease-in" leave-from="opacity-100" leave-to="opacity-0"
      />

      <!-- Full-screen container -->
      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">

          <!-- Modal panel -->
          <TransitionChild as="template" enter="duration-300 ease-out" enter-from="opacity-0 scale-95" enter-to="opacity-100 scale-100" leave="duration-200 ease-in" leave-from="opacity-100 scale-100" leave-to="opacity-0 scale-95">
            <DialogPanel class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all">
              <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 mb-4">
                {{ isEditing ? 'تعديل الدرس' : 'إضافة درس جديد' }}
              </DialogTitle>

              <form @submit.prevent="saveLesson" class="space-y-4">

                <!-- Title Field -->
                <div>
                  <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">العنوان *</label>
                  <input
                    type="text" id="title" v-model="form.title" required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    aria-describedby="title-error"
                  />
                   <p v-if="validationErrors.title" class="mt-1 text-xs text-red-500" id="title-error">{{ validationErrors.title }}</p>
                </div>

                <!-- Description Field -->
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</label>
                  <textarea id="description" rows="4" v-model="form.description" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
                </div>

                <!-- YouTube URL Field -->
                <div>
                   <label for="youtube_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">رابط يوتيوب *</label>
                   <input
                     type="url" id="youtube_url" v-model="form.youtube_url" required placeholder="https://..."
                     class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                     aria-describedby="youtube-error"
                    />
                   <p v-if="validationErrors.youtube_url" class="mt-1 text-xs text-red-500" id="youtube-error">{{ validationErrors.youtube_url }}</p>
                </div>

                <!-- Audio URL Field (تمت إزالته) -->
                <!-- PDF Transcript URL Field (تمت إزالته) -->

                 <!-- Category Select Field -->
                  <div>
                      <label for="category_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الفئة</label>
                       <div v-if="loadingCategories" class="mt-1 text-sm text-gray-500">جار تحميل الفئات...</div>
                      <select v-else id="category_id" v-model="form.category_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <option :value="null">-- اختر فئة (اختياري) --</option>
                          <template v-if="categories && categories.length > 0">
                              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                          </template>
                           <option v-else disabled>-- لا توجد فئات متاحة --</option>
                      </select>
                  </div>

                  <!-- === Course Select Field === -->
                   <div>
                       <label for="course_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الدورة الدراسية (اختياري)</label>
                       <div v-if="loadingCourses" class="mt-1 text-sm text-gray-500">جار تحميل الدورات...</div>
                       <select
                           v-else
                           id="course_id"
                           v-model="form.course_id"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       >
                           <option :value="null">-- درس عام (لا يتبع دورة) --</option>
                           <template v-if="courses && courses.length > 0">
                               <option v-for="course in courses" :key="course.id" :value="course.id">
                                   {{ course.title }}
                               </option>
                           </template>
                            <option v-else disabled>-- لا توجد دورات متاحة --</option>
                       </select>
                   </div>
                   <!-- === End Course Select Field === -->

                <!-- General Error Message -->
                <p v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400">
                  خطأ: {{ errorMessage }}
                </p>

                <!-- Action Buttons -->
                <div class="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse">
                    <button type="button" @click="closeModal" class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">إلغاء</button>
                    <button type="submit" :disabled="isSaving || loadingCategories || loadingCourses" class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50">
                       <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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
import { ref, watch, computed, onMounted, reactive } from 'vue';
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue';
import type { Database, Tables, TablesInsert, TablesUpdate } from '~/types/database.types'; // استيراد الأنواع المطلوبة

// Define Types
// استخدم الأنواع الأساسية بدون الحقول المحذوفة إذا أردت دقة أكبر،
// لكن Partial سيظل يعمل. للتوضيح، سنعرف نوعًا خاصًا بالنموذج.
// type LessonPayload = Omit<TablesInsert<'lessons'>, 'id' | 'created_at' | 'updated_at' | 'audio_url' | 'pdf_transcript_url'>;
// type LessonUpdatePayload = Omit<TablesUpdate<'lessons'>, 'id' | 'created_at' | 'updated_at' | 'audio_url' | 'pdf_transcript_url'>;
// أو أبسط، استخدام Partial مع إزالة الحقول عند الإرسال
type Lesson = Tables<'lessons'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;
type Course = Pick<Tables<'study_courses'>, 'id' | 'title'>;

const props = defineProps<{
  show: boolean;
  lessonData: Lesson | null;
  preselectedCourseId?: number | null;
}>();

const emit = defineEmits(['close', 'saved']);
const supabase = useSupabaseClient<Database>();

// Form State - لاحظ أننا سنستخدم Partial، لكننا لا نضع الحقول المحذوفة فيه
const form = ref<Partial<Omit<Lesson, 'audio_url' | 'pdf_transcript_url'>>>({});
const isSaving = ref(false);
const errorMessage = ref<string | null>(null);
const validationErrors = reactive({ title: '', youtube_url: '' });

// Dropdown State
const categories = ref<Category[]>([]);
const courses = ref<Course[]>([]);
const loadingCategories = ref(false);
const loadingCourses = ref(false);

// Computed Properties
const isEditing = computed(() => !!props.lessonData && !!props.lessonData.id);

// Functions
const resetForm = () => {
    form.value = {
        title: '', description: '', youtube_url: '',
        // audio_url: '', // تمت إزالته
        // pdf_transcript_url: '', // تمت إزالته
        category_id: null,
        course_id: props.preselectedCourseId ?? null,
    };
    errorMessage.value = null;
    validationErrors.title = '';
    validationErrors.youtube_url = '';
};

// Watch for changes in lessonData or preselectedCourseId
watch([() => props.lessonData, () => props.preselectedCourseId], ([newLesson, newPreselectedId], [oldLesson, oldPreselectedId]) => {
  if (newLesson) {
    // عند التعديل، نأخذ البيانات الموجودة ونحذف الحقول غير المرغوبة
    const { audio_url, pdf_transcript_url, ...restOfLesson } = newLesson;
    form.value = { ...restOfLesson };
    errorMessage.value = null;
    validationErrors.title = '';
    validationErrors.youtube_url = '';
  }
  else if (!newLesson && newPreselectedId !== oldPreselectedId) {
     resetForm();
  }
  else if (!newLesson && !oldLesson) {
      resetForm();
  }
}, { immediate: true, deep: true });


// Close Modal Handler
function closeModal() { if (!isSaving.value) emit('close'); }

// Fetch Categories AND Courses
async function fetchDropdownData() {
    console.log('[fetchDropdownData] Starting (All Categories & Courses)...'); // Updated log message
    loadingCategories.value = true;
    loadingCourses.value = true;
    errorMessage.value = null;
    categories.value = [];
    courses.value = [];

    try {
        const [catResult, courseResult] = await Promise.all([
            supabase.from('categories')
                    .select('id, name')
                    // .eq('type', 'lesson') // <<<--- تم حذف أو التعليق على هذا السطر
                    .order('name'), // يمكنك تغيير الترتيب إذا أردت
            supabase.from('study_courses')
                    .select('id, title')
                    .order('title')
        ]);

        console.log('[fetchDropdownData] Categories Result (All):', JSON.stringify(catResult, null, 2)); // Updated log message
        console.log('[fetchDropdownData] Courses Result:', JSON.stringify(courseResult, null, 2));

        if (catResult.error) throw new Error(`فشل تحميل الفئات: ${catResult.error.message}`);
        // تأكد من أن البيانات القادمة ليست null أو undefined قبل إسنادها
        categories.value = catResult.data ?? [];
        console.log(`[fetchDropdownData] ${categories.value.length} total categories loaded.`);

        if (courseResult.error) throw new Error(`فشل تحميل الدورات: ${courseResult.error.message}`);
        courses.value = courseResult.data ?? [];
        console.log(`[fetchDropdownData] ${courses.value.length} courses loaded.`);

    } catch (err: any) {
        console.error("Error in fetchDropdownData catch block:", err);
        errorMessage.value = err.message || "فشل تحميل بيانات القوائم المنسدلة.";
        categories.value = []; // تأكد من تفريغها عند الخطأ
        courses.value = [];    // تأكد من تفريغها عند الخطأ
    } finally {
        loadingCategories.value = false;
        loadingCourses.value = false;
        console.log('[fetchDropdownData] Finished.');
    }
}

// Watch props.show to fetch data when modal opens
watch(() => props.show, (newVal) => {
    if (newVal) {
        console.log("Modal opening, fetching dropdown data...");
        fetchDropdownData();
    }
});

// Form Validation
const validateForm = (): boolean => {
    let isValid = true;
    validationErrors.title = '';
    validationErrors.youtube_url = '';
    errorMessage.value = null;
    if (!form.value.title?.trim()) { validationErrors.title = 'حقل العنوان مطلوب.'; isValid = false; }
    if (!form.value.youtube_url?.trim()) { validationErrors.youtube_url = 'حقل رابط يوتيوب مطلوب.'; isValid = false; }
    else { try { const url = new URL(form.value.youtube_url); if (!['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname)) { validationErrors.youtube_url = 'يجب أن يكون رابط يوتيوب صالحًا.'; isValid = false; } } catch (_) { validationErrors.youtube_url = 'صيغة الرابط غير صحيحة.'; isValid = false; } }
    return isValid;
};

// Save Lesson (Insert or Update)
async function saveLesson() {
  console.log('Attempting to save lesson...');
  if (!validateForm()) { console.log('Validation failed.'); return; }

  isSaving.value = true;
  errorMessage.value = null;

  // تحضير البيانات بدون الحقول المحذوفة
  const lessonPayload: Omit<TablesInsert<'lessons'>, 'id' | 'created_at' | 'updated_at' | 'audio_url' | 'pdf_transcript_url'> = {
    title: form.value.title!,
    description: form.value.description || null,
    youtube_url: form.value.youtube_url!,
    // audio_url: form.value.audio_url || null, // تمت إزالته
    // pdf_transcript_url: form.value.pdf_transcript_url || null, // تمت إزالته
    category_id: form.value.category_id ? Number(form.value.category_id) : null,
    course_id: form.value.course_id ? Number(form.value.course_id) : null,
  };
  console.log('Payload to send:', JSON.stringify(lessonPayload, null, 2));

  try {
    let error: any = null;
    let data: any = null;

    // تأكد من إزالة الحقول غير المرغوبة من payload للتحديث أيضاً إذا لزم الأمر
    // في حالتنا هذه، `lessonPayload` نفسه لا يحتوي عليها، لذا يمكن استخدامه مباشرة
    const updatePayload: TablesUpdate<'lessons'> = { ...lessonPayload };

    if (isEditing.value && form.value.id) {
       console.log(`Attempting UPDATE for lesson ID: ${form.value.id}`);
       // تأكد من عدم إرسال الحقول المحذوفة في التحديث
       const result = await supabase.from('lessons').update(updatePayload).eq('id', form.value.id).select();
       error = result.error; data = result.data;
    } else {
      console.log('Attempting INSERT for new lesson');
      const result = await supabase.from('lessons').insert(lessonPayload).select(); // Insert لا يحتوي الحقول المحذوفة
      error = result.error; data = result.data;
    }

    console.log('Supabase response error:', JSON.stringify(error, null, 2));
    console.log('Supabase response data:', JSON.stringify(data, null, 2));

    if (error) throw error;
    if (!data || data.length === 0) console.warn('Supabase call successful but no data returned.');

    console.log('Save successful, emitting saved event.');
    emit('saved');

  } catch (err: any) {
    console.error('Error during save operation:', JSON.stringify(err, null, 2));
     if (err.message?.includes('violates foreign key constraint')) {
          errorMessage.value = 'فشل الحفظ: الفئة أو الدورة المحددة غير موجودة.';
     } else if (err.code === '42501') { /* ... RLS error ... */ }
     else { errorMessage.value = `فشل حفظ الدرس: ${err.message || 'خطأ غير متوقع'}`; }
  } finally {
    isSaving.value = false;
    console.log('saveLesson finished.');
  }
}

</script>

<style scoped>
/* Add specific styles if needed */
</style>