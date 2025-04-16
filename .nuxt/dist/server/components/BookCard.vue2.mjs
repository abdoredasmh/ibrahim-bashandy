import __nuxt_component_0 from "../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, mergeProps, withCtx, createBlock, createTextVNode, openBlock, createVNode } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BookCard",
  __ssrInlineRender: true,
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  setup(__props) {
    const imageError = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: "book-card group block bg-beige-light dark:bg-cream-gray rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 cursor-pointer",
        role: "link",
        tabindex: "0",
        "aria-label": `عرض تفاصيل كتاب ${__props.book.title}`
      }, _attrs))} data-v-87625d12><div class="flex flex-col h-full" data-v-87625d12><div class="relative h-48 bg-cream-gray dark:bg-gray-700 flex items-center justify-center flex-shrink-0" data-v-87625d12>`);
      if (__props.book.cover_image_url && !imageError.value) {
        _push(`<img${ssrRenderAttr("src", __props.book.cover_image_url)}${ssrRenderAttr("alt", `غلاف ${__props.book.title}`)} class="w-full h-full object-cover" loading="lazy" decoding="async" data-v-87625d12>`);
      } else {
        _push(`<div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800" aria-hidden="true" data-v-87625d12><svg xmlns="http://www.w3.org/2000/svg" class="text-6xl text-gray-400 dark:text-gray-500 w-12 h-12" fill="currentColor" viewBox="0 0 24 24" data-v-87625d12><title data-v-87625d12>رمز كتاب بديل</title><path d="M6 4v16c0 .6.4 1 1 1h13v-2H8V5h12V3H7c-.6 0-1 .4-1 1zm3 2h8v2H9V6zm0 4h8v2H9v-2zm0 4h5v2H9v-2z" data-v-87625d12></path></svg></div>`);
      }
      if (__props.book.is_research || __props.book.is_transcript) {
        _push(`<div class="absolute top-2 start-2 flex gap-1" data-v-87625d12>`);
        if (__props.book.is_research) {
          _push(`<span class="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" data-v-87625d12> بحث </span>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.book.is_transcript) {
          _push(`<span class="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" data-v-87625d12> تفريغ </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="p-4 flex flex-col flex-grow" data-v-87625d12><h3 class="text-lg font-semibold text-brown-dark dark:text-brown-dark mb-2 line-clamp-2 group-hover:text-primary dark:group-hover:text-primary transition-colors duration-200"${ssrRenderAttr("title", __props.book.title)} data-v-87625d12>${ssrInterpolate(__props.book.title)}</h3>`);
      if (__props.book.description) {
        _push(`<p class="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow" data-v-87625d12>${ssrInterpolate(__props.book.description)}</p>`);
      } else {
        _push(`<div class="flex-grow" data-v-87625d12></div>`);
      }
      _push(`<div class="mt-auto flex flex-col space-y-2" data-v-87625d12>`);
      if (__props.book.is_transcript && __props.book.linked_lesson_id) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/lessons/${__props.book.linked_lesson_id}`,
          onClick: () => {
          },
          class: "button-secondary"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 me-2" fill="currentColor" viewBox="0 0 20 20" data-v-87625d12${_scopeId}><title data-v-87625d12${_scopeId}>عرض الدرس الأصلي</title><path fill-rule="evenodd" d="M12.293 2.293a1 1 0 011.414 0L18 6.586V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h8.586a1 1 0 01.707.293zM11 6a1 1 0 00-1 1v3.586l-.293-.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 10-1.414-1.414L12 10.586V7a1 1 0 00-1-1z" clip-rule="evenodd" data-v-87625d12${_scopeId}></path></svg> عرض الدرس الأصلي `);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  class: "w-5 h-5 me-2",
                  fill: "currentColor",
                  viewBox: "0 0 20 20"
                }, [
                  createVNode("title", null, "عرض الدرس الأصلي"),
                  createVNode("path", {
                    "fill-rule": "evenodd",
                    d: "M12.293 2.293a1 1 0 011.414 0L18 6.586V16a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2h8.586a1 1 0 01.707.293zM11 6a1 1 0 00-1 1v3.586l-.293-.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 10-1.414-1.414L12 10.586V7a1 1 0 00-1-1z",
                    "clip-rule": "evenodd"
                  })
                ])),
                createTextVNode(" عرض الدرس الأصلي ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/books/${__props.book.id}`,
        onClick: () => {
        },
        class: "button-primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 me-2" fill="currentColor" viewBox="0 0 20 20" data-v-87625d12${_scopeId}><title data-v-87625d12${_scopeId}>عرض الكتاب</title><path fill-rule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H7z" clip-rule="evenodd" data-v-87625d12${_scopeId}></path></svg> عرض الكتاب `);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                class: "w-5 h-5 me-2",
                fill: "currentColor",
                viewBox: "0 0 20 20"
              }, [
                createVNode("title", null, "عرض الكتاب"),
                createVNode("path", {
                  "fill-rule": "evenodd",
                  d: "M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm0 2h12v12H4V4zm2 2a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H7z",
                  "clip-rule": "evenodd"
                })
              ])),
              createTextVNode(" عرض الكتاب ")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (!__props.book.storage_path) {
        _push(`<p class="text-xs text-center text-red-500 dark:text-red-400 mt-1" data-v-87625d12> ملف الكتاب غير متاح حاليًا. </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=BookCard.vue2.mjs.map
