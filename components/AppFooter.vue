<template>
  <footer class="bg-brown-dark text-beige-light mt-auto border-t-4 border-olive-green">
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">

        <!-- 1. حقوق النشر -->
        <div class="text-center md:text-right"> {/* text-right ليناسب RTL */}
          <p class="text-sm">
            جميع الحقوق محفوظة © {{ new Date().getFullYear() }}
          </p>
          <p class="text-lg font-semibold">موقع الشيخ إبراهيم بشندي</p>
        </div>

        <!-- 2. روابط سريعة (اختياري) -->
        <!-- يمكنك إضافة روابط هنا لاحقًا إذا احتجت -->
        <!--
        <nav class="flex gap-x-4 justify-center md:justify-start">
          <NuxtLink to="/privacy-policy" class="text-sm hover:text-olive-green transition-colors">سياسة الخصوصية</NuxtLink>
          <NuxtLink to="/terms" class="text-sm hover:text-olive-green transition-colors">شروط الاستخدام</NuxtLink>
        </nav>
        -->

        <!-- 3. روابط التواصل الاجتماعي (اختياري) -->
        <div class="flex justify-center md:justify-start gap-x-4">
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook" class="text-beige-light hover:text-olive-green transition-colors">
            <Icon name="mdi:facebook" size="24" /> 
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="text-beige-light hover:text-olive-green transition-colors">
            <Icon name="mdi:youtube" size="24" /> 
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Telegram" class="text-beige-light hover:text-olive-green transition-colors">
            <Icon name="mdi:telegram" size="24" /> 
          </a>
          {/* أضف روابط وحسابات الشيخ الفعلية هنا */}
        </div>

      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// لا حاجة لـ script هنا حاليًا
// ولكن إذا كنت ستستخدم مكون <Icon>, ستحتاج لتثبيت وإعداد وحدة الأيقونات مثل nuxt-icon
// pnpm install -D nuxt-icon
// ثم أضف 'nuxt-icon' إلى modules في nuxt.config.ts
</script>

<style scoped>
/* أي تنسيقات خاصة بالفوتر */
</style>