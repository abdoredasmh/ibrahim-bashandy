import { defineComponent, ref, computed, watch, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrInterpolate } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "UserAvatar",
  __ssrInlineRender: true,
  props: {
    avatarUrl: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: ""
    },
    size: {
      type: String,
      default: "md",
      // 'xs', 'sm', 'md', 'lg', 'xl'
      validator: (value) => ["xs", "sm", "md", "lg", "xl"].includes(value)
    },
    initialBgColor: {
      type: String,
      default: "bg-gray-200 dark:bg-gray-700"
      // لون افتراضي للخلفية
    },
    initialTextColor: {
      type: String,
      default: "text-gray-600 dark:text-gray-300"
      // لون افتراضي للنص
    }
  },
  setup(__props) {
    const props = __props;
    const showInitial = ref(false);
    const initial = computed(() => {
      var _a, _b, _c;
      return ((_c = (_b = (_a = props.name) == null ? void 0 : _a.trim()) == null ? void 0 : _b[0]) == null ? void 0 : _c.toUpperCase()) || null;
    });
    const altText = computed(() => {
      return props.name ? `الصورة الرمزية لـ ${props.name}` : "الصورة الرمزية للمستخدم";
    });
    const sizeClasses = computed(() => {
      switch (props.size) {
        case "xs":
          return "w-6 h-6 text-xs";
        case "sm":
          return "w-8 h-8 text-sm";
        case "lg":
          return "w-12 h-12 text-lg";
        case "xl":
          return "w-16 h-16 text-xl";
        case "md":
        default:
          return "w-10 h-10 text-base";
      }
    });
    watch(() => props.avatarUrl, (newUrl) => {
      showInitial.value = !newUrl;
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["flex items-center justify-center rounded-full overflow-hidden flex-shrink-0", sizeClasses.value]
      }, _attrs))}>`);
      if (__props.avatarUrl && !showInitial.value) {
        _push(`<img${ssrRenderAttr("src", __props.avatarUrl)}${ssrRenderAttr("alt", altText.value)} class="w-full h-full object-cover" loading="lazy">`);
      } else if (initial.value) {
        _push(`<div class="${ssrRenderClass([
          "w-full h-full flex items-center justify-center font-semibold",
          __props.initialBgColor,
          __props.initialTextColor
        ])}"${ssrRenderAttr("title", altText.value)} aria-hidden="true">${ssrInterpolate(initial.value)}</div>`);
      } else {
        _push(`<div class="${ssrRenderClass([
          "w-full h-full flex items-center justify-center",
          __props.initialBgColor,
          __props.initialTextColor
        ])}"${ssrRenderAttr("title", altText.value)} aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" class="w-2/3 h-2/3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 2a5 5 0 100 10 5 5 0 000-10zM2 16.5A7.5 7.5 0 0110 9a7.5 7.5 0 018 7.5v.25a.25.25 0 01-.25.25H2.25a.25.25 0 01-.25-.25v-.25z" clip-rule="evenodd"></path></svg></div>`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=UserAvatar.vue2.mjs.map
