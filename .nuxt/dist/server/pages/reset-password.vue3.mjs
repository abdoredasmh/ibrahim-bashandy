import __nuxt_component_0 from "../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, mergeProps, withCtx, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderComponent } from "vue/server-renderer";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "reset-password",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const password = ref("");
    const confirmPassword = ref("");
    const message = ref("");
    const isError = ref(false);
    const loading = ref(false);
    const showForm = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8" }, _attrs))} data-v-4f8779b1><div class="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-lg shadow border border-cream-gray" data-v-4f8779b1><div data-v-4f8779b1><h2 class="mt-6 text-center text-3xl font-bold tracking-tight text-brown-dark" data-v-4f8779b1> إعادة تعيين كلمة المرور </h2>`);
      if (!showForm.value && !message.value) {
        _push(`<p class="mt-2 text-center text-sm text-gray-600" data-v-4f8779b1> {/* تعديل شرط الرسالة */} جارٍ التحقق من الرابط... </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (message.value) {
        _push(`<div class="${ssrRenderClass([isError.value ? "text-red-600" : "text-green-600", "text-center text-sm mb-4 p-2 bg-opacity-10 rounded"])}" style="${ssrRenderStyle({ backgroundColor: isError.value ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)" })}" data-v-4f8779b1>${ssrInterpolate(message.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (showForm.value) {
        _push(`<form class="mt-8 space-y-6" data-v-4f8779b1><input type="hidden" name="remember" value="true" data-v-4f8779b1><div class="rounded-md shadow-sm -space-y-px" data-v-4f8779b1><div data-v-4f8779b1><label for="password" class="sr-only" data-v-4f8779b1>كلمة المرور الجديدة</label><input id="password" name="password" type="password"${ssrRenderAttr("value", password.value)} autocomplete="new-password" required class="relative block w-full appearance-none rounded-none rounded-t-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm" placeholder="كلمة المرور الجديدة (8+ حروف، رموز، إلخ)" data-v-4f8779b1></div><div data-v-4f8779b1><label for="confirm-password" class="sr-only" data-v-4f8779b1>تأكيد كلمة المرور الجديدة</label><input id="confirm-password" name="confirm-password" type="password"${ssrRenderAttr("value", confirmPassword.value)} autocomplete="new-password" required class="relative block w-full appearance-none rounded-none rounded-b-md border border-cream-gray px-3 py-2 text-brown-dark placeholder-gray-500 focus:z-10 focus:border-olive-green focus:outline-none focus:ring-olive-green sm:text-sm" placeholder="تأكيد كلمة المرور الجديدة" data-v-4f8779b1></div></div><div data-v-4f8779b1><button type="submit"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""} class="group relative flex w-full justify-center rounded-md border border-transparent bg-olive-green py-2 px-4 text-sm font-medium text-white hover:bg-opacity-85 focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 disabled:opacity-50" data-v-4f8779b1>`);
        if (loading.value) {
          _push(`<span class="absolute inset-y-0 left-0 flex items-center pl-3" data-v-4f8779b1><svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-4f8779b1><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-4f8779b1></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-4f8779b1></path></svg></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<span class="${ssrRenderClass({ "opacity-0": loading.value })}" data-v-4f8779b1>تحديث كلمة المرور</span></button></div></form>`);
      } else {
        _push(`<!---->`);
      }
      if (!showForm.value && !loading.value && !isError.value) {
        _push(`<div class="text-sm text-center mt-4" data-v-4f8779b1> {/* تعديل الشرط */} `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "font-medium text-olive-green hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` العودة لتسجيل الدخول `);
            } else {
              return [
                createTextVNode(" العودة لتسجيل الدخول ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=reset-password.vue3.mjs.map
