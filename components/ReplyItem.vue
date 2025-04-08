<template>
  <div class="flex space-x-3 rtl:space-x-reverse py-3 border-t border-gray-200 dark:border-gray-700 first:border-t-0 first:pt-0">
    <UserAvatar
      :avatar-url="reply.profiles?.avatar_url"
      :name="reply.profiles?.full_name"
      size="sm"
      class="mt-1"
    />
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {{ reply.profiles?.full_name || 'مستخدم' }}
        </span>
        <!-- تمرير الحدث فقط للتعديل والحذف للردود -->
        <CommentActions
          :item="reply"
          item-type="reply"
          @edit="startEditing"
          @delete="requestDelete"
        />
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">
        <time :datetime="reply.created_at" :title="fullTimestamp">{{ formattedTimestamp }}</time>
        <span v-if="isEdited" class="mx-1" title="تم تعديل هذا الرد">(تم التعديل)</span>
      </div>

      <!-- وضع العرض -->
      <p v-if="!isEditing" class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
        {{ reply.content }}
      </p>

      <!-- وضع التعديل -->
      <div v-else>
        <textarea
          ref="editInputRef"
          v-model="editedContent"
          rows="2"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="تعديل الرد..."
          @keydown.esc="cancelEdit"
          @keydown.enter.prevent.exact="saveEdit"
        ></textarea>
        <div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">
           <span v-if="editError" class="text-xs text-red-500 flex-1 text-right">{{ editError }}</span>
           <button
             @click="cancelEdit"
             type="button"
             class="px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
           >
             إلغاء
           </button>
           <button
             @click="saveEdit"
             type="button"
             :disabled="isSavingEdit || !editedContent.trim()"
             class="px-3 py-1 text-xs font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
           >
             <Icon v-if="isSavingEdit" name="svg-spinners:3-dots-fade" class="w-4 h-4" />
             <span v-else>حفظ</span>
           </button>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { Database } from '~/types/database.types' // تأكد من وجود هذا الملف
import { formatDistanceToNowStrict } from 'date-fns'
import { ar } from 'date-fns/locale'
import UserAvatar from './UserAvatar.vue'
import CommentActions from './CommentActions.vue'

// تعريف النوع للتعليق مع بيانات البروفايل المضمنة
type CommentWithProfile = Database['public']['Tables']['comments']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'> | null
}

const props = defineProps<{
  reply: CommentWithProfile
}>()

const emit = defineEmits(['replyUpdated', 'replyDeleted'])

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const isEditing = ref(false)
const editedContent = ref('')
const isSavingEdit = ref(false)
const editError = ref<string | null>(null)
const editInputRef = ref<HTMLTextAreaElement | null>(null); // للتركيز على حقل التعديل

const isOwner = computed(() => user.value && user.value.id === props.reply.user_id)
const isEdited = computed(() => props.reply.created_at !== props.reply.updated_at)

const formattedTimestamp = computed(() => {
  try {
    return formatDistanceToNowStrict(new Date(props.reply.created_at), { addSuffix: true, locale: ar })
  } catch (e) {
    console.error("Error formatting date:", e)
    return props.reply.created_at?.toString() // fallback
  }
})

const fullTimestamp = computed(() => {
    try {
        return new Date(props.reply.created_at).toLocaleString('ar-EG', {dateStyle: 'medium', timeStyle: 'short'});
    } catch {
        return props.reply.created_at?.toString();
    }
})


const startEditing = async () => {
  if (!isOwner.value) return
  isEditing.value = true
  editedContent.value = props.reply.content
  editError.value = null
  // التركيز على الحقل بعد عرضه
  await nextTick()
  editInputRef.value?.focus()
}

const cancelEdit = () => {
  isEditing.value = false
  editedContent.value = ''
  editError.value = null
}

const saveEdit = async () => {
  if (!isOwner.value || !editedContent.value.trim() || isSavingEdit.value) return

  isSavingEdit.value = true
  editError.value = null
  try {
    const contentToSave = editedContent.value.trim();
    // لا تقم بالتحديث إذا لم يتغير المحتوى
    if (contentToSave === props.reply.content) {
        cancelEdit();
        return;
    }

    const { data, error } = await supabase
      .from('comments')
      .update({ content: contentToSave, updated_at: new Date().toISOString() })
      .eq('id', props.reply.id)
      .select('updated_at') // فقط لجلب القيمة المحدثة للتأكيد
      .single()

    if (error) throw error

    // تحديث محلي ناجح
    emit('replyUpdated', { ...props.reply, content: contentToSave, updated_at: data?.updated_at || new Date().toISOString() })
    isEditing.value = false

  } catch (err: any) {
    console.error('Error updating reply:', err)
    editError.value = 'حدث خطأ أثناء حفظ التعديل.'
  } finally {
    isSavingEdit.value = false
  }
}

const requestDelete = async () => {
  if (!isOwner.value) return

  // استخدم نافذة تأكيد بسيطة
  if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الرد؟ لا يمكن التراجع عن هذا الإجراء.')) {
     try {
       const { error } = await supabase
         .from('comments')
         .delete()
         .eq('id', props.reply.id)

       if (error) throw error

       // إرسال حدث للحذف
       emit('replyDeleted', props.reply.id)

     } catch (err: any) {
       console.error('Error deleting reply:', err)
       // يمكنك عرض رسالة خطأ للمستخدم هنا
       alert('حدث خطأ أثناء حذف الرد.')
     }
   }
}
</script>