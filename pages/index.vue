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
            <!-- يمكن لاحقًا جلب هذه النبذة من قاعدة البيانات -->
            نبذة مختصرة عن حياة الشيخ إبراهيم بشندي ومسيرته العلمية والدعوية.
            هذا النص سيتم إدارته لاحقًا من لوحة التحكم لعرض معلومات محدثة ودقيقة
            عن الشيخ حفظه الله. نسعى لتقديم محتوى ثري ومفيد لجميع المسلمين.
          </p>
          <NuxtLink to="/about" class="inline-block bg-olive-green text-white py-2 px-6 rounded-md hover:bg-opacity-80 transition-colors text-lg">
            المزيد عن الشيخ
          </NuxtLink>
        </div>
        <div class="md:w-1/3 flex justify-center md:justify-start">
          <!-- استخدام NuxtImg لتحسين الأداء -->
          <NuxtImg
            src="/images/placeholder-sheikh.jpg"
            alt="صورة الشيخ إبراهيم بشندي"
            class="rounded-lg shadow-lg w-60 h-60 object-cover"
            sizes="240px"
            format="webp"
            quality="80"
            loading="lazy"
            :placeholder="[60, 60, 75, 5]" /> <!-- Placeholder لطيف -->
          <!-- تأكد من وجود الصورة في public/images/placeholder-sheikh.jpg -->
        </div>
      </div>
    </section>

    <!-- 2. مواعيد وأخبار (القسم الجديد) -->
    <section class="py-12 px-4 bg-white"> <!-- خلفية بيضاء للتمييز -->
      <div class="container mx-auto">
        <h2 class="text-2xl font-bold text-center text-brown-dark mb-8">مواعيد الدروس والإعلانات</h2>
        <div v-if="pending">
          <p class="text-center text-gray-500">جاري تحميل المواعيد...</p>
        </div>
        <div v-else-if="error && !data?.announcements">
           <p class="text-center text-red-500">حدث خطأ أثناء تحميل المواعيد.</p>
        </div>
         <div v-else-if="!announcements?.length">
          <p class="text-center text-gray-500">لا توجد مواعيد أو إعلانات حاليًا.</p>
        </div>
        <div v-else class="space-y-4 max-w-3xl mx-auto">
          <!-- مثال لإعلان أو موعد (سيتم استخدام مكون AnnouncementCard لاحقًا) -->
          <div v-for="item in announcements" :key="item.id" class="bg-beige-light/50 p-4 rounded-lg shadow-sm border border-cream-gray flex flex-col sm:flex-row gap-4 items-start">
            <div class="flex-shrink-0 w-full sm:w-28 text-center">
               <div class="text-sm font-semibold text-olive-green bg-olive-green/10 rounded px-2 py-1 inline-block mb-1">{{ item.type === 'lecture' ? 'محاضرة' : 'إعلان' }}</div>
               <div class="text-xs text-gray-600">{{ formatDate(item.date) }}</div>
               <div v-if="item.time" class="text-xs text-gray-600">{{ item.time }}</div>
            </div>
            <div class="flex-grow">
              <h3 class="font-semibold text-brown-dark mb-1">{{ item.title }}</h3>
              <p class="text-sm text-gray-700 line-clamp-3">
                {{ item.details }}
              </p>
              <!-- يمكن إضافة رابط إذا كان للإعلان رابط خاص -->
              <NuxtLink v-if="item.link" :to="item.link" class="text-sm text-olive-green hover:underline mt-2 inline-block">التفاصيل</NuxtLink>
            </div>
          </div>
          <!-- نهاية مثال الإعلان -->
        </div>
      </div>
    </section>

    <!-- 3. آخر الأسئلة المجابة -->
    <section class="py-12 px-4">
      <div class="container mx-auto">
        <h2 class="text-2xl font-bold text-center text-brown-dark mb-8">آخر الأسئلة المجابة</h2>
        <div v-if="pending">
          <p class="text-center text-gray-500">جاري تحميل الأسئلة...</p>
        </div>
         <div v-else-if="error && !data?.latestQuestions">
           <p class="text-center text-red-500">حدث خطأ أثناء تحميل الأسئلة.</p>
        </div>
        <div v-else-if="!latestQuestions?.length">
          <p class="text-center text-gray-500">لا توجد أسئلة مجابة حاليًا.</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- مثال لسؤال واحد (سيتم استخدام مكون QuestionPreviewCard لاحقًا) -->
          <div v-for="question in latestQuestions" :key="question.id" class="bg-white p-4 rounded-lg shadow border border-cream-gray hover:shadow-md transition-shadow">
            <NuxtLink :to="`/ask/${question.id}`" class="hover:text-olive-green group"> <!-- رابط لصفحة السؤال -->
              <h3 class="font-semibold mb-2 line-clamp-2 group-hover:underline">{{ question.title }}</h3>
            </NuxtLink>
            <p class="text-sm text-gray-600 line-clamp-3">
              {{ question.answerSnippet }}
            </p>
          </div>
          <!-- نهاية مثال السؤال -->
        </div>
        <div v-if="latestQuestions?.length" class="text-center mt-8">
           <NuxtLink to="/ask" class="text-olive-green hover:underline font-medium">
             عرض جميع الأسئلة
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 4. مقتطف قائمة المتفوقين -->
    <section class="bg-cream-gray py-12 px-4">
       <div class="container mx-auto">
        <h2 class="text-2xl font-bold text-center text-brown-dark mb-8">لوحة الشرف (المتفوقون دراسيًا)</h2>
         <div v-if="pending">
          <p class="text-center text-gray-500">جاري تحميل لوحة الشرف...</p>
         </div>
         <div v-else-if="error && !data?.leaderboard">
           <p class="text-center text-red-500">حدث خطأ أثناء تحميل لوحة الشرف.</p>
         </div>
         <div v-else-if="!leaderboard?.length">
           <p class="text-center text-gray-500">لا يوجد متفوقون حاليًا.</p>
         </div>
        <div v-else class="max-w-md mx-auto bg-white p-6 rounded-lg shadow border border-cream-gray">
           <ul class="space-y-3">
             <!-- مثال لطالب (سيتم استخدام مكون LeaderboardItem لاحقًا) -->
             <li v-for="(entry, index) in leaderboard" :key="entry.userId" class="flex items-center justify-between p-2 rounded hover:bg-beige-light transition-colors">
               <div class="flex items-center gap-x-3">
                 <span class="font-bold text-lg text-olive-green w-6 text-center">{{ index + 1 }}.</span>
                 <span class="font-medium text-brown-dark">{{ entry.userName }}</span>
               </div>
               <span class="text-sm text-gray-500">{{ entry.score }} نقطة</span> <!-- أو حسب ما يمثل التفوق -->
             </li>
             <!-- نهاية مثال الطالب -->
           </ul>
        </div>
         <div v-if="leaderboard?.length" class="text-center mt-8">
           <NuxtLink to="/leaderboard" class="inline-block bg-olive-green text-white py-2 px-5 rounded-md hover:bg-opacity-80 transition-colors">
             عرض لوحة الشرف كاملة
          </NuxtLink>
        </div>
       </div>
    </section>

    <!-- 5. أحدث المحتوى (دروس، كتب، إلخ) -->
    <section class="py-12 px-4">
      <div class="container mx-auto">
        <h2 class="text-2xl font-bold text-center text-brown-dark mb-8">أحدث الإضافات</h2>
         <div v-if="pending">
           <p class="text-center text-gray-500">جاري تحميل المحتوى...</p>
         </div>
          <div v-else-if="error && !data?.latestContent">
           <p class="text-center text-red-500">حدث خطأ أثناء تحميل المحتوى.</p>
         </div>
         <div v-else-if="!latestContent?.length">
           <p class="text-center text-gray-500">لا يوجد محتوى مضاف حديثًا.</p>
         </div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           <!-- مثال لبطاقة محتوى (سيتم استخدام مكونات مثل LessonCard, BookCard لاحقًا) -->
           <div v-for="item in latestContent" :key="item.id" class="bg-white rounded-lg shadow border border-cream-gray overflow-hidden group hover:shadow-lg transition-shadow">
              <!-- استخدام NuxtImg للصورة المصغرة -->
             <NuxtImg
               :src="item.thumbnail || '/images/placeholder-content.jpg'"
               alt=""
               class="h-40 w-full object-cover"
               sizes="300px sm:400px md:300px"
               format="webp"
               quality="75"
               loading="lazy"
              :placeholder="[40, 20, 75, 5]" />
             <div class="p-4">
               <p class="text-xs text-gray-500 mb-1">{{ getContentType(item.type) }}</p>
               <h3 class="font-semibold mb-2 line-clamp-2 text-brown-dark group-hover:text-olive-green transition-colors">{{ item.title }}</h3>
               <NuxtLink :to="item.link" class="text-sm text-olive-green hover:underline mt-2 inline-block">
                 {{ item.type === 'book' ? 'تحميل الكتاب' : 'مشاهدة الدرس' }}
               </NuxtLink>
            </div>
           </div>
           <!-- نهاية مثال البطاقة -->
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// --- 1. تعريف واجهات البيانات (Interfaces) ---
interface Announcement {
  id: number;
  title: string;
  details: string;
  date: string; // ISO format e.g., "2024-07-28T10:00:00Z"
  time?: string; // Optional time e.g., "10:00 صباحًا"
  type: 'announcement' | 'lecture';
  link?: string; // Optional link for more details
}

interface Question {
  id: number;
  title: string;
  answerSnippet: string; // Short preview of the answer
}

interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number; // Or completions, points, etc.
}

interface ContentItem {
  id: number;
  title: string;
  type: 'lesson' | 'book' | 'course'; // Example types
  thumbnail?: string; // Optional image URL
  link: string; // Link to the content page
}

// --- 2. محاكاة جلب البيانات (استخدم بيانات وهمية مؤقتًا) ---
// في التطبيق الحقيقي، هذه الدالة ستتصل بـ Supabase
async function fetchHomepageData() {
  console.log("Fetching homepage data (mock)...");
  // محاكاة تأخير الشبكة
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- بيانات وهمية (Mock Data) ---
  const mockAnnouncements: Announcement[] = [
    { id: 1, title: 'محاضرة الأسبوع: فقه الصيام', details: 'محاضرة مباشرة عن أحكام الصيام وما يتعلق به، يقدمها فضيلة الشيخ إبراهيم بشندي.', date: '2024-08-05T18:00:00Z', time: '06:00 مساءً', type: 'lecture', link: '/live' },
    { id: 2, title: 'إعلان هام: بدء التسجيل في دورة العقيدة المستوى الأول', details: 'تم فتح باب التسجيل في دورة العقيدة (المستوى الأول). سارع بالتسجيل فالأماكن محدودة.', date: '2024-08-01T09:00:00Z', type: 'announcement', link: '/courses/aqeedah-1' },
     { id: 3, title: 'تذكير: حلقة التفسير الأسبوعية', details: 'نذكركم بحلقة تفسير سورة البقرة الأسبوعية كل يوم ثلاثاء بعد صلاة العشاء بتوقيت مكة المكرمة.', date: '2024-08-06T19:30:00Z', time:'بعد العشاء', type: 'lecture'},
  ];

  const mockLatestQuestions: Question[] = [
    { id: 101, title: 'ما حكم استخدام معجون الأسنان أثناء الصيام؟', answerSnippet: 'يجوز استخدام معجون الأسنان للصائم بشرط ألا يبتلع شيئاً منه...' },
    { id: 102, title: 'هل يجوز إخراج زكاة الفطر نقداً؟', answerSnippet: 'اختلف العلماء في هذه المسألة، والراجح عند بعضهم جواز إخراج القيمة للحاجة...' },
    { id: 103, title: 'كيف أجمع بين طلب العلم والعمل؟', answerSnippet: 'التوفيق بين طلب العلم والعمل يتطلب تنظيم الوقت وتحديد الأولويات والاستعانة بالله...' },
    { id: 104, title: 'ما فضل قراءة سورة الكهف يوم الجمعة؟', answerSnippet: 'وردت أحاديث في فضل قراءة سورة الكهف يوم الجمعة وأنها نور ما بين الجمعتين...' },
  ];

  const mockLeaderboard: LeaderboardEntry[] = [
    { userId: 'user1', userName: 'عبد الله محمد', score: 1500 },
    { userId: 'user2', userName: 'فاطمة علي', score: 1450 },
    { userId: 'user3', userName: 'أحمد خالد', score: 1380 },
  ];

  const mockLatestContent: ContentItem[] = [
    { id: 201, title: 'شرح كتاب التوحيد - الدرس الخامس', type: 'lesson', link: '/lessons/tawheed-5', thumbnail:'/images/content/lesson1.jpg' },
    { id: 202, title: 'كتاب مختصر النصيحة', type: 'book', link: '/books/naseeha', thumbnail:'/images/content/book1.jpg' },
    { id: 203, title: 'دورة السيرة النبوية - الدرس الأول', type: 'course', link: '/courses/seerah-1/lesson-1', thumbnail:'/images/content/course1.jpg' },
    { id: 204, title: 'الرد على شبهات حول السنة', type: 'lesson', link: '/lessons/shubuhat-sunnah', thumbnail:'/images/content/lesson2.jpg' },
    { id: 205, title: 'آداب طالب العلم', type: 'lesson', link: '/lessons/adab-talib', thumbnail:'/images/content/lesson3.jpg' },
     { id: 206, title: 'كتاب رياض الصالحين (PDF)', type: 'book', link: '/books/riyadh-salihin', thumbnail:'/images/content/book2.jpg' },
  ];

  // محاكاة خطأ محتمل (للاختبار)
  // if (Math.random() > 0.8) {
  //   throw new Error("Failed to fetch mock data!");
  // }

  return {
    announcements: mockAnnouncements,
    latestQuestions: mockLatestQuestions,
    leaderboard: mockLeaderboard,
    latestContent: mockLatestContent,
  };
}

// --- 3. استخدام useAsyncData لجلب البيانات ---
const { data, pending, error } = await useAsyncData('homepage', fetchHomepageData, {
   lazy: true // يجعل الصفحة تعرض المحتوى الثابت أولاً ثم تُحمّل البيانات
});

// --- 4. Computed Properties للوصول السهل للبيانات ---
const announcements = computed(() => data.value?.announcements || []);
const latestQuestions = computed(() => data.value?.latestQuestions?.slice(0, 4) || []); // عرض 4 فقط
const leaderboard = computed(() => data.value?.leaderboard?.slice(0, 3) || []); // عرض 3 فقط
const latestContent = computed(() => data.value?.latestContent?.slice(0, 6) || []); // عرض 6 فقط

// --- 5. دوال مساعدة ---
function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
     // يمكن استخدام مكتبة مثل date-fns لتنسيق أكثر احترافية ودعمًا للغة
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString; // أرجع النص الأصلي عند الخطأ
  }
}

function getContentType(type: ContentItem['type']): string {
  switch (type) {
    case 'lesson': return 'درس';
    case 'book': return 'كتاب';
    case 'course': return 'دورة';
    default: return 'محتوى';
  }
}

</script>

<style scoped>
/* أي تنسيقات خاصة بالصفحة الرئيسية فقط */
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

/* تحسين بسيط لمظهر البطاقات */
.shadow {
   box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}
.shadow-md {
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
}
.hover\:shadow-md:hover {
   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
}
.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
</style>
