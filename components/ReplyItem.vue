<template>
  <li class="reply-item">
    <div class="flex items-start space-x-3 space-x-reverse">
      <!-- Reply Avatar -->
       <div class="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden border border-cream-gray dark:border-gray-600 flex items-center justify-center relative"
            :style="!avatarUrl && fullName ? letterAvatarStyle(fullName, 0.8) : {}">
         <img v-if="avatarUrl" :key="avatarUrl" :src="avatarUrl" alt="" class="w-full h-full object-cover" @error="handleAvatarError" :class="{'opacity-0': avatarLoadingError}"/>
         <span v-else-if="fullName" class="text-sm font-medium text-white dark:text-gray-900 select-none"> {{ getInitial(fullName) }} </span>
         <img v-else :src="defaultAvatar" alt="" class="w-full h-full object-cover" />
         <div v-if="avatarLoadingError && !fullName" class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <img :src="defaultAvatar" alt="" class="w-full h-full object-cover opacity-50" />
         </div>
       </div>

      <!-- Reply Content & Actions -->
      <div class="flex-1">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm font-semibold text-brown-dark dark:text-gray-200">
              {{ fullName || 'مستخدم' }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ timeAgo(reply.created_at) }}
          </span>
        </div>

        <!-- Content / Edit Form -->
         <div v-if="!isEditing">
           <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{{ reply.content }}</p>
         </div>
         <div v-else>
           <form @submit.prevent="saveEdit">
             <textarea v-model="editableContent" rows="2" required
               class="w-full px-2 py-1 text-sm border rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
               :disabled="isSavingEdit"></textarea>
             <div class="mt-1 flex items-center justify-end space-x-2 space-x-reverse">
               <button type="button" @click="cancelEdit" :disabled="isSavingEdit" class="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">إلغاء</button>
               <button type="submit" :disabled="isSavingEdit || !editableContent.trim()" class="px-2 py-0.5 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" :style="{ backgroundColor: !isSavingEdit && editableContent.trim() ? 'var(--color-olive-green)' : '' }">
                  <span v-if="isSavingEdit">جارٍ الحفظ...</span><span v-else>حفظ</span>
               </button>
             </div>
             <p v-if="editError" class="text-red-500 mt-1 text-xs text-end">{{ editError }}</p>
           </form>
         </div>

        <!-- Actions (Reply, Edit, Delete for Owner) -->
        <div class="mt-1 flex items-center space-x-3 space-x-reverse text-xs">
           <!-- 1. زر الرد مع SVG -->
           <button v-if="currentUser" @click="toggleReplyForm"
              class="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <!-- Heroicon: arrow-uturn-left (mini) -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 me-1">
                <path fill-rule="evenodd" d="M14 2.5a.5.5 0 0 0-.5-.5H6.707l.353-.354a.5.5 0 1 0-.707-.708L4.146 3.146a.5.5 0 0 0 0 .708l2.207 2.207a.5.5 0 0 0 .707-.708l-.354-.353H13.5a.5.5 0 0 0 .5-.5ZM13.5 7a.5.5 0 0 1 .5.5v5.793l.146-.147a.5.5 0 0 1 .708.708l-1.5 1.5a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L12.5 13.293V7.5a.5.5 0 0 1 .5-.5Z" clip-rule="evenodd" />
              </svg>
              <span>رد</span>
           </button>

           <!-- 2. زر قائمة الخيارات مع SVG -->
           <div v-if="isOwner" class="relative" ref="optionsMenuRef">
             <button @click="toggleOptionsMenu" class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
               <!-- Heroicon: ellipsis-horizontal (mini) -->
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4">
                 <path d="M3 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm5 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
               </svg>
             </button>
             <!-- 3. القائمة المنسدلة مع أيقونات SVG -->
             <transition name="fade-fast">
               <div v-show="showOptionsMenu"
                 class="origin-top-left absolute start-0 mt-1 w-32 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                 <div class="py-1">
                   <!-- زر التعديل مع SVG -->
                   <button @click="startEditing" class="flex items-center w-full text-start px-3 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                     <!-- Heroicon: pencil-square (mini) -->
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 me-1">
                       <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.813 1.558L5.75 11.25a.75.75 0 0 0 .75.75h2.919c.587 0 1.15-.224 1.558-.813l4.263-4.262a1.75 1.75 0 0 0 0-2.475Z" />
                       <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9.5A.75.75 0 0 1 14 9.5v1.75A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H6.5a.75.75 0 0 1 0 1.5H4.75Z" />
                     </svg>
                     <span>تعديل</span>
                   </button>
                   <!-- زر الحذف مع SVG -->
                   <button @click="confirmDelete" class="flex items-center w-full text-start px-3 py-1 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-600">
                     <!-- Heroicon: trash (mini) -->
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3 h-3 me-1">
                       <path fill-rule="evenodd" d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.3l.815 8.15A1.5 1.5 0 0 0 5.357 15h5.285a1.5 1.5 0 0 0 1.493-1.35l.815-8.15h.3a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 5.5l.785 7.85a.15.15 0 0 0 .149.15h2.03a.15.15 0 0 0 .15-.15l.785-7.85a.75.75 0 0 0-.74-.75H6.79a.75.75 0 0 0-.74.75Z" clip-rule="evenodd" />
                     </svg>
                     <span>حذف</span>
                   </button>
                 </div>
               </div>
             </transition>
           </div>
        </div>

        <!-- Reply Form (نفس الكود بدون تغيير في الأيقونات هنا) -->
        <div v-if="showReplyForm && currentUser" class="mt-2">
           {/* ... form ... */}
        </div>
        <p v-if="showReplyForm && !currentUser" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
           {/* ... login link ... */}
        </p>

      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
// --- Script Setup (نفس الكود السابق بدون تغيير) ---
import { ref, computed, watch } from 'vue';
import type { Database, Tables } from '~/types/database.types';
import type { ContentType, ContentIdColumn } from '~/types/comments';
import { onClickOutside } from '@vueuse/core';
import { useSupabaseUser, useSupabaseClient } from '#imports';

// Type definitions
type Profile = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'avatar_url'>;
type Reply = Omit<Tables<'comments'>, 'user_id'> & { profiles: Profile | null };

// Props
const props = defineProps<{
  reply: Reply,
  contentType: ContentType,
  contentId: string | number,
  rootCommentId: number,
}>();

// Emits
const emit = defineEmits(['reply-deleted', 'reply-updated', 'reply-added']);

// Composables
const supabase = useSupabaseClient<Database>();
const currentUser = useSupabaseUser();

// Refs
const defaultAvatar = '/images/default-avatar.png';
const avatarLoadingError = ref(false);
const isEditing = ref(false);
const editableContent = ref(props.reply.content);
const isSavingEdit = ref(false);
const editError = ref<string | null>(null);
const showReplyForm = ref(false);
const newReplyText = ref('');
const isSubmittingReply = ref(false);
const replyError = ref<string | null>(null);
const showOptionsMenu = ref(false);
const optionsMenuRef = ref<HTMLElement | null>(null);

// Computed
const isOwner = computed(() => !!currentUser.value && props.reply.user_id === currentUser.value.id);
const numericContentId = computed(() => Number(props.contentId));
const avatarUrl = computed(() => props.reply.profiles?.avatar_url);
const fullName = computed(() => props.reply.profiles?.full_name);

// Methods - Avatar
function handleAvatarError() { avatarLoadingError.value = true; }
function getInitial(name: string | null | undefined): string { return name ? name.trim().charAt(0).toUpperCase() : '?'; }
const letterAvatarColors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'];
function letterAvatarStyle(name: string | null | undefined, opacity = 1): { backgroundColor?: string } {
     if (!name) return {};
     const charCodeSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
     const colorIndex = charCodeSum % letterAvatarColors.length;
     const color = letterAvatarColors[colorIndex];
     const applyOpacity = (hexColor: string, alpha: number): string => { const r = parseInt(hexColor.slice(1, 3), 16); const g = parseInt(hexColor.slice(3, 5), 16); const b = parseInt(hexColor.slice(5, 7), 16); return `rgba(${r}, ${g}, ${b}, ${alpha})`; };
     return { backgroundColor: opacity === 1 ? color : applyOpacity(color, opacity) };
}

// Methods - Time Ago
const timeAgo = (dateString: string | null): string => { if (!dateString) return ''; const date = new Date(dateString); const now = new Date(); const seconds = Math.round((now.getTime() - date.getTime()) / 1000); if (seconds < 60) return `منذ ${seconds} ثوان`; const minutes = Math.round(seconds / 60); if (minutes < 60) return `منذ ${minutes} دقائق`; const hours = Math.round(minutes / 60); if (hours < 24) return `منذ ${hours} ساعات`; const days = Math.round(hours / 24); if (days < 7) return `منذ ${days} أيام`; const weeks = Math.round(days / 7); if (weeks < 4) return `منذ ${weeks} أسابيع`; const months = Math.round(days / 30); if (months < 12) return `منذ ${months} أشهر`; const years = Math.round(days / 365); return `منذ ${years} سنوات`; };

// Methods - Edit Reply
function startEditing() { editableContent.value = props.reply.content; isEditing.value = true; showOptionsMenu.value = false; }
function cancelEdit() { isEditing.value = false; editError.value = null; }
async function saveEdit() {
  if (!editableContent.value.trim()) return;
  isSavingEdit.value = true; editError.value = null;
  try {
    const { data, error } = await supabase.from('comments').update({ content: editableContent.value.trim() }).eq('id', props.reply.id).select(`*, profiles ( id, full_name, avatar_url )`).single();
    if (error) throw error;
    if(data) { emit('reply-updated', data as Reply); isEditing.value = false; } else { throw new Error("Failed to retrieve updated reply data."); }
  } catch (error: any) { console.error('Error saving reply edit:', error); editError.value = error.message || 'فشل حفظ التعديل.'; }
  finally { isSavingEdit.value = false; }
}

// Methods - Delete Reply
async function deleteReply() {
    try {
        const { error } = await supabase.from('comments').delete().eq('id', props.reply.id);
        if (error) throw error;
        emit('reply-deleted', props.reply.id); showOptionsMenu.value = false;
    } catch (error: any) { console.error('Error deleting reply:', error); alert(`فشل حذف الرد: ${error.message}`); }
}
function confirmDelete() { if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الرد؟')) { deleteReply(); } else { showOptionsMenu.value = false; } }

// Methods - Reply to Root
function toggleReplyForm() { showReplyForm.value = !showReplyForm.value; if(!showReplyForm.value) { newReplyText.value = ''; replyError.value = null; } }
function cancelReply() { toggleReplyForm(); }
async function submitReplyToRoot() {
  if (!currentUser.value || !newReplyText.value.trim()) return;
  isSubmittingReply.value = true; replyError.value = null;
  let directContentIdColumn: ContentIdColumn | undefined; const allCols: ContentIdColumn[] = ['lesson_id', 'book_id', 'study_course_id']; switch (props.contentType) { case 'lesson': directContentIdColumn = 'lesson_id'; break; case 'book': directContentIdColumn = 'book_id'; break; case 'study_course': directContentIdColumn = 'study_course_id'; break; } if (!directContentIdColumn) { console.error("Invalid content type", props.contentType); replyError.value = "خطأ داخلي."; isSubmittingReply.value = false; return; } const otherIdColumns = allCols.filter(col => col !== directContentIdColumn);
  const replyData: Partial<Tables<'comments'>> = { user_id: currentUser.value.id, content: newReplyText.value.trim(), parent_comment_id: props.rootCommentId, [directContentIdColumn]: numericContentId.value, }; otherIdColumns.forEach(colName => { replyData[colName] = null; });
  try {
    const { data, error } = await supabase.from('comments').insert(replyData).select(`*, profiles ( id, full_name, avatar_url )`).single();
    if (error) throw error;
    if(data) { emit('reply-added', data as Reply); newReplyText.value = ''; showReplyForm.value = false; } else { throw new Error("Failed to retrieve new reply data."); }
  } catch (error: any) { console.error('Error adding reply (to root):', error); replyError.value = error.message || 'فشل إضافة الرد.'; }
  finally { isSubmittingReply.value = false; }
}

// Methods - Options Menu
function toggleOptionsMenu() { showOptionsMenu.value = !showOptionsMenu.value; }
onClickOutside(optionsMenuRef, (event) => { const toggleButton = optionsMenuRef.value?.previousElementSibling; if (toggleButton && toggleButton.contains(event.target as Node)) return; showOptionsMenu.value = false; });

// Watchers
watch(() => props.reply.content, (newContent) => { if (!isEditing.value) { editableContent.value = newContent; } });
watch(avatarUrl, () => { avatarLoadingError.value = false; });
watch(() => props.reply.id, () => { isEditing.value = false; editableContent.value = props.reply.content; showOptionsMenu.value = false; showReplyForm.value = false; avatarLoadingError.value = false; });

</script>

<style scoped>
.fade-fast-enter-active, .fade-fast-leave-active { transition: opacity 0.1s ease; }
.fade-fast-enter-from, .fade-fast-leave-to { opacity: 0; }
.select-none { user-select: none; }
</style>