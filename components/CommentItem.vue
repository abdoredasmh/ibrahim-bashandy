<template>
  <li class="comment-item bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm relative">
    <div class="flex items-start space-x-3 space-x-reverse">
      <!-- 1. منطقة عرض صورة الأفاتار (أو الحرف الأول) -->
      <div class="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-cream-gray dark:border-gray-600 flex items-center justify-center relative"
           :style="!avatarUrl && fullName ? letterAvatarStyle(fullName) : {}">
        <img v-if="avatarUrl && !avatarLoadingError" :key="avatarUrl" :src="avatarUrl" alt="صورة المستخدم" class="w-full h-full object-cover" @error="handleAvatarError"/>
        <span v-else-if="fullName" class="text-xl font-medium text-white dark:text-gray-900 select-none">{{ getInitial(fullName) }}</span>
        <img v-else :src="defaultAvatar" alt="صورة افتراضية" class="w-full h-full object-cover" />
        <div v-if="avatarLoadingError && !fullName" class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
           <img :src="defaultAvatar" alt="فشل التحميل" class="w-full h-full object-cover opacity-50" />
        </div>
      </div>

      <!-- 2. منطقة محتوى التعليق والإجراءات -->
      <div class="flex-1">
        <!-- اسم المستخدم ووقت التعليق -->
        <div class="flex items-center justify-between mb-1">
          <span class="font-semibold text-brown-dark dark:text-gray-200">{{ fullName || 'مستخدم غير معروف' }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ timeAgo(comment.created_at) }}</span>
        </div>

        <!-- عرض نص التعليق أو نموذج التعديل -->
        <div v-if="!isEditing">
          <p class="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ comment.content }}</p>
        </div>
        <div v-else>
           <!-- نموذج تعديل التعليق الجذري -->
           <form @submit.prevent="saveEdit">
             <textarea v-model="editableContent" rows="2" required class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600" :disabled="isSavingEdit"></textarea>
             <div class="mt-2 flex items-center justify-end space-x-2 space-x-reverse">
               <button type="button" @click="cancelEdit" :disabled="isSavingEdit" class="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">إلغاء</button>
               <button type="submit" :disabled="isSavingEdit || !editableContent.trim()" class="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" :style="{ backgroundColor: !isSavingEdit && editableContent.trim() ? 'var(--color-olive-green)' : '' }">
                 <span v-if="isSavingEdit">جارٍ الحفظ...</span><span v-else>حفظ التعديل</span>
               </button>
             </div>
             <p v-if="editError" class="text-red-500 mt-1 text-xs text-end">{{ editError }}</p>
           </form>
        </div>

        <!-- 3. أزرار الإجراءات للتعليق الجذري (رد، تعديل، حذف) -->
        <div class="mt-2 flex items-center space-x-4 space-x-reverse text-sm">
          <!-- زر الرد مع SVG -->
          <button v-if="currentUser" @click="toggleReplyForm"
            class="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
             <!-- Heroicon: arrow-uturn-left (solid, 20x20) -->
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1">
               <path fill-rule="evenodd" d="M7.793 2.232a.75.75 0 0 1-.025 1.06L3.622 7.25h6.878a5.75 5.75 0 0 1 5.75 5.75v1.5a.75.75 0 0 1-1.5 0v-1.5a4.25 4.25 0 0 0-4.25-4.25H3.622l4.146 3.957a.75.75 0 0 1-1.036 1.085l-5.5-5.25a.75.75 0 0 1 0-1.085l5.5-5.25a.75.75 0 0 1 1.06.025Z" clip-rule="evenodd" />
             </svg>
             <span>رد</span>
          </button>
          <!-- زر قائمة الخيارات مع SVG -->
           <div v-if="isOwner" class="relative" ref="optionsMenuRef">
             <button @click="toggleOptionsMenu" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
               <!-- Heroicon: ellipsis-horizontal (solid, 20x20) -->
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                 <path d="M3 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM8.5 10a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM15.5 8.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
               </svg>
             </button>
             <!-- القائمة المنسدلة مع SVG -->
             <transition name="fade-fast">
               <div v-show="showOptionsMenu"
                 class="origin-top-left absolute start-0 mt-2 w-40 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                 <div class="py-1">
                   <!-- زر التعديل مع SVG -->
                   <button @click="startEditing" class="flex items-center w-full text-start px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                     <!-- Heroicon: pencil-square (solid, 20x20) -->
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1">
                       <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
                     </svg>
                     <span>تعديل</span>
                   </button>
                   <!-- زر الحذف مع SVG -->
                   <button @click="confirmDelete" class="flex items-center w-full text-start px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600">
                     <!-- Heroicon: trash (solid, 20x20) -->
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1">
                       <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.573.023 2.365.068v.183c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75v-.183A42.53 42.53 0 0 1 10 4ZM8.75 16.5a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 0 1 1.5 0v7.5a.75.75 0 0 1-.75.75Zm2.5 0a.75.75 0 0 1-.75-.75v-7.5a.75.75 0 0 1 1.5 0v7.5a.75.75 0 0 1-.75.75Z" clip-rule="evenodd" />
                     </svg>
                     <span>حذف</span>
                   </button>
                 </div>
               </div>
             </transition>
           </div>
        </div>

        <!-- 4. نموذج الرد على التعليق الجذري -->
        <div v-if="showReplyForm && currentUser" class="mt-3 ms-4 border-s-2 border-cream-gray dark:border-gray-600 ps-4">
          <form @submit.prevent="addReply">
             <textarea v-model="newReply" rows="2" required placeholder="اكتب ردك..." class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600" :disabled="isSubmittingReply"></textarea>
             <div class="mt-2 flex items-center justify-end space-x-2 space-x-reverse">
                <button type="button" @click="cancelReply" :disabled="isSubmittingReply" class="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">إلغاء</button>
               <button type="submit" :disabled="isSubmittingReply || !newReply.trim()" class="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" :style="{ backgroundColor: !isSubmittingReply && newReply.trim() ? 'var(--color-olive-green)' : '' }">
                  <span v-if="isSubmittingReply">جارٍ الإرسال...</span><span v-else>إضافة رد</span>
                </button>
             </div>
             <p v-if="replyError" class="text-red-500 mt-1 text-xs text-end">{{ replyError }}</p>
           </form>
        </div>
         <p v-if="showReplyForm && !currentUser" class="mt-3 text-xs text-gray-500 dark:text-gray-400 ms-4 ps-4">
           <NuxtLink to="/login" class="text-primary-600 dark:text-primary-400 hover:underline">سجل الدخول</NuxtLink> للرد على هذا التعليق.
         </p>

         <!-- 5. قسم عرض الردود -->
         <div v-if="currentReplyCount > 0" class="mt-4 ms-6">
            <!-- زر إظهار/إخفاء الردود مع SVG -->
             <button @click="toggleRepliesVisibility" class="inline-flex items-center text-sm font-semibold text-primary-700 dark:text-primary-400 hover:underline mb-3">
               <template v-if="!areRepliesVisible">
                 <!-- Heroicon: chevron-down (solid, 20x20) -->
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1">
                   <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                 </svg>
                 <span>عرض الردود ({{ currentReplyCount }})</span>
               </template>
               <template v-else>
                 <!-- Heroicon: chevron-up (solid, 20x20) -->
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1">
                   <path fill-rule="evenodd" d="M14.78 11.78a.75.75 0 0 1-1.06 0L10 8.06l-3.72 3.72a.75.75 0 1 1-1.06-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06Z" clip-rule="evenodd" />
                 </svg>
                 <span>إخفاء الردود</span>
               </template>
             </button>

             <!-- منطقة عرض قائمة الردود -->
             <div v-if="areRepliesVisible">
                 <div v-if="isLoadingReplies" class="py-3 text-center">{/* ... Loading Spinner ... */}</div>
                 <div v-else-if="replyFetchError" class="py-3 text-center text-red-500 text-xs">{/* ... Error Message ... */}</div>
                 <div v-else-if="loadedReplies.length === 0" class="py-3 text-center text-gray-500 text-xs">{/* ... No Replies ... */}</div>
                 <!-- عرض قائمة الردود باستخدام ReplyItem -->
                 <ul v-else class="space-y-4 border-s-2 border-cream-gray dark:border-gray-600 ps-4">
                     <ReplyItem
                         v-for="reply in loadedReplies"
                         :key="reply.id"
                         :reply="reply"
                         :content-type="contentType"
                         :content-id="contentId"
                         :root-comment-id="comment.id"
                         @reply-deleted="handleReplyDeleted"
                         @reply-updated="handleReplyUpdated"
                         @reply-added="handleReplyAdded"
                     />
                 </ul>
             </div>
         </div>

      </div>
    </div>
  </li>
</template>


<script setup lang="ts">
// --- استيراد الأدوات والأنواع اللازمة ---
import { ref, computed, watch } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import type { ContentType, ContentIdColumn } from '~/types/comments'; // افتراض وجود هذا الملف أو تعريف الأنواع هنا
import { onClickOutside } from '@vueuse/core'; // لإغلاق القائمة المنسدلة عند النقر خارجها
import { useSupabaseUser, useSupabaseClient } from '#imports';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import ReplyItem from './ReplyItem.vue'; // استيراد مكون عرض الرد

// --- تعريف أنواع البيانات المستخدمة ---
type Profile = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'>;
type CommentGeneric = Omit<Tables<'comments'>, 'user_id'> & { profiles: Profile | null };
type CommentWithProfileAndReplyCount = CommentGeneric & { reply_count?: number; }; // عدد الردود قد لا يكون موجودًا دائمًا في كل السياقات
type ReplyWithProfile = CommentGeneric; // نوع الردود (لا تحتاج لعدد ردود خاص بها)

// --- تعريف الخصائص (Props) التي يستقبلها المكون ---
const props = defineProps({
  // التعليق الجذري الذي سيتم عرضه
  comment: { type: Object as () => CommentWithProfileAndReplyCount, required: true },
  contentType: { type: String as () => ContentType, required: true },
  contentId: { type: [String, Number], required: true },
  // العدد الأولي للردود (يأتي من CommentSection)
  initialReplyCount: { type: Number, default: 0 }
});

// --- تعريف الأحداث (Emits) التي يرسلها المكون ---
const emit = defineEmits([
    'comment-deleted', // عند حذف هذا التعليق الجذري
    'comment-updated', // عند تحديث هذا التعليق الجذري
    'reply-added-to-root' // عند إضافة رد بنجاح (سواء من هذا المكون أو من ReplyItem)
]);

// --- أدوات Supabase وحالة المستخدم ---
const supabase = useSupabaseClient<Database>();
const currentUser = useSupabaseUser();

// --- حالة المكون الداخلية (State) ---
const defaultAvatar = '/images/default-avatar.png'; // المسار إلى الصورة الافتراضية
const avatarLoadingError = ref(false); // لتتبع فشل تحميل صورة الأفاتار
const isEditing = ref(false); // هل التعليق في وضع التعديل؟
const editableContent = ref(props.comment.content); // محتوى التعليق القابل للتعديل
const isSavingEdit = ref(false); // هل عملية حفظ التعديل جارية؟
const editError = ref<string | null>(null); // خطأ أثناء حفظ التعديل
const showReplyForm = ref(false); // هل نموذج الرد على التعليق الجذري ظاهر؟
const newReply = ref(''); // نموذج الرد على التعليق الجذري
const isSubmittingReply = ref(false); // هل عملية إرسال الرد على التعليق الجذري جارية؟
const replyError = ref<string | null>(null); // خطأ أثناء إرسال الرد على التعليق الجذري
const showOptionsMenu = ref(false); // هل قائمة الخيارات (تعديل/حذف) ظاهرة؟
const optionsMenuRef = ref<HTMLElement | null>(null); // إشارة إلى عنصر القائمة لإغلاقها عند النقر بالخارج

// --- حالة خاصة بالردود المرتبطة ---
const areRepliesVisible = ref(false); // هل قسم الردود ظاهر؟
const isLoadingReplies = ref(false); // هل عملية تحميل الردود جارية؟
const loadedReplies = ref<ReplyWithProfile[]>([]); // مصفوفة لتخزين الردود التي تم تحميلها
const replyFetchError = ref<string | null>(null); // خطأ أثناء تحميل الردود
const currentReplyCount = ref(props.initialReplyCount); // العدد الحالي للردود (يبدأ بالعدد الأولي)

// --- الخصائص المحسوبة (Computed Properties) ---
// هل المستخدم الحالي هو صاحب التعليق الجذري؟
const isOwner = computed(() => !!currentUser.value && props.comment.user_id === currentUser.value.id);
// معرف المحتوى كرقم
const numericContentId = computed(() => Number(props.contentId));
// رابط صورة الأفاتار
const avatarUrl = computed(() => props.comment.profiles?.avatar_url);
// الاسم الكامل للمستخدم
const fullName = computed(() => props.comment.profiles?.full_name);

// --- الدوال المساعدة (Methods) ---

// معالجة خطأ تحميل الأفاتار
function handleAvatarError() {
    console.warn('Avatar image failed to load:', avatarUrl.value);
    avatarLoadingError.value = true;
}

// الحصول على الحرف الأول من الاسم
function getInitial(name: string | null | undefined): string {
    return name ? name.trim().charAt(0).toUpperCase() : '?';
}

// حساب لون خلفية الأفاتار بناءً على الاسم
const letterAvatarColors = [ '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d' ];
function letterAvatarStyle(name: string | null | undefined): { backgroundColor?: string } {
     if (!name) return {};
     const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
     const colorIndex = charCodeSum % letterAvatarColors.length;
     return { backgroundColor: letterAvatarColors[colorIndex] };
}

// حساب وعرض الوقت المنقضي (مثل "منذ 5 دقائق")
const timeAgo = (dateString: string | null): string => {
    if (!dateString) return '';
    // ... (نفس منطق حساب الوقت المنقضي) ...
    const date = new Date(dateString); const now = new Date(); const seconds = Math.round((now.getTime() - date.getTime()) / 1000); if (seconds < 60) return `منذ ${seconds} ثوان`; const minutes = Math.round(seconds / 60); if (minutes < 60) return `منذ ${minutes} دقائق`; const hours = Math.round(minutes / 60); if (hours < 24) return `منذ ${hours} ساعات`; const days = Math.round(hours / 24); if (days < 7) return `منذ ${days} أيام`; const weeks = Math.round(days / 7); if (weeks < 4) return `منذ ${weeks} أسابيع`; const months = Math.round(days / 30); if (months < 12) return `منذ ${months} أشهر`; const years = Math.round(days / 365); return `منذ ${years} سنوات`;
};

// --- دوال تعديل/حذف التعليق الجذري ---
function startEditing() {
  editableContent.value = props.comment.content; // تعبئة النموذج بالمحتوى الحالي
  isEditing.value = true; // الدخول في وضع التعديل
  showOptionsMenu.value = false; // إخفاء القائمة المنسدلة
}
function cancelEdit() {
  isEditing.value = false; // الخروج من وضع التعديل
  editError.value = null; // مسح أي خطأ سابق
}
async function saveEdit() {
  // التحقق من وجود محتوى
  if (!editableContent.value.trim()) return;
  isSavingEdit.value = true; editError.value = null;
  try {
    // تحديث التعليق في قاعدة البيانات
    const { data, error } = await supabase.from('comments')
        .update({ content: editableContent.value.trim() })
        .eq('id', props.comment.id)
        // إعادة جلب التعليق المحدث مع بيانات الملف الشخصي وعدد الردود
        .select(`*, profiles ( id, full_name, avatar_url ), reply_count:rpc(get_reply_count, id)`).single();
    if (error) throw error;
    if(data) {
        // إرسال الحدث إلى CommentSection مع البيانات المحدثة
        const updatedData = { ...data, reply_count: data.reply_count ?? 0 } as CommentWithProfileAndReplyCount;
        emit('comment-updated', updatedData);
        isEditing.value = false; // الخروج من وضع التعديل
    } else { throw new Error("Failed to retrieve updated comment data."); }
  } catch (error: any) {
    console.error('Error saving comment edit:', error);
    editError.value = error.message || 'فشل حفظ التعديل.';
  } finally { isSavingEdit.value = false; }
}
// تأكيد الحذف قبل التنفيذ
function confirmDelete() {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا التعليق وكل الردود المرتبطة به؟ لا يمكن التراجع عن هذا الإجراء.')) {
        deleteComment();
    } else { showOptionsMenu.value = false; } // إغلاق القائمة إذا ألغى المستخدم
}
async function deleteComment() {
    try {
        // حذف التعليق من قاعدة البيانات
        const { error } = await supabase.from('comments').delete().eq('id', props.comment.id);
        if (error) throw error;
        // إرسال الحدث إلى CommentSection لإزالة التعليق من القائمة
        emit('comment-deleted', props.comment.id);
        showOptionsMenu.value = false;
    } catch (error: any) {
        console.error('Error deleting comment:', error);
        // إظهار رسالة خطأ للمستخدم (يمكن استخدام نظام إشعارات أفضل لاحقًا)
        alert(`فشل حذف التعليق: ${error.message}`);
    }
}

// --- دوال الرد على التعليق الجذري ---
// إظهار/إخفاء نموذج الرد
function toggleReplyForm() {
    showReplyForm.value = !showReplyForm.value;
    if(!showReplyForm.value) { // إذا تم إخفاء النموذج
        newReply.value = ''; // مسح النص
        replyError.value = null; // مسح أي خطأ
    }
}
// إلغاء الرد (نفس وظيفة الإظهار/الإخفاء)
function cancelReply() { toggleReplyForm(); }
// إرسال الرد على التعليق الجذري
async function addReply() {
  if (!currentUser.value || !newReply.value.trim()) return;
  isSubmittingReply.value = true; replyError.value = null;

  // حساب اسم العمود الصحيح والأعمدة الأخرى
  let directContentIdColumn: ContentIdColumn | undefined;
  const allCols: ContentIdColumn[] = ['lesson_id', 'book_id', 'study_course_id'];
  switch (props.contentType) {
      case 'lesson': directContentIdColumn = 'lesson_id'; break;
      case 'book': directContentIdColumn = 'book_id'; break;
      case 'study_course': directContentIdColumn = 'study_course_id'; break;
  }
  if (!directContentIdColumn) { /* ... معالجة الخطأ ... */ isSubmittingReply.value = false; return; }
  const otherIdColumns = allCols.filter(col => col !== directContentIdColumn);

  // تجهيز بيانات الرد
  const replyData: Partial<Tables<'comments'>> = {
    user_id: currentUser.value.id,
    content: newReply.value.trim(),
    parent_comment_id: props.comment.id, // الأب هو التعليق الجذري الحالي
    [directContentIdColumn]: numericContentId.value,
  };
   otherIdColumns.forEach(colName => { replyData[colName] = null; });

  try {
    // إرسال الرد إلى قاعدة البيانات
    const { data, error } = await supabase.from('comments').insert(replyData)
        .select(`*, profiles ( id, full_name, avatar_url )`).single(); // جلب الرد المُضاف مع بيانات المستخدم
    if (error) throw error;
    if(data) {
        // استدعاء الدالة المشتركة لمعالجة الرد المُضاف
        handleReplyAdded(data as ReplyWithProfile);
        newReply.value = ''; // مسح النموذج
        showReplyForm.value = false; // إخفاء النموذج
    } else { throw new Error("Failed to retrieve new reply data."); }
  } catch (error: any) { console.error('Error adding reply to root:', error); replyError.value = error.message || 'فشل إضافة الرد.';
  } finally { isSubmittingReply.value = false; }
}

// --- دوال قائمة الخيارات ---
// إظهار/إخفاء القائمة
function toggleOptionsMenu() { showOptionsMenu.value = !showOptionsMenu.value; }
// إغلاق القائمة عند النقر خارجها (باستخدام VueUse)
onClickOutside(optionsMenuRef, (event) => {
     // منع الإغلاق إذا تم النقر على زر الفتح نفسه
     const toggleButton = optionsMenuRef.value?.previousElementSibling;
     if (toggleButton && toggleButton.contains(event.target as Node)) return;
    showOptionsMenu.value = false;
});

// --- دوال تحميل وعرض الردود المرتبطة ---
// إظهار/إخفاء قسم الردود وتحميلها عند الحاجة
function toggleRepliesVisibility() {
    areRepliesVisible.value = !areRepliesVisible.value;
    // إذا أصبحت الردود مرئية ولم يتم تحميلها من قبل وكان هناك ردود لعرضها
    if (areRepliesVisible.value && loadedReplies.value.length === 0 && currentReplyCount.value > 0) {
        loadReplies();
    }
}
// تحميل الردود من قاعدة البيانات
async function loadReplies() {
    // التأكد من وجود معرف للتعليق الجذري
    if (!props.comment.id) return;
    isLoadingReplies.value = true; // بدء التحميل
    replyFetchError.value = null; // مسح أي خطأ سابق
    console.log(`[CommentItem] Loading replies for comment ID: ${props.comment.id}`);

    try {
        // جلب التعليقات التي يكون parent_comment_id الخاص بها هو معرف التعليق الجذري الحالي
        const { data, error } = await supabase
            .from('comments')
            .select(`*, profiles ( id, full_name, avatar_url )`) // جلب بيانات المستخدم المرتبطة
            .eq('parent_comment_id', props.comment.id)
            // .eq('is_approved', true) // إلغاء التعليق إذا كانت الردود تحتاج موافقة
            .order('created_at', { ascending: true }); // ترتيب حسب الأقدم

        if (error) throw error; // طرح الخطأ لإيقاف التنفيذ

        console.log(`[CommentItem] Loaded replies for ${props.comment.id}:`, data);
        // تحديث مصفوفة الردود المحملة
        loadedReplies.value = (data || []) as ReplyWithProfile[];

    } catch (err: any) {
        console.error(`Error loading replies for comment ${props.comment.id}:`, err);
        replyFetchError.value = err.message || 'فشل تحميل الردود.';
        loadedReplies.value = []; // مسح البيانات في حالة الخطأ
    } finally {
        isLoadingReplies.value = false; // انتهاء التحميل
    }
}

// --- معالجات الأحداث القادمة من مكون ReplyItem ---
// عند حذف رد
function handleReplyDeleted(replyId: number) {
    // إزالة الرد من القائمة المحلية
    const index = loadedReplies.value.findIndex(r => r.id === replyId);
    if (index > -1) {
        loadedReplies.value.splice(index, 1);
        currentReplyCount.value--; // تقليل العداد المحلي
    } else {
        console.warn(`Could not find reply ${replyId} to delete locally.`);
        loadReplies(); // إعادة تحميل الردود كحل بديل
    }
}
// عند تحديث رد
function handleReplyUpdated(updatedReply: ReplyWithProfile) {
    // تحديث الرد في القائمة المحلية
    const index = loadedReplies.value.findIndex(r => r.id === updatedReply.id);
    if (index > -1) {
        loadedReplies.value[index] = updatedReply;
    } else {
        console.warn(`Could not find reply ${updatedReply.id} to update locally.`);
        loadReplies(); // إعادة تحميل الردود كحل بديل
    }
}
// عند إضافة رد جديد (سواء من هذا المكون أو من ReplyItem)
function handleReplyAdded(newReplyData: ReplyWithProfile) {
    // إذا كانت الردود معروضة حاليًا، أضف الرد الجديد إلى القائمة
    if (areRepliesVisible.value) {
        // التأكد من عدم إضافته مرتين (احتياطي)
        if (!loadedReplies.value.some(r => r.id === newReplyData.id)) {
             loadedReplies.value.push(newReplyData);
             // يمكن إعادة ترتيب القائمة هنا إذا لزم الأمر
             // loadedReplies.value.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }
    }
    // زيادة العداد المحلي
    currentReplyCount.value++;
    // إعلام المكون الأب (CommentSection) لزيادة العداد الإجمالي
    // التأكد من أن هذا هو تعليق جذري قبل إرسال الحدث
    if (props.comment.parent_comment_id === null) {
         emit('reply-added-to-root', props.comment.id);
    }
}

// --- مراقبة التغييرات (Watchers) ---
// تحديث محتوى التعديل إذا تغير التعليق من الخارج (نادر)
watch(() => props.comment.content, (newContent) => {
    if (!isEditing.value) { editableContent.value = newContent; }
});
// تحديث العداد المحلي إذا تغير العداد الأولي (بعد التحميل الأولي مثلاً)
watch(() => props.initialReplyCount, (newCount) => {
    // فقط إذا لم نقم بتحميل الردود بعد، لتجنب الكتابة فوق العدد الصحيح
    if (loadedReplies.value.length === 0) {
       currentReplyCount.value = newCount;
    }
});
// إعادة تعيين حالة المكون عند تغير التعليق الجذري نفسه (للتنقل بين الصفحات)
watch(() => props.comment.id, () => {
    areRepliesVisible.value = false;
    loadedReplies.value = [];
    isLoadingReplies.value = false;
    replyFetchError.value = null;
    currentReplyCount.value = props.initialReplyCount;
    isEditing.value = false;
    showReplyForm.value = false;
    showOptionsMenu.value = false;
    avatarLoadingError.value = false; // إعادة تعيين خطأ الأفاتار أيضًا
});
// إعادة تعيين خطأ الأفاتار عند تغير رابط الصورة
watch(avatarUrl, () => { avatarLoadingError.value = false; });

</script>

<style scoped>
.fade-fast-enter-active, .fade-fast-leave-active { transition: opacity 0.1s ease; }
.fade-fast-enter-from, .fade-fast-leave-to { opacity: 0; }
.select-none { user-select: none; }
</style>