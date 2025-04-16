import { defineComponent, ref, mergeProps } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "about-sheikh",
  __ssrInlineRender: true,
  setup(__props) {
    useSupabaseClient();
    const isLoading = ref(true);
    const loadError = ref(null);
    const isSaving = ref(false);
    const updateError = ref(null);
    const successMessage = ref(null);
    const lastUpdated = ref(null);
    ref(null);
    const isUploading = ref(false);
    const uploadError = ref(null);
    const initialFormData = {
      short_bio: "",
      full_bio: "",
      profile_image_url: "",
      contact_info: {}
      // تهيئة ككائن فارغ
    };
    const formData = ref({ ...initialFormData });
    function formatDate(dateString) {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        return date.toLocaleString("ar-EG", { dateStyle: "long", timeStyle: "short" });
      } catch {
        return "تاريخ غير صالح";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-4 md:p-6 lg:p-8" }, _attrs))} data-v-2d9e13f5><h1 class="text-2xl font-bold text-brown-dark dark:text-beige-light mb-6 border-b border-cream-gray dark:border-gray-700 pb-3" data-v-2d9e13f5> إدارة صفحة &quot;عن الشيخ&quot; </h1>`);
      if (isLoading.value) {
        _push(`<div class="text-center py-10" data-v-2d9e13f5><p class="text-gray-500 dark:text-gray-400" data-v-2d9e13f5>جاري تحميل البيانات...</p></div>`);
      } else if (loadError.value) {
        _push(`<div class="p-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-md" data-v-2d9e13f5><p data-v-2d9e13f5>خطأ في تحميل البيانات: ${ssrInterpolate(loadError.value)}</p><button class="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700" data-v-2d9e13f5> إعادة المحاولة </button></div>`);
      } else {
        _push(`<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-cream-gray dark:border-gray-700" data-v-2d9e13f5><form data-v-2d9e13f5><div class="space-y-6" data-v-2d9e13f5><div data-v-2d9e13f5><label for="short_bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-v-2d9e13f5> نبذة مختصرة </label><textarea id="short_bio" rows="3" class="form-textarea" data-v-2d9e13f5>${ssrInterpolate(formData.value.short_bio)}</textarea><p class="form-help-text" data-v-2d9e13f5>تظهر في أماكن مثل أعلى الصفحة الرئيسية.</p></div><div data-v-2d9e13f5><label for="full_bio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-v-2d9e13f5> السيرة الذاتية الكاملة </label><textarea id="full_bio" rows="10" class="form-textarea" data-v-2d9e13f5>${ssrInterpolate(formData.value.full_bio)}</textarea><p class="form-help-text" data-v-2d9e13f5>المحتوى الرئيسي لصفحة &quot;عن الشيخ&quot;.</p></div><div data-v-2d9e13f5><label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-v-2d9e13f5> صورة الشيخ الشخصية </label><div class="mt-1 flex items-center space-x-reverse space-x-4" data-v-2d9e13f5>`);
        if (formData.value.profile_image_url) {
          _push(`<img${ssrRenderAttr("src", formData.value.profile_image_url)} alt="صورة الشيخ الحالية" class="h-24 w-24 rounded-md object-cover border border-cream-gray dark:border-gray-600 flex-shrink-0" data-v-2d9e13f5>`);
        } else {
          _push(`<div class="h-24 w-24 rounded-md border border-dashed border-cream-gray dark:border-gray-600 flex items-center justify-center text-gray-400 flex-shrink-0" data-v-2d9e13f5><svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1" data-v-2d9e13f5><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" data-v-2d9e13f5></path></svg></div>`);
        }
        _push(`<div class="flex-grow" data-v-2d9e13f5><input type="file" id="imageUpload" accept="image/png, image/jpeg, image/webp" class="hidden" data-v-2d9e13f5><label for="imageUpload" class="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" data-v-2d9e13f5><span data-v-2d9e13f5>${ssrInterpolate(isUploading.value ? "جاري الرفع..." : "اختيار صورة جديدة")}</span></label>`);
        if (uploadError.value) {
          _push(`<p class="mt-1 text-xs text-red-600 dark:text-red-400" data-v-2d9e13f5>${ssrInterpolate(uploadError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (!uploadError.value) {
          _push(`<p class="mt-1 text-xs text-gray-500 dark:text-gray-400" data-v-2d9e13f5> (اختياري) اختر ملف PNG, JPG, أو WEBP. سيتم استبدال الصورة الحالية. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<input type="text"${ssrRenderAttr("value", formData.value.profile_image_url)} readonly class="form-input mt-2 !bg-gray-100 dark:!bg-gray-700/50 opacity-75" placeholder="رابط الصورة بعد الرفع" data-v-2d9e13f5></div></div></div><fieldset class="border-t border-cream-gray dark:border-gray-600 pt-5" data-v-2d9e13f5><legend class="text-base font-medium text-gray-900 dark:text-white mb-3" data-v-2d9e13f5>معلومات الاتصال (اختياري)</legend><div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5" data-v-2d9e13f5><div data-v-2d9e13f5><label for="contact_email" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-2d9e13f5>البريد الإلكتروني</label><input type="email" id="contact_email"${ssrRenderAttr("value", formData.value.contact_info.email)} class="form-input mt-1" placeholder="email@example.com" data-v-2d9e13f5></div><div data-v-2d9e13f5><label for="contact_phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-2d9e13f5>الهاتف</label><input type="tel" id="contact_phone"${ssrRenderAttr("value", formData.value.contact_info.phone)} class="form-input mt-1" placeholder="+XXXXXXXXXXX" data-v-2d9e13f5></div><div data-v-2d9e13f5><label for="contact_telegram" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-2d9e13f5>تيليجرام (رابط قناة أو حساب)</label><input type="url" id="contact_telegram"${ssrRenderAttr("value", formData.value.contact_info.telegram)} class="form-input mt-1" placeholder="https://t.me/username" data-v-2d9e13f5></div><div data-v-2d9e13f5><label for="contact_whatsapp" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-2d9e13f5>واتساب (رابط مباشر أو رقم)</label><input type="text" id="contact_whatsapp"${ssrRenderAttr("value", formData.value.contact_info.whatsapp)} class="form-input mt-1" placeholder="https://wa.me/..." data-v-2d9e13f5></div><div data-v-2d9e13f5><label for="contact_facebook" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-2d9e13f5>فيسبوك (رابط صفحة)</label><input type="url" id="contact_facebook"${ssrRenderAttr("value", formData.value.contact_info.facebook)} class="form-input mt-1" placeholder="https://facebook.com/page" data-v-2d9e13f5></div><div data-v-2d9e13f5><label for="contact_twitter" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-2d9e13f5>تويتر / X (رابط حساب)</label><input type="url" id="contact_twitter"${ssrRenderAttr("value", formData.value.contact_info.twitter)} class="form-input mt-1" placeholder="https://x.com/username" data-v-2d9e13f5></div><div data-v-2d9e13f5><label for="contact_youtube" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-2d9e13f5>يوتيوب (رابط قناة)</label><input type="url" id="contact_youtube"${ssrRenderAttr("value", formData.value.contact_info.youtube)} class="form-input mt-1" placeholder="https://youtube.com/channel/..." data-v-2d9e13f5></div><div data-v-2d9e13f5><label for="contact_instagram" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-2d9e13f5>انستغرام (رابط حساب)</label><input type="url" id="contact_instagram"${ssrRenderAttr("value", formData.value.contact_info.instagram)} class="form-input mt-1" placeholder="https://instagram.com/username" data-v-2d9e13f5></div><div data-v-2d9e13f5><label for="contact_tiktok" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-2d9e13f5>تيك توك (رابط حساب)</label><input type="url" id="contact_tiktok"${ssrRenderAttr("value", formData.value.contact_info.tiktok)} class="form-input mt-1" placeholder="https://tiktok.com/@username" data-v-2d9e13f5></div></div></fieldset></div>`);
        if (successMessage.value) {
          _push(`<div class="mt-6 p-3 form-success-message" data-v-2d9e13f5>${ssrInterpolate(successMessage.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (updateError.value) {
          _push(`<div class="mt-6 p-3 form-error-message" data-v-2d9e13f5> خطأ في التحديث: ${ssrInterpolate(updateError.value)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-8 pt-5 border-t border-cream-gray dark:border-gray-700" data-v-2d9e13f5><button type="submit"${ssrIncludeBooleanAttr(isSaving.value || isUploading.value) ? " disabled" : ""} class="inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 dark:focus:ring-offset-gray-800" data-v-2d9e13f5>`);
        if (isSaving.value) {
          _push(`<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-2d9e13f5><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-2d9e13f5></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-2d9e13f5></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(isSaving.value ? "جاري حفظ التعديلات..." : "حفظ التعديلات")}</button>`);
        if (lastUpdated.value) {
          _push(`<p class="mt-3 text-xs text-gray-500 dark:text-gray-400" data-v-2d9e13f5>آخر تحديث: ${ssrInterpolate(formatDate(lastUpdated.value))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></form></div>`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=about-sheikh.vue3.mjs.map
