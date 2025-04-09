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
                       <div v-if="loadingCategories" class="mt-1 text-sm text-gray-500">جار تحميل الفئات...</div>
                      <select v-else id="category_id" v-model="form.category_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <option :value="null">-- اختر فئة (اختياري) --</option>
                          <template v-if="categories && categories.length > 0">
                              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                          </template>
                           <option v-else disabled>-- لا توجد فئات متاحة --</option>
                      </select>
                  </div>

                  <!-- === Course Select Field (عاد مرة أخرى) === -->
                   <div>
                       <label for="course_id" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الدورة الدراسية (اختياري)</label>
                       <div v-if="loadingCourses" class="mt-1 text-sm text-gray-500">جار تحميل الدورات...</div>
                       <select
                           v-else
                           id="course_id"
                           v-model="form.course_id"
                           class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                       >
                           <!-- الخيار الأساسي للدرس العام -->
                           <option :value="null">-- درس عام (لا يتبع دورة) --</option>
                           <!-- قائمة الدورات المتاحة -->
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
import type { Database, Tables } from '~/types/database.types';

// Define Types
type Lesson = Tables<'lessons'>;
type Category = Pick<Tables<'categories'>, 'id' | 'name'>;
type Course = Pick<Tables<'study_courses'>, 'id' | 'title'>; // أعدنا تعريف Course

const props = defineProps<{
  show: boolean;
  lessonData: Lesson | null;
  // Prop اختياري لتحديد الدورة مسبقًا عند الإضافة من صفحة الدورة
  preselectedCourseId?: number | null;
}>();

const emit = defineEmits(['close', 'saved']);
const supabase = useSupabaseClient<Database>();

// Form State
const form = ref<Partial<Lesson>>({});
const isSaving = ref(false);
const errorMessage = ref<string | null>(null);
const validationErrors = reactive({ title: '', youtube_url: '' });

// Dropdown State (للفئات والدورات)
const categories = ref<Category[]>([]);
const courses = ref<Course[]>([]); // <-- عاد مرة أخرى
const loadingCategories = ref(false);
const loadingCourses = ref(false); // <-- عاد مرة أخرى

// Computed Properties
const isEditing = computed(() => !!props.lessonData && !!props.lessonData.id);

// Functions
const resetForm = () => {
    form.value = {
        title: '', description: '', youtube_url: '', audio_url: '',
        pdf_transcript_url: '', category_id: null,
        // إعادة تعيين course_id إلى null افتراضيًا أو القيمة الممررة
        course_id: props.preselectedCourseId ?? null,
    };
    errorMessage.value = null;
    validationErrors.title = '';
    validationErrors.youtube_url = '';
};

// Watch for changes in lessonData or preselectedCourseId
watch([() => props.lessonData, () => props.preselectedCourseId], ([newLesson, newPreselectedId], [oldLesson, oldPreselectedId]) => {
  // Reset based on lessonData first (for editing)
  if (newLesson) {
    form.value = { ...newLesson };
    // Clear errors when editing existing lesson
    errorMessage.value = null;
    validationErrors.title = '';
    validationErrors.youtube_url = '';
  }
  // Handle adding new lesson or preselection change
  else if (!newLesson && newPreselectedId !== oldPreselectedId) {
     resetForm(); // This will now use the new preselectedCourseId
  }
  else if (!newLesson && !oldLesson) {
      // This covers the initial opening for "Add New" without preselection
      resetForm();
  }

}, { immediate: true, deep: true });


// Close Modal Handler
function closeModal() { if (!isSaving.value) emit('close'); }

// --- Fetch Categories AND Courses ---
async function fetchDropdownData() {
    console.log('[fetchDropdownData] Starting (Categories & Courses)...');
    loadingCategories.value = true;
    loadingCourses.value = true; // تفعيل تحميل الدورات
    errorMessage.value = null;
    categories.value = []; // Clear previous
    courses.value = [];    // Clear previous

    try {
        const [catResult, courseResult] = await Promise.all([
            supabase.from('categories').select('id, name').order('name'),
            supabase.from('study_courses').select('id, title').order('title') // <-- إعادة جلب الدورات
        ]);

        console.log('[fetchDropdownData] Categories Result:', JSON.stringify(catResult, null, 2));
        console.log('[fetchDropdownData] Courses Result:', JSON.stringify(courseResult, null, 2));

        // Handle Categories
        if (catResult.error) throw new Error(`فشل تحميل الفئات: ${catResult.error.message}`);
        categories.value = catResult.data ?? [];
        console.log(`[fetchDropdownData] ${categories.value.length} categories loaded.`);

        // Handle Courses
        if (courseResult.error) throw new Error(`فشل تحميل الدورات: ${courseResult.error.message}`);
        courses.value = courseResult.data ?? [];
        console.log(`[fetchDropdownData] ${courses.value.length} courses loaded.`);

    } catch (err: any) {
        console.error("Error in fetchDropdownData catch block:", err);
        errorMessage.value = err.message || "فشل تحميل بيانات القوائم المنسدلة.";
        categories.value = []; // Ensure empty on error
        courses.value = [];    // Ensure empty on error
    } finally {
        loadingCategories.value = false;
        loadingCourses.value = false; // إيقاف تحميل الدورات
        console.log('[fetchDropdownData] Finished.');
    }
}
// --- End fetchDropdownData ---

// Watch props.show to fetch data when modal opens
watch(() => props.show, (newVal) => {
    if (newVal) {
        console.log("Modal opening, fetching dropdown data...");
        fetchDropdownData();
    }
});

// Form Validation (كما هو)
const validateForm = (): boolean => {
    // ... (نفس كود التحقق السابق) ...
     let isValid = true;
    validationErrors.title = '';
    validationErrors.youtube_url = '';
    errorMessage.value = null;
    if (!form.value.title?.trim()) { validationErrors.title = 'حقل العنوان مطلوب.'; isValid = false; }
    if (!form.value.youtube_url?.trim()) { validationErrors.youtube_url = 'حقل رابط يوتيوب مطلوب.'; isValid = false; }
    else { try { const url = new URL(form.value.youtube_url); if (!['www.youtube.com', 'youtube.com', 'youtu.be'].includes(url.hostname)) { validationErrors.youtube_url = 'يجب أن يكون رابط يوتيوب صالحًا.'; isValid = false; } } catch (_) { validationErrors.youtube_url = 'صيغة الرابط غير صحيحة.'; isValid = false; } }
    return isValid;
};

// Save Lesson (Insert or Update) - يرسل course_id المختار
async function saveLesson() {
  console.log('Attempting to save lesson...');
  if (!validateForm()) { console.log('Validation failed.'); return; }

  isSaving.value = true;
  errorMessage.value = null;

  // تحضير البيانات، بما في ذلك course_id المختار (قد يكون null)
  const lessonPayload: Omit<Lesson, 'id' | 'created_at'> = {
    title: form.value.title!,
    description: form.value.description || null,
    youtube_url: form.value.youtube_url!,
    audio_url: form.value.audio_url || null,
    pdf_transcript_url: form.value.pdf_transcript_url || null,
    category_id: form.value.category_id ? Number(form.value.category_id) : null,
    course_id: form.value.course_id ? Number(form.value.course_id) : null, // <-- استخدام القيمة من النموذج
  };
  console.log('Payload to send:', JSON.stringify(lessonPayload, null, 2));

  try {
    let error: any = null;
    let data: any = null;

    if (isEditing.value && form.value.id) {
       console.log(`Attempting UPDATE for lesson ID: ${form.value.id}`);
       const result = await supabase.from('lessons').update(lessonPayload).eq('id', form.value.id).select();
       error = result.error; data = result.data;
    } else {
      console.log('Attempting INSERT for new lesson');
      const result = await supabase.from('lessons').insert(lessonPayload).select();
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
     // (نفس معالجة الأخطاء السابقة)
     if (err.message?.includes('violates foreign key constraint')) {
          errorMessage.value = 'فشل الحفظ: الفئة أو الدورة المحددة غير موجودة.'; // تعديل الرسالة قليلاً
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