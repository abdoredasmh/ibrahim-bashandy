<template>
  <header class="bg-white shadow-md sticky top-0 z-50">
    <nav class="container mx-auto px-4 py-3 flex items-center justify-between">
      <NuxtLink to="/" class="text-xl font-bold text-olive-green hover:opacity-80 transition-opacity">
        الشيخ إبراهيم بشندي
      </NuxtLink>

      <!-- روابط سطح المكتب -->
      <ul class="hidden md:flex items-center gap-x-6 lg:gap-x-8 text-brown-dark">
        <li><NuxtLink to="/" class="hover:text-olive-green transition-colors">الرئيسية</NuxtLink></li>
        <li><NuxtLink to="/lessons" class="hover:text-olive-green transition-colors">الدروس</NuxtLink></li>
        <li><NuxtLink to="/books" class="hover:text-olive-green transition-colors">الكتب</NuxtLink></li>
        <li><NuxtLink to="/study" class="hover:text-olive-green transition-colors">الدراسة</NuxtLink></li>
        <li><NuxtLink to="/ask" class="hover:text-olive-green transition-colors">اسأل الشيخ</NuxtLink></li>
        <li><NuxtLink to="/about" class="hover:text-olive-green transition-colors">عن الشيخ</NuxtLink></li>
      </ul>

      <!-- أيقونات الهيدر -->
      <div class="flex items-center gap-x-4">
        <!-- زر البحث -->
        <button class="text-brown-dark hover:text-olive-green transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <!-- زر الإشعارات -->
        <NuxtLink to="/notifications" class="relative text-brown-dark hover:text-olive-green transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span v-if="unreadNotifications > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 rounded-full">
            {{ unreadNotifications }}
          </span>
        </NuxtLink>

        <!-- حالة تسجيل الدخول -->
        <ClientOnly>
          <div v-if="userStore.isLoggedIn">
            <div class="relative" ref="dropdownRef">
              <button @click="toggleDropdown" class="flex items-center gap-x-2 hover:opacity-80 transition-opacity">
                <div class="w-6 h-6 rounded-full overflow-hidden bg-olive-green text-white flex items-center justify-center text-xs font-semibold">
                  <img v-if="userStore.userAvatar" :src="userStore.userAvatar" alt="Avatar" class="w-full h-full object-cover">
                  <span v-else>{{ userStore.displayName.charAt(0).toUpperCase() }}</span>
                </div>
                <span class="text-brown-dark">{{ userStore.displayName }}</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-brown-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <transition name="dropdown-fade">
                <div v-show="isDropdownOpen" @click="closeDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-cream-gray">
                  <NuxtLink to="/profile" class="block px-4 py-2 text-sm text-right text-brown-dark hover:bg-beige-light">الملف الشخصي</NuxtLink>
                  <button @click.stop="toggleTheme" class="w-full text-right block px-4 py-2 text-sm text-brown-dark hover:bg-beige-light">
                    <Icon :name="isDark ? 'mdi:weather-sunny' : 'mdi:weather-night'" class="ml-1" />
                    <span>{{ isDark ? 'الوضع الفاتح' : 'الوضع الداكن' }}</span>
                  </button>
                  <button @click="logoutAndClose" class="w-full text-right block px-4 py-2 text-sm text-red-600 hover:bg-beige-light">تسجيل الخروج</button>
                </div>
              </transition>
            </div>
          </div>

          <div v-else class="flex items-center gap-x-2">
            <NuxtLink to="/login" class="text-sm bg-olive-green text-white px-3 py-1.5 rounded-md hover:bg-opacity-80 transition-colors">دخول</NuxtLink>
            <NuxtLink to="/signup" class="text-sm border border-olive-green text-olive-green px-3 py-1.5 rounded-md hover:bg-olive-green hover:text-white transition-colors">إنشاء حساب</NuxtLink>
          </div>
        </ClientOnly>

        <!-- زر القائمة الجانبية للموبايل -->
        <button @click="toggleMobileMenu" class="md:hidden text-brown-dark hover:text-olive-green transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
    class="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity"
  ></div>

  <!-- القائمة الجانبية للموبايل -->
  <transition name="dropdown-fade">
    <aside
      v-show="isSidebarOpen"
      class="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 md:hidden px-4 py-6 space-y-4 overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-4">
        <span class="text-lg font-bold text-olive-green">القائمة</span>
        <button @click="closeSidebar" class="text-brown-dark hover:text-olive-green">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <ul class="space-y-3 text-brown-dark">
        <li><NuxtLink to="/" @click="closeSidebar" class="block hover:text-olive-green">الرئيسية</NuxtLink></li>
        <li><NuxtLink to="/lessons" @click="closeSidebar" class="block hover:text-olive-green">الدروس</NuxtLink></li>
        <li><NuxtLink to="/books" @click="closeSidebar" class="block hover:text-olive-green">الكتب</NuxtLink></li>
        <li><NuxtLink to="/study" @click="closeSidebar" class="block hover:text-olive-green">الدراسة</NuxtLink></li>
        <li><NuxtLink to="/ask" @click="closeSidebar" class="block hover:text-olive-green">اسأل الشيخ</NuxtLink></li>
        <li><NuxtLink to="/about" @click="closeSidebar" class="block hover:text-olive-green">عن الشيخ</NuxtLink></li>
      </ul>

      <div class="mt-6">
        <ClientOnly>
          <div v-if="userStore.isLoggedIn">
            <button @click="logoutAndClose" class="w-full text-right text-red-600 hover:text-olive-green">تسجيل الخروج</button>
          </div>
          <div v-else class="flex gap-x-2">
            <NuxtLink to="/login" @click="closeSidebar" class="text-sm bg-olive-green text-white px-3 py-1.5 rounded-md hover:bg-opacity-80">دخول</NuxtLink>
            <NuxtLink to="/signup" @click="closeSidebar" class="text-sm border border-olive-green text-olive-green px-3 py-1.5 rounded-md hover:bg-olive-green hover:text-white">إنشاء حساب</NuxtLink>
          </div>
        </ClientOnly>
      </div>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()

const isDropdownOpen = ref(false)
const isSidebarOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const unreadNotifications = ref(3) // مثال، يمكنك ربطه بـ API لاحقًا

const toggleDropdown = () => isDropdownOpen.value = !isDropdownOpen.value
const closeDropdown = () => isDropdownOpen.value = false
const toggleMobileMenu = () => isSidebarOpen.value = !isSidebarOpen.value
const closeSidebar = () => isSidebarOpen.value = false

const handleClickOutside = (e: MouseEvent) => {
  if (isDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  const saved = localStorage.getItem('theme')
  isDark.value = saved === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const logoutAndClose = async () => {
  closeDropdown()
  closeSidebar()
  await userStore.logout()
}

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<style scoped>
.router-link-exact-active {
  @apply text-olive-green font-semibold;
}
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.3s ease;
}
.dropdown-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.dropdown-fade-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.dropdown-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
