<template>
  <div class="mt-8 pt-6 border-t border-cream-gray dark:border-gray-700">
    <!-- عنوان وعدد التعليقات الإجمالي -->
    <h3 class="text-xl font-semibold text-brown-dark dark:text-brown-dark mb-4">
      التعليقات ({{ totalCommentsCount }})
    </h3>

    <!-- نموذج إضافة تعليق جذري (فقط للمستخدم المسجل) -->
    <div v-if="user" class="mb-6">
      <form @submit.prevent="addRootComment">
        <textarea v-model="newComment" rows="3" required placeholder="أضف تعليقك هنا..."
          class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
          :disabled="isSubmitting"></textarea>
        <button type="submit" :disabled="isSubmitting || !newComment.trim()"
          class="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :style="{ backgroundColor: !isSubmitting && newComment.trim() ? 'var(--color-olive-green)' : '' }">
          <span v-if="isSubmitting">جارٍ الإرسال...</span><span v-else>أضف تعليق</span>
        </button>
      </form>
      <p v-if="submitError" class="text-red-500 mt-2 text-sm">{{ submitError }}</p>
    </div>
    <!-- رسالة للزوار لتسجيل الدخول -->
    <div v-else class="mb-6 p-4 bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-gray-700 rounded-md text-center">
      <p class="text-yellow-800 dark:text-yellow-300">
        يرجى <NuxtLink to="/login" class="font-semibold hover:underline">تسجيل الدخول</NuxtLink> أو
        <NuxtLink to="/signup" class="font-semibold hover:underline">إنشاء حساب</NuxtLink> لتتمكن من إضافة تعليق.
      </p>
    </div>

    <!-- عرض قائمة التعليقات الجذرية -->
    <!-- حالة التحميل -->
    <div v-if="loading" class="text-center py-4">
      <LoadingSpinner />
      <p class="mt-2 text-gray-600 dark:text-gray-400">جارٍ تحميل التعليقات...</p>
    </div>
    <!-- حالة الخطأ -->
    <div v-else-if="fetchError" class="text-center py-4 text-red-500">
      حدث خطأ أثناء تحميل التعليقات: {{ fetchError }}
      <button @click="fetchRootComments" class="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:underline">إعادة المحاولة</button>
    </div>
    <!-- حالة عدم وجود تعليقات -->
    <div v-else-if="rootComments.length === 0" class="text-center py-4 text-gray-500">
      لا توجد تعليقات حتى الآن. كن أول من يعلق!
    </div>
    <!-- عرض القائمة باستخدام CommentItem لكل تعليق جذري -->
    <div v-else>
      <ul class="space-y-5">
        <CommentItem
          v-for="comment in rootComments"
          :key="comment.id"
          :comment="comment"
          :content-type="contentType"
          :content-id="numericContentId"
          :initial-reply-count="comment.reply_count || 0"
          @comment-deleted="handleCommentDeleted"
          @comment-updated="handleCommentUpdated"
          @reply-added-to-root="handleReplyAddedToRoot"
        />
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
// --- استيراد الأدوات والأنواع اللازمة ---
import { ref, onMounted, computed, watch } from 'vue';
import type { Database, Tables, Json } from '~/types/database.types'; // استيراد أنواع قاعدة البيانات
import type { ContentType, ContentIdColumn } from '~/types/comments'; // استيراد أنواع مخصصة للتعليقات (يجب إنشاؤها أو تعريفها هنا)
import CommentItem from './CommentItem.vue'; // استيراد مكون عرض التعليق/الرد
import LoadingSpinner from '~/components/LoadingSpinner.vue'; // استيراد مكون مؤشر التحميل
import { useSupabaseUser, useSupabaseClient } from '#imports'; // استيراد أدوات Supabase

// --- تعريف أنواع البيانات المستخدمة ---
type Profile = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'>; // نوع بيانات الملف الشخصي (فقط الحقول المطلوبة)
type CommentWithProfile = Omit<Tables<'comments'>, 'user_id'> & { // نوع التعليق مع بيانات الملف الشخصي (بدون user_id لأنه مُضمّن في profiles)
    profiles: Profile | null;
};
type CommentWithProfileAndReplyCount = CommentWithProfile & { // نوع التعليق مع بيانات الملف الشخصي وعدد الردود
    reply_count: number;
};
// تعريف أنواع المحتوى الممكنة وأسماء أعمدة المفتاح الأجنبي المرتبطة بها
// يجب أن تكون هذه الأنواع معرفة في مكان مركزي أو هنا
// type ContentType = 'lesson' | 'book' | 'study_course';
// type ContentIdColumn = 'lesson_id' | 'book_id' | 'study_course_id';

// --- تعريف الخصائص (Props) التي يستقبلها المكون ---
const props = defineProps({
  // معرف المحتوى (درس، كتاب، ...) الذي ترتبط به التعليقات
  contentId: { type: [String, Number], required: true },
  // نوع المحتوى (لتحديد جدول قاعدة البيانات والعمود الصحيح)
  contentType: {
    type: String as () => ContentType,
    required: true,
    // للتحقق من أن القيمة المُمررة هي إحدى القيم المسموح بها
    validator: (v: string) => ['lesson', 'book', 'study_course'].includes(v)
  },
});

// --- أدوات Supabase وحالة المستخدم ---
const supabase = useSupabaseClient<Database>(); // عميل Supabase للتواصل مع قاعدة البيانات
const user = useSupabaseUser(); // حالة المستخدم الحالي (null إذا لم يكن مسجلاً)

// --- حالة المكون الداخلية (State) ---
const rootComments = ref<CommentWithProfileAndReplyCount[]>([]); // مصفوفة لتخزين التعليقات الجذرية التي تم جلبها
const newComment = ref(''); // نموذج لإضافة تعليق جذري جديد
const loading = ref(true); // حالة التحميل الأولية للتعليقات
const fetchError = ref<string | null>(null); // لتخزين رسالة الخطأ عند فشل جلب التعليقات
const isSubmitting = ref(false); // حالة إرسال تعليق جذري جديد
const submitError = ref<string | null>(null); // لتخزين رسالة الخطأ عند فشل إرسال تعليق جديد

// --- الخصائص المحسوبة (Computed Properties) ---
// تحويل contentId إلى رقم دائمًا للاتساق
const numericContentId = computed(() => Number(props.contentId));

// تحديد اسم عمود المفتاح الأجنبي في جدول comments بناءً على نوع المحتوى
const contentIdColumn = computed<ContentIdColumn>(() => {
  switch (props.contentType) {
    case 'lesson': return 'lesson_id';
    case 'book': return 'book_id';
    case 'study_course': return 'study_course_id';
    default:
      // في الحالة غير المتوقعة (خطأ في prop), يتم تسجيل تحذير
      console.warn(`Invalid contentType '${props.contentType}' detected.`);
      // إرجاع undefined سيتم اكتشافه لاحقًا لمنع استعلام خاطئ
      return undefined as unknown as ContentIdColumn; // Cast to allow compilation, but logic handles undefined
  }
});

// تحديد أسماء أعمدة المفاتيح الأجنبية الأخرى التي يجب أن تكون null عند الإضافة
const otherIdColumns = computed<ContentIdColumn[]>(() => {
  const allCols: ContentIdColumn[] = ['lesson_id', 'book_id', 'study_course_id'];
  const currentCol = contentIdColumn.value; // احصل على القيمة المحسوبة
  return currentCol ? allCols.filter(col => col !== currentCol) : allCols; // إذا كان العمود الحالي صالحًا، قم بتصفية الآخرين
});

// حساب العدد الإجمالي للتعليقات (الجذرية + مجموع أعداد ردودها)
const totalCommentsCount = computed(() => {
  let count = rootComments.value.length; // ابدأ بعدد التعليقات الجذرية
  // أضف عدد الردود لكل تعليق جذري
  rootComments.value.forEach(comment => {
    count += comment.reply_count || 0; // استخدم 0 إذا كان العدد غير موجود أو null
  });
  return count;
});

// --- دالة جلب التعليقات الجذرية وعدد ردودها ---
async function fetchRootComments() {
  loading.value = true; // بدء التحميل
  fetchError.value = null; // مسح أي خطأ سابق

  const currentColName = contentIdColumn.value; // الحصول على اسم العمود المحسوب
  const currentNumericId = numericContentId.value; // الحصول على المعرف الرقمي

  // التحقق من أن اسم العمود صالح قبل المتابعة
  if (!currentColName) {
    console.error('!!! ABORTING FETCH: contentIdColumn is undefined. Check contentType prop!');
    fetchError.value = 'خطأ داخلي: نوع المحتوى غير محدد بشكل صحيح.';
    loading.value = false;
    return;
  }

  console.log(`[CommentSection] Fetching ROOT comments for ${props.contentType} ID: ${currentNumericId} using column ${currentColName}`);

  try {
    // الخطوة 1: جلب التعليقات الجذرية (parent_comment_id is null) مع بيانات الملف الشخصي المرتبط
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        profiles ( id, full_name, avatar_url )
      `)
      .eq(currentColName, currentNumericId) // فلترة حسب معرف ونوع المحتوى
      .is('parent_comment_id', null) // فقط التعليقات الجذرية
      // .eq('is_approved', true) // قم بإلغاء التعليق إذا كنت تريد فقط التعليقات المعتمدة
      .order('created_at', { ascending: true }); // ترتيب حسب الأقدم (أو false للأحدث)

    // التعامل مع خطأ جلب التعليقات
    if (commentsError) {
      console.error(`Supabase error fetching root comments data:`, commentsError);
      throw new Error(commentsError.message || 'Supabase query failed');
    }

    // تحويل البيانات المستلمة إلى النوع الصحيح
    const fetchedComments = (commentsData || []) as CommentWithProfile[];
    console.log('[CommentSection] Fetched root comments base data:', fetchedComments);

    // الخطوة 2: جلب عدد الردود لكل تعليق جذري باستخدام استدعاء RPC
    const commentsWithCountsPromises = fetchedComments.map(async (comment) => {
      try {
        // استدعاء دالة SQL 'get_reply_count' التي أنشأناها في Supabase
        const { data: countData, error: countError } = await supabase.rpc('get_reply_count', {
          p_parent_id: comment.id // تمرير معرف التعليق الجذري كمعامل للدالة
        });

        // التعامل مع خطأ جلب عدد الردود
        if (countError) {
          console.error(`Error fetching reply count for comment ${comment.id}:`, countError);
          return { ...comment, reply_count: 0 }; // الافتراضي هو 0 عند الخطأ
        }

        // الحصول على العدد (RPC ترجع القيمة مباشرة)
        const replyCount = typeof countData === 'number' ? countData : 0;
        return { ...comment, reply_count: replyCount }; // إضافة العدد إلى كائن التعليق

      } catch (rpcError: any) {
        console.error(`RPC call failed for comment ${comment.id}:`, rpcError);
        return { ...comment, reply_count: 0 }; // الافتراضي هو 0 عند الخطأ
      }
    });

    // انتظار اكتمال جميع استدعاءات RPC
    const commentsWithCounts = await Promise.all(commentsWithCountsPromises);

    console.log('[CommentSection] Root comments with counts:', commentsWithCounts);
    // تحديث حالة المكون بالتعليقات الجذرية مع عدد ردودها
    rootComments.value = commentsWithCounts;

  } catch (err: any) {
    console.error(`Error in fetchRootComments for ${props.contentType} ${currentNumericId}:`, err);
    fetchError.value = err.message || 'فشل تحميل التعليقات.';
    rootComments.value = []; // مسح التعليقات عند حدوث خطأ
    // رسالة خطأ مخصصة إذا كانت دالة RPC غير موجودة
    if (err.message?.includes("function get_reply_count(bigint) does not exist")) {
      fetchError.value = "فشلت العملية. تأكد من إنشاء دالة 'get_reply_count' في قاعدة بيانات Supabase.";
    }
    // رسالة خطأ مخصصة إذا كان اسم العمود غير معرف (للتحقق مرة أخرى)
    if (err.message?.includes("does not exist") && err.message?.includes(currentColName)) { // Be more specific
        fetchError.value = `خطأ: العمود '${currentColName}' غير موجود أو خطأ في الاستعلام.`;
    }
  } finally {
    loading.value = false; // انتهاء التحميل
  }
}

// --- دالة إضافة تعليق جذري جديد ---
async function addRootComment() {
  // التحقق من تسجيل المستخدم ووجود محتوى للتعليق
  if (!user.value || !newComment.value.trim()) return;
  isSubmitting.value = true; // بدء عملية الإرسال
  submitError.value = null; // مسح أي خطأ سابق

  const currentColName = contentIdColumn.value; // الحصول على اسم العمود الصحيح
  if (!currentColName) {
      console.error("Cannot add comment: Invalid content type", props.contentType);
      submitError.value = "خطأ داخلي: لا يمكن تحديد نوع المحتوى.";
      isSubmitting.value = false;
      return;
  }
  const currentOtherIdCols = otherIdColumns.value; // الحصول على الأعمدة الأخرى

  // تجهيز بيانات التعليق الجديد
  const commentData: Partial<Tables<'comments'>> = {
    user_id: user.value.id,
    content: newComment.value.trim(),
    parent_comment_id: null, // لا يوجد أب لأنه تعليق جذري
    [currentColName]: numericContentId.value, // تعيين المفتاح الأجنبي الصحيح
    // is_approved: false, // قم بإلغاء التعليق إذا كنت تحتاج إلى موافقة يدوية
  };
  // تعيين الأعمدة الأخرى إلى null
  currentOtherIdCols.forEach(colName => { commentData[colName] = null; });

  try {
    // إرسال بيانات التعليق إلى قاعدة البيانات وجلب التعليق المُضاف مع بيانات الملف الشخصي
    const { data: insertedComment, error: insertError } = await supabase
      .from('comments')
      .insert(commentData)
      .select(`*, profiles ( id, full_name, avatar_url )`) // تحديد الحقول المطلوبة
      .single(); // نتوقع تعليقًا واحدًا فقط

    // التعامل مع خطأ الإضافة
    if (insertError) throw insertError;
    if (!insertedComment) throw new Error("Failed to retrieve inserted comment data.");

    // إضافة التعليق الجديد إلى بداية أو نهاية قائمة التعليقات الجذرية المعروضة
    const newRootComment: CommentWithProfileAndReplyCount = {
      ...insertedComment,
      reply_count: 0 // التعليق الجديد ليس لديه ردود بعد
    };
    rootComments.value.push(newRootComment); // إضافته إلى نهاية المصفوفة
    newComment.value = ''; // مسح حقل الإدخال

  } catch (error: any) {
    console.error('Error adding root comment:', error);
    submitError.value = error.message || 'فشل إضافة التعليق.';
  } finally {
    isSubmitting.value = false; // انتهاء عملية الإرسال
  }
}

// --- معالجات الأحداث (Event Handlers) القادمة من CommentItem ---

// عند حذف تعليق جذري
function handleCommentDeleted(commentId: number) {
  // البحث عن التعليق في المصفوفة المحلية وحذفه
  const index = rootComments.value.findIndex(c => c.id === commentId);
  if (index > -1) {
    rootComments.value.splice(index, 1);
  } else {
    console.warn(`Could not find root comment ${commentId} to delete locally.`);
    // يمكن إعادة الجلب هنا لضمان التناسق fetchRootComments();
  }
}

// عند تحديث تعليق جذري
function handleCommentUpdated(updatedComment: CommentWithProfileAndReplyCount) {
  // البحث عن التعليق في المصفوفة المحلية وتحديث بياناته
  const index = rootComments.value.findIndex(c => c.id === updatedComment.id);
  if (index > -1) {
    // التأكد من الحفاظ على عدد الردود الصحيح
    rootComments.value[index] = {
        ...rootComments.value[index], // الحفاظ على أي حالة محلية أخرى قد تكون موجودة
        ...updatedComment, // تطبيق التحديثات من قاعدة البيانات
        reply_count: updatedComment.reply_count ?? rootComments.value[index].reply_count ?? 0 // استخدام العدد المحدث
    };
  } else {
    console.warn(`Could not find root comment ${updatedComment.id} to update locally.`);
    // يمكن إعادة الجلب هنا fetchRootComments();
  }
}

// عند إضافة رد جديد (يتم إعلامنا من CommentItem لزيادة العداد الإجمالي)
function handleReplyAddedToRoot(rootCommentId: number) {
  // البحث عن التعليق الجذري وزيادة عداد الردود الخاص به محليًا
  const index = rootComments.value.findIndex(c => c.id === rootCommentId);
  if (index > -1) {
    // زيادة العداد المحلي للعرض الفوري للعدد الإجمالي الصحيح
    rootComments.value[index].reply_count = (rootComments.value[index].reply_count || 0) + 1;
    // CommentItem سيهتم فعليًا بعرض الرد الجديد عند فتحه
  } else {
    console.warn(`Could not find root comment ${rootCommentId} to increment reply count.`);
    // إعادة الجلب للحصول على العدد الصحيح كحل بديل
     fetchRootComments();
  }
}

// --- الجلب الأولي ومراقبة التغييرات ---
// جلب التعليقات عند تحميل المكون لأول مرة
onMounted(() => {
  fetchRootComments();
});
// إعادة جلب التعليقات إذا تغير معرف المحتوى أو نوعه (مثل التنقل بين الصفحات)
watch([() => props.contentId, () => props.contentType], () => {
  fetchRootComments();
});

</script>

<style scoped>
/* أنماط CSS خاصة بهذا المكون إذا لزم الأمر */
</style>