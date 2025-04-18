<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">إدارة المستخدمين</h1>

    <!-- Filters and Search -->
    <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 flex flex-wrap items-center gap-4 sticky top-[--header-height] z-10 shadow-sm">
      <!-- Search -->
      <div class="flex-grow min-w-[250px] relative">
        <label for="user-search" class="sr-only">بحث</label>
        <input
          id="user-search"
          type="text"
          v-model="searchTerm"
          @input="handleSearchInput"
          placeholder="ابحث بالاسم أو البريد الإلكتروني..."
          :disabled="pending || pendingMore"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-8 pr-8"
        />
         <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 text-gray-400"><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" /></svg></div>
        <button v-if="searchTerm" @click="clearSearch" :disabled="pending || pendingMore" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 z-10"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 1.06L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.78Z" clip-rule="evenodd" /></svg></button>
      </div>
      <!-- Filter by Role -->
      <div class="flex-shrink-0">
          <label for="role-filter" class="sr-only">الدور</label>
          <select id="role-filter" v-model="filterRole" :disabled="pending || pendingMore" class="form-select">
            <option value="all">كل الأدوار</option>
            <option value="user">مستخدم</option>
            <option value="admin">مشرف</option>
          </select>
      </div>
      <!-- Filter by Status -->
      <div class="flex-shrink-0">
          <label for="status-filter" class="sr-only">الحالة</label>
          <select id="status-filter" v-model="filterStatus" :disabled="pending || pendingMore" class="form-select">
            <option value="all">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="banned">محظور</option>
            <option value="suspended">تعليق موقوف</option>
          </select>
      </div>
       <!-- Refresh Button -->
       <button @click="refreshUsers" :disabled="pending || pendingMore" title="تحديث القائمة" class="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 flex-shrink-0">
           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" :class="['w-4 h-4', (pending || pendingMore) ? 'animate-spin' : '']">
                <path fill-rule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0V4.813a6.5 6.5 0 1 0-1.685 8.343.75.75 0 0 1-1.22-.83A5 5 0 1 1 13.5 7.25h-2.75a.75.75 0 0 1 0-1.5h3.086Z" clip-rule="evenodd" />
            </svg>
       </button>
    </div>

    <!-- Error State -->
     <div v-if="fetchError" class="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
        <strong class="font-bold">خطأ!</strong>
        <span class="block sm:inline"> {{ fetchError.message }}</span>
     </div>

    <!-- Users Table/List -->
    <div class="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" class="table-header">المستخدم</th>
            <th scope="col" class="table-header hidden sm:table-cell">الدور</th>
            <th scope="col" class="table-header hidden md:table-cell">الحالة</th>
            <th scope="col" class="table-header hidden lg:table-cell">تاريخ الانضمام</th>
            <th scope="col" class="relative px-6 py-3"><span class="sr-only">عرض التفاصيل</span></th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Initial Loading State -->
          <tr v-if="pending && users.length === 0">
             <td colspan="5" class="table-cell text-center py-10">
                <LoadingSpinner />
                <p class="text-sm text-gray-500 mt-1">جارٍ تحميل المستخدمين...</p>
            </td>
          </tr>
          <!-- Empty State (after loading, no results) -->
          <tr v-else-if="!pending && users.length === 0 && !fetchError">
             <td colspan="5" class="table-cell text-center py-10 text-gray-500">لا يوجد مستخدمون يطابقون بحثك أو الفلاتر المحددة.</td>
          </tr>
          <!-- Data Rows -->
          <tr v-for="profile in users" :key="profile.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50">

            <td class="table-cell">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10"><UserAvatar :src="profile.avatar_url || undefined" :alt="profile.full_name || 'مستخدم'" size="md" /></div>
                <div class="mr-4">
                  <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ profile.full_name || 'لم يحدد اسم' }}</div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ profile.email || 'لا يوجد بريد' }}</div>

                    <div class="sm:hidden mt-1 flex items-center gap-2 text-xs">
                         <span :class="['status-badge', getRoleClass(profile.role)]">{{ profile.role === 'admin' ? 'مشرف' : 'مستخدم' }}</span>
                          <span v-if="profile.is_banned" class="status-badge bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">محظور</span>
                          <span v-else-if="isCommentSuspended(profile.comment_suspended_until)" class="status-badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">موقوف</span>
                          <span v-else class="status-badge bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">نشط</span>
                    </div>
                </div>
              </div>
            </td>

            <td class="table-cell hidden sm:table-cell">
               <span :class="['status-badge', getRoleClass(profile.role)]">
                   {{ profile.role === 'admin' ? 'مشرف' : 'مستخدم' }}
               </span>
            </td>

            <td class="table-cell hidden md:table-cell">
              <span v-if="profile.is_banned" class="status-badge bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">محظور</span>
              <span v-else-if="isCommentSuspended(profile.comment_suspended_until)" class="status-badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">تعليق موقوف</span>
              <span v-else class="status-badge bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">نشط</span>
            </td>

             <td class="table-cell hidden lg:table-cell text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(profile.created_at) }}
             </td>

            <td class="table-cell text-left text-sm font-medium rtl:text-right">
                <NuxtLink :to="`/admin/users/${profile.id}`" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 group inline-flex items-center gap-1">
                    <span>التفاصيل</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px]"><path fill-rule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" /></svg>
                </NuxtLink>
            </td>
          </tr>
          <!-- Row for loading more indicator within the table -->
           <tr v-if="pendingMore">
               <td colspan="5" class="text-center py-4">
                   <LoadingSpinner class="inline-block w-5 h-5" />
                   <span class="text-sm text-gray-500 ml-2">تحميل المزيد...</span>
               </td>
           </tr>
        </tbody>
      </table>
    </div>

    <!-- Infinite Scroll Trigger (Element remains but observer is commented out) -->
    <div ref="loadMoreTrigger" class="h-1"></div>
     <!-- Message indicating end of list (optional) -->
     <div v-if="!pending && !pendingMore && users.length > 0 && !hasMore" class="text-center text-sm text-gray-500 py-4">
         لا يوجد المزيد من المستخدمين لعرضهم.
     </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import type { Database, Tables, Enums } from '~/types/database.types';
import LoadingSpinner from '~/components/LoadingSpinner.vue';
import UserAvatar from '~/components/UserAvatar.vue';
import { useSupabaseClient, definePageMeta, useNuxtApp } from '#imports';
import type { PostgrestError } from '@supabase/supabase-js';
// Comment out IntersectionObserver import if not used
// import { useIntersectionObserver } from '@vueuse/core';

// --- Constants ---
const ADMIN_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 500;

// --- Define Types ---
type AdminUserProfile = Pick<
    Tables<'profiles'>,
    'id' | 'full_name' | 'email' | 'avatar_url' | 'role' | 'is_banned' | 'comment_suspended_until' | 'created_at'
>;

// --- Page Meta ---
definePageMeta({ layout: 'admin', middleware: 'admin' });

// --- Composables ---
const supabase = useSupabaseClient<Database>();
const { $toast } = useNuxtApp();

// --- State ---
const pending = ref(true);        // Initial load state
const pendingMore = ref(false);   // Loading more state
const fetchError = ref<PostgrestError | null>(null);
const users = ref<AdminUserProfile[]>([]);
const currentPage = ref(1);
const pageSize = ref(ADMIN_PAGE_SIZE);
const hasMore = ref(true);
const searchTerm = ref('');
const filterRole = ref<'all' | 'user' | 'admin'>('all');
const filterStatus = ref<'all' | 'active' | 'banned' | 'suspended'>('all');
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// --- Infinite Scroll Trigger Ref ---
const loadMoreTrigger = ref<HTMLElement | null>(null);
// --- Observer instance (kept null for now) ---
let observer: ReturnType<typeof useIntersectionObserver> | null = null;


// --- Functions ---

const handleSearchInput = () => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    // Don't refresh if a fetch is already in progress
    if (!pending.value && !pendingMore.value) {
        refreshUsers();
    }
  }, SEARCH_DEBOUNCE_MS);
};

const clearSearch = () => {
    if (searchTerm.value === '') return;
    searchTerm.value = '';
    // Watcher will trigger refresh if not loading
};

/** Fetch users, supporting pagination and filtering */
const fetchUsers = async (page = 1, appending = false) => {
  // Prevent concurrent fetches
  if ((appending && pendingMore.value) || (!appending && pending.value)) {
    console.log("Fetch prevented: Already fetching.");
    return;
  }

  console.log(`fetchUsers called - page: ${page}, appending: ${appending}`); // Log call

  if (appending) {
      pendingMore.value = true;
  } else {
      pending.value = true;
      // Only clear users if it's a *new* initial fetch (page 1 and not appending)
      if (page === 1 && !appending) {
          users.value = [];
      }
      currentPage.value = 1; // Reset page number for new searches/filters
      hasMore.value = true; // Assume more initially
  }
  fetchError.value = null;

  const rangeFrom = (page - 1) * pageSize.value;
  const rangeTo = rangeFrom + pageSize.value - 1;
  console.log(`Fetching range: ${rangeFrom} to ${rangeTo}`); // Log range

  try {
    let baseQuery = supabase
      .from('profiles')
      .select(`id, full_name, email, avatar_url, role, is_banned, comment_suspended_until, created_at`)
      .order('created_at', { ascending: false });

    if (filterRole.value !== 'all') { baseQuery = baseQuery.eq('role', filterRole.value); }
    const trimmedSearch = searchTerm.value.trim();
    if (trimmedSearch) {
        // Search in full_name and email (if exists and indexed)
        baseQuery = baseQuery.or(`full_name.ilike.%${trimmedSearch}%,email.ilike.%${trimmedSearch}%`);
    }
    if (filterStatus.value !== 'all') {
        if (filterStatus.value === 'banned') { baseQuery = baseQuery.eq('is_banned', true); }
        else if (filterStatus.value === 'suspended') { baseQuery = baseQuery.gt('comment_suspended_until', new Date().toISOString()); }
        else if (filterStatus.value === 'active') {
            baseQuery = baseQuery.eq('is_banned', false).or(`comment_suspended_until.is.null,comment_suspended_until.lte.${new Date().toISOString()}`);
        }
    }

    console.time(`fetchUsers query page ${page}`);
    const { data: fetchedUsersData, error: fetchErr } = await baseQuery
      .range(rangeFrom, rangeTo);
    console.timeEnd(`fetchUsers query page ${page}`);

    console.log('Fetched Data:', fetchedUsersData); // Log actual data
    console.log('Fetch Error:', fetchErr);       // Log error object

    if (fetchErr) throw fetchErr;

    const usersToAdd = fetchedUsersData || [];

    if (appending) {
      users.value.push(...usersToAdd);
       console.log(`Appended ${usersToAdd.length} users. Total: ${users.value.length}`);
    } else {
      users.value = usersToAdd;
       console.log(`Set ${usersToAdd.length} users.`);
    }

    hasMore.value = usersToAdd.length === pageSize.value;
    console.log(`Has More: ${hasMore.value}`);
    if (hasMore.value) {
        // Set current page to the *next* page number we expect to fetch
        currentPage.value = page + 1;
    }


  } catch (err: any) {
    console.error("Error fetching users:", err);
    fetchError.value = err as PostgrestError;
    if (!appending) { users.value = []; }
    hasMore.value = false;
  } finally {
    pending.value = false;
    pendingMore.value = false;
    console.log(`Fetch finished. Pending: ${pending.value}, PendingMore: ${pendingMore.value}`);
  }
};

/** Trigger a full refresh (reset to page 1) */
const refreshUsers = () => {
    console.log("refreshUsers called.");
    // Don't refresh if already loading
    if (!pending.value && !pendingMore.value) {
        fetchUsers(1, false);
    } else {
        console.log("Refresh prevented: Fetch in progress.");
    }
};

/** Load next page for infinite scroll */
const loadMore = () => {
    console.log(`loadMore called. Conditions: pending=${pending.value}, pendingMore=${pendingMore.value}, hasMore=${hasMore.value}`);
    if (!pending.value && !pendingMore.value && hasMore.value) {
        console.log(`Executing fetchUsers for page ${currentPage.value}`);
        fetchUsers(currentPage.value, true);
    } else {
         console.log("loadMore skipped due to conditions.");
    }
};

// --- Intersection Observer Setup (Currently Commented Out) ---
const setupObserver = () => {
    // Ensure previous observer is stopped if re-initializing
    if (observer) observer.stop();

    if (loadMoreTrigger.value) {
        observer = useIntersectionObserver(
            loadMoreTrigger,
            ([{ isIntersecting }]) => {
                if (isIntersecting) {
                    console.log("Load more trigger intersecting...");
                    loadMore();
                }
            },
            { threshold: 0.1 } // Adjust threshold if needed
        );
         console.log("Intersection Observer initialized.");
    } else {
        console.warn("Load more trigger element not found for Intersection Observer.");
    }
};

// --- Helper Functions ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'غير محدد';
  try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'تاريخ غير صالح'; return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch (e) { return 'خطأ تنسيق'; }
};

const isCommentSuspended = (suspendedUntil: string | null | undefined): boolean => {
    if (!suspendedUntil) return false;
    try { return new Date(suspendedUntil) > new Date(); } catch { return false; }
};

const getRoleClass = (role: string | null | undefined): string => {
    if (role === 'admin') return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
}

// --- Watchers ---
// Watch filters to trigger a refresh (reset to page 1)
watch([filterRole, filterStatus], () => {
    console.log("Filters changed, triggering refresh.");
    refreshUsers();
}, { deep: true });
// Watch searchTerm is handled by handleSearchInput debounce

// --- Lifecycle Hooks ---
onMounted(() => {
  console.log("Component mounted. Fetching initial users...");
  fetchUsers(1); // Fetch initial data
  // --- Intersection Observer is commented out for testing ---
  // setTimeout(setupObserver, 500); // Delay observer setup slightly
});

onBeforeUnmount(() => {
  console.log("Component unmounting. Cleaning up...");
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  // Disconnect the observer if it was initialized
  if (observer) {
    console.log("Stopping Intersection Observer.");
    observer.stop();
  }
});

</script>

<style scoped>
/* Base styles for table elements */
.table-header {
    @apply px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider;
}
.table-cell {
    @apply px-6 py-4 whitespace-nowrap;
}
.status-badge {
    @apply px-2 inline-flex text-xs leading-5 font-semibold rounded-full;
}
/* Styles for form elements */
.form-select {
     @apply text-sm rounded-md border-gray-300 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-70;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 3px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.8); }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

/* Responsive hiding classes */
@media (max-width: 640px) { /* sm */
  .sm\:hidden { display: none; }
  .sm\:table-cell { display: table-cell; }
}
@media (max-width: 768px) { /* md */
  .md\:hidden { display: none; }
  .md\:table-cell { display: table-cell; }
}
@media (max-width: 1024px) { /* lg */
  .lg\:hidden { display: none; }
  .lg\:table-cell { display: table-cell; }
}

/* Sticky Header Adjustment - Replace with your actual header height */
:root {
  --header-height: 4rem; /* Example value */
}
.sticky {
    /* Ensure position and top are correctly applied */
    position: sticky;
    top: var(--header-height);
}

</style>