<template>
  <div>
    <!-- 1. Hero Section -->
    <section class="bg-gradient-to-br from-beige-light via-cream-gray to-yellow-50 py-20 px-6 relative overflow-hidden">
      <div class="container mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-right">
        <div class="md:w-2/3 z-10">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-olive-green mb-4">
            {{ greeting }} فضيلة الشيخ إبراهيم بشندي
          </h1>
          <p v-if="pending" class="text-lg text-brown-dark dark:text-gray-300 leading-relaxed mb-6">
            جاري تحميل النبذة...
          </p>
          <p v-else-if="error || !aboutData" class="text-lg text-red-500 leading-relaxed mb-6">
            لم يتم تحميل النبذة.
          </p>
          <p v-else class="text-lg text-brown-dark dark:text-gray-300 leading-relaxed mb-6">
            {{ aboutData.short_bio || 'نبذة مختصرة عن حياة الشيخ إبراهيم بشندي ومسيرته العلمية والدعوية...' }}
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-8">
            <NuxtLink to="/about" class="btn-primary">
              المزيد عن الشيخ
            </NuxtLink>
            <button
              v-if="upcomingLectureOrLive?.link"
              @click="openLiveStreamModal(upcomingLectureOrLive)"
              aria-label="مشاهدة البث المباشر أو المحاضرة القادمة"
              :class="[upcomingLectureOrLive?.type === 'live' ? 'btn-live' : 'btn-upcoming-lecture']">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
              </svg>
              <span>
                {{ isLiveNow(upcomingLectureOrLive?.date) ? (upcomingLectureOrLive?.type === 'live' ? 'شاهد البث الآن' : 'المحاضرة الآن') : (countdown ? 'يبدأ خلال ' + countdown : (upcomingLectureOrLive?.type === 'live' ? 'البث القادم' : 'المحاضرة القادمة')) }}
              </span>
            </button>
          </div>
        </div>
        <div class="md:w-1/3 flex justify-center md:justify-start z-10">
          <NuxtImg
            :src="aboutData?.profile_image_url || '/images/placeholder-sheikh.jpg'"
            alt="صورة الشيخ إبراهيم بشندي"
            class="rounded-lg shadow-xl w-64 h-64 md:w-72 md:h-72 object-cover border-4 border-white dark:border-gray-700"
            sizes="256px md:288px" format="webp" quality="85" loading="lazy" :placeholder="[60, 60, 75, 5]" />
        </div>
      </div>
      <div class="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-olive-green/10 dark:bg-olive-green/5 rounded-full opacity-30 blur-3xl z-0"></div>
      <div class="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-golden-calm/10 dark:bg-golden-calm/5 rounded-full opacity-30 blur-3xl z-0"></div>
    </section>

    <!-- 2. مواعيد الدروس والإعلانات (تعديل عرض التاريخ) -->
    <section class="py-16 px-4 bg-white dark:bg-gray-900">
      <div class="container mx-auto">
        <h2 class="text-3xl font-bold text-center text-brown-dark dark:text-beige-light mb-10">
          مواعيد الدروس والإعلانات
        </h2>
        <div v-if="pending" class="text-center py-10 text-gray-500 dark:text-gray-400">جاري تحميل المواعيد...</div>
        <div v-else-if="error && !data?.announcements" class="text-center py-10 text-red-500">حدث خطأ أثناء تحميل المواعيد.</div>
        <div v-else-if="!filteredAnnouncements?.length" class="text-center py-10 text-gray-500 dark:text-gray-400">لا توجد مواعيد أو إعلانات (غير البث المباشر) حاليًا.</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <div v-for="item in filteredAnnouncements" :key="item.id" class="bg-beige-light/70 dark:bg-gray-800 p-5 rounded-lg shadow-md border border-cream-gray dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-start hover:shadow-lg transition-shadow duration-300">
            <div class="flex-shrink-0 w-full sm:w-24 text-center sm:text-right">
              <span :class="['px-2.5 py-1 inline-block text-xs font-semibold rounded mb-1.5', item.type === 'lecture' ? 'tag-lecture' : 'tag-announcement']">
                {{ getTypeText(item.type) }}
              </span>
              <!-- ***** التعديل هنا: استخدام formatDate بدلاً من formatFriendlyDate وإزالة عرض الوقت ***** -->
              <div class="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {{ formatDate(item.date) || 'بدون تاريخ' }}
              </div>
              <!-- تم إزالة div الخاص بـ formatTimeOnly -->
            </div>
            <div class="flex-grow">
              <h3 class="font-semibold text-brown-dark dark:text-beige-light mb-2 text-lg">{{ item.title }}</h3>
              <p v-if="item.details" class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">{{ item.details }}</p>
              <NuxtLink v-if="item.link && item.type === 'announcement'" :to="item.link" class="text-sm text-primary hover:underline mt-auto inline-block">التفاصيل</NuxtLink>
              <NuxtLink v-if="item.link && item.type === 'lecture'" :to="item.link" class="text-sm text-primary hover:underline mt-auto inline-block">تفاصيل المحاضرة</NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. لوحة الشرف -->
    <section class="bg-cream-gray dark:bg-gray-800/50 py-16 px-4">
       <!-- ... الكود كما هو ... -->
       <div class="container mx-auto">
        <h2 class="text-3xl font-bold text-center text-brown-dark dark:text-beige-light mb-10">لوحة الشرف</h2>
        <div v-if="pending" class="text-center text-gray-500 dark:text-gray-400">جاري تحميل لوحة الشرف...</div>
        <div v-else-if="error && !data?.leaderboard" class="text-center text-red-500">حدث خطأ أثناء تحميل لوحة الشرف.</div>
        <div v-else-if="!leaderboard?.length" class="text-center text-gray-500 dark:text-gray-400">لا يوجد متفوقون حاليًا.</div>
        <div v-else class="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-cream-gray dark:border-gray-700">
           <ul class="space-y-4">
             <li v-for="(entry, index) in leaderboard" :key="entry.userId" class="flex items-center justify-between p-3 rounded-md hover:bg-beige-light/70 dark:hover:bg-gray-700/50 transition-colors border-b border-cream-gray dark:border-gray-700 last:border-b-0">
               <div class="flex items-center gap-x-4">
                 <span class="font-bold text-xl text-primary w-8 text-center">{{ index + 1 }}.</span>
                 <span class="font-semibold text-brown-dark dark:text-beige-light text-lg">{{ entry.userName }}</span>
               </div>
               <span class="text-base text-gray-600 dark:text-gray-400 font-medium">{{ entry.score }} نقطة</span>
             </li>
           </ul>
        </div>
         <div v-if="leaderboard?.length" class="text-center mt-10">
           <NuxtLink to="/leaderboard" class="inline-block bg-primary text-white py-2.5 px-7 rounded-md hover:bg-opacity-85 transition-colors text-lg shadow hover:shadow-md">
             عرض لوحة الشرف كاملة
          </NuxtLink>
        </div>
       </div>
    </section>

    <!-- 4. آخر الأسئلة المجابة -->
    <section class="py-16 px-4">
       <!-- ... الكود كما هو ... -->
       <div class="container mx-auto">
        <h2 class="text-3xl font-bold text-center text-brown-dark dark:text-beige-light mb-10">آخر الأسئلة المجابة</h2>
        <div v-if="pending" class="text-center py-10 text-gray-500 dark:text-gray-400">جاري تحميل الأسئلة...</div>
         <div v-else-if="error && !data?.latestQuestions" class="text-center py-10 text-red-500">حدث خطأ أثناء تحميل الأسئلة.</div>
        <div v-else-if="!latestQuestions?.length" class="text-center py-10 text-gray-500 dark:text-gray-400">لا توجد أسئلة مجابة حاليًا.</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="question in latestQuestions" :key="question.id" class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-cream-gray dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col">
            <NuxtLink :to="`/ask`" class="hover:text-primary group flex-grow">
              <h3 class="font-semibold text-lg mb-2 line-clamp-2 group-hover:underline text-brown-dark dark:text-beige-light">{{ question.title }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{{ question.answerSnippet }}</p>
            </NuxtLink>
            <NuxtLink :to="`/ask`" class="text-xs text-primary hover:underline mt-3 self-start">اقرأ الإجابة كاملة →</NuxtLink>
          </div>
        </div>
        <div class="text-center mt-10">
           <NuxtLink to="/ask" class="text-primary hover:underline font-semibold text-lg">عرض جميع الأسئلة المجابة</NuxtLink>
        </div>
        <!-- زر إرسال السؤال -->
        <div class="text-center mt-6">
          <NuxtLink to="/ask" class="bg-primary text-white py-2.5 px-6 rounded-md shadow hover:bg-opacity-90 transition-colors">
            أرسل سؤالك للشيخ
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 5. أحدث الإضافات -->
    <!-- 5.1 أحدث الدروس (المستقلة فقط) -->
    <section class="py-16 px-4 bg-beige-light/50 dark:bg-gray-800/20">
      <!-- ... الكود كما هو ... -->
       <div class="container mx-auto">
        <div class="flex justify-between items-center mb-10">
          <h2 class="text-3xl font-bold text-brown-dark dark:text-beige-light">أحدث الدروس المستقلة</h2>
          <NuxtLink v-if="latestLessons?.length" to="/lessons" class="text-sm text-primary hover:underline font-medium">عرض كل الدروس</NuxtLink>
        </div>
        <div v-if="pending" class="text-center text-gray-500 dark:text-gray-400">جاري تحميل الدروس...</div>
        <div v-else-if="error && !data?.latestLessons" class="text-center text-red-500">حدث خطأ أثناء تحميل الدروس.</div>
        <div v-else-if="!latestLessons?.length" class="text-center text-gray-500 dark:text-gray-400">لا توجد دروس مستقلة مضافة حديثًا.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="item in latestLessons" :key="`lesson-${item.id}`" class="content-card">
            <NuxtLink :to="item.link" class="block group">
              <NuxtImg :src="item.thumbnail || '/images/placeholder-lesson.jpg'" :alt="item.title" class="content-card-image"/>
              <div class="p-4">
                <p class="content-card-type">{{ getContentType(item.type) }}</p>
                <h3 class="content-card-title">{{ item.title }}</h3>
                 <span class="text-xs text-primary group-hover:underline">مشاهدة الدرس →</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 5.2 أحدث الدورات -->
    <section class="py-16 px-4 bg-white dark:bg-gray-900">
      <!-- ... الكود كما هو ... -->
       <div class="container mx-auto">
         <div class="flex justify-between items-center mb-10">
          <h2 class="text-3xl font-bold text-brown-dark dark:text-beige-light">أحدث الدورات</h2>
          <NuxtLink v-if="latestCourses?.length" to="/study" class="text-sm text-primary hover:underline font-medium">عرض كل الدورات</NuxtLink>
        </div>
        <div v-if="pending" class="text-center text-gray-500 dark:text-gray-400">جاري تحميل الدورات...</div>
        <div v-else-if="error && !data?.latestCourses" class="text-center text-red-500">حدث خطأ أثناء تحميل الدورات.</div>
        <div v-else-if="!latestCourses?.length" class="text-center text-gray-500 dark:text-gray-400">لا توجد دورات مضافة حديثًا.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="item in latestCourses" :key="`course-${item.id}`" class="content-card">
            <NuxtLink :to="item.link" class="block group">
              <NuxtImg :src="item.thumbnail || '/images/placeholder-course.jpg'" :alt="item.title" class="content-card-image"/>
              <div class="p-4">
                <p class="content-card-type">{{ getContentType(item.type) }}</p>
                <h3 class="content-card-title">{{ item.title }}</h3>
                 <span class="text-xs text-primary group-hover:underline">بدء الدورة →</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 5.3 أحدث الكتب -->
    <section class="py-16 px-4 bg-beige-light/50 dark:bg-gray-800/20">
       <!-- ... الكود كما هو ... -->
        <div class="container mx-auto">
        <div class="flex justify-between items-center mb-10">
          <h2 class="text-3xl font-bold text-brown-dark dark:text-beige-light">أحدث الكتب</h2>
           <NuxtLink v-if="latestBooks?.length" to="/books" class="text-sm text-primary hover:underline font-medium">عرض كل الكتب</NuxtLink>
        </div>
         <div v-if="pending" class="text-center text-gray-500 dark:text-gray-400">جاري تحميل الكتب...</div>
        <div v-else-if="error && !data?.latestBooks" class="text-center text-red-500">حدث خطأ أثناء تحميل الكتب.</div>
        <div v-else-if="!latestBooks?.length" class="text-center text-gray-500 dark:text-gray-400">لا توجد كتب مضافة حديثًا.</div>
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div v-for="item in latestBooks" :key="`book-${item.id}`" class="content-card">
            <NuxtLink :to="item.link" class="block group">
              <NuxtImg :src="item.thumbnail || '/images/placeholder-content.jpg'" :alt="item.title" class="content-card-image"/>
              <div class="p-4">
                <p class="content-card-type">{{ getContentType(item.type) }}</p>
                <h3 class="content-card-title">{{ item.title }}</h3>
                 <span class="text-xs text-primary group-hover:underline">تصفح الكتاب →</span>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal for Live Stream -->
     <ClientOnly>
        <VideoPreviewModal
         :show="showLiveModal"
         :video-url="liveStreamUrl"
         :title="liveStreamTitle"
         @close="closeLiveStreamModal" />
     </ClientOnly>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch, onMounted } from 'vue';
import { useSupabaseClient, useAsyncData } from '#imports';
import type { Database, Tables, Enums } from '~/types/database.types';
import VideoPreviewModal from '~/components/admin/VideoPreviewModal.vue'; // تأكد من المسار الصحيح

// --- Supabase Client ---
const client = useSupabaseClient<Database>();

// --- Types ---
type AnnouncementType = Enums<'announcement_type'>;
type Announcement = Omit<Tables<'announcements'>, 'type'> & { type: AnnouncementType, time?: string };
type Question = { id: number; title: string; answerSnippet: string; };
type LeaderboardEntry = { userId: string; userName: string; score: number; };
type ContentItem = { id: string | number; title: string; type: 'lesson' | 'book' | 'course'; thumbnail?: string | null; link: string; created_at: string; };
type AboutSheikhInfo = Tables<'about_sheikh'> | null;

// --- Modal State ---
const showLiveModal = ref(false);
const liveStreamUrl = ref('');
const liveStreamTitle = ref('');

// --- Countdown State ---
const countdown = ref<string | null>(null);
let countdownInterval: ReturnType<typeof setInterval> | null = null;

// --- Functions for Modal ---
function openLiveStreamModal(lecture: Announcement | undefined) {
    if (lecture?.link) {
        liveStreamUrl.value = lecture.link;
        liveStreamTitle.value = lecture.title;
        showLiveModal.value = true;
    }
}
function closeLiveStreamModal() {
    showLiveModal.value = false;
    liveStreamUrl.value = '';
    liveStreamTitle.value = '';
}

// --- Helper function to get YouTube Thumbnail ---
function getYoutubeThumbnailUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    let videoId: string | null = null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') { videoId = urlObj.pathname.slice(1); }
        else if (urlObj.hostname.includes('youtube.com')) {
            videoId = urlObj.searchParams.get('v');
            if (!videoId && urlObj.searchParams.get('list')) { return null; } // Cannot get playlist thumb reliably
        }
    } catch (e) { console.error("Error parsing YouTube URL:", e); return null; }
    if (videoId) { return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; }
    return null;
}


// --- Function to generate content links ---
function generateContentLink(type: ContentItem['type'], id: number | string): string {
    switch (type) {
        case 'lesson': return `/lessons/${id}`;
        case 'book': return `/books/${id}`;
        case 'course': return `/study/courses/${id}`;
        default: return '/';
    }
}

// --- Function to fetch homepage data ---
async function fetchHomepageData() {
  console.log("Fetching homepage data from Supabase...");
   const aboutPromise = client.from('about_sheikh').select('short_bio, profile_image_url').eq('id', 1).maybeSingle();
   const lessonsPromise = client.from('lessons').select('id, title, created_at, youtube_url').is('course_id', null).order('created_at', { ascending: false }).limit(4);
   const booksPromise = client.from('books').select('id, title, cover_image_url, created_at').order('created_at', { ascending: false }).limit(4);
   const coursesPromise = client.from('study_courses').select('id, title, created_at, youtube_playlist_url').eq('is_active', true).order('created_at', { ascending: false }).limit(4);
   const announcementsPromise = client.from('announcements').select('id, title, details, date, type, link').eq('is_published', true).order('date', { ascending: false, nullsFirst: false }).limit(6);
   const questionsPromise = client.from('questions_to_sheikh').select('id, question_text, answer_text').eq('is_public', true).eq('is_answered', true).order('answered_at', { ascending: false }).limit(4);
   const leaderboardPromise = client.from('profiles').select('id, full_name, points').order('points', { ascending: false }).limit(3);

  const [
    announcementsResponse, questionsResponse, leaderboardResponse, aboutResponse,
    lessonsResponse, booksResponse, coursesResponse
  ] = await Promise.all([
    announcementsPromise, questionsPromise, leaderboardPromise, aboutPromise,
    lessonsPromise, booksPromise, coursesPromise
  ]);
   const errors = [ /* ... */ ].filter(Boolean);
   if (errors.length > 0) { console.error('Errors fetching homepage data:', errors.map(e => e?.message)); }

  const processedQuestions = questionsResponse.data?.map(q => ({ id: q.id, title: q.question_text, answerSnippet: q.answer_text?.substring(0, 120) + (q.answer_text && q.answer_text.length > 120 ? '...' : '') || '...' })) || [];
  const processedLeaderboard = leaderboardResponse.data?.map(p => ({ userId: p.id, userName: p.full_name ?? 'مستخدم', score: p.points ?? 0 })) || [];
  const processedLessons = lessonsResponse.data?.map(item => ({ id: item.id, title: item.title, type: 'lesson' as const, thumbnail: getYoutubeThumbnailUrl(item.youtube_url), created_at: item.created_at, link: generateContentLink('lesson', item.id) })) || [];
  const processedBooks = booksResponse.data?.map(item => ({ id: item.id, title: item.title, type: 'book' as const, thumbnail: item.cover_image_url, created_at: item.created_at, link: generateContentLink('book', item.id) })) || [];
  const processedCourses = coursesResponse.data?.map(item => ({ id: item.id, title: item.title, type: 'course' as const, thumbnail: getYoutubeThumbnailUrl(item.youtube_playlist_url), created_at: item.created_at, link: generateContentLink('course', item.id) })) || [];

  return {
    aboutData: aboutResponse.data as AboutSheikhInfo,
    announcements: (announcementsResponse.data || []) as Announcement[],
    latestQuestions: processedQuestions,
    leaderboard: processedLeaderboard,
    latestLessons: processedLessons,
    latestBooks: processedBooks,
    latestCourses: processedCourses,
  };
}

// --- useAsyncData ---
const { data, pending, error } = await useAsyncData('homepageData', fetchHomepageData, { lazy: true });

// --- Computed Properties ---
const aboutData = computed(() => data.value?.aboutData || null);
const allAnnouncements = computed(() => data.value?.announcements || []); // Get all announcements first
const latestQuestions = computed(() => data.value?.latestQuestions || []);
const leaderboard = computed(() => data.value?.leaderboard || []);
const latestLessons = computed(() => data.value?.latestLessons || []);
const latestBooks = computed(() => data.value?.latestBooks || []);
const latestCourses = computed(() => data.value?.latestCourses || []);

// --- Upcoming Lecture/Live Logic (for Hero button) ---
const upcomingLectureOrLive = computed<Announcement | undefined>(() => {
  if (!allAnnouncements.value) return undefined;
  const now = new Date();
  // Find the nearest upcoming/ongoing lecture or live event
  return [...allAnnouncements.value]
    .filter(a => (a.type === 'lecture' || a.type === 'live') && a.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime()) // Sort by date ascending
    .find(a => new Date(a.date!).getTime() >= now.getTime() - (1 * 60 * 60 * 1000)); // Within the last hour or in the future
});

// --- Filtered Announcements (for the list section, excluding 'live' and the one shown in hero) ---
const filteredAnnouncements = computed(() => {
    const upcomingId = upcomingLectureOrLive.value?.id;
    return allAnnouncements.value.filter(a => {
        if (a.type === 'live') return false; // Exclude all live events
        if (a.id === upcomingId) return false; // Exclude the specific event shown in hero
        return true; // Include other announcements and lectures
    });
});


// --- Countdown Update Function ---
function updateCountdown() {
  if (!upcomingLectureOrLive.value?.date || isLiveNow(upcomingLectureOrLive.value.date)) {
    countdown.value = null;
    if (countdownInterval) clearInterval(countdownInterval);
    return;
  }
  const now = new Date();
  const eventDate = new Date(upcomingLectureOrLive.value.date);
  const diff = eventDate.getTime() - now.getTime();
  if (diff <= 0) {
    countdown.value = null;
    if (countdownInterval) clearInterval(countdownInterval);
  } else {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    let countdownString = '';
    if (days > 0) countdownString += `${days}ي `;
    if (hours > 0 || days > 0) countdownString += `${hours}س `;
    if (minutes > 0 || hours > 0 || days > 0) countdownString += `${minutes}د `;
    countdownString += `${seconds}ث`;
    countdown.value = countdownString.trim();
  }
}

// --- Lifecycle Hooks for Countdown ---
onMounted(() => {
   watch(upcomingLectureOrLive, (newLecture) => {
      if (countdownInterval) clearInterval(countdownInterval);
      if (newLecture && !isLiveNow(newLecture.date)) {
         updateCountdown();
         countdownInterval = setInterval(updateCountdown, 1000);
      } else {
          countdown.value = null;
      }
   }, { immediate: true }); // Use immediate: true to run the watch handler on mount
});

onUnmounted(() => {
  if (countdownInterval) { clearInterval(countdownInterval); }
});


// --- Greeting Computed Property ---
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return 'فجر مبارك مع';
  if (hour < 12) return 'صباح الخير مع';
  if (hour < 17) return 'نهارك سعيد مع';
  return 'مساء الخير مع';
});

// --- Helper Functions ---
function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { console.error("Error formatting date:", e); return dateString || ''; }
}
function formatFriendlyDate(dateString: string | null): string | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
  } catch (e) { console.error("Error formatting friendly date:", e); return null; }
}
function formatTimeOnly(dateString: string | null): string | null {
   if (!dateString) return null;
   try {
     const date = new Date(dateString);
     if (isNaN(date.getTime())) return null;
      const hasTimeComponent = dateString.includes('T') || dateString.includes(':'); // Improved check
      if (date.getHours() === 0 && date.getMinutes() === 0 && !hasTimeComponent) {
          return null;
      }
     return date.toLocaleTimeString('ar-EG', { timeStyle: 'short' });
   } catch (e) { console.error("Error formatting time only:", e); return null; }
}
function isLiveNow(dateString: string | null): boolean {
    if (!dateString) return false;
    try {
        const now = new Date();
        const eventDate = new Date(dateString);
        if (isNaN(eventDate.getTime())) return false;
        const eventDurationMs = 3 * 60 * 60 * 1000; // 3 hours duration example
        const eventEnd = new Date(eventDate.getTime() + eventDurationMs);
        return eventDate <= now && now < eventEnd;
    } catch (e) { console.error("Error checking if live now:", e); return false; }
}
function getTypeText(type: AnnouncementType | undefined): string {
    switch (type) {
        case 'lecture': return 'محاضرة';
        case 'announcement': return 'إعلان';
        case 'live': return 'بث مباشر';
        default: return 'غير محدد';
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
/* ----- أنماط الأزرار ----- */
.btn-primary {
  @apply bg-primary text-white py-3 px-10 rounded-md transition-all duration-300 text-lg shadow-lg hover:bg-opacity-90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900;
}
.btn-live {
  @apply inline-flex items-center gap-2 bg-red-600 text-white py-3 px-6 md:px-8 rounded-md transition-all duration-300 text-lg shadow-lg hover:bg-red-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 animate-pulse;
}
.btn-upcoming-lecture {
    @apply inline-flex items-center gap-2 bg-blue-600 text-white py-3 px-6 md:px-8 rounded-md transition-all duration-300 text-lg shadow-lg hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900;
}

/* ----- أنماط محتوى البطاقات ----- */
.content-card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700 overflow-hidden transition-shadow duration-200 hover:shadow-lg flex flex-col;
}
.content-card-image {
  @apply h-40 w-full object-cover group-hover:scale-105 transition-transform duration-300 bg-gray-200 dark:bg-gray-700; /* Added background color */
}
.content-card .p-4 {
    @apply flex flex-col flex-grow;
}
.content-card-type {
  @apply text-xs text-gray-500 dark:text-gray-400 mb-1;
}
.content-card-title {
  @apply font-semibold mb-2 line-clamp-2 text-brown-dark dark:text-beige-light group-hover:text-primary transition-colors flex-grow;
}
.content-card .text-xs {
    @apply mt-auto pt-2;
}

/* ----- أنماط الوسوم الخاصة بالإعلانات ----- */
.tag-lecture {
    @apply bg-blue-100 text-blue-800 dark:bg-blue-900/70 dark:text-blue-200;
}
.tag-live {
     @apply bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-200 animate-pulse;
}
.tag-announcement {
    @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-200;
}

/* ----- ميزة تقطيع الأسطر ----- */
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

/* ----- تأثير نبض زر البث المباشر (والوسم) ----- */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.animate-pulse {
  animation: pulse 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>