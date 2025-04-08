<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-lg shadow border border-cream-gray">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-brown-dark">
          إنشاء حساب جديد
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
        <!-- رسائل الخطأ أو النجاح -->
        <div v-if="message" :class="isError ? 'text-red-600' : 'text-green-600'" class="text-center text-sm mb-4 p-2 bg-opacity-10 rounded" :style="{ backgroundColor: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)' }">
          {{ message }}
        </div>

        <!-- استخدام flex-col لترتيب الحقول فوق بعضها بشكل واضح -->
        <div class="flex flex-col gap-y-4">
          <div>
            <label for="full-name" class="block text-sm font-medium text-brown-dark mb-1">الاسم الكامل</label>
            <input id="full-name" name="full-name" type="text" v-model="fullName" required
                   class="relative block w-full appearance-none rounded-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                   placeholder="أدخل اسمك الكامل">
          </div>
          <div>
            <label for="email-address" class="block text-sm font-medium text-brown-dark mb-1">البريد الإلكتروني</label>
            <input id="email-address" name="email" type="email" v-model="email" autocomplete="email" required
                   class="relative block w-full appearance-none rounded-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                   placeholder="أدخل بريدك الإلكتروني">
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-brown-dark mb-1">كلمة المرور</label>
            <input id="password" name="password" type="password" v-model="password" autocomplete="new-password" required
                   @input="validatePasswordStrength" 
                   class="relative block w-full appearance-none rounded-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                   placeholder="أنشئ كلمة مرور قوية">
             <!-- إرشادات كلمة المرور -->
             <ul class="mt-2 text-xs text-gray-500 list-disc list-inside space-y-1">
                <li :class="{'text-green-600': passwordCriteria.length}">8 حروف على الأقل</li>
                <li :class="{'text-green-600': passwordCriteria.uppercase}">حرف كبير واحد على الأقل</li>
                <li :class="{'text-green-600': passwordCriteria.lowercase}">حرف صغير واحد على الأقل</li>
                <li :class="{'text-green-600': passwordCriteria.number}">رقم واحد على الأقل</li>
                <li :class="{'text-green-600': passwordCriteria.symbol}">رمز واحد على الأقل (مثل @$!%*?&)</li>
             </ul>
          </div>
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-brown-dark mb-1">تأكيد كلمة المرور</label>
            <input id="confirm-password" name="confirm-password" type="password" v-model="confirmPassword" autocomplete="new-password" required
                   class="relative block w-full appearance-none rounded-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm"
                   placeholder="أعد كتابة كلمة المرور">
          </div>
        </div>

        <div>
          <button type="submit" :disabled="loading || !isPasswordStrong" 
                  class="group relative flex w-full justify-center rounded-md border border-transparent bg-olive-green py-2 px-4 text-sm font-medium text-white hover:bg-opacity-85 focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="loading" class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            <span :class="{ 'opacity-0': loading }">إنشاء الحساب</span>
          </button>
        </div>
        <div class="text-sm text-center">
          <NuxtLink to="/login" class="font-medium text-olive-green hover:underline">
            لديك حساب بالفعل؟ تسجيل الدخول
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue' // استيراد reactive و computed
import { useSupabaseClient, navigateTo } from '#imports'

const client = useSupabaseClient()
const email = ref('')
const password = ref('')
const fullName = ref('')
const confirmPassword = ref('') // إضافة حقل تأكيد كلمة المرور
const message = ref('')
const isError = ref(false)
const loading = ref(false)

// حالة لتتبع معايير قوة كلمة المرور
const passwordCriteria = reactive({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  symbol: false
})

// دالة للتحقق من قوة كلمة المرور وتحديث الحالة
const validatePasswordStrength = () => {
  const pass = password.value
  passwordCriteria.length = pass.length >= 8
  passwordCriteria.uppercase = /[A-Z]/.test(pass)
  passwordCriteria.lowercase = /[a-z]/.test(pass)
  passwordCriteria.number = /[0-9]/.test(pass)
  passwordCriteria.symbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(pass) // يمكنك تعديل مجموعة الرموز
}

// خاصية محسوبة لمعرفة ما إذا كانت جميع المعايير متحققة
const isPasswordStrong = computed(() => {
  return Object.values(passwordCriteria).every(Boolean)
})

const handleSignup = async () => {
  // التحقق من تطابق كلمتي المرور
  if (password.value !== confirmPassword.value) {
    message.value = 'كلمتا المرور غير متطابقتين.'
    isError.value = true
    return // إيقاف التنفيذ
  }

  // التحقق من قوة كلمة المرور قبل الإرسال (إجراء إضافي)
  if (!isPasswordStrong.value) {
     message.value = 'الرجاء التأكد من أن كلمة المرور تحقق جميع المعايير المطلوبة.'
     isError.value = true
     return
  }

  loading.value = true
  message.value = ''
  isError.value = false

  const { data, error } = await client.auth.signUp({
    email: email.value,
    password: password.value, // استخدم كلمة المرور بعد التحقق
    options: {
      data: {
        full_name: fullName.value, // الاسم أصبح مطلوبًا في الواجهة
      }
    }
  })

  loading.value = false

  // بقية منطق التعامل مع الاستجابة يبقى كما هو...
  if (error) {
    console.error('Signup Error:', error.message)
    // تحسين رسالة الخطأ الخاصة بضعف كلمة المرور إذا أرسلها Supabase
    if (error.message.includes('password should be at least')) {
         message.value = 'كلمة المرور ضعيفة جدًا. يرجى اتباع الإرشادات.'
    } else {
        message.value = error.message || 'حدث خطأ أثناء إنشاء الحساب.'
    }
    isError.value = true
  } else if (data.user) {
      if (data.user.identities && data.user.identities.length === 0) {
         message.value = 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني. يرجى التحقق منه لتفعيل حسابك.';
         isError.value = false;
      } else if (data.session) {
          message.value = 'تم إنشاء الحساب وتسجيل الدخول بنجاح!';
          isError.value = false;
          setTimeout(() => navigateTo('/profile'), 1500);
      } else {
        message.value = 'تم إنشاء الحساب بنجاح. قد تحتاج لتأكيد بريدك الإلكتروني.';
         isError.value = false;
          // توجيه المستخدم لصفحة التأكيد بعد لحظة لعرض الرسالة
      setTimeout(() => navigateTo('/confirm?email=' + encodeURIComponent(email.value)), 2000);
      }
  } else {
    message.value = 'حدث خطأ غير متوقع.';
    isError.value = true;
       // توجيه المستخدم لصفحة التأكيد هنا أيضًا
    setTimeout(() => navigateTo('/confirm?email=' + encodeURIComponent(email.value)), 2000);
  }
}

</script>

<style scoped>
/* تغيير لون الإرشادات المتحققة */
li.text-green-600 {
    color: #16a34a; /* يمكنك استخدام كلاس Tailwind text-green-600 مباشرة إذا كان يعمل */
}
button:disabled span:first-child {
    left: 0.75rem;
}
</style>