import __nuxt_component_0 from "../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, createBlock, openBlock, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LessonCard",
  __ssrInlineRender: true,
  props: {
    lesson: {
      type: Object,
      // Use the defined type
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const imageError = ref(false);
    const getYouTubeVideoId = (url) => {
      if (!url) return null;
      try {
        const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regex);
        return match && match[1] ? match[1] : null;
      } catch (e) {
        console.error("Error processing YouTube URL:", url, e);
        return null;
      }
    };
    const videoId = computed(() => getYouTubeVideoId(props.lesson.youtube_url));
    const handleImageError = () => {
      console.warn(`Failed to load YouTube thumbnail for video ID: ${videoId.value}`);
      imageError.value = true;
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white dark:bg-gray-800 rounded-lg shadow border border-cream-gray dark:border-gray-700/50 overflow-hidden group transition-shadow duration-300 hover:shadow-lg" }, _attrs))} data-v-640cfe80>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/lessons/${__props.lesson.id}`,
        class: "block group/link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="aspect-video bg-black flex items-center justify-center relative overflow-hidden" data-v-640cfe80${_scopeId}>`);
            if (videoId.value && !imageError.value) {
              _push2(`<img${ssrRenderAttr("src", `https://img.youtube.com/vi/${videoId.value}/hqdefault.jpg`)}${ssrRenderAttr("alt", `صورة مصغرة لدرس: ${__props.lesson.title}`)} class="w-full h-full object-cover transition-transform duration-300 group-hover/link:scale-105" loading="lazy" decoding="async" data-v-640cfe80${_scopeId}>`);
            } else {
              _push2(`<div class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700" data-v-640cfe80${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-12 h-12 text-gray-400 dark:text-gray-500" fill="currentColor" aria-hidden="true" data-v-640cfe80${_scopeId}><path d="M10,15L15,12L10,9V15M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" data-v-640cfe80${_scopeId}></path></svg></div>`);
            }
            _push2(`<div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover/link:bg-opacity-40 transition-opacity duration-300 opacity-0 group-hover/link:opacity-100" data-v-640cfe80${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-12 h-12 text-white drop-shadow-lg transform transition-transform duration-300 group-hover/link:scale-110" fill="currentColor" aria-hidden="true" data-v-640cfe80${_scopeId}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" data-v-640cfe80${_scopeId}></path></svg></div></div><div class="p-4" data-v-640cfe80${_scopeId}><h3 class="font-semibold text-lg mb-1 line-clamp-2 text-brown-dark dark:text-beige-light group-hover/link:text-olive-green transition-colors duration-200" data-v-640cfe80${_scopeId}>${ssrInterpolate(__props.lesson.title)}</h3><p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3" data-v-640cfe80${_scopeId}>${ssrInterpolate(__props.lesson.description || "لا يوجد وصف للفديو")}</p></div>`);
          } else {
            return [
              createVNode("div", { class: "aspect-video bg-black flex items-center justify-center relative overflow-hidden" }, [
                videoId.value && !imageError.value ? (openBlock(), createBlock("img", {
                  key: 0,
                  src: `https://img.youtube.com/vi/${videoId.value}/hqdefault.jpg`,
                  alt: `صورة مصغرة لدرس: ${__props.lesson.title}`,
                  class: "w-full h-full object-cover transition-transform duration-300 group-hover/link:scale-105",
                  loading: "lazy",
                  decoding: "async",
                  onError: handleImageError
                }, null, 40, ["src", "alt"])) : (openBlock(), createBlock("div", {
                  key: 1,
                  class: "absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700"
                }, [
                  (openBlock(), createBlock("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    class: "w-12 h-12 text-gray-400 dark:text-gray-500",
                    fill: "currentColor",
                    "aria-hidden": "true"
                  }, [
                    createVNode("path", { d: "M10,15L15,12L10,9V15M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z" })
                  ]))
                ])),
                createVNode("div", { class: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover/link:bg-opacity-40 transition-opacity duration-300 opacity-0 group-hover/link:opacity-100" }, [
                  (openBlock(), createBlock("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0 0 24 24",
                    class: "w-12 h-12 text-white drop-shadow-lg transform transition-transform duration-300 group-hover/link:scale-110",
                    fill: "currentColor",
                    "aria-hidden": "true"
                  }, [
                    createVNode("path", { d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" })
                  ]))
                ])
              ]),
              createVNode("div", { class: "p-4" }, [
                createVNode("h3", { class: "font-semibold text-lg mb-1 line-clamp-2 text-brown-dark dark:text-beige-light group-hover/link:text-olive-green transition-colors duration-200" }, toDisplayString(__props.lesson.title), 1),
                createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-400 line-clamp-3" }, toDisplayString(__props.lesson.description || "لا يوجد وصف للفديو"), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=LessonCard.vue2.mjs.map
