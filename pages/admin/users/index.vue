<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">إدارة المستخدمين</h1>

    <!-- Filters and Search -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 flex flex-wrap items-center gap-4 sticky top-0 z-10"> 
      <!-- Search -->
      <div class="flex-grow min-w-[250px] relative">
        <label for="user-search" class="sr-only">بحث</label>
        <input
          id="user-search"
          type="text"
          v-model="searchTerm"
          @input="handleSearchInput"
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-8"
        />
         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 text-gray-400"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg></div>
        <button v-if="searchTerm" @click="clearSearch" :disabled="pending" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 z-10"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 1.06L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.78Z" clip-rule="evenodd" /></svg></button>
      </div>
      <!-- Filter by Role -->
      <div><select id="role-filter" v-model="filterRole" :disabled="pending" class="rounded-md ..."><option value="all">كل الأدوار</option><option value="user">مستخدم</option><option value="admin">مشرف</option></select></div>
      <!-- Filter by Status -->
      <div><select id="status-filter" v-model="filterStatus" :disabled="pending" class="rounded-md ..."><option value="all">كل الحالات</option><option value="active">نشط</option><option value="banned">محظور</option><option value="suspended">تعليق موقوف</option></select></div>
       <!-- Refresh Button -->
       <button @click="refreshUsers" :disabled="pending" title="تحديث القائمة" class="p-2 ..."><svg :class="['w-4 h-4', pending ? 'animate-spin' : '']">...</svg></button>
    </div>

    <!-- Error State -->
     <div v-if="fetchError" class="my-4 p-3 bg-red-100 ..."> خطأ! {{ fetchError.message }}</div>

    <!-- Users Table/List -->
    <div class="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-right ...">المستخدم</th>
            <th scope="col" class="px-6 py-3 text-right ... hidden sm:table-cell">الدور</th> 
            <th scope="col" class="px-6 py-3 text-right ... hidden md:table-cell">الحالة</th> 
            <th scope="col" class="px-6 py-3 text-right ... hidden lg:table-cell">تاريخ الانضمام</th> 
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">عرض التفاصيل</span></th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-if="pending && users.length === 0">
             <td colspan="5" class="text-center py-10"><LoadingSpinner /></td>
          </tr>
          <tr v-else-if="!pending && users.length === 0">
             <td colspan="5" class="text-center py-10 text-gray-500">لا يوجد مستخدمون يطابقون بحثك أو الفلاتر.</td>
          </tr>
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">
          
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10"><UserAvatar :src="user.avatar_url || undefined" :alt="user.full_name || 'مستخدم'" size="md" /></div>
                <div class="mr-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user.full_name || 'لم يحدد اسم' }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.auth_email || 'لا يوجد بريد' }}</div>
             
                    <div class="sm:hidden mt-1 flex items-center gap-2 text-xs">
                         <span :class="['px-1.5 py-0.5 rounded-full', user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300']">{{ user.role }}</span>
                          <span v-if="user.is_banned" class="px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">محظور</span>
                          <span v-else-if="isCommentSuspended(user.comment_suspended_until)" class="px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">موقوف</span>
                    </div>
                </div>
              </div>
            </td>
           
            <td class="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
               <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300']">
                   {{ user.role === 'admin' ? 'مشرف' : 'مستخدم' }}
               </span>
            </td>
          
            <td class="px-6 py-4 whitespace-nowrap hidden md:table-cell">
              <span v-if="user.is_banned" class="px-2 ... bg-red-100 ...">محظور</span>
              <span v-else-if="isCommentSuspended(user.comment_suspended_until)" class="px-2 ... bg-yellow-100 ...">تعليق موقوف</span>
              <span v-else class="px-2 ... bg-green-100 ...">نشط</span>
            </td>
           
             <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                {{ formatDate(user.created_at) }}
             </td>
       
            <td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium rtl:text-right">
                <NuxtLink :to="`/admin/users/${user.id}`" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 group flex items-center gap-1">
                    <span>التفاصيل</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px]"><path fill-rule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" /></svg>
                </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Infinite Scroll Loader/Trigger -->
    <div ref="loadMoreTrigger" class="h-20 flex items-center justify-center">
       <div v-if="pendingMore" class="text-center">
           <LoadingSpinner />
           <p class="text-sm text-gray-500 mt-1">تحميل المزيد...</p>
       </div>
        <div v-else-if="!pending && users.length > 0 && !hasMore" class="text-sm text-gray-500">
           لا يوجد المزيد من المستخدمين.
       </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import type { Database, Tables, Enums } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import UserAvatar from '~/components/UserAvatar.vue';
// Remove modal imports for now
// import SendMessageModal from '~/components/admin/SendMessageModal.vue';
// import SuspendCommentModal from '~/components/admin/SuspendCommentModal.vue';
// import ConfirmationModal, { type ConfirmationConfig } from '~/components/admin/ConfirmationModal.vue';
import { useSupabaseClient, definePageMeta, useNuxtApp } from '#imports';
import type { PostgrestError, User } from '@supabase/supabase-js';
import { useIntersectionObserver } from '@vueuse/core'; // Import for infinite scroll

// --- Constants ---
const ADMIN_PAGE_SIZE = 30; // Increase page size for infinite scroll
const SEARCH_DEBOUNCE_MS = 400;

// --- Define Types ---
type AdminUserView = Tables<'profiles'> & {
  auth_email?: string | null;
};

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const { $toast } = useNuxtApp();

// --- State ---
const pending = ref(true);        // Overall loading state (initial load or filter change)
const pendingMore = ref(false);   // Loading state for fetching next page (infinite scroll)
const fetchError = ref<PostgrestError | null>(null);
const users = ref<AdminUserView[]>([]); // Initialize as empty array
const currentPage = ref(1);
const pageSize = ref(ADMIN_PAGE_SIZE);
const hasMore = ref(true);        // Flag to indicate if more users might exist
const searchTerm = ref('');
const filterRole = ref<'all' | 'user' | 'admin'>('all');
const filterStatus = ref<'all' | 'active' | 'banned' | 'suspended'>('all');
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
// Remove action/modal related state for this page
// const isLoadingAction = ref<string | null>(null);
// const actionMessage = ref<string | null>(null);
// const actionMessageType = ref<'success' | 'error'>('success');
// const activeActionsMenu = ref<string | null>(null);
// const showSendMessageModal = ref(false);
// const showSuspendModal = ref(false);
// const showConfirmModal = ref(false);
// const selectedUserForModal = ref<AdminUserView | null>(null);
// const confirmConfig = ref<ConfirmationConfig | null>(null);
// let actionToConfirm: { type: 'ban' | 'unban' | 'unsuspend', user: AdminUserView } | null = null;

// --- Infinite Scroll Trigger Ref ---
const loadMoreTrigger = ref<HTMLElement | null>(null);


// --- Functions ---

const handleSearchInput = () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    refreshUsers(); // Trigger a full refresh (reset to page 1)
  }, SEARCH_DEBOUNCE_MS);
};

const clearSearch = () => {
    searchTerm.value = '';
    // Watcher will trigger refresh
};

/** Fetch users, supporting pagination for infinite scroll */
const fetchUsers = async (page = 1, appending = false) => {
  if (appending) {
      pendingMore.value = true; // Show loading more indicator
  } else {
      pending.value = true; // Show main loading indicator
      users.value = []; // Clear existing users on a full refresh
      currentPage.value = 1;
      hasMore.value = true; // Assume there's more when refreshing
  }
  fetchError.value = null;
  // clearActionMessage(); // No actions on this page anymore

  const rangeFrom = (page - 1) * pageSize.value;
  const rangeTo = rangeFrom + pageSize.value - 1;

  try {
    // --- Build Base Query ---
    let baseQuery = supabase
      .from('profiles')
      .select(`*`) // Assuming created_at exists in profiles
      .order('created_at', { ascending: false });

    // --- Apply Filters ---
    if (filterRole.value !== 'all') { baseQuery = baseQuery.eq('role', filterRole.value); }
    const trimmedSearch = searchTerm.value.trim();
    if (trimmedSearch) { baseQuery = baseQuery.ilike('full_name', `%${trimmedSearch}%`); } // Basic search on name
    if (filterStatus.value !== 'all') {
        if (filterStatus.value === 'banned') { baseQuery = baseQuery.eq('is_banned', true); }
        else if (filterStatus.value === 'suspended') { baseQuery = baseQuery.gt('comment_suspended_until', new Date().toISOString()); }
        else if (filterStatus.value === 'active') { baseQuery = baseQuery.eq('is_banned', false).or(`comment_suspended_until.is.null,comment_suspended_until.lte.${new Date().toISOString()}`); }
    }

    // --- Execute Data Query ---
    const { data: profilesData, error: profilesError } = await baseQuery
      .range(rangeFrom, rangeTo);

    if (profilesError) throw profilesError;

    // --- Fetch Auth Emails (Optional) ---
     const userIds = profilesData?.map(p => p.id) ?? [];
     let authUsersMap = new Map<string, Pick<User, 'email'>>(); // Only need email now
     if (userIds.length > 0) {
         try {
            const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
            if (authError) throw authError;
            if (authData?.users) {
                const relevantUsers = authData.users.filter(u => userIds.includes(u.id));
                relevantUsers.forEach(u => authUsersMap.set(u.id, { email: u.email }));
            }
         } catch (authErr: any) { console.warn("Could not fetch auth user emails:", authErr.message); }
     }

     // --- Combine and Append/Set Data ---
     const fetchedUsers = profilesData?.map(profile => ({
         ...profile,
         auth_email: authUsersMap.get(profile.id)?.email ?? null,
     })) ?? [];

    if (appending) {
      users.value.push(...fetchedUsers); // Append new users
    } else {
      users.value = fetchedUsers; // Replace users on full refresh
    }

    // Update hasMore flag
    hasMore.value = fetchedUsers.length === pageSize.value;
    if (hasMore.value) {
        currentPage.value = page + 1; // Prepare for the next page fetch
    }


  } catch (err: any) {
    console.error("Error fetching users:", err);
    fetchError.value = err as PostgrestError;
    if (!appending) { // Clear users only if it was a full refresh error
        users.value = [];
    }
    hasMore.value = false; // Stop fetching on error
  } finally {
    pending.value = false;
    pendingMore.value = false;
  }
};

/** Trigger a full refresh (reset to page 1) */
const refreshUsers = () => {
    fetchUsers(1, false);
};

/** Load next page for infinite scroll */
const loadMore = () => {
    if (!pending.value && !pendingMore.value && hasMore.value) {
        fetchUsers(currentPage.value, true);
    }
};

// --- Intersection Observer for Infinite Scroll ---
useIntersectionObserver(
  loadMoreTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      loadMore();
    }
  },
  { threshold: 0.1 } // Trigger when 10% of the element is visible
);

// --- Helper Functions ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'غير محدد';
  try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'تاريخ غير صالح'; return date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }); }
  catch (e) { return 'خطأ تنسيق'; }
};

const isCommentSuspended = (suspendedUntil: string | null | undefined): boolean => {
    if (!suspendedUntil) return false;
    try { return new Date(suspendedUntil) > new Date(); } catch { return false; }
};

// Remove action/modal related functions as they moved to detail page
// const updateUserRole = ...
// const toggleBanStatus = ...
// const handleUserSuspended = ...
// const removeCommentSuspension = ...
// const openSendMessageModal = ...
// const openSuspendModal = ...
// const handleMessageSent = ...
// const confirmAction = ...
// const executeConfirmedAction = ...
// const toggleActions = ...
// const handleClickOutside = ...


// --- Watchers ---
// Watch filters and search term to trigger a refresh
watch([filterRole, filterStatus, searchTerm], () => {
    refreshUsers();
});

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchUsers(1); // Fetch initial data
  // Remove click outside listener for actions menu
});

onBeforeUnmount(() => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
});

</script>

<style scoped>
/* Add styles for responsiveness */
@media (max-width: 640px) { /* sm */
  .hidden-sm { display: none; }
}
@media (max-width: 768px) { /* md */
  .hidden-md { display: none; }
}
@media (max-width: 1024px) { /* lg */
  .hidden-lg { display: none; }
}


</style>