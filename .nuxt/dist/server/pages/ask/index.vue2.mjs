import __nuxt_component_0 from "../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, createTextVNode } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderStyle, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useSupabaseUser } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseUser.mjs";
import { useHead } from "../../node_modules/nuxt/dist/head/runtime/composables/v3.mjs";
const MIN_QUESTION_LENGTH = 10;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();
    const questionText = ref("");
    const isSubmitting = ref(false);
    const submitSuccess = ref(false);
    const submitError = ref(null);
    const questionError = ref(null);
    const publicQuestions = ref([]);
    const categories = ref([]);
    const selectedCategory = ref(null);
    const isLoadingPublic = ref(true);
    const fetchErrorPublic = ref(null);
    const isLoadingCategories = ref(true);
    const currentPage = ref(1);
    const pageSize = ref(15);
    const totalQuestions = ref(0);
    const isQuestionInvalid = computed(() => {
      return questionText.value.trim().length < MIN_QUESTION_LENGTH;
    });
    const totalPages = computed(() => {
      if (totalQuestions.value === 0) return 1;
      return Math.ceil(totalQuestions.value / pageSize.value);
    });
    async function fetchPublicData(page = 1, categoryId = selectedCategory.value) {
      isLoadingPublic.value = true;
      fetchErrorPublic.value = null;
      const rangeFrom = (page - 1) * pageSize.value;
      const rangeTo = rangeFrom + pageSize.value - 1;
      try {
        if (categories.value.length === 0 && isLoadingCategories.value) {
          const { data: catData, error: catError } = await supabase.from("question_categories").select("id, name").order("id");
          if (catError) {
            console.error("Error fetching categories:", catError);
          } else {
            categories.value = catData || [];
          }
          isLoadingCategories.value = false;
        }
        let query = supabase.from("questions_to_sheikh").select(`
        id, question_text, submitted_at, answer_text, answered_at,
        is_public, is_answered, category_id,
        question_categories ( name )
      `, { count: "exact" }).eq("is_public", true).eq("is_answered", true).order("answered_at", { ascending: false }).range(rangeFrom, rangeTo);
        if (categoryId !== null) {
          query = query.eq("category_id", categoryId);
        }
        const { data, error, count } = await query;
        if (error) throw error;
        publicQuestions.value = data || [];
        totalQuestions.value = count ?? 0;
        if (page > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      } catch (err) {
        console.error("Error fetching public questions:", err);
        fetchErrorPublic.value = err.message || "فشل تحميل البيانات.";
        publicQuestions.value = [];
        totalQuestions.value = 0;
      } finally {
        isLoadingPublic.value = false;
      }
    }
    watch([currentPage, selectedCategory], ([newPage, newCategory], [oldPage, oldCategory]) => {
      if (newCategory !== oldCategory) {
        if (currentPage.value !== 1) {
          currentPage.value = 1;
        } else {
          fetchPublicData(1, newCategory);
        }
      } else {
        fetchPublicData(newPage, newCategory);
      }
    }, { immediate: true });
    useHead({
      title: "اسأل الشيخ - موقع الشيخ إبراهيم بشندي",
      meta: [
        { name: "description", content: "اطرح سؤالك مباشرة على الشيخ إبراهيم بشندي وتصفح الأسئلة المجابة في مختلف الفئات الشرعية مع إمكانية الفلترة والتصفح." }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8" }, _attrs))} data-v-274c751a><h1 class="text-3xl font-bold text-brown-dark dark:text-brown-dark mb-8 border-b-2 border-olive-green pb-2" data-v-274c751a> اسأل الشيخ </h1>`);
      if (unref(user)) {
        _push(`<section class="mb-10 p-6 bg-beige-light dark:bg-cream-gray rounded-lg shadow-md border border-cream-gray dark:border-gray-700" data-v-274c751a><h2 class="text-xl font-semibold text-brown-dark dark:text-brown-dark mb-4" data-v-274c751a> أرسل سؤالك للشيخ </h2><form data-v-274c751a><div data-v-274c751a><textarea rows="4" placeholder="اكتب سؤالك هنا..." required${ssrRenderAttr("aria-describedby", questionError.value ? "question-error-message" : "question-help-text")} class="${ssrRenderClass([{ "border-red-500 dark:border-red-600": questionError.value }, "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-70"])}"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-274c751a>${ssrInterpolate(questionText.value)}</textarea><p id="question-help-text" class="mt-1 text-xs text-gray-500 dark:text-gray-400" data-v-274c751a> يجب أن يكون السؤال ${ssrInterpolate(MIN_QUESTION_LENGTH)} حروف على الأقل. (الحالي: ${ssrInterpolate(questionText.value.trim().length)} حرف) </p>`);
        if (questionError.value) {
          _push(`<p id="question-error-message" class="mt-1 text-xs text-red-600 dark:text-red-400" data-v-274c751a>${ssrInterpolate(questionError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="mt-4 flex items-center justify-end gap-4 flex-wrap" data-v-274c751a>`);
        if (submitSuccess.value) {
          _push(`<p class="text-sm text-green-600 dark:text-green-400 order-1 sm:order-none" data-v-274c751a> تم إرسال سؤالك بنجاح! </p>`);
        } else {
          _push(`<!---->`);
        }
        if (submitError.value) {
          _push(`<p class="text-sm text-red-600 dark:text-red-400 order-1 sm:order-none" data-v-274c751a>${ssrInterpolate(submitError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button type="submit"${ssrIncludeBooleanAttr(isSubmitting.value || isQuestionInvalid.value) ? " disabled" : ""} class="inline-flex items-center justify-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 dark:focus:ring-offset-gray-900 order-2 sm:order-none" style="${ssrRenderStyle({ backgroundColor: "var(--color-olive-green)" })}" data-v-274c751a>`);
        if (isSubmitting.value) {
          _push(`<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" data-v-274c751a><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" data-v-274c751a></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" data-v-274c751a></path></svg>`);
        } else {
          _push(`<!---->`);
        }
        if (isSubmitting.value) {
          _push(`<span data-v-274c751a>جاري الإرسال...</span>`);
        } else {
          _push(`<span data-v-274c751a>إرسال السؤال</span>`);
        }
        _push(`</button></div></form></section>`);
      } else {
        _push(`<section class="mb-10 p-6 text-center bg-gray-100 dark:bg-gray-800 rounded-md" data-v-274c751a><p class="text-gray-700 dark:text-gray-300" data-v-274c751a>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "text-primary-600 hover:underline dark:text-primary-400 font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`سجّل الدخول`);
            } else {
              return [
                createTextVNode("سجّل الدخول")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` أو `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/signup",
          class: "text-primary-600 hover:underline dark:text-primary-400 font-medium"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`أنشئ حسابًا جديدًا`);
            } else {
              return [
                createTextVNode("أنشئ حسابًا جديدًا")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` لتتمكن من إرسال سؤالك. </p></section>`);
      }
      _push(`<section data-v-274c751a><h2 class="text-2xl font-semibold text-brown-dark dark:text-brown-dark mb-6 border-b border-cream-gray dark:border-gray-700 pb-2" data-v-274c751a> أسئلة شائعة ومجابة </h2>`);
      if (isLoadingPublic.value && publicQuestions.value.length === 0) {
        _push(`<div class="text-center py-10" data-v-274c751a>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-4 text-gray-600 dark:text-gray-400" data-v-274c751a>جارٍ تحميل الأسئلة...</p></div>`);
      } else if (fetchErrorPublic.value) {
        _push(`<div class="text-center py-10 text-red-600 dark:text-red-400" data-v-274c751a> حدث خطأ أثناء تحميل الأسئلة: ${ssrInterpolate(fetchErrorPublic.value)} <button class="mt-2 block mx-auto text-sm text-primary-600 hover:underline" data-v-274c751a>إعادة المحاولة</button></div>`);
      } else {
        _push(`<div data-v-274c751a><div class="flex flex-wrap gap-2 mb-8 items-center" data-v-274c751a><button${ssrIncludeBooleanAttr(isLoadingPublic.value) ? " disabled" : ""} class="${ssrRenderClass([
          "px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-150",
          selectedCategory.value === null ? "bg-olive-green text-white shadow" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
          isLoadingPublic.value ? "opacity-70 cursor-not-allowed" : ""
        ])}" data-v-274c751a> الكل </button><!--[-->`);
        ssrRenderList(categories.value, (category) => {
          _push(`<button${ssrIncludeBooleanAttr(isLoadingPublic.value) ? " disabled" : ""} class="${ssrRenderClass([
            "px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-150",
            selectedCategory.value === category.id ? "bg-olive-green text-white shadow" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
            isLoadingPublic.value ? "opacity-70 cursor-not-allowed" : ""
          ])}" data-v-274c751a>${ssrInterpolate(category.name)}</button>`);
        });
        _push(`<!--]-->`);
        if (isLoadingCategories.value && !categories.value.length) {
          _push(`<span class="text-sm text-gray-500 italic" data-v-274c751a>جارٍ تحميل التصنيفات...</span>`);
        } else {
          _push(`<!---->`);
        }
        if (isLoadingPublic.value) {
          _push(ssrRenderComponent(LoadingSpinner, { class: "w-4 h-4 text-gray-500 inline-block ms-2" }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (publicQuestions.value.length > 0) {
          _push(`<div class="space-y-6" data-v-274c751a><!--[-->`);
          ssrRenderList(publicQuestions.value, (qa) => {
            var _a;
            _push(`<div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow duration-200 hover:shadow-md" data-v-274c751a><div class="p-5" data-v-274c751a>`);
            if ((_a = qa.question_categories) == null ? void 0 : _a.name) {
              _push(`<span class="inline-block bg-blue-100 text-blue-800 text-xs font-medium mb-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300" data-v-274c751a>${ssrInterpolate(qa.question_categories.name)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<h3 class="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-2" data-v-274c751a><span class="text-gray-500 dark:text-gray-400" data-v-274c751a>س:</span> ${ssrInterpolate(qa.question_text)}</h3></div>`);
            if (qa.answer_text) {
              _push(`<div class="bg-gray-50 dark:bg-gray-700/50 p-5 border-t border-gray-200 dark:border-gray-600" data-v-274c751a><h4 class="font-semibold text-md text-olive-green dark:text-yellow-400 mb-2 flex items-center" data-v-274c751a><span class="bg-olive-green dark:bg-yellow-400 text-white dark:text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs me-2" data-v-274c751a>ج</span><span data-v-274c751a>جواب الشيخ:</span></h4><div class="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-200" data-v-274c751a><p class="whitespace-pre-wrap" data-v-274c751a>${ssrInterpolate(qa.answer_text)}</p></div></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else if (!isLoadingPublic.value && publicQuestions.value.length === 0) {
          _push(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-274c751a>`);
          if (selectedCategory.value === null) {
            _push(`<p data-v-274c751a>لا توجد أسئلة مجابة متاحة حاليًا.</p>`);
          } else {
            _push(`<p data-v-274c751a>لا توجد أسئلة مجابة تطابق هذا التصنيف حاليًا.</p>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (totalPages.value > 1) {
          _push(`<div class="mt-8 flex justify-center items-center space-x-2 rtl:space-x-reverse" data-v-274c751a><button${ssrIncludeBooleanAttr(currentPage.value === 1 || isLoadingPublic.value) ? " disabled" : ""} class="px-3 py-1 text-sm rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" data-v-274c751a> السابق </button><span class="text-sm text-gray-700 dark:text-gray-300" data-v-274c751a> صفحة ${ssrInterpolate(currentPage.value)} من ${ssrInterpolate(totalPages.value)}</span><button${ssrIncludeBooleanAttr(currentPage.value === totalPages.value || isLoadingPublic.value) ? " disabled" : ""} class="px-3 py-1 text-sm rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" data-v-274c751a> التالي </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</section></div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=index.vue2.mjs.map
