import __nuxt_component_0 from "../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, watchEffect, mergeProps, withCtx, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderClass } from "vue/server-renderer";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { navigateTo } from "../node_modules/nuxt/dist/app/composables/router.mjs";
import { useSupabaseUser } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseUser.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const user = useSupabaseUser();
    const email = ref("");
    const password = ref("");
    const message = ref("");
    const loading = ref(false);
    watchEffect(() => {
      if (user.value) {
        navigateTo("/");
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8" }, _attrs))} data-v-ddc8bca1><div class="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-lg shadow border border-cream-gray" data-v-ddc8bca1><div data-v-ddc8bca1><h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-brown-dark" data-v-ddc8bca1> تسجيل الدخول إلى حسابك </h2></div><form class="mt-8 space-y-6" data-v-ddc8bca1>`);
      if (message.value) {
        _push(`<div class="text-red-600 text-center text-sm mb-4 p-2 bg-red-100 rounded" data-v-ddc8bca1>${ssrInterpolate(message.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="rounded-md shadow-sm -space-y-px" data-v-ddc8bca1><div data-v-ddc8bca1><label for="email-address" class="sr-only" data-v-ddc8bca1>البريد الإلكتروني</label><input id="email-address" name="email" type="email"${ssrRenderAttr("value", email.value)} autocomplete="email" required class="relative block w-full appearance-none rounded-none rounded-t-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm" placeholder="البريد الإلكتروني" data-v-ddc8bca1></div><div data-v-ddc8bca1><label for="password" class="sr-only" data-v-ddc8bca1>كلمة المرور</label><input id="password" name="password" type="password"${ssrRenderAttr("value", password.value)} autocomplete="current-password" required class="relative block w-full appearance-none rounded-none rounded-b-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm" placeholder="كلمة المرور" data-v-ddc8bca1></div></div><div class="flex items-center justify-between" data-v-ddc8bca1><div class="text-sm" data-v-ddc8bca1>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/forgot-password",
        class: "font-medium text-olive-green hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` نسيت كلمة المرور؟ `);
          } else {
            return [
              createTextVNode(" نسيت كلمة المرور؟ ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div data-v-ddc8bca1><button type="submit"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} class="group relative flex w-full justify-center rounded-md border border-transparent bg-olive-green py-2 px-4 text-sm font-medium text-white hover:bg-opacity-85 focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 disabled:opacity-50" data-v-ddc8bca1>`);
      if (loading.value) {
        _push(`<span class="absolute inset-y-0 left-0 flex items-center pl-3" data-v-ddc8bca1><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-ddc8bca1><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-ddc8bca1></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-ddc8bca1></path></svg></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="${ssrRenderClass({ "opacity-0": loading.value })}" data-v-ddc8bca1>تسجيل الدخول</span></button></div><div class="text-sm text-center" data-v-ddc8bca1>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/signup",
        class: "font-medium text-olive-green hover:underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` ليس لديك حساب؟ إنشاء حساب جديد `);
          } else {
            return [
              createTextVNode(" ليس لديك حساب؟ إنشاء حساب جديد ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></form></div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=login.vue2.mjs.map
