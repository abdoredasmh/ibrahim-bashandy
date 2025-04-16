import __nuxt_component_0 from "../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import __nuxt_component_1 from "../node_modules/nuxt/dist/app/components/client-only.mjs";
import { defineComponent, ref, watch, withCtx, createTextVNode, toDisplayString, unref, createBlock, createCommentVNode, openBlock, createVNode } from "vue";
import { ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderStyle, ssrRenderClass } from "vue/server-renderer";
import { useUserStore } from "../stores/user.mjs";
import { storeToRefs } from "../node_modules/pinia/dist/pinia.mjs";
import { useColorMode } from "../node_modules/_nuxtjs/color-mode/dist/runtime/composables.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AppHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const userStore = useUserStore();
    const { isLoggedIn, displayName, userAvatar, isAdmin } = storeToRefs(userStore);
    const isDropdownOpen = ref(false);
    const isSidebarOpen = ref(false);
    const unreadNotifications = ref(0);
    ref(null);
    ref(null);
    ref(null);
    ref(null);
    ref(null);
    const previouslyFocusedElement = ref(null);
    const navLinks = ref([
      { text: "الرئيسية", to: "/" },
      { text: "الدروس", to: "/lessons" },
      { text: "الكتب", to: "/books" },
      { text: "الدراسة", to: "/study" },
      { text: "اسأل الشيخ", to: "/ask" },
      { text: "عن الشيخ", to: "/about" }
    ]);
    const isDark = ref(false);
    useColorMode();
    const closeDropdown = (refocus = true) => {
      if (isDropdownOpen.value) {
        isDropdownOpen.value = false;
        if (refocus && previouslyFocusedElement.value && (void 0).body.contains(previouslyFocusedElement.value)) {
          previouslyFocusedElement.value.focus();
        }
      }
    };
    const closeSidebar = (refocus = true) => {
      if (isSidebarOpen.value) {
        isSidebarOpen.value = false;
        if (refocus && previouslyFocusedElement.value && (void 0).body.contains(previouslyFocusedElement.value)) {
          previouslyFocusedElement.value.focus();
        }
      }
    };
    async function fetchNotifications() {
      if (isLoggedIn.value) {
        console.log("Fetching notifications...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        try {
          unreadNotifications.value = 3;
          console.log("Notifications fetched:", unreadNotifications.value);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
          unreadNotifications.value = 0;
        }
      } else {
        unreadNotifications.value = 0;
      }
    }
    watch(isLoggedIn, (newValue, oldValue) => {
      if (newValue === true && oldValue === false) {
        fetchNotifications();
      } else if (newValue === false) {
        unreadNotifications.value = 0;
        closeDropdown(false);
        closeSidebar(false);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ClientOnly = __nuxt_component_1;
      _push(`<!--[--><header class="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50" data-v-09e2986d><nav class="container mx-auto px-4 py-5 flex items-center justify-between" data-v-09e2986d>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "text-xl font-bold text-olive-green dark:text-yellow-400 hover:opacity-80 transition-opacity"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` الشيخ إبراهيم بشندي `);
          } else {
            return [
              createTextVNode(" الشيخ إبراهيم بشندي ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<ul class="hidden md:flex items-center gap-x-6 lg:gap-x-8 text-brown-dark dark:text-gray-300" data-v-09e2986d><!--[-->`);
      ssrRenderList(navLinks.value, (link) => {
        _push(`<li data-v-09e2986d>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: link.to,
          class: "hover:text-olive-green dark:hover:text-yellow-400 transition-colors"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(link.text)}`);
            } else {
              return [
                createTextVNode(toDisplayString(link.text), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]-->`);
      if (unref(isAdmin)) {
        _push(`<li data-v-09e2986d>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin",
          class: "text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold transition-colors admin-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` لوحة التحكم `);
            } else {
              return [
                createTextVNode(" لوحة التحكم ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</li>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</ul><div class="flex items-center gap-x-4" data-v-09e2986d><button class="text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400 transition-colors" aria-label="بحث" data-v-09e2986d><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true" data-v-09e2986d><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" data-v-09e2986d></path></svg></button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "relative text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400 transition-colors",
        "aria-label": "الإشعارات"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true" data-v-09e2986d${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" data-v-09e2986d${_scopeId}></path></svg>`);
            if (unreadNotifications.value > 0) {
              _push2(`<span class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900" data-v-09e2986d${_scopeId}>${ssrInterpolate(unreadNotifications.value > 9 ? "9+" : unreadNotifications.value)}</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              (openBlock(), createBlock("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                class: "h-6 w-6",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                "stroke-width": "2",
                "aria-hidden": "true"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                })
              ])),
              unreadNotifications.value > 0 ? (openBlock(), createBlock("span", {
                key: 0,
                class: "absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900"
              }, toDisplayString(unreadNotifications.value > 9 ? "9+" : unreadNotifications.value), 1)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400 transition-colors" aria-label="تبديل الوضع الداكن" data-v-09e2986d>`);
      if (!isDark.value) {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true" data-v-09e2986d><path fill-rule="evenodd" d="M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.981A10.503 10.503 0 0 1 18 19.5a10.5 10.5 0 0 1-10.5-10.5 10.503 10.503 0 0 1 2.028-6.282.75.75 0 0 1 .819-.162Z" clip-rule="evenodd" data-v-09e2986d></path></svg>`);
      } else {
        _push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6" aria-hidden="true" data-v-09e2986d><path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.06 1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6.166 7.758a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591ZM12 4.5a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5h2.25a.75.75 0 0 1 .75.75Z" data-v-09e2986d></path></svg>`);
      }
      _push(`</button>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`<button class="md:hidden text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400 transition-colors" aria-label="فتح القائمة" data-v-09e2986d><svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true" data-v-09e2986d><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" data-v-09e2986d></path></svg></button></div></nav></header><div style="${ssrRenderStyle(isSidebarOpen.value ? null : { display: "none" })}" class="${ssrRenderClass([{ "opacity-100": isSidebarOpen.value, "opacity-0 pointer-events-none": !isSidebarOpen.value }, "fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden transition-opacity duration-300 ease-in-out"])}" aria-hidden="true" data-v-09e2986d></div><aside style="${ssrRenderStyle(isSidebarOpen.value ? null : { display: "none" })}" class="fixed top-0 right-0 w-64 h-full bg-white dark:bg-gray-800 shadow-lg z-50 md:hidden px-4 py-6 space-y-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="sidebar-title" data-v-09e2986d><div class="flex items-center justify-between mb-4" data-v-09e2986d><span id="sidebar-title" class="text-lg font-bold text-olive-green dark:text-yellow-400" data-v-09e2986d>القائمة</span><button class="text-brown-dark dark:text-gray-300 hover:text-olive-green dark:hover:text-yellow-400" aria-label="إغلاق القائمة" data-v-09e2986d><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" data-v-09e2986d><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-09e2986d></path></svg></button></div><ul class="space-y-3 text-brown-dark dark:text-gray-300" data-v-09e2986d><!--[-->`);
      ssrRenderList(navLinks.value, (link) => {
        _push(`<li data-v-09e2986d>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: link.to,
          onClick: closeSidebar,
          class: "block hover:text-olive-green dark:hover:text-yellow-400"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(link.text)}`);
            } else {
              return [
                createTextVNode(toDisplayString(link.text), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]-->`);
      if (unref(isAdmin)) {
        _push(`<li data-v-09e2986d>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin",
          onClick: closeSidebar,
          class: "block text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold admin-link"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` لوحة التحكم `);
            } else {
              return [
                createTextVNode(" لوحة التحكم ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</li>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</ul><div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700" data-v-09e2986d>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div></aside><!--]-->`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=AppHeader.vue2.mjs.map
