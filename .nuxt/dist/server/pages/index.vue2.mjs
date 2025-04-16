import __nuxt_component_0 from "../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import "../node_modules/_nuxt/image/dist/runtime/components/NuxtImg.vue.mjs";
import __nuxt_component_1 from "../node_modules/nuxt/dist/app/components/client-only.mjs";
import { defineComponent, ref, withAsyncContext, computed, unref, withCtx, createTextVNode, createVNode, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useAsyncData } from "../node_modules/nuxt/dist/app/composables/asyncData.mjs";
import _sfc_main$1 from "../node_modules/_nuxt/image/dist/runtime/components/NuxtImg.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const client = useSupabaseClient();
    ref(false);
    ref("");
    ref("");
    const countdown = ref(null);
    function getYoutubeThumbnailUrl(url) {
      if (!url) return null;
      let videoId = null;
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname === "youtu.be") {
          videoId = urlObj.pathname.slice(1);
        } else if (urlObj.hostname.includes("youtube.com")) {
          videoId = urlObj.searchParams.get("v");
          if (!videoId && urlObj.searchParams.get("list")) {
            return null;
          }
        }
      } catch (e) {
        console.error("Error parsing YouTube URL:", e);
        return null;
      }
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      }
      return null;
    }
    function generateContentLink(type, id) {
      switch (type) {
        case "lesson":
          return `/lessons/${id}`;
        case "book":
          return `/books/${id}`;
        case "course":
          return `/study/courses/${id}`;
        default:
          return "/";
      }
    }
    async function fetchHomepageData() {
      var _a, _b, _c, _d, _e;
      console.log("Fetching homepage data from Supabase...");
      const aboutPromise = client.from("about_sheikh").select("short_bio, profile_image_url").eq("id", 1).maybeSingle();
      const lessonsPromise = client.from("lessons").select("id, title, created_at, youtube_url").is("course_id", null).order("created_at", { ascending: false }).limit(4);
      const booksPromise = client.from("books").select("id, title, cover_image_url, created_at").order("created_at", { ascending: false }).limit(4);
      const coursesPromise = client.from("study_courses").select("id, title, created_at, youtube_playlist_url").eq("is_active", true).order("created_at", { ascending: false }).limit(4);
      const announcementsPromise = client.from("announcements").select("id, title, details, date, type, link").eq("is_published", true).order("date", { ascending: false, nullsFirst: false }).limit(6);
      const questionsPromise = client.from("questions_to_sheikh").select("id, question_text, answer_text").eq("is_public", true).eq("is_answered", true).order("answered_at", { ascending: false }).limit(4);
      const leaderboardPromise = client.from("profiles").select("id, full_name, points").order("points", { ascending: false }).limit(3);
      const [
        announcementsResponse,
        questionsResponse,
        leaderboardResponse,
        aboutResponse,
        lessonsResponse,
        booksResponse,
        coursesResponse
      ] = await Promise.all([
        announcementsPromise,
        questionsPromise,
        leaderboardPromise,
        aboutPromise,
        lessonsPromise,
        booksPromise,
        coursesPromise
      ]);
      const errors = [
        /* ... */
      ].filter(Boolean);
      if (errors.length > 0) {
        console.error("Errors fetching homepage data:", errors.map((e) => e == null ? void 0 : e.message));
      }
      const processedQuestions = ((_a = questionsResponse.data) == null ? void 0 : _a.map((q) => {
        var _a2;
        return { id: q.id, title: q.question_text, answerSnippet: ((_a2 = q.answer_text) == null ? void 0 : _a2.substring(0, 120)) + (q.answer_text && q.answer_text.length > 120 ? "..." : "") || "..." };
      })) || [];
      const processedLeaderboard = ((_b = leaderboardResponse.data) == null ? void 0 : _b.map((p) => ({ userId: p.id, userName: p.full_name ?? "مستخدم", score: p.points ?? 0 }))) || [];
      const processedLessons = ((_c = lessonsResponse.data) == null ? void 0 : _c.map((item) => ({ id: item.id, title: item.title, type: "lesson", thumbnail: getYoutubeThumbnailUrl(item.youtube_url), created_at: item.created_at, link: generateContentLink("lesson", item.id) }))) || [];
      const processedBooks = ((_d = booksResponse.data) == null ? void 0 : _d.map((item) => ({ id: item.id, title: item.title, type: "book", thumbnail: item.cover_image_url, created_at: item.created_at, link: generateContentLink("book", item.id) }))) || [];
      const processedCourses = ((_e = coursesResponse.data) == null ? void 0 : _e.map((item) => ({ id: item.id, title: item.title, type: "course", thumbnail: getYoutubeThumbnailUrl(item.youtube_playlist_url), created_at: item.created_at, link: generateContentLink("course", item.id) }))) || [];
      return {
        aboutData: aboutResponse.data,
        announcements: announcementsResponse.data || [],
        latestQuestions: processedQuestions,
        leaderboard: processedLeaderboard,
        latestLessons: processedLessons,
        latestBooks: processedBooks,
        latestCourses: processedCourses
      };
    }
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("homepageData", fetchHomepageData, { lazy: true })), __temp = await __temp, __restore(), __temp);
    const aboutData = computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.aboutData) || null;
    });
    const allAnnouncements = computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.announcements) || [];
    });
    const latestQuestions = computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.latestQuestions) || [];
    });
    const leaderboard = computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.leaderboard) || [];
    });
    const latestLessons = computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.latestLessons) || [];
    });
    const latestBooks = computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.latestBooks) || [];
    });
    const latestCourses = computed(() => {
      var _a;
      return ((_a = data.value) == null ? void 0 : _a.latestCourses) || [];
    });
    const upcomingLectureOrLive = computed(() => {
      if (!allAnnouncements.value) return void 0;
      const now = /* @__PURE__ */ new Date();
      return [...allAnnouncements.value].filter((a) => (a.type === "lecture" || a.type === "live") && a.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).find((a) => new Date(a.date).getTime() >= now.getTime() - 1 * 60 * 60 * 1e3);
    });
    const filteredAnnouncements = computed(() => {
      var _a;
      const upcomingId = (_a = upcomingLectureOrLive.value) == null ? void 0 : _a.id;
      return allAnnouncements.value.filter((a) => {
        if (a.type === "live") return false;
        if (a.id === upcomingId) return false;
        return true;
      });
    });
    const greeting = computed(() => {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      if (hour < 6) return "فجر مبارك مع";
      if (hour < 12) return "صباح الخير مع";
      if (hour < 17) return "نهارك سعيد مع";
      return "مساء الخير مع";
    });
    function formatDate(dateString) {
      if (!dateString) return "";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
      } catch (e) {
        console.error("Error formatting date:", e);
        return dateString || "";
      }
    }
    function isLiveNow(dateString) {
      if (!dateString) return false;
      try {
        const now = /* @__PURE__ */ new Date();
        const eventDate = new Date(dateString);
        if (isNaN(eventDate.getTime())) return false;
        const eventDurationMs = 3 * 60 * 60 * 1e3;
        const eventEnd = new Date(eventDate.getTime() + eventDurationMs);
        return eventDate <= now && now < eventEnd;
      } catch (e) {
        console.error("Error checking if live now:", e);
        return false;
      }
    }
    function getTypeText(type) {
      switch (type) {
        case "lecture":
          return "محاضرة";
        case "announcement":
          return "إعلان";
        case "live":
          return "بث مباشر";
        default:
          return "غير محدد";
      }
    }
    function getContentType(type) {
      switch (type) {
        case "lesson":
          return "درس";
        case "book":
          return "كتاب";
        case "course":
          return "دورة";
        default:
          return "محتوى";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_NuxtImg = _sfc_main$1;
      const _component_ClientOnly = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-caa61215><section class="bg-gradient-to-br from-beige-light via-cream-gray to-yellow-50 py-20 px-6 relative overflow-hidden" data-v-caa61215><div class="container mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-right" data-v-caa61215><div class="md:w-2/3 z-10" data-v-caa61215><h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-olive-green mb-4" data-v-caa61215>${ssrInterpolate(greeting.value)} فضيلة الشيخ إبراهيم بشندي </h1>`);
      if (unref(pending)) {
        _push(`<p class="text-lg text-brown-dark dark:text-gray-300 leading-relaxed mb-6" data-v-caa61215> جاري تحميل النبذة... </p>`);
      } else if (unref(error) || !aboutData.value) {
        _push(`<p class="text-lg text-red-500 leading-relaxed mb-6" data-v-caa61215> لم يتم تحميل النبذة. </p>`);
      } else {
        _push(`<p class="text-lg text-brown-dark dark:text-gray-300 leading-relaxed mb-6" data-v-caa61215>${ssrInterpolate(aboutData.value.short_bio || "نبذة مختصرة عن حياة الشيخ إبراهيم بشندي ومسيرته العلمية والدعوية...")}</p>`);
      }
      _push(`<div class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-8" data-v-caa61215>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/about",
        class: "btn-primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` المزيد عن الشيخ `);
          } else {
            return [
              createTextVNode(" المزيد عن الشيخ ")
            ];
          }
        }),
        _: 1
      }, _parent));
      if ((_a = upcomingLectureOrLive.value) == null ? void 0 : _a.link) {
        _push(`<button aria-label="مشاهدة البث المباشر أو المحاضرة القادمة" class="${ssrRenderClass([((_b = upcomingLectureOrLive.value) == null ? void 0 : _b.type) === "live" ? "btn-live" : "btn-upcoming-lecture"])}" data-v-caa61215><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" data-v-caa61215><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" data-v-caa61215></path></svg><span data-v-caa61215>${ssrInterpolate(isLiveNow((_c = upcomingLectureOrLive.value) == null ? void 0 : _c.date) ? ((_d = upcomingLectureOrLive.value) == null ? void 0 : _d.type) === "live" ? "شاهد البث الآن" : "المحاضرة الآن" : countdown.value ? "يبدأ خلال " + countdown.value : ((_e = upcomingLectureOrLive.value) == null ? void 0 : _e.type) === "live" ? "البث القادم" : "المحاضرة القادمة")}</span></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="md:w-1/3 flex justify-center md:justify-start z-10" data-v-caa61215>`);
      _push(ssrRenderComponent(_component_NuxtImg, {
        src: ((_f = aboutData.value) == null ? void 0 : _f.profile_image_url) || "/images/placeholder-sheikh.jpg",
        alt: "صورة الشيخ إبراهيم بشندي",
        class: "rounded-lg shadow-xl w-64 h-64 md:w-72 md:h-72 object-cover border-4 border-white dark:border-gray-700",
        sizes: "256px md:288px",
        format: "webp",
        quality: "85",
        loading: "lazy",
        placeholder: [60, 60, 75, 5]
      }, null, _parent));
      _push(`</div></div><div class="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-olive-green/10 dark:bg-olive-green/5 rounded-full opacity-30 blur-3xl z-0" data-v-caa61215></div><div class="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-golden-calm/10 dark:bg-golden-calm/5 rounded-full opacity-30 blur-3xl z-0" data-v-caa61215></div></section><section class="py-16 px-4 bg-white dark:bg-gray-900" data-v-caa61215><div class="container mx-auto" data-v-caa61215><h2 class="text-3xl font-bold text-center text-brown-dark dark:text-beige-light mb-10" data-v-caa61215> مواعيد الدروس والإعلانات </h2>`);
      if (unref(pending)) {
        _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-caa61215>جاري تحميل المواعيد...</div>`);
      } else if (unref(error) && !((_g = unref(data)) == null ? void 0 : _g.announcements)) {
        _push(`<div class="text-center py-10 text-red-500" data-v-caa61215>حدث خطأ أثناء تحميل المواعيد.</div>`);
      } else if (!((_h = filteredAnnouncements.value) == null ? void 0 : _h.length)) {
        _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-caa61215>لا توجد مواعيد أو إعلانات (غير البث المباشر) حاليًا.</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto" data-v-caa61215><!--[-->`);
        ssrRenderList(filteredAnnouncements.value, (item) => {
          _push(`<div class="bg-beige-light/70 dark:bg-gray-800 p-5 rounded-lg shadow-md border border-cream-gray dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-start hover:shadow-lg transition-shadow duration-300" data-v-caa61215><div class="flex-shrink-0 w-full sm:w-24 text-center sm:text-right" data-v-caa61215><span class="${ssrRenderClass(["px-2.5 py-1 inline-block text-xs font-semibold rounded mb-1.5", item.type === "lecture" ? "tag-lecture" : "tag-announcement"])}" data-v-caa61215>${ssrInterpolate(getTypeText(item.type))}</span><div class="text-xs text-gray-600 dark:text-gray-400 mt-1" data-v-caa61215>${ssrInterpolate(formatDate(item.date) || "بدون تاريخ")}</div></div><div class="flex-grow" data-v-caa61215><h3 class="font-semibold text-brown-dark dark:text-beige-light mb-2 text-lg" data-v-caa61215>${ssrInterpolate(item.title)}</h3>`);
          if (item.details) {
            _push(`<p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3" data-v-caa61215>${ssrInterpolate(item.details)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (item.link && item.type === "announcement") {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: item.link,
              class: "text-sm text-primary hover:underline mt-auto inline-block"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`التفاصيل`);
                } else {
                  return [
                    createTextVNode("التفاصيل")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (item.link && item.type === "lecture") {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: item.link,
              class: "text-sm text-primary hover:underline mt-auto inline-block"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`تفاصيل المحاضرة`);
                } else {
                  return [
                    createTextVNode("تفاصيل المحاضرة")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></section><section class="bg-cream-gray dark:bg-gray-800/50 py-16 px-4" data-v-caa61215><div class="container mx-auto" data-v-caa61215><h2 class="text-3xl font-bold text-center text-brown-dark dark:text-beige-light mb-10" data-v-caa61215>لوحة الشرف</h2>`);
      if (unref(pending)) {
        _push(`<div class="text-center text-gray-500 dark:text-gray-400" data-v-caa61215>جاري تحميل لوحة الشرف...</div>`);
      } else if (unref(error) && !((_i = unref(data)) == null ? void 0 : _i.leaderboard)) {
        _push(`<div class="text-center text-red-500" data-v-caa61215>حدث خطأ أثناء تحميل لوحة الشرف.</div>`);
      } else if (!((_j = leaderboard.value) == null ? void 0 : _j.length)) {
        _push(`<div class="text-center text-gray-500 dark:text-gray-400" data-v-caa61215>لا يوجد متفوقون حاليًا.</div>`);
      } else {
        _push(`<div class="max-w-lg mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-cream-gray dark:border-gray-700" data-v-caa61215><ul class="space-y-4" data-v-caa61215><!--[-->`);
        ssrRenderList(leaderboard.value, (entry, index) => {
          _push(`<li class="flex items-center justify-between p-3 rounded-md hover:bg-beige-light/70 dark:hover:bg-gray-700/50 transition-colors border-b border-cream-gray dark:border-gray-700 last:border-b-0" data-v-caa61215><div class="flex items-center gap-x-4" data-v-caa61215><span class="font-bold text-xl text-primary w-8 text-center" data-v-caa61215>${ssrInterpolate(index + 1)}.</span><span class="font-semibold text-brown-dark dark:text-beige-light text-lg" data-v-caa61215>${ssrInterpolate(entry.userName)}</span></div><span class="text-base text-gray-600 dark:text-gray-400 font-medium" data-v-caa61215>${ssrInterpolate(entry.score)} نقطة</span></li>`);
        });
        _push(`<!--]--></ul></div>`);
      }
      if ((_k = leaderboard.value) == null ? void 0 : _k.length) {
        _push(`<div class="text-center mt-10" data-v-caa61215>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/leaderboard",
          class: "inline-block bg-primary text-white py-2.5 px-7 rounded-md hover:bg-opacity-85 transition-colors text-lg shadow hover:shadow-md"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` عرض لوحة الشرف كاملة `);
            } else {
              return [
                createTextVNode(" عرض لوحة الشرف كاملة ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section><section class="py-16 px-4" data-v-caa61215><div class="container mx-auto" data-v-caa61215><h2 class="text-3xl font-bold text-center text-brown-dark dark:text-beige-light mb-10" data-v-caa61215>آخر الأسئلة المجابة</h2>`);
      if (unref(pending)) {
        _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-caa61215>جاري تحميل الأسئلة...</div>`);
      } else if (unref(error) && !((_l = unref(data)) == null ? void 0 : _l.latestQuestions)) {
        _push(`<div class="text-center py-10 text-red-500" data-v-caa61215>حدث خطأ أثناء تحميل الأسئلة.</div>`);
      } else if (!((_m = latestQuestions.value) == null ? void 0 : _m.length)) {
        _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-caa61215>لا توجد أسئلة مجابة حاليًا.</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-v-caa61215><!--[-->`);
        ssrRenderList(latestQuestions.value, (question) => {
          _push(`<div class="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-cream-gray dark:border-gray-700 hover:shadow-lg transition-shadow flex flex-col" data-v-caa61215>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/ask/${question.id}`,
            class: "hover:text-primary group flex-grow"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h3 class="font-semibold text-lg mb-2 line-clamp-2 group-hover:underline text-brown-dark dark:text-beige-light" data-v-caa61215${_scopeId}>${ssrInterpolate(question.title)}</h3><p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3" data-v-caa61215${_scopeId}>${ssrInterpolate(question.answerSnippet)}</p>`);
              } else {
                return [
                  createVNode("h3", { class: "font-semibold text-lg mb-2 line-clamp-2 group-hover:underline text-brown-dark dark:text-beige-light" }, toDisplayString(question.title), 1),
                  createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-400 line-clamp-3" }, toDisplayString(question.answerSnippet), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/ask/${question.id}`,
            class: "text-xs text-primary hover:underline mt-3 self-start"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`اقرأ الإجابة كاملة →`);
              } else {
                return [
                  createTextVNode("اقرأ الإجابة كاملة →")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`<div class="text-center mt-10" data-v-caa61215>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/ask",
        class: "text-primary hover:underline font-semibold text-lg"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`عرض جميع الأسئلة المجابة`);
          } else {
            return [
              createTextVNode("عرض جميع الأسئلة المجابة")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="text-center mt-6" data-v-caa61215>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/ask",
        class: "bg-primary text-white py-2.5 px-6 rounded-md shadow hover:bg-opacity-90 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` أرسل سؤالك للشيخ `);
          } else {
            return [
              createTextVNode(" أرسل سؤالك للشيخ ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></section><section class="py-16 px-4 bg-beige-light/50 dark:bg-gray-800/20" data-v-caa61215><div class="container mx-auto" data-v-caa61215><div class="flex justify-between items-center mb-10" data-v-caa61215><h2 class="text-3xl font-bold text-brown-dark dark:text-beige-light" data-v-caa61215>أحدث الدروس المستقلة</h2>`);
      if ((_n = latestLessons.value) == null ? void 0 : _n.length) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/lessons",
          class: "text-sm text-primary hover:underline font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`عرض كل الدروس`);
            } else {
              return [
                createTextVNode("عرض كل الدروس")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="text-center text-gray-500 dark:text-gray-400" data-v-caa61215>جاري تحميل الدروس...</div>`);
      } else if (unref(error) && !((_o = unref(data)) == null ? void 0 : _o.latestLessons)) {
        _push(`<div class="text-center text-red-500" data-v-caa61215>حدث خطأ أثناء تحميل الدروس.</div>`);
      } else if (!((_p = latestLessons.value) == null ? void 0 : _p.length)) {
        _push(`<div class="text-center text-gray-500 dark:text-gray-400" data-v-caa61215>لا توجد دروس مستقلة مضافة حديثًا.</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-v-caa61215><!--[-->`);
        ssrRenderList(latestLessons.value, (item) => {
          _push(`<div class="content-card" data-v-caa61215>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: item.link,
            class: "block group"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_NuxtImg, {
                  src: item.thumbnail || "/images/placeholder-lesson.jpg",
                  alt: item.title,
                  class: "content-card-image"
                }, null, _parent2, _scopeId));
                _push2(`<div class="p-4" data-v-caa61215${_scopeId}><p class="content-card-type" data-v-caa61215${_scopeId}>${ssrInterpolate(getContentType(item.type))}</p><h3 class="content-card-title" data-v-caa61215${_scopeId}>${ssrInterpolate(item.title)}</h3><span class="text-xs text-primary group-hover:underline" data-v-caa61215${_scopeId}>مشاهدة الدرس →</span></div>`);
              } else {
                return [
                  createVNode(_component_NuxtImg, {
                    src: item.thumbnail || "/images/placeholder-lesson.jpg",
                    alt: item.title,
                    class: "content-card-image"
                  }, null, 8, ["src", "alt"]),
                  createVNode("div", { class: "p-4" }, [
                    createVNode("p", { class: "content-card-type" }, toDisplayString(getContentType(item.type)), 1),
                    createVNode("h3", { class: "content-card-title" }, toDisplayString(item.title), 1),
                    createVNode("span", { class: "text-xs text-primary group-hover:underline" }, "مشاهدة الدرس →")
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></section><section class="py-16 px-4 bg-white dark:bg-gray-900" data-v-caa61215><div class="container mx-auto" data-v-caa61215><div class="flex justify-between items-center mb-10" data-v-caa61215><h2 class="text-3xl font-bold text-brown-dark dark:text-beige-light" data-v-caa61215>أحدث الدورات</h2>`);
      if ((_q = latestCourses.value) == null ? void 0 : _q.length) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/study",
          class: "text-sm text-primary hover:underline font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`عرض كل الدورات`);
            } else {
              return [
                createTextVNode("عرض كل الدورات")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="text-center text-gray-500 dark:text-gray-400" data-v-caa61215>جاري تحميل الدورات...</div>`);
      } else if (unref(error) && !((_r = unref(data)) == null ? void 0 : _r.latestCourses)) {
        _push(`<div class="text-center text-red-500" data-v-caa61215>حدث خطأ أثناء تحميل الدورات.</div>`);
      } else if (!((_s = latestCourses.value) == null ? void 0 : _s.length)) {
        _push(`<div class="text-center text-gray-500 dark:text-gray-400" data-v-caa61215>لا توجد دورات مضافة حديثًا.</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-v-caa61215><!--[-->`);
        ssrRenderList(latestCourses.value, (item) => {
          _push(`<div class="content-card" data-v-caa61215>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: item.link,
            class: "block group"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_NuxtImg, {
                  src: item.thumbnail || "/images/placeholder-course.jpg",
                  alt: item.title,
                  class: "content-card-image"
                }, null, _parent2, _scopeId));
                _push2(`<div class="p-4" data-v-caa61215${_scopeId}><p class="content-card-type" data-v-caa61215${_scopeId}>${ssrInterpolate(getContentType(item.type))}</p><h3 class="content-card-title" data-v-caa61215${_scopeId}>${ssrInterpolate(item.title)}</h3><span class="text-xs text-primary group-hover:underline" data-v-caa61215${_scopeId}>بدء الدورة →</span></div>`);
              } else {
                return [
                  createVNode(_component_NuxtImg, {
                    src: item.thumbnail || "/images/placeholder-course.jpg",
                    alt: item.title,
                    class: "content-card-image"
                  }, null, 8, ["src", "alt"]),
                  createVNode("div", { class: "p-4" }, [
                    createVNode("p", { class: "content-card-type" }, toDisplayString(getContentType(item.type)), 1),
                    createVNode("h3", { class: "content-card-title" }, toDisplayString(item.title), 1),
                    createVNode("span", { class: "text-xs text-primary group-hover:underline" }, "بدء الدورة →")
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></section><section class="py-16 px-4 bg-beige-light/50 dark:bg-gray-800/20" data-v-caa61215><div class="container mx-auto" data-v-caa61215><div class="flex justify-between items-center mb-10" data-v-caa61215><h2 class="text-3xl font-bold text-brown-dark dark:text-beige-light" data-v-caa61215>أحدث الكتب</h2>`);
      if ((_t = latestBooks.value) == null ? void 0 : _t.length) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/books",
          class: "text-sm text-primary hover:underline font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`عرض كل الكتب`);
            } else {
              return [
                createTextVNode("عرض كل الكتب")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="text-center text-gray-500 dark:text-gray-400" data-v-caa61215>جاري تحميل الكتب...</div>`);
      } else if (unref(error) && !((_u = unref(data)) == null ? void 0 : _u.latestBooks)) {
        _push(`<div class="text-center text-red-500" data-v-caa61215>حدث خطأ أثناء تحميل الكتب.</div>`);
      } else if (!((_v = latestBooks.value) == null ? void 0 : _v.length)) {
        _push(`<div class="text-center text-gray-500 dark:text-gray-400" data-v-caa61215>لا توجد كتب مضافة حديثًا.</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" data-v-caa61215><!--[-->`);
        ssrRenderList(latestBooks.value, (item) => {
          _push(`<div class="content-card" data-v-caa61215>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: item.link,
            class: "block group"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_component_NuxtImg, {
                  src: item.thumbnail || "/images/placeholder-content.jpg",
                  alt: item.title,
                  class: "content-card-image"
                }, null, _parent2, _scopeId));
                _push2(`<div class="p-4" data-v-caa61215${_scopeId}><p class="content-card-type" data-v-caa61215${_scopeId}>${ssrInterpolate(getContentType(item.type))}</p><h3 class="content-card-title" data-v-caa61215${_scopeId}>${ssrInterpolate(item.title)}</h3><span class="text-xs text-primary group-hover:underline" data-v-caa61215${_scopeId}>تصفح الكتاب →</span></div>`);
              } else {
                return [
                  createVNode(_component_NuxtImg, {
                    src: item.thumbnail || "/images/placeholder-content.jpg",
                    alt: item.title,
                    class: "content-card-image"
                  }, null, 8, ["src", "alt"]),
                  createVNode("div", { class: "p-4" }, [
                    createVNode("p", { class: "content-card-type" }, toDisplayString(getContentType(item.type)), 1),
                    createVNode("h3", { class: "content-card-title" }, toDisplayString(item.title), 1),
                    createVNode("span", { class: "text-xs text-primary group-hover:underline" }, "تصفح الكتاب →")
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div></section>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=index.vue2.mjs.map
