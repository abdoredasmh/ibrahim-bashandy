import { defineComponent, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderSlot } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BaseCard",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700" }, _attrs))} data-v-dacc5a2c>`);
      if (_ctx.$slots.title) {
        _push(`<div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700" data-v-dacc5a2c><h3 class="text-lg font-semibold leading-6 text-[color:var(--color-brown-dark)] dark:text-[color:var(--color-beige-light)]" data-v-dacc5a2c>`);
        ssrRenderSlot(_ctx.$slots, "title", {}, null, _push, _parent);
        _push(`</h3></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="px-6 py-5" data-v-dacc5a2c>`);
      ssrRenderSlot(_ctx.$slots, "content", {}, null, _push, _parent);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
      if (_ctx.$slots.footer) {
        _push(`<div class="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600" data-v-dacc5a2c>`);
        ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push, _parent);
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=BaseCard.vue2.mjs.map
