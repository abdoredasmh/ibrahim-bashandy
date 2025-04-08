<template>
  <div class="py-4">
    <!-- التعليق الأصلي -->
    <div class="flex space-x-3 rtl:space-x-reverse">
      <UserAvatar
        :avatar-url="comment.profiles?.avatar_url"
        :name="comment.profiles?.full_name"
        size="md"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {{ comment.profiles?.full_name || 'مستخدم' }}
          </span>
          <!-- تمرير وظائف الرد والتعديل والحذف -->
          <CommentActions
            :item="comment"
            item-type="comment"
            @reply="toggleReplyForm"
            @edit="startEditingComment"
            @delete="requestDeleteComment"
            class="flex-shrink-0"
          />
        </div>
        <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
          <time :datetime="comment.created_at" :title="fullTimestamp">{{ formattedTimestamp }}</time>
          <span v-if="isCommentEdited" class="mx-1" title="تم تعديل هذا التعليق">(تم التعديل)</span>
        </div>

        <!-- عرض التعليق -->
        <p v-if="!isEditingComment" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
          {{ comment.content }}
        </p>

        <!-- تعديل التعليق -->
        <div v-else>
          <textarea
            ref="editCommentInputRef"
            v-model="editedCommentContent"
            rows="3"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            placeholder="تعديل التعليق..."
            @keydown.esc="cancelEditComment"
          ></textarea>
           <div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">
             <span v-if="editCommentError" class="text-xs text-red-500 flex-1 text-right">{{ editCommentError }}</span>
             <button
               @click="cancelEditComment"
                type="button"
               class="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
             >
               إلغاء
             </button>
             <button
               @click="saveEditComment"
                type="button"
               :disabled="isSavingCommentEdit || !editedCommentContent.trim()"
               class="px-3 py-1 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
             >
                <Icon v-if="isSavingCommentEdit" name="svg-spinners:3-dots-fade" class="w-4 h-4" />
                <span v-else>حفظ</span>
             </button>
           </div>
        </div>

        <!-- أزرار الرد وعرض عدد الردود (تظهر فقط في وضع العرض) -->
        <div v-if="!isEditingComment" class="mt-2 flex items-center space-x-4 rtl:space-x-reverse text-xs">
          <button
            v-if="user"
            @click="toggleReplyForm"
            type="button"
            class="font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
          >
            <Icon :name="showReplyForm ? 'heroicons:x-mark-20-solid' : 'heroicons:arrow-uturn-left-20-solid'" class="w-4 h-4 inline-block ml-1 rtl:ml-0 rtl:mr-1" />
            {{ showReplyForm ? 'إلغاء' : 'رد' }}
          </button>
          <button
            v-if="localReplies.length > 0"
            @click="repliesVisible = !repliesVisible"
            type="button"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white flex items-center"
            :aria-expanded="repliesVisible.toString()"
          >
            <Icon :name="repliesVisible ? 'heroicons:chevron-up-20-solid' : 'heroicons:chevron-down-20-solid'" class="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
            {{ localReplies.length }} {{ localReplies.length === 1 ? 'رد' : (localReplies.length === 2 ? 'ردان' : (localReplies.length <= 10 ? 'ردود' : 'ردًا')) }}
          </button>
        </div>
      </div>
    </div>

    <!-- منطقة الردود (نموذج إضافة + قائمة الردود) -->
    <div class="mt-3 ml-10 rtl:mr-10 rtl:ml-0 pl-3 rtl:pr-3 border-l-2 border-gray-200 dark:border-gray-700 rtl:border-l-0 rtl:border-r-2">
      <!-- نموذج إضافة رد جديد (يظهر فقط إذا ضغط المستخدم على "رد") -->
      <div v-if="showReplyForm" class="mb-4">
        <div class="flex space-x-3 rtl:space-x-reverse">
            <UserAvatar
              :avatar-url="userProfile?.avatar_url"
              :name="userProfile?.full_name"
              size="sm"
              class="mt-1"
            />
            <div class="flex-1 min-w-0">
                  <textarea
                    ref="replyInputRef"
                    v-model="newReplyContent"
                    rows="2"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    placeholder="إضافة رد عام..."
                    @keydown.esc="cancelReply"
                    @keydown.enter.prevent.exact="addReply"
                  ></textarea>
                  <div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">
                      <span v-if="replyError" class="text-xs text-red-500 flex-1 text-right">{{ replyError }}</span>
                       <button
                        @click="cancelReply"
                        type="button"
                        class="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        إلغاء
                      </button>
                      <button
                        @click="addReply"
                        type="button"
                        :disabled="isSubmittingReply || !newReplyContent.trim()"
                        class="px-3 py-1 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                      >
                        <Icon v-if="isSubmittingReply" name="svg-spinners:3-dots-fade" class="w-4 h-4" />
                        <span v-else>رد</span>
                      </button>
                </div>
            </div>
        </div>
      </div>

      <!-- عرض الردود الحالية (تظهر وتختفي حسب repliesVisible) -->
      <Transition name="fade">
          <div v-if="localReplies.length > 0 && repliesVisible" class="space-y-0">
            <ReplyItem
              v-for="reply in sortedReplies"
              :key="reply.id"
              :reply="reply"
              @reply-updated="handleReplyUpdate"
              @reply-deleted="handleReplyDelete"
            />
          </div>
       </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { Database } from '~/types/database.types'
import { formatDistanceToNowStrict } from 'date-fns'
import { ar } from 'date-fns/locale'
import UserAvatar from './UserAvatar.vue'
import ReplyItem from './ReplyItem.vue'
import CommentActions from './CommentActions.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '~/stores/user' // تأكد من المسار الصحيح

// تعريف النوع مرة أخرى للتوضيح
type CommentWithProfile = Database['public']['Tables']['comments']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'> | null
}

const props = defineProps<{
  comment: CommentWithProfile,
  replies: CommentWithProfile[], // الردود المرتبطة بهذا التعليق
  contentId: { lessonId?: number, bookId?: number, courseId?: number } // لتحديد أين نضيف الرد
}>()

const emit = defineEmits(['commentUpdated', 'commentDeleted', 'replyAdded'])

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { profile: userProfile } = storeToRefs(useUserStore())

// حالة محلية للردود لتسهيل التحديث والحذف
const localReplies = ref<CommentWithProfile[]>([...props.replies])
const repliesVisible = ref(true) // حالة إظهار / إخفاء الردود

watch(() => props.replies, (newReplies) => {
  localReplies.value = [...newReplies];
}, { deep: true });


// --- حالة تعديل التعليق الأصلي ---
const isEditingComment = ref(false)
const editedCommentContent = ref('')
const isSavingCommentEdit = ref(false)
const editCommentError = ref<string | null>(null)
const editCommentInputRef = ref<HTMLTextAreaElement | null>(null);

// --- حالة إضافة رد جديد ---
const showReplyForm = ref(false)
const newReplyContent = ref('')
const isSubmittingReply = ref(false)
const replyError = ref<string | null>(null)
const replyInputRef = ref<HTMLTextAreaElement | null>(null);

// --- Computed Properties ---
const isCommentOwner = computed(() => user.value && user.value.id === props.comment.user_id)
const isCommentEdited = computed(() => props.comment.created_at !== props.comment.updated_at)

const formattedTimestamp = computed(() => {
   try {
    return formatDistanceToNowStrict(new Date(props.comment.created_at), { addSuffix: true, locale: ar })
  } catch (e) {
    console.error("Error formatting date:", e)
    return props.comment.created_at?.toString() // fallback
  }
})

const fullTimestamp = computed(() => {
    try {
        return new Date(props.comment.created_at).toLocaleString('ar-EG', {dateStyle: 'medium', timeStyle: 'short'});
    } catch {
        return props.comment.created_at?.toString();
    }
})


const sortedReplies = computed(() => {
    // ترتيب الردود حسب الأقدم فالأحدث
    return [...localReplies.value].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
})


// --- وظائف تعديل التعليق ---
const startEditingComment = async () => {
  if (!isCommentOwner.value) return
  isEditingComment.value = true
  editedCommentContent.value = props.comment.content
  editCommentError.value = null
  showReplyForm.value = false // أغلق نموذج الرد عند التعديل
  await nextTick();
  editCommentInputRef.value?.focus();
}

const cancelEditComment = () => {
  isEditingComment.value = false
  editedCommentContent.value = ''
  editCommentError.value = null
}

const saveEditComment = async () => {
  if (!isCommentOwner.value || !editedCommentContent.value.trim() || isSavingCommentEdit.value) return

  const contentToSave = editedCommentContent.value.trim();
   // لا تقم بالتحديث إذا لم يتغير المحتوى
   if (contentToSave === props.comment.content) {
        cancelEditComment();
        return;
    }

  isSavingCommentEdit.value = true
  editCommentError.value = null
  try {
    const { data, error } = await supabase
      .from('comments')
      .update({ content: contentToSave, updated_at: new Date().toISOString() })
      .eq('id', props.comment.id)
      .select('updated_at')
      .single()

    if (error) throw error

    // تحديث محلي ناجح
    emit('commentUpdated', { ...props.comment, content: contentToSave, updated_at: data?.updated_at || new Date().toISOString() })
    isEditingComment.value = false

  } catch (err: any) {
    console.error('Error updating comment:', err)
    editCommentError.value = 'حدث خطأ أثناء حفظ التعديل.'
  } finally {
    isSavingCommentEdit.value = false
  }
}

// --- وظيفة حذف التعليق ---
const requestDeleteComment = async () => {
   if (!isCommentOwner.value) return

   // تأكيد الحذف (مع التنبيه لحذف الردود بسبب ON DELETE CASCADE)
   if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا التعليق؟ سيتم حذف جميع الردود المرتبطة به أيضاً.')) {
     try {
       const { error } = await supabase
         .from('comments')
         .delete()
         .eq('id', props.comment.id)

       if (error) throw error

       // إرسال حدث للحذف
       emit('commentDeleted', props.comment.id)

     } catch (err: any) {
       console.error('Error deleting comment:', err)
       alert('حدث خطأ أثناء حذف التعليق.')
     }
   }
}

// --- وظائف الرد ---
const toggleReplyForm = async () => {
    if(!user.value) return; // لا تفتح النموذج لغير المسجلين
    showReplyForm.value = !showReplyForm.value
    newReplyContent.value = '' // أفرغ الحقل عند الفتح/الإغلاق
    replyError.value = null
    if (showReplyForm.value) {
        isEditingComment.value = false // أغلق وضع التعديل إذا كان مفتوحاً
        await nextTick();
        replyInputRef.value?.focus();
    }
}

const cancelReply = () => {
    showReplyForm.value = false;
    newReplyContent.value = '';
    replyError.value = null;
}


const addReply = async () => {
  if (!user.value || !userProfile.value || !newReplyContent.value.trim() || isSubmittingReply.value) return

  isSubmittingReply.value = true
  replyError.value = null

  const replyData = {
    user_id: user.value.id,
    profile_id: userProfile.value.id, // تأكد من أن profile id موجود في userStore
    content: newReplyContent.value.trim(),
    parent_comment_id: props.comment.id, // الربط بالتعليق الأب
    lesson_id: props.contentId.lessonId || null,
    book_id: props.contentId.bookId || null,
    study_course_id: props.contentId.courseId || null, // استخدام المعرف الصحيح
    // is_approved: true // الافتراضي في قاعدة البيانات هو true
  }

  try {
    const { data: newReply, error } = await supabase
      .from('comments')
      .insert(replyData)
      .select(`
        *,
        profiles (full_name, avatar_url)
      `)
      .single()

    if (error) throw error
    if (!newReply) throw new Error('Failed to fetch new reply data.')

    // نجاح: أضف الرد الجديد محلياً وأغلق النموذج
    emit('replyAdded', newReply as CommentWithProfile) // أخبر القسم الأب بالرد الجديد
    newReplyContent.value = ''
    showReplyForm.value = false
    repliesVisible.value = true // تأكد من أن الردود ظاهرة بعد الإضافة

  } catch (err: any) {
    console.error('Error adding reply:', err)
    replyError.value = 'حدث خطأ أثناء إضافة الرد.'
  } finally {
    isSubmittingReply.value = false
  }
}

// --- معالجة تحديثات وحذف الردود القادمة من ReplyItem ---
const handleReplyUpdate = (updatedReply: CommentWithProfile) => {
  const index = localReplies.value.findIndex(r => r.id === updatedReply.id)
  if (index !== -1) {
    // Use spread operator to ensure reactivity if needed, though direct assignment often works
    localReplies.value[index] = { ...localReplies.value[index], ...updatedReply };
    // Or simply: localReplies.value[index] = updatedReply;
  }
}

const handleReplyDelete = (deletedReplyId: number) => {
  localReplies.value = localReplies.value.filter(r => r.id !== deletedReplyId)
}

</script>

<style scoped>
/* Transitions for reply list */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, max-height 0.3s ease;
  max-height: 500px; /* Adjust based on expected max height */
  overflow: hidden;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>