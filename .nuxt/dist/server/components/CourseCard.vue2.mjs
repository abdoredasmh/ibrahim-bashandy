import __nuxt_component_0 from "../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, createBlock, createCommentVNode, openBlock, toDisplayString, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CourseCard",
  __ssrInlineRender: true,
  props: {
    course: {},
    lessonCount: {},
    isEnrolled: { type: Boolean }
  },
  emits: ["enroll"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const imageLoadError = ref(false);
    const enrollLoading = ref(false);
    const imageUrl = computed(() => props.course.image_url || "/images/placeholder-course.jpg");
    const courseLink = computed(() => `/study/courses/${props.course.id}`);
    function onImageError() {
      imageLoadError.value = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700/50 overflow-hidden group transition-shadow duration-300 hover:shadow-lg flex flex-col" }, _attrs))} data-v-8bfecfbf>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: courseLink.value,
        class: "block relative aspect-video overflow-hidden"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", imageUrl.value)}${ssrRenderAttr("alt", `غلاف دورة: ${_ctx.course.title}`)} class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" decoding="async" data-v-8bfecfbf${_scopeId}>`);
            if (imageLoadError.value) {
              _push2(`<div class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500" data-v-8bfecfbf${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10" data-v-8bfecfbf${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm16.5-5.818V18" data-v-8bfecfbf${_scopeId}></path></svg></div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("img", {
                src: imageUrl.value,
                alt: `غلاف دورة: ${_ctx.course.title}`,
                class: "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",
                loading: "lazy",
                decoding: "async",
                onError: onImageError
              }, null, 40, ["src", "alt"]),
              imageLoadError.value ? (openBlock(), createBlock("div", {
                key: 0,
                class: "absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
              }, [
                (openBlock(), createBlock("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  "stroke-width": "1.5",
                  stroke: "currentColor",
                  class: "w-10 h-10"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm16.5-5.818V18"
                  })
                ]))
              ])) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="p-4 flex flex-col flex-grow" data-v-8bfecfbf>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: courseLink.value }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h3 class="font-semibold text-lg mb-1 line-clamp-2 text-brown-dark dark:text-beige-light group-hover:text-olive-green transition-colors duration-200" data-v-8bfecfbf${_scopeId}>${ssrInterpolate(_ctx.course.title)}</h3>`);
          } else {
            return [
              createVNode("h3", { class: "font-semibold text-lg mb-1 line-clamp-2 text-brown-dark dark:text-beige-light group-hover:text-olive-green transition-colors duration-200" }, toDisplayString(_ctx.course.title), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 flex-grow" data-v-8bfecfbf>${ssrInterpolate(_ctx.course.description || "...")}</p><div class="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between mt-2" data-v-8bfecfbf>`);
      if (_ctx.lessonCount !== void 0) {
        _push(`<span data-v-8bfecfbf><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 inline-block align-middle me-1" data-v-8bfecfbf><path d="M2 2.75C2 1.784 2.784 1 3.75 1h8.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25V2.75Z" data-v-8bfecfbf></path><path d="M4.75 5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5ZM4 9.75A.75.75 0 0 1 4.75 9h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 4 9.75Z" data-v-8bfecfbf></path></svg> ${ssrInterpolate(_ctx.lessonCount)} ${ssrInterpolate(_ctx.lessonCount === 1 ? "درس" : _ctx.lessonCount <= 10 ? "دروس" : "درس")}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="px-4 pb-4 mt-auto" data-v-8bfecfbf>`);
      if (!_ctx.isEnrolled) {
        _push(`<button${ssrIncludeBooleanAttr(enrollLoading.value) ? " disabled" : ""} class="w-full button-enroll" data-v-8bfecfbf>`);
        if (!enrollLoading.value) {
          _push(`<span data-v-8bfecfbf>انتساب للدورة</span>`);
        } else {
          _push(`<span data-v-8bfecfbf>جاري الانتساب...</span>`);
        }
        _push(`</button>`);
      } else {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: courseLink.value,
          class: "w-full button-view"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` عرض الدورة `);
            } else {
              return [
                createTextVNode(" عرض الدورة ")
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=CourseCard.vue2.mjs.map
