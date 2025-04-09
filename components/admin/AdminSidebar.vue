// components/admin/AdminSidebar.vue
<template>
  <aside class="w-64 flex-shrink-0 bg-gray-800 dark:bg-gray-900 text-gray-100 flex flex-col">
    <div class="h-16 flex items-center justify-center px-4 bg-gray-900 dark:bg-gray-950"> 
      <NuxtLink to="/" class="text-xl font-bold text-white hover:opacity-80 transition-opacity">
        موقع الشيخ بشندي
      </NuxtLink>
    </div>
    <nav class="flex-1 px-4 py-6 space-y-2">
      <NuxtLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
        :class="[
          $route.path === item.href
            ? 'bg-gray-700 dark:bg-gray-800 text-white'
            : 'text-gray-300 hover:bg-gray-700/50 dark:hover:bg-gray-700 hover:text-white'
        ]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 me-3" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" :d="item.iconPath" />
        </svg>
        <span>{{ item.name }}</span>
      </NuxtLink>
    </nav>
     
     <div class="px-4 py-4 border-t border-gray-700 dark:border-gray-800">
        <button @click="handleLogout" class="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors duration-150">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 me-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
            </svg>
            <span>تسجيل الخروج</span>
        </button>
     </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSupabaseClient } from '#imports';
import { useRouter } from 'vue-router';

const supabase = useSupabaseClient();
const router = useRouter();

// تعريف عناصر التنقل
const navigation = ref([
  { name: 'لوحة التحكم', href: '/admin', iconPath: 'M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h-1.5m1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0h.513M9 16.5h-.513M9 16.5c0-1.06.317-2.06.87-2.915m5.26 0c.553.855.87 1.855.87 2.915m-6.13 0h6.13' }, // Home icon
  { name: 'إدارة الدروس', href: '/admin/lessons', iconPath: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' }, // Video camera icon (adjusted)
  { name: 'إدارة الكتب', href: '/admin/books', iconPath: 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18.75c1.052 0 2.062.18 3 .512v-1.538c0-.195.07-.376.195-.512l3.305-3.306a.75.75 0 0 1 .512-.195h1.538c.195 0 .376.07.512.195l3.306 3.306c.125.125.195.317.195.512v1.538a8.967 8.967 0 0 0 3-.512V4.262a8.967 8.967 0 0 0-3-.512c-1.052 0-2.062.18-3 .512v1.538a.75.75 0 0 1-.512.195h-1.538a.75.75 0 0 1-.512-.195l-3.306-3.306a.75.75 0 0 1-.195-.512V6.042Z' }, // Book open icon
  { name: 'إدارة الدورات', href: '/admin/study-courses', iconPath: 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z' }, // Academic cap icon (placeholder)
  { name: 'اسأل الشيخ', href: '/admin/ask-sheikh', iconPath: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.364.466.027.934.028 1.401.028 1.257 0 2.513-.099 3.746-.282.798-.12 1.467-.766 1.467-1.585 0-.764-.484-1.415-1.2-1.614a2.768 2.768 0 0 0-1.337-.316 1.5 1.5 0 0 1-1.5-1.5V8.642c0-1.33.938-2.47 2.224-2.69a4.584 4.584 0 0 1 2.27.168c.94.34 1.554 1.214 1.554 2.205 0 1.33-.938 2.47-2.224 2.69a4.584 4.584 0 0 1-2.27.168 1.5 1.5 0 0 1-1.5 1.5v.634m-7.82-3.634c.466.027.934.028 1.401.028 1.257 0 2.513-.099 3.746-.282a1.51 1.51 0 0 0 1.467-1.585 1.51 1.51 0 0 0-1.467-1.585 4.63 4.63 0 0 0-3.746-.282c-.467.027-.934.028-1.401.028a4.603 4.603 0 0 0-2.56 0 1.51 1.51 0 0 0-1.467 1.585 1.51 1.51 0 0 0 1.467 1.585c.51.08 1.03.148 1.56.199Z' }, // Question mark circle icon
  { name: 'إدارة المستخدمين', href: '/admin/users', iconPath: 'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm-2.25 3.188c.596.044 1.17.044 1.756 0l-2.982 4.163a3.375 3.375 0 0 1-3.268 0l-2.982-4.163c.586-.044 1.16-.044 1.756 0Z' }, // Users icon
  // أضف روابط أخرى هنا مثل التعليقات، الاختبارات، الإعدادات لاحقًا
]);

// دالة تسجيل الخروج
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  } else {
    // توجيه المستخدم لصفحة تسجيل الدخول بعد الخروج
    router.push('/login');
  }
};
</script>

<style scoped>
/* تخصيص الـ scrollbar إذا أردت */
nav::-webkit-scrollbar {
  width: 6px;
}
nav::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
nav::-webkit-scrollbar-track {
  background: transparent;
}
</style>