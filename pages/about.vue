<template>
  <div class="container mx-auto px-4 py-12"> {/* زيادة الـ padding العمودي */}
    <h1 class="text-4xl font-bold text-center text-brown-dark dark:text-brown-dark mb-12 border-b-2 border-olive-green pb-3"> {/* تكبير الخط وتوسيطه */}
      عن الشيخ إبراهيم بشندي
    </h1>

    <!-- قسم المقدمة أو النبذة الرئيسية (اختياري) -->
    <section class="mb-16 text-center max-w-3xl mx-auto">
      <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
        هنا يمكنك إضافة نبذة مختصرة أو مقدمة عامة عن الشيخ قبل الدخول في التفاصيل المتناوبة. هذا النص سيكون أيضًا قابلاً للإدارة لاحقًا.
      </p>
    </section>

    <!-- أقسام المحتوى المتناوب -->
    <div class="space-y-16"> {/* زيادة المسافة بين الأقسام */}

      <!-- مثال قسم 1: صورة يسار، نص يمين -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center"> {/* زيادة الـ gap */}
        <div class="image-container md:order-1"> {/* الصورة أولاً في الجوال، أولاً في الكمبيوتر */}
          <img
            src="https://via.placeholder.com/600x400/ddeeff/556677?text=صورة+الشيخ+1"
            alt="صورة للشيخ إبراهيم بشندي - قسم 1"
            class="rounded-lg shadow-lg w-full h-auto object-cover aspect-video transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div class="text-container md:order-2 prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"> {/* النص ثانياً */}
          <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-4">عنوان القسم الأول</h2>
          <p>
            فقرة نصية تشرح جانبًا معينًا من سيرة الشيخ أو إنجازاته. لوريم إيبسوم دولور سيت أميت، كونسيكتيتور أديبيسشينج إيليت. سيد دو إيوسمود تيمبور إنكيديدونت أوت لابوري إت دولوري ماجنا أليكيوا.
          </p>
          <p>
            أوت إنيم أد مينيم فينيام، كيس نوسترود إكسيرسيتاتيون أولامكو لابوريس نيسي أوت أليكويب إكس يا كومودو كونسيكيوات. دويس أوتي إيروري دولور إن ريبريهينديريت إن فولوبتاتي فيليت إيسي سيلوم دولوري يو فوجيات نولا بارياتور.
          </p>
        </div>
      </section>

      <!-- مثال قسم 2: نص يسار، صورة يمين -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
        <div class="text-container md:order-1 prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"> {/* النص أولاً */}
          <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-4">عنوان القسم الثاني</h2>
          <p>
            فقرة نصية أخرى. إكسسيبتيور سينت أوككات كوپيداتات نون پروايدنت، سانت ان کولپا کوئی اوفیسیا دسرونت مولیت انیم اید است لابوروم. لوريم إيبسوم دولور سيت أميت، كونسيكتيتور أديبيسشينج إيليت.
          </p>
          <ul>
            <li>نقطة أولى في قائمة.</li>
            <li>نقطة ثانية للتوضيح.</li>
            <li>نقطة ثالثة للمعلومات.</li>
          </ul>
        </div>
        <div class="image-container md:order-2"> {/* الصورة ثانياً في الجوال، ثانياً في الكمبيوتر */}
          <img
            src="https://via.placeholder.com/600x400/eeddcc/776655?text=صورة+الشيخ+2"
            alt="صورة أخرى للشيخ إبراهيم بشندي - قسم 2"
            class="rounded-lg shadow-lg w-full h-auto object-cover aspect-video transition-transform duration-300 hover:scale-105"
          />
        </div>
      </section>

      <!-- مثال قسم 3: صورة يسار، نص يمين -->
       <section class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
        <div class="image-container md:order-1"> {/* الصورة أولاً */}
           <img
             src="https://via.placeholder.com/600x400/dcf0dc/667766?text=صورة+الشيخ+3"
             alt="صورة ثالثة للشيخ إبراهيم بشندي - قسم 3"
             class="rounded-lg shadow-lg w-full h-auto object-cover aspect-video transition-transform duration-300 hover:scale-105"
           />
         </div>
         <div class="text-container md:order-2 prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"> {/* النص ثانياً */}
           <h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-4">عنوان القسم الثالث</h2>
           <p>
            فقرة نصية ثالثة. كونسيكتيتور أديبيسشينج إيليت سيد دو إيوسمود تيمبور إنكيديدونت أوت لابوري إت دولوري ماجنا أليكيوا. لوريم إيبسوم دولور سيت أميت.
          </p>
           <blockquote>
            "هنا يمكن إضافة اقتباس مؤثر للشيخ." - الشيخ إبراهيم بشندي
          </blockquote>
         </div>
       </section>

       <!-- يمكنك إضافة المزيد من الأقسام هنا بنفس النمط المتناوب -->

    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#imports';

// --- SEO Meta ---
useHead({
  title: 'عن الشيخ إبراهيم بشندي',
  meta: [
    { name: 'description', content: 'تعرف على سيرة الشيخ إبراهيم بشندي، نشأته العلمية، ومسيرته الدعوية.' }
    // يمكنك إضافة المزيد من meta tags مثل Open Graph
  ]
});

// --- بيانات المحتوى (مؤقتة) ---
// لاحقًا، سيتم جلب هذه البيانات من Supabase باستخدام useAsyncData
// قد يكون لديك جدول مثل `about_sections` يحتوي على (id, order, image_url, text_content)
// وستقوم بعمل v-for على البيانات المجوبة لإنشاء الأقسام ديناميكيًا
// مثال للشكل المتوقع للبيانات لاحقًا:
/*
const { data: sections, pending, error } = await useAsyncData('aboutSections', async () => {
  const { data, error } = await supabase
    .from('about_sections') // اسم الجدول المقترح
    .select('id, image_url, text_content')
    .order('section_order', { ascending: true }); // ترتيب الأقسام
  if (error) throw error;
  return data;
});
*/

// حاليًا، الأقسام مبنية بشكل ثابت في القالب أعلاه.

</script>

<style scoped>
/* يمكنك إضافة تنسيقات خاصة هنا، ولكن Tailwind و Prose يوفران الكثير */

/* تحسين بسيط لقراءة الاقتباس */
blockquote {
  border-right-width: 4px; /* تغيير الاتجاه لليمين */
  border-left-width: 0;
  border-color: var(--color-olive-green); /* استخدام لون من ألوان الموقع */
  padding-right: 1rem;
  padding-left: 0;
  font-style: italic;
  color: #4a5568; /* لون أغمق قليلاً */
}

.dark blockquote {
  border-color: var(--color-golden-calm); /* لون مختلف للوضع الداكن */
   color: #cbd5e0; /* لون أفتح */
}
</style>