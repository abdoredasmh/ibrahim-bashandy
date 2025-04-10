<template>
  <div>
    <!-- Header and Add Button -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold">إدارة الكتب والأبحاث</h1>
      <button
        @click="openAddModal"
        class="button-primary"
        :disabled="loadingRelated"
      >
        <span v-if="loadingRelated">تحميل البيانات...</span>
        <span v-else>إضافة كتاب/بحث جديد</span>
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loadingList" class="text-center py-10">
      <LoadingSpinner />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">جارٍ تحميل قائمة الكتب...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="books.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
      لا توجد كتب أو أبحاث مضافة حتى الآن.
    </div>

    <!-- Books Table -->
    <div v-else class="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 dark:ring-gray-700 rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" class="table-header">العنوان</th>
            <th scope="col" class="table-header">النوع</th>
            <th scope="col" class="table-header">مرتبط بدرس</th>
            <th scope="col" class="table-header">تاريخ الإضافة</th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">إجراءات</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="book in books" :key="book.id">
            <td class="table-cell font-medium text-gray-900 dark:text-white">{{ book.title }}</td>
            <td class="table-cell">
              <span v-if="book.is_research" class="badge-blue">بحث</span>
              <span v-else-if="book.is_transcript" class="badge-yellow">تفريغ</span>
              <span v-else class="badge-green">كتاب</span>
            </td>
            <td class="table-cell">
              {{ getLessonTitle(book.linked_lesson_id) || 'غير مرتبط' }}
            </td>
            <td class="table-cell">
              {{ formatDate(book.created_at) }}
            </td>
            <td class="table-cell text-right font-medium space-x-2 rtl:space-x-reverse">
              <button @click="openEditModal(book)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">تعديل</button>
              <button @click="handleDelete(book)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Book Modal -->
    <LazyAdminBookAddModal
      v-if="showAddModal"
      :lessons="lessons"
      @close="closeAddModal"
      @book-added="handleBookAdded"
    />

    <!-- Edit Book Modal -->
    <LazyAdminBookEditModal
      v-if="showEditModal && selectedBookForEdit"
      :book="selectedBookForEdit"
      :lessons="lessons"
      @close="closeEditModal"
      @book-updated="handleBookUpdated"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Database } from '~/types/database.types';
// Import Modals (use Lazy loading for better performance)
const LazyAdminBookAddModal = defineAsyncComponent(() => import('~/components/admin/BookAddModal.vue'));
const LazyAdminBookEditModal = defineAsyncComponent(() => import('~/components/admin/BookEditModal.vue'));
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // Assuming you have this


// Define Types
type Book = Database['public']['Tables']['books']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];

definePageMeta({ layout: 'admin', middleware: 'admin' });


// Supabase client
const supabase = useSupabaseClient<Database>();

// Reactive State
const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedBookForEdit = ref<Book | null>(null);
const books = ref<Book[]>([]);
const loadingList = ref(true);
const lessons = ref<Lesson[]>([]);
const loadingRelated = ref(true);

// Configuration
const STORAGE_BUCKET_NAME = 'book-files'; // Use a constant or ideally Runtime Config

// --- Data Fetching ---
async function fetchBooks() {
  loadingList.value = true;
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*') // Select all for editing, or specify needed columns
      .order('created_at', { ascending: false });
    if (error) throw error;
    books.value = data || [];
  } catch (err: any) {
    console.error('Error fetching books:', err.message);
    alert(`فشل تحميل قائمة الكتب: ${err.message}`); // User feedback
  } finally {
    loadingList.value = false;
  }
}

async function fetchLessons() {
  loadingRelated.value = true;
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title') // Fetch only necessary data for dropdown
      .order('title', { ascending: true }); // Order alphabetically
    if (error) throw error;
    lessons.value = data || [];
  } catch (err: any) {
    console.error('Error fetching lessons:', err.message);
    // Non-critical error, don't block UI
  } finally {
    loadingRelated.value = false;
  }
}

// --- Helper Functions ---
function getLessonTitle(lessonId: number | null): string | null {
  if (!lessonId) return null;
  const lesson = lessons.value.find(l => l.id === lessonId);
  return lesson ? lesson.title : `درس #${lessonId}`;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    try {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    } catch (e) {
        return 'تاريخ غير صالح';
    }
}

// --- Modal Handling ---
function openAddModal() {
  if (!loadingRelated.value) {
    showAddModal.value = true;
  }
}
function closeAddModal() {
  showAddModal.value = false;
}
function handleBookAdded() {
  closeAddModal();
  fetchBooks(); // Refresh list after adding
  // Optionally show success toast
}

function openEditModal(book: Book) {
  if (!loadingRelated.value) {
      selectedBookForEdit.value = book;
      showEditModal.value = true;
  }
}
function closeEditModal() {
  showEditModal.value = false;
  selectedBookForEdit.value = null;
}
function handleBookUpdated() {
  closeEditModal();
  fetchBooks(); // Refresh list after updating
  // Optionally show success toast
}

// --- Delete Action ---
async function handleDelete(book: Book) {
  if (!confirm(`هل أنت متأكد من حذف الكتاب "${book.title}"؟ سيتم حذف الملف (${book.storage_path || 'لا يوجد'}) نهائيًا ولا يمكن التراجع عن هذا الإجراء.`)) {
    return;
  }

  console.log(`Attempting deletion for book ID: ${book.id}, Path: ${book.storage_path}`);
  const originalStoragePath = book.storage_path; // Keep path for potential manual cleanup message

  try {
    // 1. Delete from Database First (or Storage first, debatable, DB first avoids orphaned files if DB fails)
    console.log(`Deleting book record from DB (ID: ${book.id})`);
    const { error: dbError } = await supabase
      .from('books')
      .delete()
      .eq('id', book.id);

    if (dbError) {
        console.error("DB Delete Error:", dbError);
        throw new Error(`فشل حذف سجل الكتاب من قاعدة البيانات: ${dbError.message}`);
    }
    console.log("Book record deleted successfully from DB.");

    // 2. Delete from Storage if path exists
    if (originalStoragePath) {
        console.log(`Attempting to remove file from storage: ${originalStoragePath}`);
        const { error: storageError } = await supabase.storage
            .from(STORAGE_BUCKET_NAME)
            .remove([originalStoragePath]); // Pass path in an array

        if (storageError) {
            // Log the error but don't throw, inform the user
            console.error(`Storage Delete Error: Failed to delete ${originalStoragePath}`, storageError);
            alert(`تم حذف سجل الكتاب بنجاح، ولكن فشل حذف الملف (${originalStoragePath}) من التخزين. الخطأ: ${storageError.message}. قد تحتاج لحذفه يدويًا.`);
            // Continue to UI update even if storage deletion failed
        } else {
            console.log(`File ${originalStoragePath} removed successfully from storage.`);
             // Optionally show success toast for full deletion
            alert('تم حذف الكتاب وملفه بنجاح.');
        }
    } else {
        console.log("No storage_path found, skipping storage deletion.");
         // Optionally show success toast for DB deletion only
         alert('تم حذف سجل الكتاب بنجاح (لم يكن هناك ملف مرتبط).');
    }

    // 3. Update UI
    fetchBooks(); // Refresh the list

  } catch (err: any) {
    console.error('Error during book deletion process:', err);
    // Show general error feedback
    alert(`حدث خطأ غير متوقع أثناء الحذف: ${err.message}`);
  }
}

// --- Lifecycle Hook ---
onMounted(() => {
  fetchBooks();
  fetchLessons();
});
</script>

<style scoped>
/* Reusable utility classes */
.table-header {
  @apply px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider;
}
.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400;
}
.badge-base {
   @apply px-2 inline-flex text-xs leading-5 font-semibold rounded-full;
}
.badge-blue {
   @apply badge-base bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200;
}
.badge-yellow {
   @apply badge-base bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200;
}
.badge-green {
   @apply badge-base bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200;
}
.button-primary { /* Ensure this matches your global style or define here */
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50;
}
/* Add other styles if needed */
</style>