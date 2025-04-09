<!-- components/admin/AdminSidebar.vue -->
<template>
  <aside class="w-64 flex-shrink-0 bg-gray-800 dark:bg-gray-900 text-gray-100 flex flex-col">
    <div class="h-16 flex items-center justify-center px-4 bg-gray-900 dark:bg-gray-950">
      <NuxtLink to="/" class="text-xl font-bold text-white hover:opacity-80 transition-opacity">
        موقع الشيخ بشندي
      </NuxtLink>
    </div>
    <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto"> <!-- Added overflow-y-auto -->
      <NuxtLink
        v-for="item in navigation"
        :key="item.name"
        :to="item.href"
        class="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
        :class="[
          isLinkActive(item.href) // استخدام دالة التحقق من النشاط
            ? 'bg-gray-700 dark:bg-gray-800 text-white'
            : 'text-gray-300 hover:bg-gray-700/50 dark:hover:bg-gray-700 hover:text-white'
        ]"
      >
        <!-- استخدام v-html لتقديم أيقونات SVG إذا كانت بسيطة، أو مكون Icon إذا كان معقدًا -->
        <span v-html="item.iconSvg" class="w-5 h-5 me-3 flex-shrink-0" aria-hidden="true"></span>
        <span>{{ item.name }}</span>
      </NuxtLink>
    </nav>

     <div class="px-4 py-4 border-t border-gray-700 dark:border-gray-800">
        <button @click="handleLogout" class="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors duration-150">
            <!-- أيقونة تسجيل الخروج -->
             <span v-html="logoutIcon" class="w-5 h-5 me-3 flex-shrink-0" aria-hidden="true"></span>
            <span>تسجيل الخروج</span>
        </button>
     </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSupabaseClient } from '#imports';
import { useRouter, useRoute } from 'vue-router'; // استيراد useRoute

const supabase = useSupabaseClient();
const router = useRouter();
const route = useRoute(); // الحصول على المسار الحالي

// دالة للتحقق مما إذا كان الرابط نشطًا (تطابق تام أو بداية المسار)
const isLinkActive = (href: string) => {
    // تطابق تام أو إذا كان المسار الحالي يبدأ بمسار الرابط (مفيد للأقسام الفرعية)
    return route.path === href || (href !== '/admin' && route.path.startsWith(href));
};


// --- تعريف أيقونات SVG كسلاسل نصية ---
// (استبدل هذه بأيقونات SVG الفعلية التي تفضلها من Heroicons أو غيرها)
const homeIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>`;
const lessonsIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" /></svg>`;
const booksIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18.75c1.052 0 2.062.18 3 .512V12.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v6.012c.938-.332 1.95-.512 3-.512a8.987 8.987 0 0 1 3 1.5V4.262a8.967 8.967 0 0 0-3-.512c-1.052 0-2.062.18-3 .512v1.538a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1-.75-.75V6.042Z" /></svg>`;
const coursesIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>`; // أيقونة تخرج أو شهادة
const categoriesIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>`; // أيقونة تصنيفات
const askSheikhIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>`;
const usersIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm-2.25 3.188a3.75 3.75 0 0 0-1.756.044l-2.982 4.163a3.375 3.375 0 0 0 3.268 0l2.982-4.163a3.75 3.75 0 0 0-1.756-.044Z" /></svg>`;
const logoutIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>`;
// --- نهاية تعريف الأيقونات ---


// تعريف عناصر التنقل مع الأيقونات الجديدة والروابط المحدثة
const navigation = ref([
  { name: 'لوحة التحكم', href: '/admin', iconSvg: homeIcon },
  { name: 'إدارة الدروس', href: '/admin/lessons', iconSvg: lessonsIcon },
  { name: 'إدارة الكتب', href: '/admin/books', iconSvg: booksIcon },
  { name: 'إدارة الفئات', href: '/admin/categories', iconSvg: categoriesIcon }, // <-- رابط الفئات
  { name: 'إدارة الدورات', href: '/admin/study-courses', iconSvg: coursesIcon }, // <-- رابط الدورات
  { name: 'اسأل الشيخ', href: '/admin/ask-sheikh', iconSvg: askSheikhIcon },
  { name: 'إدارة المستخدمين', href: '/admin/users', iconSvg: usersIcon },
  // يمكنك إضافة روابط أخرى هنا (تعليقات، اختبارات، إعدادات...)
]);

// دالة تسجيل الخروج (كما هي)
const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  } else {
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
  background-color: rgba(156, 163, 175, 0.4); /* لون أفتح قليلاً */
  border-radius: 3px;
}
nav:hover::-webkit-scrollbar-thumb {
   background-color: rgba(156, 163, 175, 0.6); /* أغمق عند التحويم */
}
nav::-webkit-scrollbar-track {
  background: transparent;
}
</style>