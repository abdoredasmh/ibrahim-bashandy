import __nuxt_component_0 from "../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderComponent, ssrRenderClass } from "vue/server-renderer";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import AdminLessonModal from "../../components/admin/AdminLessonModal.vue.mjs";
import "../../components/admin/VideoPreviewModal.vue.mjs";
import { useDebounceFn } from "@vueuse/core";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useHead } from "../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import _sfc_main$1 from "../../components/admin/VideoPreviewModal.vue2.mjs";
const PAGE_SIZE = 15;
const SEARCH_DEBOUNCE_MS = 400;
const NO_COURSE_VALUE = -1;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "lessons",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({ title: "إدارة الدروس" });
    const supabase = useSupabaseClient();
    const isListLoading = ref(true);
    const fetchError = ref(null);
    const lessons = ref(null);
    const totalLessons = ref(0);
    const searchTerm = ref("");
    const filterCategory = ref(null);
    const filterCourse = ref(null);
    const sortBy = ref("created_at");
    const sortOrder = ref("desc");
    const categories = ref([]);
    const courses = ref([]);
    const isLoadingFilters = ref(true);
    const currentPage = ref(1);
    const isDeleting = ref(null);
    const successMessage = ref(null);
    const actionError = ref(null);
    const showModal = ref(false);
    const selectedLesson = ref(null);
    const showVideoPreview = ref(false);
    const previewVideoUrl = ref(null);
    const preselectedCourseIdForModal = computed(
      () => filterCourse.value !== null && filterCourse.value !== NO_COURSE_VALUE ? filterCourse.value : null
    );
    const totalPages = computed(() => {
      if (!totalLessons.value || totalLessons.value <= 0) return 1;
      return Math.ceil(totalLessons.value / PAGE_SIZE);
    });
    const fetchLessons = async (page = currentPage.value) => {
      isListLoading.value = true;
      fetchError.value = null;
      clearMessages(false);
      console.log(`[fetchLessons] Fetching page ${page}, Filters: Cat=${filterCategory.value}, Course=${filterCourse.value}, Search='${searchTerm.value}', Sort=${sortBy.value} ${sortOrder.value}`);
      const rangeFrom = (page - 1) * PAGE_SIZE;
      const rangeTo = rangeFrom + PAGE_SIZE - 1;
      try {
        let query = supabase.from("lessons").select(`id, title, description, youtube_url, category_id, course_id, created_at, module_number, lesson_order, categories ( name ), study_courses ( title )`, { count: "exact" });
        if (filterCategory.value !== null) query = query.eq("category_id", filterCategory.value);
        if (filterCourse.value !== null) query = filterCourse.value === NO_COURSE_VALUE ? query.is("course_id", null) : query.eq("course_id", filterCourse.value);
        const trimmedSearch = searchTerm.value.trim();
        if (trimmedSearch) query = query.ilike("title", `%${trimmedSearch}%`);
        query = query.order(sortBy.value, { ascending: sortOrder.value === "asc", nullsFirst: false });
        if (sortBy.value !== "created_at") query = query.order("created_at", { ascending: false });
        query = query.range(rangeFrom, rangeTo);
        console.log("[fetchLessons] Executing query...");
        const { data, error, count } = await query;
        console.log(`[fetchLessons] Query executed. Error: ${!!error}, Count: ${count}, Data received: ${(data == null ? void 0 : data.length) ?? 0}`);
        if (error) throw error;
        lessons.value = data;
        totalLessons.value = count ?? 0;
        currentPage.value = page;
        if (page > totalPages.value && totalPages.value > 0) {
          console.log(`[fetchLessons] Current page ${page} out of bounds. Fetching last page.`);
          await fetchLessons(totalPages.value);
        }
      } catch (err) {
        console.error("[fetchLessons] Error fetching lessons:", err);
        fetchError.value = err;
        lessons.value = null;
        totalLessons.value = 0;
      } finally {
        isListLoading.value = false;
      }
    };
    useDebounceFn(() => {
      if (currentPage.value !== 1) {
        currentPage.value = 1;
      } else {
        fetchLessons(1);
      }
    }, SEARCH_DEBOUNCE_MS);
    const closeModal = () => {
      showModal.value = false;
      selectedLesson.value = null;
    };
    const closeVideoPreviewModal = () => {
      showVideoPreview.value = false;
      previewVideoUrl.value = null;
    };
    const handleSave = async () => {
      closeModal();
      setSuccessMessage("تم حفظ الدرس بنجاح.");
      await fetchLessons(currentPage.value);
    };
    const formatDate = (dateString, short = false) => {
      if (!dateString) return "-";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "تاريخ غير صالح";
        const options = short ? { year: "numeric", month: "short", day: "numeric" } : { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" };
        return date.toLocaleDateString("ar-EG", options);
      } catch (e) {
        return "خطأ تنسيق";
      }
    };
    const getYoutubeVideoId = (url) => {
      if (!url) return null;
      const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?/;
      const match = url.match(regex);
      return (match == null ? void 0 : match[1]) || null;
    };
    const getYoutubeThumbnail = (url) => {
      const videoId = getYoutubeVideoId(url);
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
    };
    const setSuccessMessage = (msg) => {
      successMessage.value = msg;
      actionError.value = null;
      setTimeout(() => {
        successMessage.value = null;
      }, 4e3);
    };
    const clearMessages = (clearActionErr = true) => {
      successMessage.value = null;
      if (clearActionErr) actionError.value = null;
    };
    const getLessonPublicLink = (lesson) => {
      return lesson.course_id ? `/study/courses/${lesson.course_id}/lessons/${lesson.id}` : "#";
    };
    watch([filterCategory, filterCourse, sortBy, sortOrder], () => {
      if (currentPage.value !== 1) {
        currentPage.value = 1;
      } else {
        fetchLessons(1);
      }
    }, { deep: true });
    watch(currentPage, (newPage, oldPage) => {
      if (newPage !== oldPage) {
        fetchLessons(newPage);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8 md:py-12" }, _attrs))} data-v-045606d4><div class="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700" data-v-045606d4><h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100" data-v-045606d4>إدارة الدروس <span class="text-gray-500 dark:text-gray-400 text-lg" data-v-045606d4>(${ssrInterpolate(totalLessons.value)})</span></h1><button class="button-primary inline-flex items-center"${ssrIncludeBooleanAttr(isListLoading.value || isDeleting.value !== null) ? " disabled" : ""} data-v-045606d4><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-1.5" aria-hidden="true" data-v-045606d4><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" data-v-045606d4></path></svg> إضافة درس جديد </button></div><div class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700" data-v-045606d4><div data-v-045606d4><label for="search-term" class="admin-label" data-v-045606d4>بحث بالعنوان:</label><input id="search-term" type="text"${ssrRenderAttr("value", searchTerm.value)}${ssrIncludeBooleanAttr(isListLoading.value) ? " disabled" : ""} placeholder="ابحث..." class="admin-input" data-v-045606d4></div><div data-v-045606d4><label for="filter-category" class="admin-label" data-v-045606d4>التصنيف:</label><select id="filter-category"${ssrIncludeBooleanAttr(isListLoading.value || isLoadingFilters.value) ? " disabled" : ""} class="admin-select" data-v-045606d4><option${ssrRenderAttr("value", null)} data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(filterCategory.value) ? ssrLooseContain(filterCategory.value, null) : ssrLooseEqual(filterCategory.value, null)) ? " selected" : ""}>الكل</option>`);
      if (isLoadingFilters.value) {
        _push(`<option disabled data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(filterCategory.value) ? ssrLooseContain(filterCategory.value, null) : ssrLooseEqual(filterCategory.value, null)) ? " selected" : ""}>جاري التحميل...</option>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(categories.value, (cat) => {
        _push(`<option${ssrRenderAttr("value", cat.id)} data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(filterCategory.value) ? ssrLooseContain(filterCategory.value, cat.id) : ssrLooseEqual(filterCategory.value, cat.id)) ? " selected" : ""}>${ssrInterpolate(cat.name)}</option>`);
      });
      _push(`<!--]-->`);
      if (!isLoadingFilters.value && categories.value.length === 0) {
        _push(`<option disabled data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(filterCategory.value) ? ssrLooseContain(filterCategory.value, null) : ssrLooseEqual(filterCategory.value, null)) ? " selected" : ""}>لا توجد تصنيفات</option>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</select></div><div data-v-045606d4><label for="filter-course" class="admin-label" data-v-045606d4>الدورة الدراسية:</label><select id="filter-course"${ssrIncludeBooleanAttr(isListLoading.value || isLoadingFilters.value) ? " disabled" : ""} class="admin-select" data-v-045606d4><option${ssrRenderAttr("value", null)} data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(filterCourse.value) ? ssrLooseContain(filterCourse.value, null) : ssrLooseEqual(filterCourse.value, null)) ? " selected" : ""}>الكل</option><option${ssrRenderAttr("value", NO_COURSE_VALUE)} data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(filterCourse.value) ? ssrLooseContain(filterCourse.value, NO_COURSE_VALUE) : ssrLooseEqual(filterCourse.value, NO_COURSE_VALUE)) ? " selected" : ""}>-- دروس عامة (بلا دورة) --</option>`);
      if (isLoadingFilters.value) {
        _push(`<option disabled data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(filterCourse.value) ? ssrLooseContain(filterCourse.value, null) : ssrLooseEqual(filterCourse.value, null)) ? " selected" : ""}>جاري التحميل...</option>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(courses.value, (course) => {
        _push(`<option${ssrRenderAttr("value", course.id)} data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(filterCourse.value) ? ssrLooseContain(filterCourse.value, course.id) : ssrLooseEqual(filterCourse.value, course.id)) ? " selected" : ""}>${ssrInterpolate(course.title)}</option>`);
      });
      _push(`<!--]-->`);
      if (!isLoadingFilters.value && courses.value.length === 0) {
        _push(`<option disabled data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(filterCourse.value) ? ssrLooseContain(filterCourse.value, null) : ssrLooseEqual(filterCourse.value, null)) ? " selected" : ""}>لا توجد دورات</option>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</select></div><div data-v-045606d4><label for="sort-by" class="admin-label" data-v-045606d4>ترتيب حسب:</label><div class="flex gap-2" data-v-045606d4><select id="sort-by"${ssrIncludeBooleanAttr(isListLoading.value) ? " disabled" : ""} class="admin-select flex-grow" data-v-045606d4><option value="created_at" data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(sortBy.value) ? ssrLooseContain(sortBy.value, "created_at") : ssrLooseEqual(sortBy.value, "created_at")) ? " selected" : ""}>تاريخ الإنشاء</option><option value="title" data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(sortBy.value) ? ssrLooseContain(sortBy.value, "title") : ssrLooseEqual(sortBy.value, "title")) ? " selected" : ""}>العنوان</option><option value="course_id" data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(sortBy.value) ? ssrLooseContain(sortBy.value, "course_id") : ssrLooseEqual(sortBy.value, "course_id")) ? " selected" : ""}>الدورة</option><option value="category_id" data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(sortBy.value) ? ssrLooseContain(sortBy.value, "category_id") : ssrLooseEqual(sortBy.value, "category_id")) ? " selected" : ""}>التصنيف</option><option value="module_number" data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(sortBy.value) ? ssrLooseContain(sortBy.value, "module_number") : ssrLooseEqual(sortBy.value, "module_number")) ? " selected" : ""}>الوحدة</option><option value="lesson_order" data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(sortBy.value) ? ssrLooseContain(sortBy.value, "lesson_order") : ssrLooseEqual(sortBy.value, "lesson_order")) ? " selected" : ""}>الترتيب</option></select><select aria-label="Sort order"${ssrIncludeBooleanAttr(isListLoading.value) ? " disabled" : ""} class="admin-select w-24 flex-shrink-0" data-v-045606d4><option value="desc" data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(sortOrder.value) ? ssrLooseContain(sortOrder.value, "desc") : ssrLooseEqual(sortOrder.value, "desc")) ? " selected" : ""}>تنازلي</option><option value="asc" data-v-045606d4${ssrIncludeBooleanAttr(Array.isArray(sortOrder.value) ? ssrLooseContain(sortOrder.value, "asc") : ssrLooseEqual(sortOrder.value, "asc")) ? " selected" : ""}>تصاعدي</option></select></div></div></div>`);
      if (isListLoading.value && !((_a = lessons.value) == null ? void 0 : _a.length)) {
        _push(`<div class="text-center py-16" data-v-045606d4>`);
        _push(ssrRenderComponent(LoadingSpinner, { class: "w-10 h-10" }, null, _parent));
        _push(`<p class="mt-3 text-gray-500 dark:text-gray-400" data-v-045606d4>جاري تحميل الدروس...</p></div>`);
      } else if (fetchError.value) {
        _push(`<div class="error-box" role="alert" data-v-045606d4><strong class="font-bold" data-v-045606d4>خطأ في جلب البيانات!</strong><span class="block sm:inline" data-v-045606d4>${ssrInterpolate(fetchError.value.message || "حدث خطأ أثناء جلب الدروس.")}</span><button class="ml-2 mt-2 sm:mt-0 underline text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" data-v-045606d4>إعادة المحاولة</button></div>`);
      } else {
        _push(`<!---->`);
      }
      if (successMessage.value) {
        _push(`<div class="my-4 p-3 bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-200 rounded text-sm font-medium shadow-sm" data-v-045606d4>${ssrInterpolate(successMessage.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (actionError.value) {
        _push(`<div class="my-4 p-3 bg-red-100 border border-red-300 text-red-700 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200 rounded text-sm font-medium shadow-sm" data-v-045606d4>${ssrInterpolate(actionError.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (lessons.value && lessons.value.length > 0) {
        _push(`<div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg border dark:border-gray-700 relative" data-v-045606d4>`);
        if (isListLoading.value || isDeleting.value !== null) {
          _push(`<div class="absolute inset-0 bg-white/60 dark:bg-gray-800/60 flex items-center justify-center z-10 backdrop-blur-sm rounded-lg" data-v-045606d4>`);
          _push(ssrRenderComponent(LoadingSpinner, { class: "w-8 h-8 text-primary-500" }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="overflow-x-auto" data-v-045606d4><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" data-v-045606d4><thead class="bg-gray-50 dark:bg-gray-700/50" data-v-045606d4><tr data-v-045606d4><th scope="col" class="w-24 px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-045606d4> معاينة </th><th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider" data-v-045606d4> العنوان </th><th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap" data-v-045606d4> التصنيف </th><th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap" data-v-045606d4> الدورة </th><th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell whitespace-nowrap" data-v-045606d4> الوحدة/الترتيب </th><th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell whitespace-nowrap" data-v-045606d4> تاريخ الإنشاء </th><th scope="col" class="relative px-4 py-3" data-v-045606d4><span class="sr-only" data-v-045606d4>الإجراءات</span></th></tr></thead><tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" data-v-045606d4><!--[-->`);
        ssrRenderList(lessons.value, (lesson) => {
          var _a2, _b;
          _push(`<tr class="${ssrRenderClass([{ "opacity-40 pointer-events-none": isDeleting.value === lesson.id }, "hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150 group"])}" data-v-045606d4><td class="px-3 py-2 whitespace-nowrap text-center" data-v-045606d4>`);
          if (lesson.youtube_url && getYoutubeThumbnail(lesson.youtube_url)) {
            _push(`<button class="w-20 h-12 overflow-hidden rounded-md group/thumb relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 block mx-auto shadow-sm"${ssrRenderAttr("title", `معاينة فيديو: ${lesson.title}`)}${ssrIncludeBooleanAttr(isDeleting.value === lesson.id) ? " disabled" : ""} aria-label="معاينة الفيديو" data-v-045606d4><img${ssrRenderAttr("src", getYoutubeThumbnail(lesson.youtube_url))}${ssrRenderAttr("alt", `معاينة درس ${lesson.title}`)} class="w-full h-full object-cover transition-transform duration-200 ease-in-out group-hover/thumb:scale-110" loading="lazy" data-v-045606d4><div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200" data-v-045606d4><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6 text-white/80" data-v-045606d4><path fill-rule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z" clip-rule="evenodd" data-v-045606d4></path></svg></div></button>`);
          } else {
            _push(`<div class="w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs italic mx-auto" data-v-045606d4> بلا فيديو </div>`);
          }
          _push(`</td><td class="px-4 py-3" data-v-045606d4><div class="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-xs"${ssrRenderAttr("title", lesson.title)} data-v-045606d4>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: getLessonPublicLink(lesson),
            target: "_blank",
            class: "hover:text-primary-600 dark:hover:text-primary-400 transition-colors group-hover:underline underline-offset-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(lesson.title)} <span class="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity inline-block ms-1" aria-hidden="true" data-v-045606d4${_scopeId}> (مشاهدة)</span>`);
              } else {
                return [
                  createTextVNode(toDisplayString(lesson.title) + " ", 1),
                  createVNode("span", {
                    class: "text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity inline-block ms-1",
                    "aria-hidden": "true"
                  }, " (مشاهدة)")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div><div class="text-xs text-gray-500 dark:text-gray-400 lg:hidden mt-1" data-v-045606d4>${ssrInterpolate(formatDate(lesson.created_at, true))}</div></td><td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-v-045606d4>${ssrInterpolate(((_a2 = lesson.categories) == null ? void 0 : _a2.name) || "-")}</td><td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" data-v-045606d4>`);
          if (lesson.course_id && ((_b = lesson.study_courses) == null ? void 0 : _b.title)) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/study/courses/${lesson.course_id}`,
              target: "_blank",
              class: "hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(lesson.study_courses.title)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(lesson.study_courses.title), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<span class="text-gray-400 dark:text-gray-500 italic" data-v-045606d4>عام</span>`);
          }
          _push(`</td><td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell" data-v-045606d4>`);
          if (lesson.module_number) {
            _push(`<span class="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded" data-v-045606d4>#${ssrInterpolate(lesson.module_number)}</span>`);
          } else {
            _push(`<span class="text-gray-400 dark:text-gray-500 text-xs italic" data-v-045606d4>عام</span>`);
          }
          if (lesson.lesson_order) {
            _push(`<span class="text-xs" data-v-045606d4> / ${ssrInterpolate(lesson.lesson_order)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell" data-v-045606d4>${ssrInterpolate(formatDate(lesson.created_at))}</td><td class="px-4 py-3 whitespace-nowrap text-left text-sm font-medium" data-v-045606d4><div class="flex justify-end items-center gap-2" data-v-045606d4><button class="admin-action-button text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"${ssrIncludeBooleanAttr(isDeleting.value === lesson.id || isListLoading.value) ? " disabled" : ""} title="تعديل الدرس" aria-label="تعديل الدرس" data-v-045606d4><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" data-v-045606d4><path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.886 1.343Z" data-v-045606d4></path></svg></button><button class="admin-action-button text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"${ssrIncludeBooleanAttr(isDeleting.value === lesson.id || isListLoading.value) ? " disabled" : ""} title="حذف الدرس" aria-label="حذف الدرس" data-v-045606d4>`);
          if (isDeleting.value === lesson.id) {
            _push(ssrRenderComponent(LoadingSpinner, { class: "w-5 h-5" }, null, _parent));
          } else {
            _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5" data-v-045606d4><path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.326.418C2.482 4.958 2 5.752 2 6.596v3.073c0 .844.482 1.638 1.274 2.014 1.106.527 2.283.9 3.476 1.146A6.997 6.997 0 0 0 10 18.25a6.997 6.997 0 0 0 3.25-.518c1.193-.246 2.37-.619 3.476-1.146C17.518 11.207 18 10.413 18 9.67V6.596c0-.844-.482-1.638-1.274-2.014-.746-.198-1.531-.341-2.326-.418V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM7.5 3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.415c-.885.102-1.745.276-2.55.5a.75.75 0 0 1-.4 0c-.805-.224-1.665-.398-2.55-.5V3.75Z" clip-rule="evenodd" data-v-045606d4></path></svg>`);
          }
          _push(`</button></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      } else if (!isListLoading.value && (!lessons.value || lessons.value.length === 0)) {
        _push(`<div class="text-center py-16 text-gray-500 dark:text-gray-400 border border-dashed dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/20" data-v-045606d4><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" data-v-045606d4><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" data-v-045606d4></path></svg>`);
        if (searchTerm.value || filterCategory.value !== null || filterCourse.value !== null) {
          _push(`<p data-v-045606d4>لا توجد دروس تطابق معايير البحث أو الفلترة الحالية.</p>`);
        } else {
          _push(`<p data-v-045606d4>لا توجد دروس لعرضها حالياً. قم بإضافة درس جديد.</p>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (totalPages.value > 1) {
        _push(`<div class="mt-6 flex justify-center items-center space-x-2 rtl:space-x-reverse" data-v-045606d4><button${ssrIncludeBooleanAttr(currentPage.value === 1 || isListLoading.value) ? " disabled" : ""} class="pagination-button" data-v-045606d4> السابق </button><span class="text-sm text-gray-700 dark:text-gray-300 px-2 font-medium" data-v-045606d4> صفحة ${ssrInterpolate(currentPage.value)} من ${ssrInterpolate(totalPages.value)} <span class="text-gray-500 dark:text-gray-400" data-v-045606d4>(${ssrInterpolate(totalLessons.value)} درس)</span></span><button${ssrIncludeBooleanAttr(currentPage.value === totalPages.value || isListLoading.value) ? " disabled" : ""} class="pagination-button" data-v-045606d4> التالي </button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(AdminLessonModal, {
        show: showModal.value,
        "lesson-data": selectedLesson.value,
        "preselected-course-id": preselectedCourseIdForModal.value,
        onClose: closeModal,
        onSaved: handleSave
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$1, {
        show: showVideoPreview.value,
        "video-url": previewVideoUrl.value,
        onClose: closeVideoPreviewModal
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=lessons.vue3.mjs.map
