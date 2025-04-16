import { defineComponent, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderSlot } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "InfoItem",
  __ssrInlineRender: true,
  props: {
    label: {},
    value: {},
    labelClass: {},
    valueClass: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "info-item flex justify-between items-baseline gap-x-2" }, _attrs))} data-v-4b548670><dt class="${ssrRenderClass(["text-gray-500 dark:text-gray-400 flex-shrink-0", _ctx.labelClass])}" data-v-4b548670>${ssrInterpolate(_ctx.label)}${ssrInterpolate(_ctx.label ? ":" : "")}</dt><dd class="${ssrRenderClass(["text-gray-900 dark:text-gray-100 text-left", _ctx.valueClass])}" data-v-4b548670>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, () => {
        _push(`${ssrInterpolate(_ctx.value ?? "N/A")}`);
      }, _push, _parent);
      _push(`</dd></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=InfoItem.vue2.mjs.map
