// pages/admin/index.vue
<template>
  <div>
    <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">لوحة التحكم الرئيسية</h2>
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <p class="text-gray-700 dark:text-gray-300">
        مرحباً بك في لوحة التحكم. يمكنك من هنا إدارة محتوى الموقع والمستخدمين.
      </p>
      <p class="mt-4 text-gray-700 dark:text-gray-300">
        استخدم القائمة الجانبية للتنقل بين الأقسام المختلفة.
      </p>
      <!-- لاحقًا: يمكن إضافة إحصائيات هنا -->
    </div>
  </div>
</template>

<script setup lang="ts">
// تطبيق التخطيط والحماية
definePageMeta({
  layout: 'admin', // استخدام تخطيط لوحة التحكم
  middleware: 'admin' // تطبيق حارس المسار للتحقق من دور المشرف
});

// SEO بسيط للوحة التحكم
useHead({
  title: 'لوحة التحكم الرئيسية'
});
</script>