import { defineComponent, computed, resolveDirective, createVNode, resolveDynamicComponent, mergeProps, withCtx, createBlock, openBlock, createCommentVNode, toDisplayString } from "vue";
import { ssrRenderVNode, ssrGetDirectiveProps, ssrRenderClass, ssrInterpolate } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminStatCard.vue",
  __ssrInlineRender: true,
  props: {
    title: { type: String, required: true },
    value: { type: Number, default: null },
    icon: { type: String, required: true },
    // اسم الأيقونة (مثل 'users', 'comments')
    isLoading: { type: Boolean, default: false },
    warning: { type: Boolean, default: false },
    linkTo: { type: String, default: null },
    // الرابط الذي ستنتقل إليه البطاقة
    tooltip: { type: String, default: null }
    // نص التلميح (Tooltip)
  },
  setup(__props) {
    const props = __props;
    const formattedValue = computed(() => {
      if (props.value === null || props.value === void 0) {
        return "-";
      }
      return props.value.toLocaleString("ar-EG");
    });
    const iconComponent = computed(() => {
      return `icon-${props.icon}`;
    });
    const getIconBgColor = () => {
      if (props.warning && !props.isLoading) return "bg-yellow-100 dark:bg-yellow-900/50";
      const colors = ["bg-blue-100 dark:bg-blue-900/50", "bg-green-100 dark:bg-green-900/50", "bg-purple-100 dark:bg-purple-900/50", "bg-red-100 dark:bg-red-900/50"];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    const getIconTextColor = () => {
      if (props.warning && !props.isLoading) return "text-yellow-600 dark:text-yellow-400";
      const colors = ["text-blue-600 dark:text-blue-400", "text-green-600 dark:text-green-400", "text-purple-600 dark:text-purple-400", "text-red-600 dark:text-red-400"];
      return colors[Math.floor(Math.random() * colors.length)];
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _directive_tooltip = resolveDirective("tooltip");
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(__props.linkTo ? "NuxtLink" : "div"), mergeProps({
        to: __props.linkTo,
        class: ["bg-white dark:bg-gray-800 p-4 md:p-5 rounded-lg shadow-md border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 group relative", {
          "border-yellow-400 dark:border-yellow-600 hover:border-yellow-500 dark:hover:border-yellow-500": __props.warning && !__props.isLoading,
          "cursor-pointer": __props.linkTo
        }]
      }, _attrs, ssrGetDirectiveProps(_ctx, _directive_tooltip, __props.tooltip)), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (__props.isLoading) {
              _push2(`<div class="animate-pulse" data-v-a4217ca5${_scopeId}><div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" data-v-a4217ca5${_scopeId}></div><div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2" data-v-a4217ca5${_scopeId}></div></div>`);
            } else {
              _push2(`<div class="flex items-center space-x-4 rtl:space-x-reverse" data-v-a4217ca5${_scopeId}><div class="${ssrRenderClass([getIconBgColor(), "p-3 rounded-full flex items-center justify-center"])}" data-v-a4217ca5${_scopeId}>`);
              ssrRenderVNode(_push2, createVNode(resolveDynamicComponent(iconComponent.value), {
                class: ["h-6 w-6", getIconTextColor()]
              }, null), _parent2, _scopeId);
              _push2(`</div><div data-v-a4217ca5${_scopeId}><p class="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" data-v-a4217ca5${_scopeId}>${ssrInterpolate(__props.title)}</p><p class="${ssrRenderClass([{ "text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-300": __props.warning }, "text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"])}" data-v-a4217ca5${_scopeId}>${ssrInterpolate(formattedValue.value)}</p></div>`);
              if (__props.warning && __props.value !== null && __props.value > 0) {
                _push2(`<span class="absolute top-2 right-2 text-yellow-500 dark:text-yellow-400" data-v-a4217ca5${_scopeId}><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" data-v-a4217ca5${_scopeId}><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" data-v-a4217ca5${_scopeId}></path></svg></span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            }
          } else {
            return [
              __props.isLoading ? (openBlock(), createBlock("div", {
                key: 0,
                class: "animate-pulse"
              }, [
                createVNode("div", { class: "h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" }),
                createVNode("div", { class: "h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/2" })
              ])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "flex items-center space-x-4 rtl:space-x-reverse"
              }, [
                createVNode("div", {
                  class: ["p-3 rounded-full flex items-center justify-center", getIconBgColor()]
                }, [
                  (openBlock(), createBlock(resolveDynamicComponent(iconComponent.value), {
                    class: ["h-6 w-6", getIconTextColor()]
                  }, null, 8, ["class"]))
                ], 2),
                createVNode("div", null, [
                  createVNode("p", { class: "text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" }, toDisplayString(__props.title), 1),
                  createVNode("p", {
                    class: ["text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors", { "text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-500 dark:group-hover:text-yellow-300": __props.warning }]
                  }, toDisplayString(formattedValue.value), 3)
                ]),
                __props.warning && __props.value !== null && __props.value > 0 ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "absolute top-2 right-2 text-yellow-500 dark:text-yellow-400"
                }, [
                  (openBlock(), createBlock("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    class: "h-5 w-5",
                    viewBox: "0 0 20 20",
                    fill: "currentColor"
                  }, [
                    createVNode("path", {
                      "fill-rule": "evenodd",
                      d: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
                      "clip-rule": "evenodd"
                    })
                  ]))
                ])) : createCommentVNode("", true)
              ]))
            ];
          }
        }),
        _: 1
      }), _parent);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=AdminStatCard.vue.vue2.mjs.map
