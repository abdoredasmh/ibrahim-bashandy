import __nuxt_component_0 from "../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, computed, ref, withAsyncContext, watch, mergeProps, unref, withCtx, createBlock, createVNode, openBlock } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from "vue/server-renderer";
import { useRoute } from "vue-router";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import "../../components/CommentSection.vue.mjs";
import LazyPdfViewerModal from "../../components/PdfViewerModal.vue.mjs";
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
    const bookId = computed(() => {
      const id = +route.params.id;
      return isNaN(id) || id <= 0 ? -1 : id;
    });
    const isValidBookId = computed(() => bookId.value > 0);
    const imageError = ref(false);
    const showModal = ref(false);
    const pdfPublicUrl = ref(null);
    function closePdfModal() {
      showModal.value = false;
    }
    const { data: book, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      `book-${bookId.value}`,
      // Unique key including the book ID
      async () => {
        if (!isValidBookId.value) {
          console.error("Invalid Book ID from route:", route.params.id);
          throw createError({ statusCode: 400, statusMessage: "معرف الكتاب غير صالح." });
        }
        const { data, error: queryError } = await supabase.from("books").select("*").eq("id", bookId.value).maybeSingle();
        if (queryError) {
          console.error(`Error fetching book ID ${bookId.value}:`, queryError);
          throw createError({ statusCode: 500, statusMessage: `فشل تحميل الكتاب: ${queryError.message}` });
        }
        if (!data) {
          throw createError({ statusCode: 404, statusMessage: "الكتاب المطلوب غير موجود." });
        }
        pdfPublicUrl.value = null;
        if (data.storage_path) {
          try {
            const bucketName = "book-files";
            const { data: urlData, error: urlError } = await supabase.storage.from(bucketName).getPublicUrl(data.storage_path);
            if (urlError) throw urlError;
            pdfPublicUrl.value = urlData.publicUrl;
          } catch (urlErr) {
            console.error(`Failed to get public download URL for ${data.storage_path}:`, urlErr.message || urlErr);
          }
        }
        return data;
      },
      {
        // Watch the computed property directly
        watch: [bookId]
        // Use immediate: false if you want to avoid fetching on server if id is invalid initially?
        // Though the check inside the async function handles it.
      }
    )), __temp = await __temp, __restore(), __temp);
    watch(book, (newBook) => {
      imageError.value = false;
    });
    useHead(computed(() => {
      var _a, _b, _c, _d;
      return {
        title: ((_a = book.value) == null ? void 0 : _a.title) ?? (pending.value ? "تحميل..." : error.value ? "خطأ" : "تفاصيل الكتاب"),
        meta: [
          {
            name: "description",
            content: ((_c = (_b = book.value) == null ? void 0 : _b.description) == null ? void 0 : _c.substring(0, 150)) || `تفاصيل ومعلومات عن ${((_d = book.value) == null ? void 0 : _d.title) || "الكتاب المطلوب"}`
          }
          // Consider adding OpenGraph tags
          // { property: 'og:title', content: book.value?.title },
          // { property: 'og:description', content: book.value?.description?.substring(0, 150) },
          // { property: 'og:image', content: book.value?.cover_image_url },
        ]
      };
    }));
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8" }, _attrs))} data-v-e8bc791c>`);
      if (unref(pending)) {
        _push(`<div class="text-center py-20" data-v-e8bc791c>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-4 text-gray-600 dark:text-gray-400" data-v-e8bc791c>جارٍ تحميل بيانات الكتاب...</p></div>`);
      } else if (unref(error) || !unref(book)) {
        _push(`<div class="text-center py-20" data-v-e8bc791c>`);
        if (((_a = unref(error)) == null ? void 0 : _a.statusCode) === 404) {
          _push(`<h2 class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4" data-v-e8bc791c> الكتاب غير موجود </h2>`);
        } else {
          _push(`<h2 class="text-2xl font-semibold text-red-600 dark:text-red-400 mb-4" data-v-e8bc791c> حدث خطأ </h2>`);
        }
        _push(`<p class="text-gray-600 dark:text-gray-400 mb-6" data-v-e8bc791c>${ssrInterpolate(((_b = unref(error)) == null ? void 0 : _b.statusMessage) || "لم نتمكن من العثور على الكتاب المطلوب أو حدث خطأ أثناء تحميله.")}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/books",
          class: "button-primary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ms-2" aria-hidden="true" data-v-e8bc791c${_scopeId}><title data-v-e8bc791c${_scopeId}>العودة</title><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 0 0 1.5h4.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 1 0-1.02 1.1l2.1 1.95H9.25a.75.75 0 0 0 0 1.5Z" clip-rule="evenodd" data-v-e8bc791c${_scopeId}></path></svg><span data-v-e8bc791c${_scopeId}>العودة إلى المكتبة</span>`);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 20 20",
                  fill: "currentColor",
                  class: "w-5 h-5 ms-2",
                  "aria-hidden": "true"
                }, [
                  createVNode("title", null, "العودة"),
                  createVNode("path", {
                    "fill-rule": "evenodd",
                    d: "M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-4.75a.75.75 0 0 0 0 1.5h4.59l-2.1 1.95a.75.75 0 1 0 1.02 1.1l3.5-3.25a.75.75 0 0 0 0-1.1l-3.5-3.25a.75.75 0 1 0-1.02 1.1l2.1 1.95H9.25a.75.75 0 0 0 0 1.5Z",
                    "clip-rule": "evenodd"
                  })
                ])),
                createVNode("span", null, "العودة إلى المكتبة")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="book-details" data-v-e8bc791c><div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8" data-v-e8bc791c><div class="md:col-span-1" data-v-e8bc791c><div class="relative aspect-[3/4] bg-cream-gray dark:bg-gray-700 flex items-center justify-center rounded-lg shadow-md overflow-hidden" data-v-e8bc791c> {/* Added aspect ratio */} `);
        if (unref(book).cover_image_url && !imageError.value) {
          _push(`<img${ssrRenderAttr("src", unref(book).cover_image_url)}${ssrRenderAttr("alt", `غلاف ${unref(book).title}`)} class="w-full h-full object-contain" loading="lazy" decoding="async" data-v-e8bc791c>`);
        } else {
          _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="text-8xl text-gray-400 dark:text-gray-500 w-24 h-24" aria-hidden="true" data-v-e8bc791c><title data-v-e8bc791c>غلاف كتاب بديل</title><path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 .5.707A9.735 9.735 0 0 0 6 21a9.707 9.707 0 0 0 5.25-1.533v-1.27a.75.75 0 0 0-.624-.744A8.25 8.25 0 0 1 6 18.75a8.25 8.25 0 0 1-5.25-2.268v-2.156a.75.75 0 0 0 .51-.698A8.217 8.217 0 0 1 6 13.5a8.182 8.182 0 0 1 5.25 1.406v-1.406a8.182 8.182 0 0 1-5.25 1.406 8.217 8.217 0 0 1-4.74-.954.75.75 0 0 0-.51-.698V9.732a8.25 8.25 0 0 1 5.25-2.268 8.25 8.25 0 0 1 5.25 2.268V9.376a.75.75 0 0 0 .624.744v1.27ZM12.75 4.533A9.707 9.707 0 0 1 18 3a9.735 9.735 0 0 1 3.25.555.75.75 0 0 1 .5.707v14.25a.75.75 0 0 1-.5.707A9.735 9.735 0 0 1 18 21a9.707 9.707 0 0 1-5.25-1.533v-1.27a.75.75 0 0 1 .624-.744A8.25 8.25 0 0 0 18 18.75a8.25 8.25 0 0 0 5.25-2.268v-2.156a.75.75 0 0 1-.51-.698A8.217 8.217 0 0 0 18 13.5a8.182 8.182 0 0 0-5.25 1.406v-1.406a8.182 8.182 0 0 0 5.25 1.406 8.217 8.217 0 0 0 4.74-.954.75.75 0 0 1 .51-.698V9.732a8.25 8.25 0 0 0-5.25-2.268 8.25 8.25 0 0 0-5.25 2.268V9.376a.75.75 0 0 1-.624.744v1.27Z" data-v-e8bc791c></path></svg>`);
        }
        _push(`<div class="absolute top-3 start-3 flex gap-2" data-v-e8bc791c>`);
        if (unref(book).is_research) {
          _push(`<span class="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 shadow" data-v-e8bc791c> بحث </span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(book).is_transcript) {
          _push(`<span class="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 shadow" data-v-e8bc791c> تفريغ </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="mt-4 flex flex-col space-y-2" data-v-e8bc791c>`);
        if (unref(book).storage_path) {
          _push(`<button type="button" class="button-primary w-full" data-v-e8bc791c><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true" data-v-e8bc791c><title data-v-e8bc791c>عرض بالموقع</title><path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" data-v-e8bc791c></path><path fill-rule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.18l.879-.879a.75.75 0 0 1 1.06 0l.879.879A1.651 1.651 0 0 1 3.482 10c0 .311.102.613.284.879l-.879.879a.75.75 0 0 1-1.06 0l-.879-.879A1.651 1.651 0 0 1 .664 10.59ZM19.336 9.41a1.651 1.651 0 0 1 0 1.18l-.879.879a.75.75 0 0 1-1.06 0l-.879-.879A1.651 1.651 0 0 1 16.518 10c0-.311-.102-.613-.284-.879l.879-.879a.75.75 0 0 1 1.06 0l.879.879A1.651 1.651 0 0 1 19.336 9.41Z" clip-rule="evenodd" data-v-e8bc791c></path><path fill-rule="evenodd" d="M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm-5.017-9.836a.75.75 0 0 1 1.06 0l.879.879a4.652 4.652 0 0 1 6.156 0l.879-.879a.75.75 0 1 1 1.06 1.06l-.879.879a4.652 4.652 0 0 1-6.156 0l-.879-.879a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" data-v-e8bc791c></path></svg><span data-v-e8bc791c>عرض الكتاب بالموقع</span></button>`);
        } else {
          _push(`<!---->`);
        }
        if (pdfPublicUrl.value) {
          _push(`<a${ssrRenderAttr("href", pdfPublicUrl.value)} target="_blank" download class="button-secondary w-full" rel="noopener noreferrer" data-v-e8bc791c><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 me-2" aria-hidden="true" data-v-e8bc791c><title data-v-e8bc791c>تنزيل</title><path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" data-v-e8bc791c></path><path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" data-v-e8bc791c></path></svg><span data-v-e8bc791c>تنزيل الملف</span></a>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(book).storage_path) {
          _push(`<p class="text-center text-sm text-red-500 dark:text-red-400 mt-2" data-v-e8bc791c> ملف الكتاب غير متاح حاليًا للعرض أو التنزيل. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="md:col-span-2" data-v-e8bc791c><h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-4" data-v-e8bc791c>${ssrInterpolate(unref(book).title)}</h1>`);
        if (unref(book).is_transcript && unref(book).linked_lesson_id) {
          _push(`<div class="mb-4" data-v-e8bc791c>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/lessons/${unref(book).linked_lesson_id}`,
            class: "inline-flex items-center text-sm font-medium text-golden-calm hover:underline focus:outline-none focus:ring-2 focus:ring-golden-calm focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 me-1" aria-hidden="true" data-v-e8bc791c${_scopeId}><title data-v-e8bc791c${_scopeId}>رابط</title><path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.665l3-3Z" data-v-e8bc791c${_scopeId}></path><path d="M8.603 17.007a4 4 0 0 0 5.656-5.656l-3-3a4 4 0 0 0-5.865-.225.75.75 0 0 0 1.138.977 2.5 2.5 0 0 1 3.665.142l3 3a2.5 2.5 0 0 1-3.536 3.536l-1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 5.656 5.656Z" data-v-e8bc791c${_scopeId}></path></svg><span data-v-e8bc791c${_scopeId}>هذا تفريغ للدرس - اضغط هنا لعرض الدرس الأصلي</span>`);
              } else {
                return [
                  (openBlock(), createBlock("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 20 20",
                    fill: "currentColor",
                    class: "w-4 h-4 me-1",
                    "aria-hidden": "true"
                  }, [
                    createVNode("title", null, "رابط"),
                    createVNode("path", { d: "M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.665l3-3Z" }),
                    createVNode("path", { d: "M8.603 17.007a4 4 0 0 0 5.656-5.656l-3-3a4 4 0 0 0-5.865-.225.75.75 0 0 0 1.138.977 2.5 2.5 0 0 1 3.665.142l3 3a2.5 2.5 0 0 1-3.536 3.536l-1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 5.656 5.656Z" })
                  ])),
                  createVNode("span", null, "هذا تفريغ للدرس - اضغط هنا لعرض الدرس الأصلي")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(book).description) {
          _push(`<div class="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" data-v-e8bc791c><p class="whitespace-pre-wrap" data-v-e8bc791c>${ssrInterpolate(unref(book).description)}</p></div>`);
        } else {
          _push(`<p class="text-gray-500 dark:text-gray-400 italic" data-v-e8bc791c> لا يوجد وصف متاح لهذا الكتاب. </p>`);
        }
        _push(`</div></div>`);
        if (isValidBookId.value && unref(book)) {
          _push(ssrRenderComponent(_sfc_main$1, { "book-id": bookId.value }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(ssrRenderComponent(LazyPdfViewerModal, {
        show: showModal.value,
        "storage-path": ((_c = unref(book)) == null ? void 0 : _c.storage_path) || null,
        "book-title": ((_d = unref(book)) == null ? void 0 : _d.title) || "عرض الكتاب",
        onClose: closePdfModal
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=_id_.vue2.mjs.map
