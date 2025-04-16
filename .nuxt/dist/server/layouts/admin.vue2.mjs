import __nuxt_component_0 from "../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, mergeProps, withCtx, createBlock, createVNode, openBlock } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from "vue/server-renderer";
import AdminSidebar from "../components/admin/AdminSidebar.vue.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const isSidebarOpen = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex h-screen bg-gray-100 dark:bg-gray-900 font-sans" }, _attrs))}>`);
      _push(ssrRenderComponent(AdminSidebar, {
        isOpenOnMobile: isSidebarOpen.value,
        "onUpdate:isOpenOnMobile": ($event) => isSidebarOpen.value = $event
      }, null, _parent));
      _push(`<div class="flex-1 flex flex-col overflow-hidden"><header class="bg-white dark:bg-gray-800 shadow-md h-16 flex items-center justify-between px-6 flex-shrink-0"><div class="flex items-center gap-4"><button class="md:hidden ..."> ... </button><h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 hidden sm:block">لوحة التحكم</h2></div><div class="flex items-center gap-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors",
        title: "فتح الموقع الرئيسي في تبويب جديد"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4"${_scopeId}><path d="M6.75 1.75a.75.75 0 0 0 0 1.5h1.435L3.11 8.327a.75.75 0 0 0 1.06 1.061l5.076-5.075V5.75a.75.75 0 0 0 1.5 0V1.75H6.75Z"${_scopeId}></path><path d="M2.013 1.99a.75.75 0 0 0-.747.868l.016.102-.015.001H1.25C.56 3 .001 3.56.001 4.25v7.5C.001 12.44.56 13 1.25 13H9c.69 0 1.249-.56 1.249-1.25V9.76l.007-.015.103-.016a.75.75 0 0 0 .868-.746l.001-.015V8.75a.75.75 0 0 0-1.5 0v.19l-1.03.002-.03-.001-.005.001a1.74 1.74 0 0 0-1.465-.906H6.5A1.75 1.75 0 0 0 4.75 10v1H2.75a.75.75 0 0 1 0-1.5H4V6H2.75a.75.75 0 0 1 0-1.5H4V4H2.013l-.001-.01Z"${_scopeId}></path></svg><span class="hidden sm:inline"${_scopeId}>عرض الموقع</span>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 16 16",
                fill: "currentColor",
                class: "w-4 h-4"
              }, [
                createVNode("path", { d: "M6.75 1.75a.75.75 0 0 0 0 1.5h1.435L3.11 8.327a.75.75 0 0 0 1.06 1.061l5.076-5.075V5.75a.75.75 0 0 0 1.5 0V1.75H6.75Z" }),
                createVNode("path", { d: "M2.013 1.99a.75.75 0 0 0-.747.868l.016.102-.015.001H1.25C.56 3 .001 3.56.001 4.25v7.5C.001 12.44.56 13 1.25 13H9c.69 0 1.249-.56 1.249-1.25V9.76l.007-.015.103-.016a.75.75 0 0 0 .868-.746l.001-.015V8.75a.75.75 0 0 0-1.5 0v.19l-1.03.002-.03-.001-.005.001a1.74 1.74 0 0 0-1.465-.906H6.5A1.75 1.75 0 0 0 4.75 10v1H2.75a.75.75 0 0 1 0-1.5H4V6H2.75a.75.75 0 0 1 0-1.5H4V4H2.013l-.001-.01Z" })
              ])),
              createVNode("span", { class: "hidden sm:inline" }, "عرض الموقع")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div></div></div></header><main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=admin.vue2.mjs.map
