<template>
  <section class="mt-8 py-6 border-t border-gray-200 dark:border-gray-700">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
      التعليقات ({{ commentsCount }})
    </h2>

    <!-- نموذج إضافة تعليق جديد -->
    <div v-if="user" class="mb-6">
      <div class="flex space-x-3 rtl:space-x-reverse">
        <UserAvatar
          :avatar-url="userProfile?.avatar_url"
          :name="userProfile?.full_name"
          size="md"
          class="mt-1"
        />
        <div class="flex-1 min-w-0">
          <textarea
            v-model="newCommentContent"
            rows="3"
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white disabled:opacity-70"
            placeholder="إضافة تعليق عام..."
            :disabled="isSubmittingComment"
          ></textarea>
          <div class="mt-2 flex items-center justify-end space-x-2 rtl:space-x-reverse">
            <span v-if="commentError" class="text-xs text-red-500 flex-1 text-right">{{ commentError }}</span>
            <button
              @click="addComment"
              type="button"
              :disabled="isSubmittingComment || !newCommentContent.trim()"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <svg v-if="isSubmittingComment" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              </svg>
              <span v-else>إضافة تعليق</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="mb-6 p-4 text-center bg-gray-100 dark:bg-gray-800 rounded-md">
      <p class="text-sm text-gray-700 dark:text-gray-300">
        يرجى
        <NuxtLink to="/login" class="text-primary-600 hover:underline dark:text-primary-400 font-medium">تسجيل الدخول</NuxtLink>
        أو
        <NuxtLink to="/signup" class="text-primary-600 hover:underline dark:text-primary-400 font-medium">إنشاء حساب</NuxtLink>
        للتعليق.
      </p>
    </div>

    <!-- عرض التعليقات -->
    <div v-if="isLoading" class="text-center py-10">
      <svg class="w-10 h-10 text-gray-500 dark:text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
      </svg>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">جاري تحميل التعليقات...</p>
    </div>

    <div v-else-if="fetchError" class="text-center py-6 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md p-4">
      <svg class="w-6 h-6 inline-block mb-1" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.257 3.099c.366-.446.998-.533 1.447-.193A8 8 0 1110 18a8 8 0 01-1.743-14.901c.45-.34 1.081-.253 1.447.193zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clip-rule="evenodd" />
      </svg>
      <p>حدث خطأ أثناء تحميل التعليقات. يرجى المحاولة مرة أخرى.</p>
      <button @click="fetchComments" class="mt-2 px-3 py-1 text-xs font-medium text-primary-700 dark:text-primary-300 hover:underline">إعادة المحاولة</button>
    </div>

    <div v-else-if="topLevelComments.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
      <svg class="w-8 h-8 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3C6.48 3 2 6.58 2 11c0 1.9.86 3.63 2.28 5l-1.3 4.22a1 1 0 001.26 1.26l4.22-1.3c1.37 1 3.1 1.56 4.92 1.56 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/>
      </svg>
      <p>لا توجد تعليقات حتى الآن. كن أول من يعلق!</p>
    </div>

    <div v-else class="space-y-4">
      <CommentItem
        v-for="comment in topLevelComments"
        :key="comment.id"
        :comment="comment"
        :replies="getRepliesForComment(comment.id)"
        :content-id="contentIdentifier"
        @comment-updated="handleCommentUpdate"
        @comment-deleted="handleCommentDelete"
        @reply-added="handleReplyAdded"
        class="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4"
      />
    </div>
  </section>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { Database } from '~/types/database.types'
import UserAvatar from './UserAvatar.vue'
import CommentItem from './CommentItem.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '~/stores/user' // تأكد من المسار الصحيح

// تعريف النوع مرة أخرى
type CommentWithProfile = Database['public']['Tables']['comments']['Row'] & {
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'avatar_url'> | null
}

const props = defineProps<{
  // مرر ID واحد فقط بناءً على نوع المحتوى
  lessonId?: number | string
  bookId?: number | string
  courseId?: number | string // اسم الـ prop يبقى courseId للسهولة
}>()

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { profile: userProfile } = storeToRefs(useUserStore())

const allComments = ref<CommentWithProfile[]>([])
const isLoading = ref(true)
const fetchError = ref<string | null>(null)

const newCommentContent = ref('')
const isSubmittingComment = ref(false)
const commentError = ref<string | null>(null)

// تحديد عمود الربط بناءً على الـ props
const contentColumn = computed(() => {
  if (props.lessonId) return 'lesson_id'
  if (props.bookId) return 'book_id'
  if (props.courseId) return 'study_course_id' // استخدام اسم العمود الصحيح
  return null // يجب أن يكون هناك واحد على الأقل
})

const contentValue = computed(() => {
  return props.lessonId || props.bookId || props.courseId
})

// معرف المحتوى لتمريره لـ CommentItem لإضافة الردود
const contentIdentifier = computed(() => ({
    lessonId: props.lessonId ? Number(props.lessonId) : undefined,
    bookId: props.bookId ? Number(props.bookId) : undefined,
    courseId: props.courseId ? Number(props.courseId) : undefined
}))

// جلب التعليقات والردود المرتبطة
const fetchComments = async () => {
  if (!contentColumn.value || !contentValue.value) {
      isLoading.value = false;
      fetchError.value = 'معرف المحتوى غير محدد.';
      console.error('Content ID or column is missing:', { col: contentColumn.value, val: contentValue.value });
      return;
  }
  isLoading.value = true
  fetchError.value = null
  try {
    // تأكد أن القيمة ليست undefined أو null قبل الاستعلام
     const idValue = contentValue.value;
     if (!idValue) throw new Error('Content ID value is missing');

    const { data, error, status } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!inner (id, full_name, avatar_url)
      `)
      .eq(contentColumn.value, idValue)
      // .eq('is_approved', true) // <-- ألغِ التعليق إذا أردت عرض المعتمد فقط
      .order('created_at', { ascending: true }) // جلب الكل وترتيبهم زمنياً

    if (error && status !== 406) { // 406 occurs on empty result with !inner join
        throw error;
    }


    // التعامل مع profiles!inner الذي قد يعيد null إذا لم يكن هناك profile مطابق (نادر مع RLS/triggers)
    allComments.value = (data || []).filter(c => c.profiles !== null) as CommentWithProfile[];


  } catch (err: any) {
    console.error('Error fetching comments:', err)
    fetchError.value = 'فشل تحميل التعليقات.'
    allComments.value = [] // أفرغ التعليقات عند الخطأ
  } finally {
    isLoading.value = false
  }
}

// حساب التعليقات الرئيسية فقط (parent_comment_id is null)
const topLevelComments = computed(() => {
  return allComments.value.filter(c => c.parent_comment_id === null)
                       .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // الأحدث أولاً
})

// وظيفة لجلب الردود الخاصة بتعليق معين
const getRepliesForComment = (commentId: number) => {
  // لا نحتاج للترتيب هنا لأن CommentItem سيرتبهم
  return allComments.value.filter(c => c.parent_comment_id === commentId)
}

// إجمالي عدد التعليقات (الرئيسية + الردود)
const commentsCount = computed(() => allComments.value.length)

// إضافة تعليق رئيسي جديد
const addComment = async () => {
  if (!user.value || !userProfile.value || !newCommentContent.value.trim() || !contentColumn.value || !contentValue.value || isSubmittingComment.value) return

  isSubmittingComment.value = true
  commentError.value = null

  const column = contentColumn.value;
  const value = contentValue.value;
   if (!column || !value) {
       commentError.value = 'خطأ: معرف المحتوى غير متوفر.';
       isSubmittingComment.value = false;
       return;
   }


  const commentData = {
    user_id: user.value.id,
    profile_id: userProfile.value.id, // معرف البروفايل (UUID)
    content: newCommentContent.value.trim(),
    parent_comment_id: null, // تعليق رئيسي
    [column]: value, // ربط بالمحتوى الصحيح
    // is_approved: true // الافتراضي في قاعدة البيانات هو true
  }

  try {
    const { data: newComment, error } = await supabase
      .from('comments')
      .insert(commentData)
      .select(`
        *,
        profiles (id, full_name, avatar_url)
      `)
      .single()

    if (error) throw error
    if (!newComment || !newComment.profiles) {
        // قد يحدث هذا إذا لم يكن RLS يسمح بقراءة البروفايل فوراً، أو خطأ آخر
        console.error("New comment data or profile is missing after insert:", newComment);
        // حاول إعادة جلب التعليقات كحل بديل مؤقت
        await fetchComments();
        // throw new Error('Failed to fetch new comment data with profile.')
    } else {
        // نجاح: أضف التعليق الجديد محلياً في بداية القائمة
        allComments.value.unshift(newComment as CommentWithProfile);
    }

    newCommentContent.value = '';


  } catch (err: any) {
    console.error('Error adding comment:', err)
    commentError.value = 'حدث خطأ أثناء إضافة التعليق.'
  } finally {
    isSubmittingComment.value = false
  }
}

// معالجة تحديث تعليق قادم من CommentItem
const handleCommentUpdate = (updatedComment: CommentWithProfile) => {
  const index = allComments.value.findIndex(c => c.id === updatedComment.id)
  if (index !== -1) {
     // Ensure reactivity
     allComments.value[index] = { ...allComments.value[index], ...updatedComment };
  }
}

// معالجة حذف تعليق قادم من CommentItem
const handleCommentDelete = (deletedCommentId: number) => {
  // احذف التعليق وكل ردوده من القائمة المحلية
  allComments.value = allComments.value.filter(c => c.id !== deletedCommentId && c.parent_comment_id !== deletedCommentId)
}

// معالجة إضافة رد قادم من CommentItem
const handleReplyAdded = (newReply: CommentWithProfile) => {
    // أضف الرد الجديد إلى القائمة المحلية
    // يجب التأكد من عدم وجوده بالفعل لتجنب التكرار إذا كان هناك تحديث realtime مثلاً
    if (!allComments.value.some(c => c.id === newReply.id)) {
         allComments.value.push(newReply);
    }
}

// جلب التعليقات عند تحميل المكون وعند تغيير الـ ID
onMounted(fetchComments)
watch([() => props.lessonId, () => props.bookId , () => props.courseId ], (newValues, oldValues) => {
    // أعد الجلب فقط إذا تغير المعرف الفعلي
    if (newValues.some((val, i) => val !== oldValues[i])) {
        fetchComments();
    }
}, { immediate: false }) // لا تشغل المراقب فوراً لأن onMounted يقوم بذلك

// يمكنك إضافة اشتراك Realtime هنا إذا أردت تحديثات حية
// const commentChannel = supabase.channel(`comments:${contentColumn.value}:${contentValue.value}`)
//   .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `${contentColumn.value}=eq.${contentValue.value}` }, payload => {
//     console.log('Realtime comment change:', payload)
//     // هنا تحتاج لمنطق أكثر تعقيداً لتحديث allComments بناءً على نوع الحدث (INSERT, UPDATE, DELETE)
//     // أبسط حل مؤقت هو إعادة جلب كل شيء
//     fetchComments();
//   })
//   .subscribe()

// onUnmounted(() => {
//   supabase.removeChannel(commentChannel);
// })

</script>