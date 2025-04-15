<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans">
    <!-- Sidebar -->
    <AdminSidebar v-model:isOpenOnMobile="isSidebarOpen" />

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Admin Header -->
      <header class="bg-white dark:bg-gray-800 shadow-md h-16 flex items-center justify-between px-6 flex-shrink-0">
         <!-- Left side: Mobile Menu & Title -->
         <div class="flex items-center gap-4">
             <!-- Mobile Menu Button -->
             <button @click="isSidebarOpen = !isSidebarOpen" class="md:hidden ..."> ... </button>
             <!-- Page Title (Maybe dynamic based on route) -->
             <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">لوحة التحكم</h2>
         </div>

         <!-- Right side: View Site Link & User Dropdown -->
         <div class="flex items-center gap-4">
            
            <NuxtLink
                to="/"
              
                class="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="فتح الموقع الرئيسي في تبويب جديد"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"><path d="M6.75 1.75a.75.75 0 0 0 0 1.5h1.435L3.11 8.327a.75.75 0 0 0 1.06 1.061l5.076-5.075V5.75a.75.75 0 0 0 1.5 0V1.75H6.75Z" /><path d="M2.013 1.99a.75.75 0 0 0-.747.868l.016.102-.015.001H1.25C.56 3 .001 3.56.001 4.25v7.5C.001 12.44.56 13 1.25 13H9c.69 0 1.249-.56 1.249-1.25V9.76l.007-.015.103-.016a.75.75 0 0 0 .868-.746l.001-.015V8.75a.75.75 0 0 0-1.5 0v.19l-1.03.002-.03-.001-.005.001a1.74 1.74 0 0 0-1.465-.906H6.5A1.75 1.75 0 0 0 4.75 10v1H2.75a.75.75 0 0 1 0-1.5H4V6H2.75a.75.75 0 0 1 0-1.5H4V4H2.013l-.001-.01Z" /></svg>
                 <span class="hidden sm:inline">عرض الموقع</span> 
            </NuxtLink>
          

             <!-- User Dropdown or other items -->
             <div><!-- User Menu --></div>
         </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminSidebar from '~/components/admin/AdminSidebar.vue';

const isSidebarOpen = ref(false);
</script>