import __nuxt_component_0 from "../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import __nuxt_component_1 from "../../node_modules/nuxt/dist/app/components/client-only.mjs";
import { defineComponent, computed, ref, withAsyncContext, watchEffect, mergeProps, unref, withCtx, createBlock, createVNode, openBlock } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
import { useRoute } from "vue-router";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import "../../components/CommentSection.vue.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useAsyncData } from "../../node_modules/nuxt/dist/app/composables/asyncData.mjs";
import { createError } from "../../node_modules/nuxt/dist/app/composables/error.mjs";
import { useHead } from "../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
import _sfc_main$1 from "../../components/CommentSection.vue2.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const supabase = useSupabaseClient();
    const route = useRoute();
    const lessonId = computed(() => {
      const id = Number(route.params.id);
      return isNaN(id) ? -1 : id;
    });
    ref(false);
    ref(null);
    ref("");
    const { data: fetchedData, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      `lesson-details-catnav-${lessonId.value}`,
      async () => {
        const currentId = lessonId.value;
        if (currentId === -1) {
          throw createError({ statusCode: 400, statusMessage: "معرف الدرس غير صالح." });
        }
        const { data: currentLessonData, error: lessonError } = await supabase.from("lessons").select("id, title, description, youtube_url, category_id, course_id, created_at").eq("id", currentId).maybeSingle();
        if (lessonError) {
          console.error("Error fetching lesson:", lessonError);
          throw createError({ statusCode: 500, statusMessage: `حدث خطأ أثناء تحميل بيانات الدرس.` });
        }
        if (!currentLessonData) {
          throw createError({ statusCode: 404, statusMessage: "الدرس المطلوب غير موجود." });
        }
        let previousLessonData = null;
        let nextLessonData = null;
        let booksData = [];
        const currentCategoryId = currentLessonData.category_id;
        const fetches = [
          supabase.from("books").select("id, title, storage_path, is_research, is_transcript").eq("linked_lesson_id", currentId)
        ];
        if (currentCategoryId !== null) {
          console.log(`Lesson belongs to category ${currentCategoryId}. Fetching prev/next...`);
          fetches.push(
            supabase.from("lessons").select("id, title").eq("category_id", currentCategoryId).lt("id", currentId).order("id", { ascending: false }).limit(1).maybeSingle()
          );
          fetches.push(
            supabase.from("lessons").select("id, title").eq("category_id", currentCategoryId).gt("id", currentId).order("id", { ascending: true }).limit(1).maybeSingle()
          );
        } else {
          console.log("Lesson does not belong to a category. Skipping prev/next fetch.");
        }
        const results = await Promise.all(fetches);
        const booksResult = results[0];
        if (booksResult.error) {
          console.error("Error fetching linked books:", booksResult.error.message);
        } else {
          booksData = booksResult.data ?? [];
        }
        if (currentCategoryId !== null && results.length === 3) {
          const prevResult = results[1];
          const nextResult = results[2];
          if (prevResult.error) {
            console.error("Error fetching previous lesson by category:", prevResult.error.message);
          } else {
            previousLessonData = prevResult.data;
            console.log("Fetched Previous Lesson Data (Category Nav):", previousLessonData);
          }
          if (nextResult.error) {
            console.error("Error fetching next lesson by category:", nextResult.error.message);
          } else {
            nextLessonData = nextResult.data;
            console.log("Fetched Next Lesson Data (Category Nav):", nextLessonData);
          }
        }
        return {
          lesson: currentLessonData,
          linkedBooks: booksData,
          previousLesson: previousLessonData,
          nextLesson: nextLessonData
        };
      },
      {
        watch: [lessonId]
      }
    )), __temp = await __temp, __restore(), __temp);
    const lesson = computed(() => {
      var _a;
      return ((_a = fetchedData.value) == null ? void 0 : _a.lesson) ?? null;
    });
    const linkedBooks = computed(() => {
      var _a;
      return ((_a = fetchedData.value) == null ? void 0 : _a.linkedBooks) ?? [];
    });
    const previousLesson = computed(() => {
      var _a;
      return ((_a = fetchedData.value) == null ? void 0 : _a.previousLesson) ?? null;
    });
    const nextLesson = computed(() => {
      var _a;
      return ((_a = fetchedData.value) == null ? void 0 : _a.nextLesson) ?? null;
    });
    const youtubeVideoId = computed(() => {
      var _a;
      if (!((_a = lesson.value) == null ? void 0 : _a.youtube_url)) return null;
      try {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = lesson.value.youtube_url.match(regex);
        return match && match[1] ? match[1] : null;
      } catch (e) {
        console.error("Invalid YouTube URL format:", lesson.value.youtube_url, e);
        return null;
      }
    });
    useHead(computed(() => {
      var _a, _b, _c, _d;
      const title = ((_a = lesson.value) == null ? void 0 : _a.title) ? `درس: ${lesson.value.title}` : pending.value ? "جارٍ التحميل..." : "تفاصيل الدرس";
      const baseDescription = ((_c = (_b = lesson.value) == null ? void 0 : _b.description) == null ? void 0 : _c.substring(0, 100)) || `شاهد تفاصيل درس ${((_d = lesson.value) == null ? void 0 : _d.title) || ""}.`;
      let linkedItemsDescription = "";
      if (linkedBooks.value.length > 0) {
        const itemTypes = linkedBooks.value.map((book) => book.is_research ? "بحث" : book.is_transcript ? "تفريغ" : "كتاب").join(", ");
        linkedItemsDescription = ` يتضمن ملفات مرتبطة: ${itemTypes}.`;
      }
      const fullDescription = (baseDescription + linkedItemsDescription).substring(0, 160);
      return {
        title,
        meta: [
          { name: "description", content: fullDescription },
          { property: "og:title", content: title },
          { property: "og:description", content: fullDescription },
          { property: "og:type", content: "article" },
          { property: "og:url", content: "" }
        ]
      };
    }));
    watchEffect(() => {
      var _a, _b;
      console.log("[WatchEffect Debug - Category Nav]");
      console.log("  Current Lesson ID:", lessonId.value);
      console.log("  Lesson Data:", lesson.value);
      console.log("  Lesson Category ID:", (_a = lesson.value) == null ? void 0 : _a.category_id);
      console.log("  Previous Lesson Data:", previousLesson.value);
      console.log("  Next Lesson Data:", nextLesson.value);
      console.log("  Show Buttons Condition:", !!(((_b = lesson.value) == null ? void 0 : _b.category_id) && (previousLesson.value || nextLesson.value)));
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ClientOnly = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4" }, _attrs))} data-v-6dc4eee0>`);
      if (unref(pending)) {
        _push(`<div class="text-center py-20" data-v-6dc4eee0>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-4 text-gray-600 dark:text-gray-400" data-v-6dc4eee0>جارٍ تحميل بيانات الدرس...</p></div>`);
      } else if (unref(error) || !lesson.value) {
        _push(`<div class="text-center py-20 max-w-2xl mx-auto" data-v-6dc4eee0>`);
        if (((_a = unref(error)) == null ? void 0 : _a.statusCode) === 404) {
          _push(`<h2 class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4" data-v-6dc4eee0> الدرس غير موجود </h2>`);
        } else {
          _push(`<h2 class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4" data-v-6dc4eee0> حدث خطأ </h2>`);
        }
        _push(`<p class="text-gray-600 dark:text-gray-400 mb-6" data-v-6dc4eee0>${ssrInterpolate(((_b = unref(error)) == null ? void 0 : _b.statusMessage) || "لم نتمكن من العثور على الدرس المطلوب أو حدث خطأ أثناء تحميله.")}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/lessons",
          class: "inline-flex items-center justify-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors",
          style: { backgroundColor: "var(--color-olive-green)" }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true" focusable="false" data-v-6dc4eee0${_scopeId}><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z" clip-rule="evenodd" data-v-6dc4eee0${_scopeId}></path></svg><span data-v-6dc4eee0${_scopeId}>العودة إلى قائمة الدروس</span>`);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 20 20",
                  fill: "currentColor",
                  class: "w-5 h-5 ms-2",
                  "aria-hidden": "true",
                  focusable: "false"
                }, [
                  createVNode("path", {
                    "fill-rule": "evenodd",
                    d: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-7.25a.75.75 0 0 0 0-1.5H8.66l2.1-1.95a.75.75 0 1 0-1.02-1.1l-3.5 3.25a.75.75 0 0 0 0 1.1l3.5 3.25a.75.75 0 0 0 1.02-1.1l-2.1-1.95h4.59Z",
                    "clip-rule": "evenodd"
                  })
                ])),
                createVNode("span", null, "العودة إلى قائمة الدروس")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="lesson-details max-w-5xl mx-auto space-y-6" data-v-6dc4eee0><h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark text-center sm:text-right" data-v-6dc4eee0>${ssrInterpolate(lesson.value.title)}</h1><div class="video-section flex items-center gap-2 sm:gap-4" data-v-6dc4eee0><div class="flex-shrink-0" data-v-6dc4eee0>`);
        if (lesson.value.category_id && previousLesson.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/lessons/${previousLesson.value.id}`,
            class: "w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900",
            title: `الدرس السابق: ${previousLesson.value.title}`,
            "aria-label": "الدرس السابق"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 sm:w-6 sm:h-6" data-v-6dc4eee0${_scopeId}><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" data-v-6dc4eee0${_scopeId}></path></svg>`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    class: "w-5 h-5 sm:w-6 sm:h-6"
                  }, [
                    createVNode("path", {
                      "fill-rule": "evenodd",
                      d: "M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z",
                      "clip-rule": "evenodd"
                    })
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<div class="w-11 h-11 sm:w-14 sm:h-14" data-v-6dc4eee0></div>`);
        }
        _push(`</div><div class="flex-grow min-w-0" data-v-6dc4eee0>`);
        if (youtubeVideoId.value) {
          _push(`<div class="relative w-full rounded-lg overflow-hidden shadow-lg bg-black h-[250px] sm:h-[350px] md:h-[500px] lg:h-[600px]" data-v-6dc4eee0><iframe${ssrRenderAttr("src", `https://www.youtube.com/embed/${youtubeVideoId.value}`)} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen class="absolute inset-0 w-full h-full" title="مشغل فيديو الدرس" data-v-6dc4eee0></iframe></div>`);
        } else if (lesson.value.youtube_url) {
          _push(`<div class="p-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-800 dark:text-yellow-200 text-sm" data-v-6dc4eee0><p data-v-6dc4eee0>تعذر استخلاص معرف الفيديو من الرابط: <code class="break-all" data-v-6dc4eee0>${ssrInterpolate(lesson.value.youtube_url)}</code>.</p><p class="mt-1" data-v-6dc4eee0>قد يكون الرابط غير صحيح أو بتنسيق غير مدعوم.</p></div>`);
        } else {
          _push(`<div class="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-400 text-sm" data-v-6dc4eee0><p data-v-6dc4eee0>لا يوجد رابط يوتيوب متاح لهذا الدرس.</p></div>`);
        }
        _push(`</div><div class="flex-shrink-0" data-v-6dc4eee0>`);
        if (lesson.value.category_id && nextLesson.value) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/lessons/${nextLesson.value.id}`,
            class: "w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900",
            title: `الدرس التالي: ${nextLesson.value.title}`,
            "aria-label": "الدرس التالي"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 sm:w-6 sm:h-6" data-v-6dc4eee0${_scopeId}><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" data-v-6dc4eee0${_scopeId}></path></svg>`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    class: "w-5 h-5 sm:w-6 sm:h-6"
                  }, [
                    createVNode("path", {
                      "fill-rule": "evenodd",
                      d: "M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z",
                      "clip-rule": "evenodd"
                    })
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<div class="w-11 h-11 sm:w-14 sm:h-14" data-v-6dc4eee0></div>`);
        }
        _push(`</div></div><div class="description-section" data-v-6dc4eee0><h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-3" data-v-6dc4eee0>عن الدرس:</h2>`);
        if (lesson.value.description) {
          _push(`<div class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" data-v-6dc4eee0><p class="whitespace-pre-wrap" data-v-6dc4eee0>${ssrInterpolate(lesson.value.description)}</p></div>`);
        } else {
          _push(`<p class="text-gray-500 dark:text-gray-400 italic" data-v-6dc4eee0> لا يوجد وصف متاح لهذا الدرس. </p>`);
        }
        _push(`</div><div class="downloads-section p-5 bg-beige-light dark:bg-cream-gray rounded-lg shadow-sm border border-cream-gray dark:border-gray-700" data-v-6dc4eee0><h3 class="text-lg font-semibold text-brown-dark dark:text-brown-dark mb-4" data-v-6dc4eee0>ملفات مرتبطة:</h3>`);
        if (linkedBooks.value.length > 0) {
          _push(`<div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap" data-v-6dc4eee0><!--[-->`);
          ssrRenderList(linkedBooks.value, (book) => {
            _push(`<div data-v-6dc4eee0>`);
            if (book.storage_path) {
              _push(`<button class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors" style="${ssrRenderStyle({ backgroundColor: "var(--color-olive-green)" })}"${ssrRenderAttr("title", `عرض ${book.title}`)} data-v-6dc4eee0><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true" focusable="false" data-v-6dc4eee0><path fill-rule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm4.75 8.75a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" data-v-6dc4eee0></path><path fill-rule="evenodd" d="M9 3.5a.5.5 0 0 0-.5.5v2.75A1.75 1.75 0 0 0 10.25 8.5h2.75a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-3ZM11 5.75v1.75a.25.25 0 0 0 .25.25h1.75a.25.25 0 0 0 .25-.25V5.75H11Z" clip-rule="evenodd" data-v-6dc4eee0></path></svg><span data-v-6dc4eee0>عرض: ${ssrInterpolate(book.title)} (${ssrInterpolate(book.is_research ? "بحث" : book.is_transcript ? "تفريغ" : "كتاب")})</span></button>`);
            } else {
              _push(`<span class="text-xs text-gray-400 italic" data-v-6dc4eee0>(${ssrInterpolate(book.title)} - لا يوجد ملف مرفق)</span>`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<p class="text-sm text-gray-500 dark:text-gray-400" data-v-6dc4eee0> لا توجد ملفات إضافية متاحة للتحميل لهذا الدرس. </p>`);
        }
        _push(`</div>`);
        if (lessonId.value !== -1 && lesson.value) {
          _push(ssrRenderComponent(_sfc_main$1, { "lesson-id": lessonId.value }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=_id_.vue2.mjs.map
