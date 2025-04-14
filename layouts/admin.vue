<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
    <!-- Sidebar -->
    <AdminSidebar v-model:isOpenOnMobile="isSidebarOpen" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Admin Header (Example) -->
      <header class="bg-white dark:bg-gray-800 shadow-md h-16 flex items-center justify-between px-6 flex-shrink-0">
         <!-- Left side (e.g., Title) -->
         <div><!-- Page Title or Breadcrumbs --></div>

         <!-- Right side (e.g., Mobile Menu Button, User Dropdown) -->
         <div class="flex items-center gap-4">
            <!-- Other header items -->

            <!-- Mobile Menu Button -->
            <button @click="isSidebarOpen = !isSidebarOpen" class="md:hidden text-gray-500 dark:text-gray-400 focus:outline-none">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
               <span class="sr-only">فتح القائمة</span>
            </button>
         </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
        <slot /> {/* Page content will be injected here */}
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminSidebar from '~/components/admin/AdminSidebar.vue'; // Import the sidebar

const isSidebarOpen = ref(false); // State for mobile sidebar visibility
</script>

<style>
/* Optional: Add global admin layout styles */
</style>