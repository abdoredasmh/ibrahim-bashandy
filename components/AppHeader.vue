<template>
  <header class="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
    <nav class="container mx-auto px-4 py-5 flex items-center justify-between">
      <NuxtLink to="/" class="text-xl font-bold text-olive-green dark:text-yellow-400 hover:opacity-80 transition-opacity">
        الشيخ إبراهيم بشندي
      </NuxtLink>

      <!-- روابط سطح المكتب - استخدام v-for -->
      <ul class="hidden md:flex items-center gap-x-6 lg:gap-x-8 text-brown-dark dark:text-gray-300">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink :to="link.to" class="hover:text-olive-green dark:hover:text-yellow-400 transition-colors">{{ link.text }}</NuxtLink>
        </li>
        <li v-if="isAdmin">
          <NuxtLink to="/admin" class="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold transition-colors admin-link">
             لوحة التحكم
          </NuxtLink>
        </li>
      </ul>

      <!-- أيقونات الهيدر -->
      <div class="flex items-center gap-x-4">

        <button class="text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400 transition-colors" aria-label="بحث">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <!-- === START: تعديل قسم الإشعارات === -->
        <div class="relative">
           <!-- تحويل NuxtLink إلى button واستدعاء toggleNotifications -->
           <button
             @click="toggleNotifications"
             ref="notificationsButtonRef" 
             class="relative p-1 rounded-full text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
             aria-label="الإشعارات"
             aria-haspopup="true"
             :aria-expanded="isNotificationsOpen.toString()" 
            >
             <span class="sr-only">عرض الإشعارات</span>
            
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            
             <span v-if="unreadCount > 0" class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
               {{ unreadCount > 9 ? '9+' : unreadCount }}
             </span>
           </button>

           <!-- إضافة مكون القائمة المنسدلة -->
           <NotificationsDropdown
             :is-open="isNotificationsOpen"
             @close="closeNotifications(true)"
             ref="notificationsDropdownRef" 
           />
        </div>
        <!-- === END: تعديل قسم الإشعارات === -->

        <button @click="toggleTheme" class="text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400 transition-colors" aria-label="تبديل الوضع الداكن">
           <!-- SVG للوضع الفاتح (يظهر عندما isDark = false) -->
           <svg v-if="!isDark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
             <path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.981A10.503 10.503 0 0 1 18 19.5a10.5 10.5 0 0 1-10.5-10.5 10.503 10.503 0 0 1 2.028-6.282.75.75 0 0 1 .819-.162Z" clip-rule="evenodd" />
           </svg>
           <!-- SVG للوضع الداكن (يظهر عندما isDark = true) -->
           <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true">
              <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.06 1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6.166 7.758a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591ZM12 4.5a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75Z" />
           </svg>
        </button>

        <!-- حالة تسجيل الدخول -->
        <ClientOnly>
          <div v-if="isLoggedIn">
            <!-- إضافة ref="dropdownRef" لحاوية القائمة المنسدلة -->
            <div class="relative" ref="dropdownRef">
              <!-- إضافة ref="userMenuButtonRef" لزر فتح القائمة -->
              <button @click="toggleDropdown" ref="userMenuButtonRef" class="flex items-center gap-x-2 hover:opacity-80 transition-opacity" aria-expanded="isDropdownOpen.toString()" aria-controls="user-menu">
                <div class="w-8 h-8 rounded-full overflow-hidden bg-olive-green text-white flex items-center justify-center text-sm font-semibold">
                  <img v-if="userAvatar" :src="userAvatar" alt="Avatar" class="w-full h-full object-cover">
                  <span v-else>{{ displayName.charAt(0).toUpperCase() }}</span>
                </div>
                <span class="hidden sm:inline text-sm text-brown-dark dark:text-gray-300">{{ displayName }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brown-dark dark:text-gray-300 transition-transform duration-200" :class="{'rotate-180': isDropdownOpen}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <transition name="dropdown-fade">
                <div
                    id="user-menu"
                    v-show="isDropdownOpen"
                    @click.stop="closeDropdown"
                    class="absolute left-0 rtl:left-auto rtl:right-0 mt-2 w-48 origin-top-left rtl:origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-cream-gray dark:border-gray-700 focus:outline-none"
                    role="menu" aria-orientation="vertical" tabindex="-1"
                 >
                   <!-- إضافة ref لأول عنصر قابل للتركيز (رابط لوحة التحكم إذا كان مشرفاً) -->
                   <NuxtLink v-if="isAdmin" :ref="isAdmin ? 'firstDropdownItemRef' : undefined" to="/admin" role="menuitem" tabindex="-1" class="flex items-center gap-2 px-4 py-2 text-sm text-right text-red-600 dark:text-red-400 hover:bg-beige-light dark:hover:bg-gray-700 font-semibold admin-link">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" aria-hidden="true">
                        <path fill-rule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.307 1.227a4.99 4.99 0 0 1 5.734 3.313l1.072.268a1 1 0 0 1 .877.97l.03.298a1 1 0 0 1-.627 1.04l-1.14.57a4.995 4.995 0 0 1 0 4.194l1.14.57a1 1 0 0 1 .627 1.04l-.03.298a1 1 0 0 1-.877.97l-1.072.268a4.99 4.99 0 0 1-5.734 3.313l-.307 1.227a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.307-1.227a4.99 4.99 0 0 1-5.734-3.313l-1.072-.268a1 1 0 0 1-.877-.97l-.03-.298a1 1 0 0 1 .627-1.04l1.14-.57a4.995 4.995 0 0 1 0-4.194l-1.14-.57a1 1 0 0 1-.627-1.04l.03-.298a1 1 0 0 1 .877-.97l1.072-.268a4.99 4.99 0 0 1 5.734-3.313l.307-1.227ZM10 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" clip-rule="evenodd" />
                      </svg>
                      <span>لوحة التحكم</span>
                   </NuxtLink>
                   <!-- إضافة ref لرابط الملف الشخصي إذا لم يكن المستخدم مشرفاً (ليكون هو العنصر الأول للتركيز) -->
                   <NuxtLink :ref="!isAdmin ? 'firstDropdownItemRef' : undefined" to="/profile" role="menuitem" tabindex="-1" class="flex items-center gap-2 px-4 py-2 text-sm text-right text-brown-dark dark:text-gray-200 hover:bg-beige-light dark:hover:bg-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" aria-hidden="true">
                         <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clip-rule="evenodd" />
                      </svg>
                      <span>الملف الشخصي</span>
                   </NuxtLink>
                   <hr class="border-gray-200 dark:border-gray-700 my-1">
                   <button @click="logoutAndClose" role="menuitem" tabindex="-1" class="w-full flex items-center gap-2 px-4 py-2 text-sm text-right text-red-600 dark:text-red-400 hover:bg-beige-light dark:hover:bg-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4" aria-hidden="true">
                        <path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2A.75.75 0 0 0 10.75 3.5h-5.5A.75.75 0 0 0 4.5 4.25v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clip-rule="evenodd" />
                        <path fill-rule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.75a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 .75-.75Z" clip-rule="evenodd" />
                        <path fill-rule="evenodd" d="M15.28 12.28a.75.75 0 0 0 1.06-1.06l-3-3a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06L12 9.81v8.44a.75.75 0 0 0 1.5 0V9.81l1.78 1.77Z" clip-rule="evenodd" />
                     </svg>
                      <span>تسجيل الخروج</span>
                   </button>
                </div>
              </transition>
            </div>
          </div>

          <div v-else class="flex items-center gap-x-2">
            <NuxtLink to="/login" class="text-sm bg-olive-green text-white px-3 py-1.5 rounded-md hover:bg-opacity-80 transition-colors">دخول</NuxtLink>
            <NuxtLink to="/signup" class="text-sm border border-olive-green text-olive-green dark:border-yellow-400 dark:text-yellow-400 px-3 py-1.5 rounded-md hover:bg-olive-green hover:text-white dark:hover:bg-yellow-400 dark:hover:text-gray-900 transition-colors">إنشاء حساب</NuxtLink>
          </div>
        </ClientOnly>

        <!-- زر القائمة الجانبية للموبايل - إضافة ref -->
        <button @click="toggleMobileMenu" ref="mobileMenuButtonRef" class="md:hidden text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400 transition-colors" aria-label="فتح القائمة">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </nav>
  </header>

  <!-- خلفية القائمة الجانبية -->
  <div
    v-show="isSidebarOpen"
    @click="closeSidebar"
    class="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity duration-300 ease-in-out"
    :class="{ 'opacity-100': isSidebarOpen, 'opacity-0 pointer-events-none': !isSidebarOpen }"
    aria-hidden="true"
  ></div>

  <!-- القائمة الجانبية للموبايل -->
  <transition name="slide-fade">
    <aside
      v-show="isSidebarOpen"
      class="fixed top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg z-50 md:hidden px-4 py-6 space-y-4 overflow-y-auto"
      role="dialog" aria-modal="true" aria-labelledby="sidebar-title"
    >
      <div class="flex items-center justify-between mb-4">
        <span id="sidebar-title" class="text-lg font-bold text-olive-green dark:text-yellow-400">القائمة</span>
        <!-- إضافة ref لزر إغلاق القائمة الجانبية -->
        <button @click="closeSidebar" ref="sidebarCloseButtonRef" class="text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400" aria-label="إغلاق القائمة">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- استخدام v-for لعرض الروابط -->
      <ul class="space-y-3 text-brown-dark dark:text-gray-300">
        <li v-for="link in navLinks" :key="link.to">
          <NuxtLink :to="link.to" @click="closeSidebar" class="block hover:text-olive-green dark:hover:text-yellow-400">{{ link.text }}</NuxtLink>
        </li>
         <li v-if="isAdmin">
           <NuxtLink to="/admin" @click="closeSidebar" class="block text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold admin-link">
             لوحة التحكم
           </NuxtLink>
         </li>
      </ul>

      <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <ClientOnly>
          <div v-if="isLoggedIn">
            <NuxtLink to="/profile" @click="closeSidebar" class="block mb-3 text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400">الملف الشخصي</NuxtLink>
            <button @click="logoutAndClose" class="w-full text-right text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">تسجيل الخروج</button>
          </div>
          <div v-else class="flex gap-x-2">
            <NuxtLink to="/login" @click="closeSidebar" class="text-sm bg-olive-green text-white px-3 py-1.5 rounded-md hover:bg-opacity-80">دخول</NuxtLink>
            <NuxtLink to="/signup" @click="closeSidebar" class="text-sm border border-olive-green text-olive-green dark:border-yellow-400 dark:text-yellow-400 px-3 py-1.5 rounded-md hover:bg-olive-green hover:text-white dark:hover:bg-yellow-400 dark:hover:text-gray-900">إنشاء حساب</NuxtLink>
          </div>
        </ClientOnly>
      </div>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useUserStore } from '~/stores/user';
import { storeToRefs } from 'pinia';
import { useColorMode } from '#imports';
// --- === أضف هذه الاستيرادات === ---
import { useNotificationStore } from '~/stores/notifications';
import NotificationsDropdown from '~/components/NotificationsDropdown.vue';
// ------------------------------------

const userStore = useUserStore();
const { isLoggedIn, displayName, userAvatar, isAdmin, profile } = storeToRefs(userStore); // <-- أضف profile هنا

// --- === أضف هذه الأسطر === ---
const notificationStore = useNotificationStore();
const { unreadCount } = storeToRefs(notificationStore); // <-- استخدم unreadCount من المخزن
const isNotificationsOpen = ref(false); // حالة فتح/إغلاق قائمة الإشعارات
const notificationsButtonRef = ref<HTMLButtonElement | null>(null); // Ref لزر الإشعارات
const notificationsDropdownRef = ref<InstanceType<typeof NotificationsDropdown> | null>(null); // Ref للمكون
// --------------------------

// --- حالة الواجهة ---
const isDropdownOpen = ref(false);
const isSidebarOpen = ref(false);
// const unreadNotifications = ref(0); // <-- احذف هذا السطر (تم استبداله بـ unreadCount من المخزن)

// --- Refs للعناصر لإدارة التركيز والـ dropdown ---
const dropdownRef = ref<HTMLDivElement | null>(null); // Ref لحاوية القائمة المنسدلة
const userMenuButtonRef = ref<HTMLButtonElement | null>(null); // Ref لزر فتح القائمة المنسدلة
const firstDropdownItemRef = ref<HTMLElement | null>(null); // Ref لأول عنصر في القائمة المنسدلة
const mobileMenuButtonRef = ref<HTMLButtonElement | null>(null); // Ref لزر فتح القائمة الجانبية
const sidebarCloseButtonRef = ref<HTMLButtonElement | null>(null); // Ref لزر إغلاق القائمة الجانبية
const previouslyFocusedElement = ref<HTMLElement | null>(null); // لتخزين العنصر المركز عليه قبل فتح قائمة

// --- تعريف روابط التنقل مرة واحدة ---
const navLinks = ref([
  { text: 'الرئيسية', to: '/' },
  { text: 'الدروس', to: '/lessons' },
  { text: 'الكتب', to: '/books' },
  { text: 'الدراسة', to: '/study' },
  { text: 'اسأل الشيخ', to: '/ask' },
  { text: 'عن الشيخ', to: '/about' },
]);

// --- منطق الوضع الداكن ---
const isDark = ref(false);
const colorMode = useColorMode();

onMounted(() => {
  isDark.value = colorMode.value === 'dark';
  window.addEventListener('storage', handleStorageChange);
  document.addEventListener('click', handleClickOutside, true); // <-- تأكد من إضافة true هنا
  document.addEventListener('keydown', handleEscapeKey); // <-- أضف هذا السطر

  // --- === استبدل fetchNotifications الوهمي بهذا === ---
  // جلب الإشعارات والاشتراك عند التحميل إذا كان المستخدم مسجل الدخول بالفعل
  // (تم نقل المنطق إلى watch(profile) للتعامل مع التغييرات والحالة الأولية)
  // --------------------------------------------------

});

onBeforeUnmount(() => {
   window.removeEventListener('storage', handleStorageChange);
   document.removeEventListener('click', handleClickOutside, true); // <-- تأكد من إضافة true هنا
   document.removeEventListener('keydown', handleEscapeKey); // <-- أضف هذا السطر
   // --- === أضف هذا السطر === ---
   notificationStore.unsubscribeFromNotifications(); // إلغاء الاشتراك عند المغادرة
   // --------------------------
});

const toggleTheme = () => {
  const newPreference = isDark.value ? 'light' : 'dark';
  colorMode.preference = newPreference;
  isDark.value = newPreference === 'dark';
}

function handleStorageChange(event: StorageEvent) {
  if (event.key === 'nuxt-color-mode') {
    const newMode = event.newValue as 'light' | 'dark' | 'system' | null;
    if (newMode) {
        isDark.value = newMode === 'dark';
        if (colorMode.value !== newMode) {
           colorMode.preference = newMode; // مزامنة الحالة الحالية إذا تغيرت من تبويب آخر
        }
    }
  }
}
// --- نهاية منطق الوضع الداكن ---

// --- وظائف فتح/إغلاق القوائم مع إدارة التركيز ---
const toggleDropdown = async () => {
  if (!isDropdownOpen.value) {
    closeNotifications(false); // <-- أضف هذا لإغلاق قائمة الإشعارات
    previouslyFocusedElement.value = document.activeElement as HTMLElement;
    isDropdownOpen.value = true;
    await nextTick(); // انتظر حتى يتم رسم القائمة
    // حاول التركيز على أول عنصر تم تعيين ref له
    const firstItem = dropdownRef.value?.querySelector<HTMLElement>('[ref="firstDropdownItemRef"]');
    if (firstItem) {
        firstItem.focus();
    } else {
        // إذا لم يتم العثور على العنصر المحدد بـ ref، ركز على القائمة نفسها للسماح بالتنقل
        (dropdownRef.value?.querySelector('[role="menuitem"]') as HTMLElement)?.focus();
    }
  } else {
    closeDropdown(); // الإغلاق سيعيد التركيز
  }
};

const closeDropdown = (refocus = true) => {
  if (isDropdownOpen.value) {
      isDropdownOpen.value = false;
      if (refocus && previouslyFocusedElement.value && document.body.contains(previouslyFocusedElement.value)) {
          previouslyFocusedElement.value.focus();
      }
  }
};

const toggleMobileMenu = async () => {
  if (!isSidebarOpen.value) {
    previouslyFocusedElement.value = document.activeElement as HTMLElement;
    isSidebarOpen.value = true;
    await nextTick();
    sidebarCloseButtonRef.value?.focus(); // ركز على زر الإغلاق
  } else {
    closeSidebar(); // الإغلاق سيعيد التركيز
  }
};

const closeSidebar = (refocus = true) => {
  if (isSidebarOpen.value) {
      isSidebarOpen.value = false;
      if (refocus && previouslyFocusedElement.value && document.body.contains(previouslyFocusedElement.value)) {
          previouslyFocusedElement.value.focus();
      }
  }
};
// --- نهاية وظائف القوائم للمستخدم والجوال ---

// --- === أضف هذه الدوال الجديدة === ---
// وظائف جديدة لقائمة الإشعارات
const toggleNotifications = async () => {
   if (!isNotificationsOpen.value) {
      closeDropdown(false); // أغلق قائمة المستخدم إذا كانت مفتوحة
      previouslyFocusedElement.value = document.activeElement as HTMLElement;
      isNotificationsOpen.value = true;
      // لا حاجة للتركيز التلقائي داخل القائمة هنا، يمكن للمستخدم التنقل إليها
   } else {
      closeNotifications();
   }
};
const closeNotifications = (refocus = true) => {
    if(isNotificationsOpen.value) {
        isNotificationsOpen.value = false;
         if (refocus && previouslyFocusedElement.value && document.body.contains(previouslyFocusedElement.value)) {
             previouslyFocusedElement.value?.focus(); // استخدام optional chaining لاستعادة التركيز على الزر
         }
    }
};
// ------------------------------------

// --- إغلاق القوائم عند النقر خارجها (مُعدَّل) ---
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as Node;

  // إغلاق قائمة المستخدم
  if (isDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(target) && userMenuButtonRef.value && !userMenuButtonRef.value.contains(target)) {
    closeDropdown(false);
  }

  // --- === أضف هذا الشرط === ---
  // إغلاق قائمة الإشعارات
  // تحقق من أن النقرة ليست داخل المكون notificationsDropdownRef.$el وليست على زر notificationsButtonRef
  if (isNotificationsOpen.value && notificationsDropdownRef.value?.$el && !notificationsDropdownRef.value.$el.contains(target) && notificationsButtonRef.value && !notificationsButtonRef.value.contains(target)) {
    closeNotifications(false);
  }
  // --------------------------

  // لا حاجة لإغلاق القائمة الجانبية هنا لأن الخلفية تقوم بذلك وتعيد التركيز
};

// --- === أضف هذه الدالة === ---
// إغلاق القوائم عند الضغط على Escape
const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
        if (isNotificationsOpen.value) {
            closeNotifications(); // أغلق الإشعارات وأعد التركيز إلى الزر
        } else if (isDropdownOpen.value) {
            closeDropdown(); // أغلق قائمة المستخدم وأعد التركيز إلى الزر
        } else if (isSidebarOpen.value) {
             closeSidebar(); // أغلق القائمة الجانبية وأعد التركيز إلى زر الفتح
        }
    }
};
// --------------------------

// --- جلب الإشعارات (مثال وهمي) ---
// async function fetchNotifications() { ... } // <-- احذف هذه الدالة الوهمية (استخدم watch بدلاً منها)

// --- مراقبة حالة تسجيل الدخول لجلب/مسح الإشعارات (مُعدَّل) ---
watch(profile, (newProfile, oldProfile) => { // <-- راقب profile بدلاً من isLoggedIn
  if (newProfile?.id && (!oldProfile || newProfile.id !== oldProfile.id)) {
      console.log("[AppHeader] User profile available/changed, fetching notifications and subscribing.");
      notificationStore.fetchNotifications(newProfile.id);
      notificationStore.subscribeToNotifications(newProfile.id);
  } else if (!newProfile && oldProfile) {
      console.log("[AppHeader] User logged out, clearing notifications.");
      notificationStore.clearNotifications(); // <-- استدعاء دالة المسح من المخزن
      closeDropdown(false); // أغلق قائمة المستخدم
      closeSidebar(false); // أغلق القائمة الجانبية
      closeNotifications(false); // <-- أضف إغلاق قائمة الإشعارات
  }
}, { immediate: true }); // immediate: true لتشغيل الواچر عند تحميل المكون لأول مرة

// --- تسجيل الخروج (مُعدَّل) ---
const logoutAndClose = async () => {
  const wasDropdownOpen = isDropdownOpen.value; // تتبع الحالة قبل الإغلاق
  const wasSidebarOpen = isSidebarOpen.value;
  const wasNotificationsOpen = isNotificationsOpen.value; // <-- أضف هذا

  closeDropdown(false); // أغلق القوائم دون إعادة التركيز فوراً
  closeSidebar(false);
  closeNotifications(false); // <-- أضف هذا

  try {
    await userStore.logout();
    // بعد تسجيل الخروج الناجح، الواجهة ستتغير (أزرار الدخول/التسجيل)
    // لا حاجة لإعادة التركيز يدوياً هنا
  } catch (error) {
    console.error("Logout failed:", error);
    alert('حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.');
    // اختياري: أعد فتح القوائم إذا فشل تسجيل الخروج وكانت مفتوحة
    // if (wasDropdownOpen) isDropdownOpen.value = true;
    // if (wasSidebarOpen) isSidebarOpen.value = true;
    // if (wasNotificationsOpen) isNotificationsOpen.value = true;
  }
}

</script>

<style scoped>
/* تحسين active class ليشمل الوضع الداكن ويستثني رابط الأدمن إذا أردت */
.router-link-exact-active:not(.admin-link) {
  @apply text-olive-green dark:text-yellow-400 font-semibold;
}
/* تنسيق خاص لرابط الأدمن النشط */
.admin-link.router-link-exact-active {
   @apply text-red-700 dark:text-red-500 font-bold;
}

/* Transition للقائمة المنسدلة للمستخدم */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Transition للقائمة الجانبية */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s ease-in-out;
}
/* اتجاه الانزلاق لـ RTL (من اليمين إلى اليسار) */
html[dir="rtl"] .slide-fade-enter-from,
html[dir="rtl"] .slide-fade-leave-to {
   transform: translateX(100%); /* تنزلق من اليمين */
}
/* اتجاه الانزلاق الافتراضي لـ LTR (من اليسار إلى اليمين) */
html:not([dir="rtl"]) .slide-fade-enter-from,
html:not([dir="rtl"]) .slide-fade-leave-to {
   transform: translateX(-100%); /* تنزلق من اليسار - قد تحتاج لتعديل حسب التصميم */
}

/* (لا تغيير هنا، يمكنك إضافة تنسيقات أخرى إذا احتجت) */
</style>