<template>
  <footer class="bg-brown-dark text-beige-light mt-auto border-t-4 border-olive-green">
    <div class="container mx-auto px-14 py-5">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">

        <!-- 1. حقوق النشر -->
        <div class="text-center md:text-right">
          <p class="text-sm">
            جميع الحقوق محفوظة © {{ new Date().getFullYear() }}
          </p>
          <p class="text-lg font-semibold">موقع الشيخ إبراهيم بشندي</p>
        </div>

    <p class="text-lg font-semibold">موقع الشيخ إبراهيم بشندي</p>
    
        <!-- 2. روابط التواصل -->
        <div class="flex justify-center md:justify-start gap-x-4">
          <!-- Facebook -->
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
            class="text-beige-light hover:text-olive-green transition-colors">
            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M22 12C22 6.48 17.52 2 12 2S2 6.48 2 12c0 4.84 3.44 8.84 8 9.8v-6.92H8v-2.88h2V9.75c0-2 1.18-3.12 3-3.12.88 0 1.8.15 1.8.15v2h-1.01c-.99 0-1.29.62-1.29 1.26v1.52h2.2l-.35 2.88H13.5v6.92c4.56-.96 8-4.96 8-9.8z"/>
            </svg>
          </a>

          <!-- YouTube -->
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="YouTube"
            class="text-beige-light hover:text-olive-green transition-colors">
            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M21.8 8.001a2.752 2.752 0 0 0-1.936-1.946C18.206 6 12 6 12 6s-6.206 0-7.864.055A2.752 2.752 0 0 0 2.2 8.001 28.898 28.898 0 0 0 2 12c0 1.352.067 2.67.2 3.999a2.752 2.752 0 0 0 1.936 1.946C5.794 18 12 18 12 18s6.206 0 7.864-.055a2.752 2.752 0 0 0 1.936-1.946A28.898 28.898 0 0 0 22 12c0-1.352-.067-2.67-.2-3.999zM10 15.5V8.5l6 3.5-6 3.5z"/>
            </svg>
          </a>

          <!-- Telegram -->
          <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Telegram"
            class="text-beige-light hover:text-olive-green transition-colors">
            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M21.05 2.85a1.5 1.5 0 0 0-1.58-.24L2.9 10.13a1.5 1.5 0 0 0 .13 2.76l4.97 1.6 1.86 5.05a1.5 1.5 0 0 0 2.69.27l2.3-3.65 4.39 3.26a1.5 1.5 0 0 0 2.36-1.06l1.04-14a1.5 1.5 0 0 0-.83-1.5zM10.9 15.34l-.66 2.2-.95-2.58 8.2-7.22-10.41 6.4-4.41-1.42L19.24 4.5l-8.34 10.84z"/>
            </svg>
          </a>
        </div>

      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// لا حاجة لسكريبت هنا حالياً
</script>

<style scoped>
/* تنسيقات إضافية إن احتجت */
</style>
