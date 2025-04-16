import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, createVNode, resolveDynamicComponent, h } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderVNode } from "vue/server-renderer";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useAsyncData } from "../node_modules/nuxt/dist/app/composables/asyncData.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AppFooter",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const supabase = useSupabaseClient();
    const currentYear = ref((/* @__PURE__ */ new Date()).getFullYear());
    const { data: aboutData, pending, error } = ([__temp, __restore] = withAsyncContext(async () => useAsyncData(
      "footer-about-data-v2",
      // استخدم مفتاح مختلف قليلاً إذا لزم الأمر
      async () => {
        console.log("[AppFooter] Fetching about_sheikh data...");
        const { data, error: error2 } = await supabase.from("about_sheikh").select("contact_info, short_bio").eq("id", 1).maybeSingle();
        if (error2) {
          console.error("Error fetching about_sheikh data for footer:", error2);
        }
        return data;
      },
      {
        default: () => ({ contact_info: null, short_bio: "موقع الشيخ إبراهيم بشندي" })
      }
    )), __temp = await __temp, __restore(), __temp);
    const socialLinks = computed(() => {
      var _a;
      const contactInfo = (_a = aboutData.value) == null ? void 0 : _a.contact_info;
      if (contactInfo && typeof contactInfo === "object" && !Array.isArray(contactInfo)) {
        const validLinks = {};
        const expectedPlatforms = ["facebook", "twitter", "youtube", "instagram", "tiktok", "telegram", "whatsapp", "linkedin"];
        for (const [key, value] of Object.entries(contactInfo)) {
          const platformKey = key.toLowerCase();
          if (expectedPlatforms.includes(platformKey) && typeof value === "string" && value.trim() !== "") {
            validLinks[platformKey] = value;
          }
        }
        return Object.keys(validLinks).length > 0 ? validLinks : null;
      }
      return null;
    });
    computed(() => {
      var _a;
      return ((_a = aboutData.value) == null ? void 0 : _a.short_bio) || "موقع الشيخ إبراهيم بشندي";
    });
    const iconsData = {
      facebook: { path: "M22 12C22 6.48 17.52 2 12 2S2 6.48 2 12c0 4.84 3.44 8.84 8 9.8v-6.92H8v-2.88h2V9.75c0-2 1.18-3.12 3-3.12.88 0 1.8.15 1.8.15v2h-1.01c-.99 0-1.29.62-1.29 1.26v1.52h2.2l-.35 2.88H13.5v6.92c4.56-.96 8-4.96 8-9.8z" },
      youtube: { path: "M21.8 8.001a2.752 2.752 0 0 0-1.936-1.946C18.206 6 12 6 12 6s-6.206 0-7.864.055A2.752 2.752 0 0 0 2.2 8.001 28.898 28.898 0 0 0 2 12c0 1.352.067 2.67.2 3.999a2.752 2.752 0 0 0 1.936 1.946C5.794 18 12 18 12 18s6.206 0 7.864-.055a2.752 2.752 0 0 0 1.936-1.946A28.898 28.898 0 0 0 22 12c0-1.352-.067-2.67-.2-3.999zM10 15.5V8.5l6 3.5-6 3.5z" },
      telegram: { path: "M21.05 2.85a1.5 1.5 0 0 0-1.58-.24L2.9 10.13a1.5 1.5 0 0 0 .13 2.76l4.97 1.6 1.86 5.05a1.5 1.5 0 0 0 2.69.27l2.3-3.65 4.39 3.26a1.5 1.5 0 0 0 2.36-1.06l1.04-14a1.5 1.5 0 0 0-.83-1.5zM10.9 15.34l-.66 2.2-.95-2.58 8.2-7.22-10.41 6.4-4.41-1.42L19.24 4.5l-8.34 10.84z" },
      // أضف مسارات الأيقونات الأخرى هنا بنفس الطريقة
      twitter: { path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
      instagram: { path: "M12 2C8.74 2 8.4 2.01 7.3 2.06c-1.1.05-1.8.22-2.43.46a4.88 4.88 0 0 0-1.77 1.15 4.88 4.88 0 0 0-1.15 1.77c-.24.63-.41 1.33-.46 2.43C2.01 8.4 2 8.74 2 12s.01 3.6.06 4.7c.05 1.1.22 1.8.46 2.43a4.88 4.88 0 0 0 1.15 1.77 4.88 4.88 0 0 0 1.77 1.15c.63.24 1.33.41 2.43.46 1.1.05 1.4.06 4.7.06s3.6-.01 4.7-.06c1.1-.05 1.8-.22 2.43-.46a4.88 4.88 0 0 0 1.77-1.15 4.88 4.88 0 0 0 1.15-1.77c.24-.63.41-1.33.46-2.43.05-1.1.06-1.4.06-4.7s-.01-3.6-.06-4.7c-.05-1.1-.22-1.8-.46-2.43a4.88 4.88 0 0 0-1.15-1.77 4.88 4.88 0 0 0-1.77-1.15c-.63-.24-1.33-.41-2.43-.46C15.6 2.01 15.3 2 12 2zm0 4.6c2.97 0 5.4 2.43 5.4 5.4s-2.43 5.4-5.4 5.4-5.4-2.43-5.4-5.4 2.43-5.4 5.4-5.4zm0 8.8c1.88 0 3.4-1.52 3.4-3.4s-1.52-3.4-3.4-3.4-3.4 1.52-3.4 3.4 1.52 3.4 3.4 3.4zm5.4-8.2c-.78 0-1.4.62-1.4 1.4s.62 1.4 1.4 1.4 1.4-.62 1.4-1.4-.62-1.4-1.4-1.4z" },
      tiktok: { path: "M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-1.09A3.458 3.458 0 0 0 11 6.45v8.97a3.35 3.35 0 1 1-4.57-3.13s0-.6.51-.51h1.5a.4.4 0 0 0 .39-.4v-1.5a.4.4 0 0 0-.39-.4H6.93a6.13 6.13 0 1 0 6.13 6.13V6.45a6.468 6.468 0 0 1 3.54-5.96Z" },
      whatsapp: { path: "M18.4 5.63a9 9 0 0 0-12.72 0 9 9 0 0 0 0 12.72L3 21.19l2.79-2.13a9 9 0 0 0 12.72 0 9 9 0 0 0-.11-12.72zm-1.43 11.3a7.5 7.5 0 0 1-10.6 0L4.8 18.5l1.49-1.49A7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 5.3 12.8l1.49 1.49zm-6.07-3.11c-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.62.14-.18.27-.7.89-.86 1.06-.16.18-.32.2-.59.06-.27-.14-1.14-.42-2.18-1.34-.81-.71-1.35-1.6-1.51-1.87-.16-.27-.02-.42.12-.56.12-.12.27-.31.41-.47.13-.15.18-.27.27-.45.09-.17.05-.31-.02-.45-.07-.14-.62-1.49-.85-2.03-.22-.53-.45-.46-.62-.47-.16 0-.35 0-.53 0a.94.94 0 0 0-.67.31c-.22.27-.86.86-.86 2.08 0 1.22.89 2.42 1 2.59.12.18 1.76 2.67 4.25 3.74.59.26 1.05.41 1.4.52.51.17.97.14 1.33.09.41-.07 1.27-.52 1.45-.99.18-.48.18-.89.13-1.06s-.23-.27-.5-.41z" },
      link: { path: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" }
      // أيقونة افتراضية
    };
    const getIconForPlatform = (platform) => {
      const iconData = iconsData[platform.toLowerCase()] || iconsData["link"];
      return {
        // استخدام render function لتمرير path data
        render() {
          return h("svg", { class: "w-6 h-6 fill-current", viewBox: "0 0 24 24" }, [
            h("path", { d: iconData.path })
          ]);
        }
      };
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "bg-brown-dark text-beige-light mt-auto border-t-4 border-olive-green" }, _attrs))} data-v-dadf47ce><div class="container mx-auto px-4 sm:px-6 lg:px-8 py-5" data-v-dadf47ce><div class="flex flex-col md:flex-row justify-between items-center gap-y-4 md:gap-x-6" data-v-dadf47ce><div class="text-center md:text-right order-2 md:order-1" data-v-dadf47ce><p class="text-sm" data-v-dadf47ce> جميع الحقوق محفوظة © ${ssrInterpolate(currentYear.value)}</p><p class="text-lg font-semibold" data-v-dadf47ce>${ssrInterpolate("الشيخ ابراهيم بشندي ")}</p></div><div class="flex justify-center md:justify-start gap-x-4 order-1 md:order-2" data-v-dadf47ce>`);
      if (unref(pending)) {
        _push(`<div class="flex space-x-4 rtl:space-x-reverse animate-pulse" data-v-dadf47ce><div class="h-6 w-6 bg-gray-600 rounded-full" data-v-dadf47ce></div><div class="h-6 w-6 bg-gray-600 rounded-full" data-v-dadf47ce></div><div class="h-6 w-6 bg-gray-600 rounded-full" data-v-dadf47ce></div></div>`);
      } else if (unref(error) || !socialLinks.value || Object.keys(socialLinks.value).length === 0) {
        _push(`<div class="text-xs text-gray-400 italic" data-v-dadf47ce> (لا تتوفر روابط تواصل) </div>`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(socialLinks.value, (url, platform) => {
          _push(`<a${ssrRenderAttr("href", url)} target="_blank" rel="noopener noreferrer"${ssrRenderAttr("aria-label", `تابعنا على ${platform}`)} class="text-beige-light hover:text-olive-green transition-colors duration-200 ease-in-out" data-v-dadf47ce><span class="sr-only" data-v-dadf47ce>${ssrInterpolate(platform)}</span>`);
          ssrRenderVNode(_push, createVNode(resolveDynamicComponent(getIconForPlatform(platform)), {
            class: "h-6 w-6 fill-current",
            "aria-hidden": "true"
          }, null), _parent);
          _push(`</a>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</div></div></div></footer>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=AppFooter.vue2.mjs.map
