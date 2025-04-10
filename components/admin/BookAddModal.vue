<template>
  <!-- Backdrop -->
  <div class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" @click.self="closeModal">
    <!-- Modal Content -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header -->
        <div class="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">إضافة كتاب/بحث جديد</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
          <!-- Title -->
          <div>
            <label for="book-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">العنوان *</label>
            <input type="text" id="book-title" v-model="formData.title" required
                   class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
          </div>

          <!-- Description -->
          <div>
            <label for="book-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">الوصف</label>
            <textarea id="book-description" v-model="formData.description" rows="3"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"></textarea>
          </div>

          <!-- Type (Research/Transcript) -->
          <div class="flex space-x-4 rtl:space-x-reverse">
            <div class="flex items-center">
              <input id="is_research" v-model="formData.is_research" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600">
              <label for="is_research" class="ms-2 block text-sm text-gray-900 dark:text-gray-300">هل هو بحث؟</label>
            </div>
            <div class="flex items-center">
              <input id="is_transcript" v-model="formData.is_transcript" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600">
              <label for="is_transcript" class="ms-2 block text-sm text-gray-900 dark:text-gray-300">هل هو تفريغ؟</label>
            </div>
          </div>

           <!-- Linked Lesson -->
          <div>
            <label for="linked-lesson" class="block text-sm font-medium text-gray-700 dark:text-gray-300">ربط بدرس (اختياري)</label>
            <select id="linked-lesson" v-model="formData.linked_lesson_id"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm">
              <option :value="null">-- لا يوجد ربط --</option>
              <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
                {{ lesson.title }}
              </option>
            </select>
             <p v-if="!lessons || lessons.length === 0" class="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
               لا توجد دروس متاحة للربط حاليًا.
             </p>
          </div>

          <!-- PDF File Upload -->
          <div>
            <label for="book-file" class="block text-sm font-medium text-gray-700 dark:text-gray-300">ملف الكتاب (PDF) *</label>
            <input type="file" id="book-file" @change="handleFileChange" accept=".pdf" required
                   class="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100
                          dark:file:bg-gray-600 dark:file:text-gray-200 dark:hover:file:bg-gray-500">
            <p v-if="bookFile" class="mt-1 text-xs text-gray-500 dark:text-gray-400">الملف المختار: {{ bookFile.name }}</p>
          </div>

           <!-- Cover Image Upload (Optional - Add if needed) -->
           <!-- يمكنك إضافة حقل رفع صورة الغلاف هنا بنفس طريقة ملف PDF -->


          <!-- Error Message -->
          <div v-if="errorMessage" class="text-red-600 dark:text-red-400 text-sm">
            {{ errorMessage }}
          </div>

          <!-- Actions -->
          <div class="pt-4 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="closeModal"
              :disabled="formLoading"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              :disabled="formLoading || !bookFile"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <span v-if="formLoading">جاري الحفظ...</span>
              <span v-else>حفظ الكتاب</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { Database } from '~/types/database.types'; // تأكد من صحة المسار

// تعريف الأنواع
type Lesson = Database['public']['Tables']['lessons']['Row'];
type BookInsert = Database['public']['Tables']['books']['Insert'];

// تعريف Props القادمة من الصفحة الرئيسية
const props = defineProps<{
  lessons: Lesson[];
}>();

// تعريف Events التي سيصدرها المكون
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'book-added'): void;
}>();

const supabase = useSupabaseClient<Database>();

// حالة تحميل النموذج
const formLoading = ref(false);
// رسالة الخطأ
const errorMessage = ref('');
// ملف PDF المختار
const bookFile = ref<File | null>(null);

// بيانات النموذج
const formData = reactive<Omit<BookInsert, 'storage_path'>>({ // Omit storage_path as it comes from upload
  title: '',
  description: '',
  is_research: false,
  is_transcript: false,
  linked_lesson_id: null,
  cover_image_url: null, // يجب إضافة حقل رفع صورة الغلاف إذا أردت استخدامه
});

// دالة التعامل مع تغيير ملف PDF
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    // التحقق من نوع الملف (اختياري ولكن جيد)
    if (target.files[0].type === 'application/pdf') {
      bookFile.value = target.files[0];
      errorMessage.value = ''; // مسح أي خطأ سابق للملف
    } else {
      bookFile.value = null;
      target.value = ''; // مسح اختيار الملف
      errorMessage.value = 'الرجاء اختيار ملف PDF فقط.';
    }
  } else {
    bookFile.value = null;
  }
}

// دالة إرسال النموذج
async function handleSubmit() {
  // التحقق من وجود ملف
  if (!bookFile.value) {
    errorMessage.value = 'الرجاء اختيار ملف PDF للكتاب.';
    return;
  }

  formLoading.value = true;
  errorMessage.value = '';

  try {
    // 1. رفع ملف PDF إلى Supabase Storage
    const file = bookFile.value;
    const fileExt = file.name.split('.').pop();
    // استخدام اسم فريد للملف (مثال: timestamp + original name)
    const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`; // إزالة الحروف غير الصالحة للمسار
    const filePath = `${uniqueFileName}`; // أو pdfs/${uniqueFileName} - تأكد من أن المجلد يتوافق مع سياسات RLS

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('book-files') // <-- تأكد من اسم الـ bucket الصحيح في Supabase
      .upload(filePath, file);

    if (uploadError) {
      // حاول تقديم رسالة خطأ أكثر وضوحًا
      if (uploadError.message.includes('Duplicate')) {
           throw new Error('حدث خطأ: اسم الملف موجود مسبقًا. حاول إعادة تسمية الملف أو المحاولة مرة أخرى.');
      } else if (uploadError.message.includes('policy')) {
           throw new Error('حدث خطأ في الأذونات عند رفع الملف. تحقق من سياسات التخزين.');
      }
      throw new Error(`خطأ في رفع ملف PDF: ${uploadError.message}`);
    }

    const uploadedFilePath = uploadData.path; // المسار الفعلي للملف بعد الرفع

    // (اختياري) رفع صورة الغلاف هنا إذا أضفت الحقل


    // 2. تجهيز بيانات الكتاب لإدخالها في قاعدة البيانات
    const bookDataToInsert: BookInsert = {
      ...formData,
      storage_path: uploadedFilePath, // إضافة مسار الملف المرفوع
       // cover_image_url: // أضف مسار أو رابط صورة الغلاف هنا إذا تم رفعها
    };

     // تحويل القيمة الفارغة في linked_lesson_id إلى null صراحةً
    if (bookDataToInsert.linked_lesson_id === '') {
       bookDataToInsert.linked_lesson_id = null;
    }


    // 3. إدخال بيانات الكتاب في جدول 'books'
    const { error: insertError } = await supabase
      .from('books')
      .insert(bookDataToInsert);

    if (insertError) {
      // حاول حذف الملف الذي تم رفعه إذا فشل الإدخال في قاعدة البيانات (Rollback بسيط)
      try {
          await supabase.storage.from('book-files').remove([uploadedFilePath]);
          console.warn("Uploaded file removed due to DB insertion failure.");
      } catch (removeError: any) {
          console.error("Failed to remove uploaded file after DB error:", removeError.message);
      }
      throw new Error(`خطأ في حفظ بيانات الكتاب: ${insertError.message}`);
    }

    // 4. نجاح!
    console.log('Book added successfully!');
    // يمكنك إظهار رسالة نجاح (toast)
    emit('book-added'); // إعلام الصفحة الرئيسية بإعادة تحميل القائمة
    emit('close'); // إغلاق المودال

  } catch (err: any) {
    console.error('Error submitting book form:', err.message);
    errorMessage.value = err.message || 'حدث خطأ غير متوقع.';
  } finally {
    formLoading.value = false;
  }
}

// دالة إغلاق المودال
function closeModal() {
  // لا تقم بإغلاق المودال إذا كان النموذج قيد التحميل
  if (!formLoading.value) {
    emit('close');
  }
}
</script>

<style scoped>
/* يمكنك إضافة تنسيقات للمودال هنا */
</style>