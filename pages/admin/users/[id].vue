<template>
  <div v-if="pending" class="flex justify-center items-center min-h-[60vh]">
    <LoadingSpinner class="w-10 h-10 text-indigo-600" />
  </div>

  <div v-else-if="fetchError || !userData" class="container mx-auto px-4 py-8 text-center">
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">خطأ!</strong>
      <span class="block sm:inline">
        {{ fetchError ? `فشل تحميل بيانات المستخدم: ${fetchError.message}` : 'لم يتم العثور على المستخدم المطلوب.' }}
      </span>
    </div>
    <NuxtLink to="/admin/users" class="mt-6 inline-block text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
      ← العودة إلى قائمة المستخدمين
    </NuxtLink>
  </div>

  <div v-else class="container mx-auto px-4 lg:px-8 py-8 space-y-8">
    <!-- Header: User Info & Back Button -->
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b dark:border-gray-700">
      <div class="flex items-center gap-4">
        <UserAvatar :src="userData.profile.avatar_url || undefined" :alt="userData.profile.full_name || 'مستخدم'" size="lg" />
        <div>
          <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">{{ userData.profile.full_name || 'لم يحدد اسم' }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ userData.auth.email }}</p>
          <div class="mt-1 flex flex-wrap gap-2 text-xs">
             <span :class="['px-2 py-0.5 rounded-full', userData.profile.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300']">
               {{ userData.profile.role === 'admin' ? 'مشرف' : 'مستخدم' }}
             </span>
              <span v-if="userData.profile.is_banned" class="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">محظور</span>
              <span v-else-if="isCommentSuspended(userData.profile.comment_suspended_until)" class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">تعليق موقوف</span>
              <span v-else class="px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">نشط</span>
          </div>
        </div>
      </div>
      <NuxtLink to="/admin/users" class="flex-shrink-0 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 mt-2 sm:mt-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z" clip-rule="evenodd" /></svg>
        العودة للقائمة
      </NuxtLink>
    </div>

    <!-- Action Buttons / Status Area -->
     <!-- Loading overlay for actions -->
     <div v-if="isLoadingAction" class="fixed inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-50">
         <LoadingSpinner class="w-8 h-8 text-indigo-600" />
         <span class="ml-2 text-gray-700 dark:text-gray-300">جاري تنفيذ الإجراء...</span>
     </div>

    <AdminUserActions
        v-if="userData?.profile"
        :user-profile="userData.profile"
        :is-loading="isLoadingAction"  
        @action-start="handleActionStart"
        @action-complete="handleActionComplete"
        @send-message="openSendMessageModal(userData.profile)"
        @suspend-comments="openSuspendModal(userData.profile)"
    />


    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Left Column: User Details -->
      <div class="lg:col-span-1 space-y-6">
         <BaseCard>
             <template #title>معلومات إضافية</template>
             <template #content>
                 <dl class="space-y-3 text-sm">
                   <div class="flex justify-between">
                     <dt class="font-medium text-gray-500 dark:text-gray-400">تاريخ الانضمام:</dt> 
                     <dd class="text-gray-700 dark:text-gray-200">{{ formatDate(userData.profile.created_at) }}</dd>
                   </div>
                   <div class="flex justify-between">
                     <dt class="font-medium text-gray-500 dark:text-gray-400">آخر تحديث للبروفايل:</dt>
                     <dd class="text-gray-700 dark:text-gray-200">{{ formatDate(userData.profile.updated_at) }}</dd>
                   </div>
                    <div class="flex justify-between">
                     <dt class="font-medium text-gray-500 dark:text-gray-400">آخر تسجيل دخول:</dt>
                     <dd class="text-gray-700 dark:text-gray-200">{{ formatDate(userData.auth.last_sign_in_at) || 'غير متاح' }}</dd>
                   </div>
                    <div class="flex justify-between">
                     <dt class="font-medium text-gray-500 dark:text-gray-400">النقاط:</dt>
                     <dd class="text-gray-700 dark:text-gray-200 font-semibold">{{ userData.profile.points ?? 0 }}</dd>
                   </div>
                   <div v-if="isCommentSuspended(userData.profile.comment_suspended_until)">
                       <dt class="font-medium text-gray-500 dark:text-gray-400">انتهاء إيقاف التعليق:</dt>
                       <dd class="text-yellow-600 dark:text-yellow-400">{{ formatDate(userData.profile.comment_suspended_until) }}</dd>
                   </div>
                   <div class="pt-2">
                     <dt class="font-medium text-gray-500 dark:text-gray-400 mb-1">النبذة الشخصية:</dt>
                     <dd class="text-gray-700 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-2 rounded border dark:border-gray-600 min-h-[50px]">{{ userData.profile.bio || 'لم يكتب نبذة.' }}</dd>
                   </div>
                 </dl>
             </template>
         </BaseCard>

           <BaseCard v-if="userEnrolledCourses.length > 0">
             <template #title>الدورات المسجل بها ({{ userEnrolledCourses.length }})</template>
             <template #content>
                 <div v-if="isLoadingCourses" class="text-center p-4"><LoadingSpinner/></div>
                  <ul v-else class="space-y-2 max-h-60 overflow-y-auto text-sm pr-1">
                     <li v-for="enrollment in userEnrolledCourses" :key="enrollment.course_id" class="flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded">
                         <NuxtLink :to="`/study/courses/${enrollment.course_id}`" class="hover:underline text-gray-700 dark:text-gray-200 flex-grow truncate mr-2">
                             {{ enrollment.study_courses?.title || 'دورة غير معروفة' }}
                         </NuxtLink>
                         <span class="text-xs text-gray-400 flex-shrink-0">{{ formatDateShort(enrollment.enrolled_at) }}</span>
                     </li>
                 </ul>
             </template>
         </BaseCard>
          <div v-else-if="!isLoadingCourses" class="text-sm text-center text-gray-400 dark:text-gray-500 italic py-4">
              المستخدم غير مسجل في أي دورات.
          </div>
      </div>

      <!-- Right Column: Messages -->
      <div class="lg:col-span-2 space-y-6">
         <BaseCard>
             <template #title>
                 <div class="flex justify-between items-center">
                     <span>المراسلات مع المستخدم</span>
                      <button @click="openSendMessageModal(userData.profile)" :disabled="isLoadingAction === 'send'" class="text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 px-3 py-1 rounded-md flex items-center gap-1 disabled:opacity-50">
                         <LoadingSpinner v-if="isLoadingAction === 'send'" class="w-4 h-4"/>
                         <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11ZM2 4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v1.145l-5.426 3.05a1.75 1.75 0 0 1-1.93.066L2 5.96V4.5Zm11.5 8h-11a.5.5 0 0 1-.5-.5v-4.318l3.924 2.207a3.25 3.25 0 0 0 3.552-.122L14 7.764V11.5a.5.5 0 0 1-.5.5Z" /></svg>
                         <span>رسالة جديدة</span>
                      </button>
                 </div>
             </template>
             <template #content>
                <div v-if="isLoadingMessages" class="text-center py-10"><LoadingSpinner /></div>
                <div v-else-if="userMessages.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">لا توجد رسائل متبادلة.</div>
                <div v-else class="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                   <div v-for="message in userMessages" :key="message.id" class="border-b dark:border-gray-700 pb-4 last:border-b-0">
          
                      <div class="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/80 shadow-sm">
                          <div class="flex justify-between items-start mb-1.5">
                            <h4 class="font-semibold text-gray-800 dark:text-gray-100">{{ message.title }}</h4>
                            <span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {{ formatDate(message.created_at) }}
                            </span>
                          </div>
                          <p class="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{{ message.content }}</p>
                           <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                               <span class="font-medium">المصدر:</span> {{ message.source === 'ask_sheikh_reply' ? 'رد على سؤال' : (message.source === 'admin_direct_message' ? 'رسالة مباشرة' : 'غير محدد') }}
                                <NuxtLink v-if="message.related_question_id" :to="`/admin/ask-sheikh?question=${message.related_question_id}`" class="mr-1 text-indigo-600 dark:text-indigo-400 hover:underline">(#{{ message.related_question_id }})</NuxtLink>
                           </p>
                      </div>

                     
                      <div v-if="message.user_reply_text" class="mt-3 mr-4 rtl:mr-0 rtl:ml-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 shadow-sm">
                          <div class="flex justify-between items-start mb-1.5">
                             <p class="text-sm font-semibold text-yellow-800 dark:text-yellow-200">رد المستخدم:</p>
                              <span class="text-xs text-yellow-700 dark:text-yellow-300 whitespace-nowrap">
                                {{ formatDate(message.user_replied_at) }}
                              </span>
                          </div>
                          <p class="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{{ message.user_reply_text }}</p>
                           <div class="mt-2 text-right">
                               <button v-if="!message.admin_read_reply"
                                      @click="markReplyAsReadByAdmin(message.id)"
                                      :disabled="isLoadingAction === `read-${message.id}`"
                                      class="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 flex items-center justify-end gap-1 ml-auto">
                                  <LoadingSpinner v-if="isLoadingAction === `read-${message.id}`" class="w-3 h-3"/>
                                  <span>{{ isLoadingAction === `read-${message.id}` ? 'جارٍ...' : 'تمييز كمقروء' }}</span>
                               </button>
                                <span v-else class="text-xs text-green-600 dark:text-green-400 font-medium">(تمت القراءة)</span>
                           </div>
                      </div>
                       <div v-else class="mt-3 mr-4 rtl:mr-0 rtl:ml-4 text-xs text-gray-400 italic">
                           لم يرد المستخدم على هذه الرسالة بعد.
                       </div>
                   </div>
                </div>
             </template>
         </BaseCard>
      </div>

    </div>

     <!-- Modals -->
    <LazyAdminSendMessageModal v-model="showSendMessageModal" :user="modalUser" @sent="handleMessageSent" />
    <LazyAdminSuspendCommentModal v-model="showSuspendModal" :user="modalUser" @suspended="handleUserSuspended" />
   
    

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import UserAvatar from '~/components/UserAvatar.vue';
import BaseCard from '~/components/BaseCard.vue';
const AdminSendMessageModal = resolveComponent('LazyAdminSendMessageModal');
const AdminSuspendCommentModal = resolveComponent('LazyAdminSuspendCommentModal');
// Confirmation is now likely inside AdminUserActions
// const AdminConfirmationModal = resolveComponent('LazyAdminConfirmationModal');
import AdminUserActions from '~/components/admin/AdminUserActions.vue';
// import { type ConfirmationConfig } from '~/components/admin/ConfirmationModal.vue'; // Type might still be needed if passed through
import { useSupabaseClient, definePageMeta, useNuxtApp, useRoute, navigateTo } from '#imports';
import type { PostgrestError, User } from '@supabase/supabase-js';

// --- Define Types ---
type Profile = Tables<'profiles'>;
type AuthUser = Pick<User, 'id' | 'email' | 'created_at' | 'last_sign_in_at'>;
type PrivateMessage = Tables<'user_private_messages'>;
type CourseEnrollment = Tables<'course_enrollments'> & {
    study_courses: Pick<Tables<'study_courses'>, 'title'> | null;
};
type UserDetailData = { profile: Profile; auth: AuthUser; } | null;

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const { $toast } = useNuxtApp();
const route = useRoute();
const userId = computed(() => route.params.id as string);

// --- State ---
const pending = ref(true);
const fetchError = ref<PostgrestError | { message: string } | null>(null);
const userData = ref<UserDetailData>(null);
const userMessages = ref<PrivateMessage[]>([]);
const isLoadingMessages = ref(false);
const userEnrolledCourses = ref<CourseEnrollment[]>([]);
const isLoadingCourses = ref(false);
const isLoadingAction = ref<string | boolean>(false); // Can be boolean or string like `read-${id}`

// Modal State
const showSendMessageModal = ref(false);
const showSuspendModal = ref(false);
// Confirmation modal state is now likely managed within AdminUserActions
// const showConfirmModal = ref(false);
// const confirmConfig = ref<ConfirmationConfig | null>(null);
// let actionToConfirm: { type: 'ban' | 'unban' | 'unsuspend', user: Profile } | null = null;
const modalUser = computed(() => userData.value?.profile ?? null);


// --- Fetch Data ---
const fetchData = async () => {
  pending.value = true; fetchError.value = null; userData.value = null;
  userMessages.value = []; userEnrolledCourses.value = [];
  isLoadingMessages.value = true; isLoadingCourses.value = true; // Start loading indicators

  if (!userId.value) {
    fetchError.value = { message: "معرف المستخدم غير موجود." }; pending.value = false; return;
  }

  try {
    const profilePromise = supabase.from('profiles').select('*').eq('id', userId.value).single();
    const authPromise = supabase.auth.admin.getUserById(userId.value); // Requires admin
    const messagesPromise = supabase.from('user_private_messages').select('*').eq('user_id', userId.value).order('created_at', { ascending: false });
    const coursesPromise = supabase.from('course_enrollments').select(`course_id, enrolled_at, study_courses (title)`).eq('user_id', userId.value).order('enrolled_at', { ascending: false });

    const [profileResult, authResult, messagesResult, coursesResult] = await Promise.allSettled([
        profilePromise, authPromise, messagesPromise, coursesPromise
    ]);

    // Process Profile
    if (profileResult.status === 'rejected' || !profileResult.value.data) throw profileResult.status === 'rejected' ? profileResult.reason : new Error('لم يتم العثور على ملف المستخدم.');
    const profileData = profileResult.value.data as Profile;

    // Process Auth
    let authData: AuthUser;
    if (authResult.status === 'fulfilled' && authResult.value.data.user) {
       const fetchedAuthUser = authResult.value.data.user;
       authData = { id: fetchedAuthUser.id, email: fetchedAuthUser.email ?? 'غير متوفر', created_at: fetchedAuthUser.created_at, last_sign_in_at: fetchedAuthUser.last_sign_in_at }
    } else {
      console.warn("فشل جلب بيانات المصادقة:", authResult.status === 'rejected' ? authResult.reason : 'لا يوجد بيانات');
      authData = { id: profileData.id, email: 'غير متاح (خطأ تحميل)', created_at: undefined, last_sign_in_at: undefined }
    }
    userData.value = { profile: profileData, auth: authData };

    // Process Messages
    if (messagesResult.status === 'fulfilled') userMessages.value = (messagesResult.value.data as PrivateMessage[]) ?? [];
    else console.error("Error fetching messages:", messagesResult.reason);
    isLoadingMessages.value = false;

    // Process Courses
    if (coursesResult.status === 'fulfilled') userEnrolledCourses.value = (coursesResult.value.data as CourseEnrollment[]) ?? [];
    else console.error("Error fetching enrolled courses:", coursesResult.reason);
    isLoadingCourses.value = false;

  } catch (err: any) {
    console.error("Error fetching user detail:", err); fetchError.value = (err as PostgrestError) ?? { message: 'خطأ غير معروف.' }; userData.value = null;
    isLoadingMessages.value = false; isLoadingCourses.value = false; // Ensure loading stops on error
  } finally { pending.value = false; }
};

// --- Action Handlers ---
const handleActionStart = (actionType: string) => {
    // Use boolean for general loading, specific string for 'read' action
    isLoadingAction.value = (actionType === 'ban' || actionType === 'unban' || actionType === 'unsuspend' || actionType === 'role');
    console.log(`Action started: ${actionType}`);
};

const handleActionComplete = (success: boolean, message: string, updatedProfile?: Partial<Profile>) => {
    isLoadingAction.value = false;
    if (success && userData.value && updatedProfile) {
        Object.assign(userData.value.profile, updatedProfile);
        showToast(message, 'success');
    } else if (!success) {
        showToast(message, 'error');
    }
};

const markReplyAsReadByAdmin = async (messageId: number) => {
    if (isLoadingAction.value) return;
    isLoadingAction.value = `read-${messageId}`;
    try {
        const { error } = await supabase.from('user_private_messages').update({ admin_read_reply: true }).eq('id', messageId);
        if (error) throw error;
        const msgIndex = userMessages.value?.findIndex(m => m.id === messageId);
        if (msgIndex !== undefined && msgIndex !== -1 && userMessages.value) userMessages.value[msgIndex].admin_read_reply = true;
        showToast('تم تمييز الرد كمقروء.', 'success');
    } catch (err: any) { console.error("Error marking reply as read by admin:", err); showToast('فشل تمييز الرد كمقروء.', 'error'); }
    finally { if(isLoadingAction.value === `read-${messageId}`) isLoadingAction.value = false; } // Reset only if it matches
};

const openSendMessageModal = (userProfile: Profile | null) => { if (!userProfile) return; showSendMessageModal.value = true; };
const openSuspendModal = (userProfile: Profile | null) => { if (!userProfile) return; showSuspendModal.value = true; };

const handleMessageSent = (success: boolean, errorMsg?: string) => {
    showSendMessageModal.value = false;
    if (success) { showToast('تم إرسال الرسالة الخاصة بنجاح.', 'success'); fetchMessages(); } // Refresh messages on success
    else { showToast(`فشل إرسال الرسالة الخاصة: ${errorMsg || 'خطأ غير معروف'}`, 'error'); }
};

const fetchMessages = async () => { // Function to refresh messages list
    if (!userId.value) return; isLoadingMessages.value = true;
    try {
        const { data, error } = await supabase.from('user_private_messages').select('*').eq('user_id', userId.value).order('created_at', { ascending: false });
        if (error) throw error; userMessages.value = data ?? [];
    } catch (err: any) { console.error("Error refreshing messages:", err); showToast("فشل تحديث قائمة الرسائل.", "error"); }
    finally { isLoadingMessages.value = false; }
};

const handleUserSuspended = (userIdParam: string, suspended: boolean, suspended_until: string | null) => {
    if (userData.value?.profile.id === userIdParam) {
        userData.value.profile.comment_suspended_until = suspended_until;
        const userName = userData.value.profile.full_name || userData.value.auth.email;
        if (suspended) { showToast(`تم إيقاف تعليقات المستخدم ${userName} حتى ${formatDate(suspended_until)}.`, 'success'); }
        else { showToast(`تم إلغاء إيقاف تعليقات المستخدم ${userName}.`, 'success'); }
    }
    showSuspendModal.value = false;
};

// Confirmation logic is now likely handled within AdminUserActions
// const confirmAction = ...
// const executeConfirmedAction = ...

// --- Helper Functions ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '--';
  try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'تاريخ غير صالح'; return date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short', hour12: true }); }
  catch (e) { return 'خطأ تنسيق'; }
};
const formatDateShort = (dateString: string | null | undefined): string => {
  if (!dateString) return '--';
  try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'تاريخ غير صالح'; return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric'}); }
  catch (e) { return 'خطأ تنسيق'; }
};

const isCommentSuspended = (suspendedUntil: string | null | undefined): boolean => {
    if (!suspendedUntil) return false;
    try { return new Date(suspendedUntil) > new Date(); } catch { return false; }
};

const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if ($toast && typeof $toast[type] === 'function') $toast[type](message);
    else console.log(`[${type.toUpperCase()}] ${message}`);
};

// --- Watchers ---
watch(userId, (newId) => { if (newId) fetchData(); }, { immediate: true });

// --- Lifecycle Hooks ---
// onMounted(() => { // Fetch data is called by the watcher });

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 3px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.8); }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.whitespace-pre-wrap { white-space: pre-wrap; word-wrap: break-word; }
.min-h-\[50px\] { min-height: 50px; }
</style>