<!-- pages/admin/study-courses.vue -->
<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200">إدارة الدورات الدراسية</h1>
    <p class="mt-4 text-gray-600 dark:text-gray-400">
      محتوى إدارة الدورات الدراسية سيظهر هنا لاحقًا... (مثل الجدول، زر الإضافة، إلخ)
    </p>
    <!-- يمكنك إضافة محتوى مؤقت آخر هنا للاختبار -->
  </div>
</template>

<script setup lang="ts">
// --- !!! الجزء الأساسي لضمان فتح الصفحة في المكان الصحيح !!! ---
definePageMeta({
  layout: 'admin',     // <-- يحدد استخدام layouts/admin.vue
  middleware: 'admin'  // <-- يطبق وسيط التحقق من صلاحيات المسؤول
});
// --- !!! نهاية الجزء الأساسي !!! ---

// يمكنك استيراد أي شيء آخر تحتاجه هنا لاحقًا
// import { ref, onMounted } from 'vue';
// import type { Database, Tables } from '~/types/database.types';
// import LoadingSpinner from '~/components/LoadingSpinner.vue';
// import StudyCourseModal from '~/components/admin/StudyCourseModal.vue';

// يمكنك إضافة أي حالة أو دوال هنا لاحقًا
// const pending = ref(true);
// ... etc ...

// يمكنك إضافة onMounted هنا لاحقًا
// onMounted(() => {
//   console.log('Study courses page mounted');
// });

// تعيين عنوان للصفحة (اختياري ولكن جيد لـ SEO ولمتصفح المستخدم)
useHead({
  title: 'إدارة الدورات الدراسية - لوحة التحكم'
});

</script>

<style scoped>
/* يمكنك إضافة أي تنسيقات خاصة هنا إذا احتجت */
</style>