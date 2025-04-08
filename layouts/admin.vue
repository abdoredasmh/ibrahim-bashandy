// layouts/admin.vue
<template>
  <div dir="rtl" class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar (اختياري - يمكن إضافة اسم المستخدم، زر الخروج لاحقًا) -->
      <header class="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-6">
        <h1 class="text-lg font-semibold text-gray-800 dark:text-gray-200">لوحة التحكم</h1>
        <!-- يمكنك إضافة عناصر هنا مثل اسم المشرف، زر الخروج -->
         <div>
            <!-- User info placeholder -->
            <span v-if="user" class="text-sm text-gray-600 dark:text-gray-300">{{ user.email }}</span>
         </div>
      </header>

      <!-- Content area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
        <slot /> {/* هنا سيتم عرض محتوى كل صفحة admin */}
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AdminSidebar from '~/components/admin/AdminSidebar.vue'; // استيراد القائمة الجانبية
const user = useSupabaseUser(); // لجلب بيانات المستخدم الحالي (اختياري للهيدر)
</script>

<style scoped>
/* يمكنك إضافة أنماط خاصة بالتخطيط هنا إذا لزم الأمر */
</style>