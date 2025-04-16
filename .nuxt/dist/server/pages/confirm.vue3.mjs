import __nuxt_component_0 from "../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, resolveComponent, mergeProps, withCtx, createVNode, createTextVNode, unref } from "vue";
import { ssrRenderAttrs, ssrRenderClass, ssrRenderStyle, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent } from "vue/server-renderer";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useSupabaseUser } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseUser.mjs";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useRoute } from "../node_modules/nuxt/dist/app/composables/router.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "confirm",
  __ssrInlineRender: true,
  setup(__props) {
    const user = useSupabaseUser();
    useSupabaseClient();
    useRoute();
    const message = ref("");
    const isError = ref(false);
    const initialLoading = ref(true);
    const showResendButton = ref(false);
    const emailForResend = ref("");
    const resendLoading = ref(false);
    const resendMessage = ref("");
    const resendError = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_Icon = resolveComponent("Icon");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8" }, _attrs))} data-v-8074f604><div class="w-full max-w-md space-y-8 bg-white p-8 md:p-10 rounded-lg shadow border border-cream-gray" data-v-8074f604><h1 class="text-2xl md:text-3xl font-semibold text-center text-brown-dark mb-4" data-v-8074f604> تأكيد البريد الإلكتروني </h1>`);
      if (initialLoading.value) {
        _push(`<div class="py-6 text-center" data-v-8074f604><p class="text-gray-600 mb-4" data-v-8074f604>جارٍ التحقق من حالة الحساب...</p><div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-olive-green" data-v-8074f604></div></div>`);
      } else {
        _push(`<div class="text-center" data-v-8074f604>`);
        if (message.value) {
          _push(`<div class="${ssrRenderClass([isError.value ? "text-red-600" : "text-green-600", "text-lg mb-6 p-3 bg-opacity-10 rounded"])}" style="${ssrRenderStyle({ backgroundColor: isError.value ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)" })}" data-v-8074f604>${ssrInterpolate(message.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (showResendButton.value && emailForResend.value) {
          _push(`<div class="mt-6" data-v-8074f604><p class="text-sm text-gray-600 mb-2" data-v-8074f604>لم تستلم الإيميل أو انتهت صلاحية الرابط؟</p><button${ssrIncludeBooleanAttr(resendLoading.value) ? " disabled" : ""} class="text-sm bg-gray-200 text-brown-dark px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait" data-v-8074f604>`);
          if (resendLoading.value) {
            _push(`<span data-v-8074f604>جارٍ الإرسال...</span>`);
          } else {
            _push(`<span data-v-8074f604>إعادة إرسال رابط التأكيد</span>`);
          }
          _push(`</button>`);
          if (resendMessage.value) {
            _push(`<p class="${ssrRenderClass([resendError.value ? "text-red-500" : "text-green-500", "mt-2 text-xs"])}" data-v-8074f604>${ssrInterpolate(resendMessage.value)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-8" data-v-8074f604>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "inline-block text-olive-green hover:underline font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_Icon, {
                name: "mdi:arrow-right",
                class: "inline-block ml-1"
              }, null, _parent2, _scopeId));
              _push2(` العودة إلى الصفحة الرئيسية `);
            } else {
              return [
                createVNode(_component_Icon, {
                  name: "mdi:arrow-right",
                  class: "inline-block ml-1"
                }),
                createTextVNode(" العودة إلى الصفحة الرئيسية ")
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(user)) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/profile",
            class: "inline-block text-olive-green hover:underline font-medium mr-4"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` الذهاب للملف الشخصي `);
                _push2(ssrRenderComponent(_component_Icon, {
                  name: "mdi:account-circle-outline",
                  class: "inline-block ml-1"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createTextVNode(" الذهاب للملف الشخصي "),
                  createVNode(_component_Icon, {
                    name: "mdi:account-circle-outline",
                    class: "inline-block ml-1"
                  })
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=confirm.vue3.mjs.map
