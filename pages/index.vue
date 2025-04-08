<template>
  <div>
    <!-- 1. Hero Section -->
    <section class="bg-gradient-to-b from-beige-light to-cream-gray py-16 px-4">
      <div class="container mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
        <div class="md:w-2/3">
          <h1 class="text-3xl md:text-4xl font-bold text-olive-green mb-4">
            فضيلة الشيخ إبراهيم بشندي
          </h1>
          <p class="text-lg text-brown-dark leading-relaxed mb-6">
            نبذة مختصرة عن حياة الشيخ إبراهيم بشندي ومسيرته العلمية والدعوية.
            هذا النص سيتم إدارته لاحقًا من لوحة التحكم لعرض معلومات محدثة ودقيقة
            عن الشيخ حفظه الله. نسعى لتقديم محتوى ثري ومفيد لجميع المسلمين.
            <!-- يمكنك إضافة المزيد من النص هنا -->
          </p>
          <NuxtLink to="/about" class="inline-block bg-olive-green text-white py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors text-lg">
            المزيد عن الشيخ
          </NuxtLink>
        </div>
        <div class="md:w-1/3 flex justify-center md:justify-start">
          <!-- يمكنك استخدام <NuxtImg> لاحقًا لتحسين الصور -->
          <img src="/images/placeholder-sheikh.jpg" alt="صورة الشيخ إبراهيم بشندي" class="rounded-lg shadow-lg w-60 h-60 object-cover">
          <!-- تأكد من وضع صورة حقيقية أو مؤقتة في المسار public/images/placeholder-sheikh.jpg -->
        </div>
      </div>
    </section>

    <!-- 2. آخر الأسئلة المجابة -->
    <section class="py-12 px-4">
      <div class="container mx-auto">
        <h2 class="text-2xl font-bold text-center text-brown-dark mb-8">آخر الأسئلة المجابة</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- مثال لسؤال واحد (سيتم تكراره 4 مرات بالبيانات الفعلية) -->
          <div v-for="i in 4" :key="i" class="bg-white p-4 rounded-lg shadow border border-cream-gray">
            <NuxtLink to="/ask" class="hover:text-olive-green"> <!-- رابط مؤقت لقسم الأسئلة -->
              <h3 class="font-semibold mb-2 line-clamp-2">سؤال {{ i }}: ما حكم كذا وكذا في الوضع الفلاني؟</h3>
            </NuxtLink>
            <p class="text-sm text-gray-600 line-clamp-3">
              هنا تظهر بداية الإجابة على السؤال بشكل مختصر وجذاب لدفع المستخدم لقراءة المزيد...
            </p>
          </div>
          <!-- نهاية مثال السؤال -->
        </div>
        <div class="text-center mt-8">
           <NuxtLink to="/ask" class="text-olive-green hover:underline font-medium">
             عرض جميع الأسئلة
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 3. مقتطف قائمة المتفوقين -->
    <section class="bg-cream-gray py-12 px-4">
       <div class="container mx-auto">
        <h2 class="text-2xl font-bold text-center text-brown-dark mb-8">لوحة الشرف (المتفوقون دراسيًا)</h2>
        <div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow border border-cream-gray">
           <ul class="space-y-3">
             <!-- مثال لطالب (سيتم تكراره 3-5 مرات بالبيانات الفعلية) -->
             <li v-for="j in 3" :key="j" class="flex items-center justify-between p-2 rounded hover:bg-beige-light">
               <div class="flex items-center gap-x-3">
                 <span class="font-bold text-lg text-olive-green">{{ j }}.</span>
                 <span class="font-medium text-brown-dark">اسم الطالب {{ j }}</span>
               </div>
               <span class="text-sm text-gray-500">XXX نقطة</span> <!-- أو عدد الدروس -->
             </li>
             <!-- نهاية مثال الطالب -->
           </ul>
        </div>
         <div class="text-center mt-8">
           <NuxtLink to="/leaderboard" class="inline-block bg-olive-green text-white py-2 px-5 rounded-md hover:bg-opacity-80 transition-colors">
             عرض لوحة الشرف كاملة
          </NuxtLink>
        </div>
       </div>
    </section>

    <!-- 4. أحدث المحتوى (دروس، كتب، إلخ) -->
    <section class="py-12 px-4">
      <div class="container mx-auto">
        <h2 class="text-2xl font-bold text-center text-brown-dark mb-8">أحدث الإضافات</h2>
        <!-- هنا يمكن إضافة أقسام فرعية أو تبويبات لعرض أحدث الدروس، الكتب، الدورات -->
        <!-- مثال بسيط لعرض بعض بطاقات المحتوى بشكل عام -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <!-- مثال لبطاقة محتوى (سيتم استخدام مكونات مثل LessonCard, BookCard لاحقًا) -->
           <div v-for="k in 6" :key="k" class="bg-white p-4 rounded-lg shadow border border-cream-gray">
             <div class="h-32 bg-cream-gray rounded mb-3"></div> <!-- مكان للصورة المصغرة -->
             <h3 class="font-semibold mb-1 line-clamp-2">عنوان الدرس أو الكتاب {{ k }}</h3>
             <p class="text-sm text-gray-500">تصنيف المحتوى</p>
             <NuxtLink to="#" class="text-sm text-olive-green hover:underline mt-2 inline-block">اقرأ المزيد</NuxtLink>
           </div>
           <!-- نهاية مثال البطاقة -->
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
// لا نحتاج لـ TypeScript هنا في هذه المرحلة لأننا نستخدم بيانات ثابتة
// لاحقًا، سنستخدم useFetch أو useAsyncData لجلب البيانات من Supabase
</script>

<style scoped>
/* أي تنسيقات خاصة بالصفحة الرئيسية فقط */
/* كلاسات لقص النص بعد عدد معين من الأسطر */
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
</style>