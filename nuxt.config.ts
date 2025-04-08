// nuxt.config.ts
export default defineNuxtConfig({
  devtools: { enabled: true },

  

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@nuxt/icon', // ✅ النسخة الجديدة بدل "nuxt-icon"
    '@pinia/nuxt'
  ],


  css: ['~/assets/css/tailwind.css'],

  app: {
    head: {
      htmlAttrs: {
        dir: 'rtl',
        lang: 'ar'
      },
    }
  },

  supabase: {
    redirectOptions: {
      login: '/login',         // تحويل غير المسجّلين لصفحة تسجيل الدخول
      callback: '/confirm',    // بعد تسجيل الدخول أو التأكيد
      exclude: [               // صفحات عامة لا تحتاج تسجيل دخول
        '/',
        '/lessons',
        '/lessons/*',
        '/books',
        '/study',
        '/ask',
        '/about',
        '/leaderboard',
        '/live',
        '/signup',
        '/confirm',
        '/forgot-password',
        '/reset-password',
      ],
      cookieRedirect: false    // نستخدم fragment بدلاً من cookies للتحويل
    }
  },

 
  // تأكد أن نسختك من Nuxt تدعم هذا التاريخ (اختياري)
  compatibilityDate: '2025-04-07'
})
