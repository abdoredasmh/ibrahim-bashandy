<template>
  <div class="p-4 md:p-6 lg:p-8">
    <div class="flex justify-between items-center mb-6 border-b border-cream-gray dark:border-gray-700 pb-3">
      <h1 class="text-2xl font-bold text-brown-dark dark:text-beige-light">
        إدارة المواعيد والإعلانات
      </h1>
      <button
        @click="openAddModal"
        class="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 me-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        إضافة جديد
      </button>
    </div>

    <!-- Loading State for List -->
     <div v-if="isLoadingList" class="text-center py-10">
        <p class="text-gray-500 dark:text-gray-400 mb-3">جاري تحميل الإعلانات...</p>
         <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
         </div>
     </div>

     <!-- Error State for List -->
     <div v-else-if="listError" class="text-center py-10 p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-md">
        <p>خطأ في تحميل القائمة: {{ listError }}</p>
        <button @click="fetchAnnouncements" class="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
          إعادة المحاولة
        </button>
     </div>

    <!-- Announcements Table -->
    <div v-else-if="announcements.length > 0" class="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700">
      <table class="min-w-full divide-y divide-cream-gray dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700/50">
          <tr>
            <th scope="col" class="table-th">العنوان</th>
            <th scope="col" class="table-th">النوع</th>
            <th scope="col" class="table-th">التاريخ</th>
            <th scope="col" class="table-th text-center">منشور؟</th>
            <th scope="col" class="table-th text-left">إجراءات</th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-cream-gray dark:divide-gray-700">
          <tr v-for="announcement in announcements" :key="announcement.id" class="table-tr">
            <td class="table-td font-medium text-brown-dark dark:text-beige-light">{{ announcement.title }}</td>
            <td class="table-td">
              <!-- تنسيق النوع المحدث ليشمل البث المباشر -->
              <span :class="[
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                announcement.type === 'lecture' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200' :
                announcement.type === 'live' ? 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200 animate-pulse' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200'
              ]">
                {{ getTypeText(announcement.type) }}
              </span>
            </td>
            <td class="table-td text-gray-700 dark:text-gray-300">{{ formatDate(announcement.date) || 'غير محدد' }}</td>
            <td class="table-td text-center">
              <!-- Toggle Publish Button -->
              <button @click="togglePublish(announcement)" :class="[
                'p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-150',
                announcement.is_published ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-500 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-800/60' : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-800/60'
              ]">
                <svg v-if="announcement.is_published" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                 <span class="sr-only">{{ announcement.is_published ? 'إلغاء النشر' : 'نشر' }}</span>
              </button>
            </td>
            <td class="table-td text-left font-medium space-x-reverse space-x-2">
              <button @click="openEditModal(announcement)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">تعديل</button>
              <button @click="handleDelete(announcement.id)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

     <!-- No Announcements Message -->
     <div v-else class="text-center py-10">
        <p class="text-gray-500 dark:text-gray-400">لا توجد إعلانات أو مواعيد حاليًا.</p>
     </div>

    <!-- Add/Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div @click="closeModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-80" aria-hidden="true"></div>
        <!-- Modal panel -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start w-full">
              <div class="mt-3 text-center sm:mt-0 sm:text-right w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-5" id="modal-title">
                  {{ editingAnnouncement ? 'تعديل' : 'إضافة جديد' }}
                </h3>
                <form @submit.prevent="handleSubmit">
                  <div class="space-y-5">
                    <!-- Title -->
                    <div>
                      <label for="modal-title-input" class="form-label">العنوان <span class="text-red-500">*</span></label>
                      <input v-model="formData.title" type="text" id="modal-title-input" required class="form-input" />
                    </div>
                    <!-- Details -->
                    <div>
                      <label for="modal-details" class="form-label">التفاصيل</label>
                      <textarea v-model="formData.details" id="modal-details" rows="4" class="form-textarea"></textarea>
                    </div>
                    <!-- Type -->
                    <div>
                      <label for="modal-type" class="form-label">النوع <span class="text-red-500">*</span></label>
                      <select v-model="formData.type" id="modal-type" required class="form-select">
                        <option value="lecture">محاضرة / درس</option>
                        <option value="announcement">إعلان عام</option>
                        <option value="live">بث مباشر</option>
                      </select>
                    </div>
                    <!-- Date and Time -->
                    <div>
                      <label for="modal-date" class="form-label">التاريخ والوقت</label>
                      <input v-model="formData.date" type="datetime-local" id="modal-date" class="form-input" />
                      <p class="form-help-text">مهم للمحاضرات والبث المباشر لتحديد وقت البدء.</p>
                    </div>
                    <!-- Link -->
                    <div>
                      <label for="modal-link" class="form-label">الرابط <span v-if="formData.type === 'live' || formData.type === 'lecture'" class="text-red-500">*</span></label>
                      <input v-model="formData.link" type="url" id="modal-link" :required="formData.type === 'live' || formData.type === 'lecture'" class="form-input" placeholder="https://..."/>
                       <p class="form-help-text">رابط البث (يوتيوب، فيسبوك، إلخ) أو رابط تفاصيل الإعلان.</p>
                    </div>
                    <!-- Is Published -->
                    <div class="flex items-center">
                      <input v-model="formData.is_published" id="modal-is_published" type="checkbox" class="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-600 dark:border-gray-500"/>
                      <label for="modal-is_published" class="ms-2 block text-sm text-gray-900 dark:text-gray-300">نشر (جعله مرئياً للعامة)</label>
                    </div>
                  </div>
                  <!-- Feedback Messages Inside Modal -->
                  <div v-if="successMessage" class="mt-4 p-3 form-success-message">{{ successMessage }}</div>
                  <div v-if="errorMessage" class="mt-4 p-3 form-error-message">خطأ: {{ errorMessage }}</div>
                </form>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="handleSubmit" :disabled="isSaving" type="button" class="modal-button-primary">
               <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                 <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSaving ? 'جاري الحفظ...' : (editingAnnouncement ? 'حفظ التعديلات' : 'إضافة') }}
            </button>
            <button @click="closeModal" type="button" class="modal-button-secondary">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
    <!-- End Modal -->

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSupabaseClient } from '#imports';
import type { Database, Tables, Enums } from '~/types/database.types';

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Types & Interfaces ---
type AnnouncementType = Enums<'announcement_type'>;
type Announcement = Omit<Tables<'announcements'>, 'type'> & {
  type: AnnouncementType;
};

// --- Supabase Client ---
const client = useSupabaseClient<Database>();

// --- Component State ---
const announcements = ref<Announcement[]>([]);
const isLoadingList = ref(false);
const listError = ref<string | null>(null);
const isModalOpen = ref(false);
const editingAnnouncement = ref<Announcement | null>(null);
const isSaving = ref(false);
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

// --- Form Data State ---
const initialFormData = {
  title: '',
  details: '',
  type: 'announcement' as AnnouncementType,
  date: '',
  link: '',
  is_published: false,
};
const formData = ref({ ...initialFormData });

// --- Helper Functions ---
function formatDate(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'تاريخ غير صالح';
  }
}

function formatISOForInput(isoString: string | null): string {
   if (!isoString) return '';
   try {
     const date = new Date(isoString);
     date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
     return date.toISOString().slice(0, 16);
   } catch {
     return '';
   }
}

function getTypeText(type: AnnouncementType): string {
    switch (type) {
        case 'lecture': return 'محاضرة/درس';
        case 'announcement': return 'إعلان عام';
        case 'live': return 'بث مباشر';
        default:
            // Handle potential new or unexpected types gracefully
            const exhaustiveCheck: never = type;
            return String(type); // Fallback to the original value
    }
}

// --- Data Fetching ---
async function fetchAnnouncements() {
  isLoadingList.value = true;
  listError.value = null;
  try {
    const { data, error } = await client
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    announcements.value = (data || []) as Announcement[];
  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    listError.value = error.message || 'فشل تحميل قائمة الإعلانات.';
    announcements.value = [];
  } finally {
    isLoadingList.value = false;
  }
}

onMounted(fetchAnnouncements);

// --- Modal Management ---
function openAddModal() {
  editingAnnouncement.value = null;
  formData.value = { ...initialFormData };
  successMessage.value = null;
  errorMessage.value = null;
  isModalOpen.value = true;
}

function openEditModal(announcement: Announcement) {
  editingAnnouncement.value = announcement;
  formData.value = {
    title: announcement.title,
    details: announcement.details ?? '',
    type: announcement.type,
    date: formatISOForInput(announcement.date),
    link: announcement.link ?? '',
    is_published: announcement.is_published,
  };
  successMessage.value = null;
  errorMessage.value = null;
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
  editingAnnouncement.value = null;
}

// --- Form Handling ---
const handleSubmit = async () => {
  isSaving.value = true;
  successMessage.value = null;
  errorMessage.value = null;

   if ((formData.value.type === 'live' || formData.value.type === 'lecture') && !formData.value.link) {
       errorMessage.value = 'حقل الرابط مطلوب للمحاضرات والبث المباشر.';
       isSaving.value = false;
       return;
   }

  try {
    const dataToSubmit = {
      title: formData.value.title,
      details: formData.value.details || null,
      type: formData.value.type,
      date: formData.value.date ? new Date(formData.value.date).toISOString() : null,
      link: formData.value.link || null,
      is_published: formData.value.is_published,
    };

    let error;
    if (editingAnnouncement.value) {
      const { error: updateError } = await client
        .from('announcements')
        .update(dataToSubmit)
        .match({ id: editingAnnouncement.value.id });
      error = updateError;
    } else {
      const { error: insertError } = await client
        .from('announcements')
        .insert([dataToSubmit]);
      error = insertError;
    }

    if (error) throw error;

    successMessage.value = editingAnnouncement.value ? 'تم التحديث بنجاح!' : 'تمت الإضافة بنجاح!';
    await fetchAnnouncements();
    closeModal();

  } catch (error: any) {
    console.error('Error saving announcement:', error);
    if (error.message?.includes('announcement_type')) {
         errorMessage.value = 'خطأ في النوع المحدد. تأكد من تحديث قاعدة البيانات لتشمل النوع "live".';
    } else if (error.message?.includes('violates check constraint')) {
         errorMessage.value = 'حدث خطأ في البيانات المدخلة، يرجى المراجعة.';
    }
     else {
        errorMessage.value = error.message || 'حدث خطأ غير متوقع.';
     }
  } finally {
    isSaving.value = false;
  }
};

// --- Delete Handling ---
async function handleDelete(id: number) {
  if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.')) {
    return;
  }
  errorMessage.value = null;
  try {
    const { error } = await client
      .from('announcements')
      .delete()
      .match({ id: id });
    if (error) throw error;
    await fetchAnnouncements();
    // Optional: Show temporary success message for deletion
  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    errorMessage.value = `فشل حذف الإعلان: ${error.message}`;
  }
}

// --- Toggle Publish Status ---
async function togglePublish(announcement: Announcement) {
    const newStatus = !announcement.is_published;
    errorMessage.value = null;
    // Optional: Add visual feedback for loading state on the button itself
    try {
        const { error } = await client
            .from('announcements')
            .update({ is_published: newStatus })
            .match({ id: announcement.id });
        if (error) throw error;
        await fetchAnnouncements(); // Refresh list to show updated status
    } catch (error: any) {
        console.error('Error toggling publish status:', error);
        errorMessage.value = `فشل تحديث حالة النشر: ${error.message}`;
        // Revert UI change if update failed? (More complex UI logic)
    }
}

</script>

<style scoped>
/* استخدام @apply لتوحيد الأنماط */
.table-th {
  @apply px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider;
}
.table-td {
  @apply px-6 py-4 whitespace-nowrap text-sm;
}
.table-tr:hover {
   @apply bg-gray-50/50 dark:hover:bg-gray-700/30;
}

.form-label {
    @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
}
.form-input, .form-textarea, .form-select {
    @apply w-full px-4 py-2 border border-cream-gray dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white;
}
.form-textarea {
    @apply min-h-[80px];
}
.form-help-text {
    @apply mt-1 text-xs text-gray-500 dark:text-gray-400;
}
.form-success-message {
     @apply p-3 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 rounded-md text-sm;
}
.form-error-message {
    @apply p-3 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-md text-sm;
}
.modal-button-primary {
     @apply w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ms-3 sm:w-auto sm:text-sm disabled:opacity-50 dark:focus:ring-offset-gray-800;
}
.modal-button-secondary {
     @apply mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm;
}


input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    filter: invert(0.6) brightness(50%);
    cursor: pointer;
}
.dark input[type="datetime-local"]::-webkit-calendar-picker-indicator {
     filter: invert(0.8);
}

/* نبض خفيف للبث المباشر في الجدول */
.animate-pulse {
    animation: pulse-light 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes pulse-light {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>