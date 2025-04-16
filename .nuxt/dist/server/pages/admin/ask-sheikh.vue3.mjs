import { defineComponent, ref, reactive, computed, watch, nextTick } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrInterpolate, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import LoadingSpinner from "../../components/LoadingSpinner.vue.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import "D:/programing/ibrahim-bashandy/node_modules/hookable/dist/index.mjs";
const ADMIN_PAGE_SIZE = 15;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ask-sheikh",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const pending = ref(true);
    const fetchError = ref(null);
    const questions = ref(null);
    const totalQuestions = ref(0);
    const filterStatus = ref("pending");
    const sortOrder = ref("asc");
    const searchTerm = ref("");
    const categories = ref([]);
    const isLoadingCategories = ref(true);
    const currentPage = ref(1);
    const pageSize = ref(ADMIN_PAGE_SIZE);
    const selectedQuestion = ref(null);
    const isSubmitting = ref(false);
    const replyError = ref(null);
    const successMessage = ref(null);
    const actionError = ref(null);
    const questionListContainer = ref(null);
    const replyForm = reactive({
      answer_text: "",
      is_public: false,
      send_private: true,
      // Default to sending private message
      category_id: null
      // For selected category ID
    });
    const totalPages = computed(() => {
      if (totalQuestions.value === 0) return 1;
      return Math.ceil(totalQuestions.value / pageSize.value);
    });
    const fetchQuestions = async (page = currentPage.value) => {
      var _a;
      pending.value = true;
      fetchError.value = null;
      clearMessages(false);
      const rangeFrom = (page - 1) * pageSize.value;
      const rangeTo = rangeFrom + pageSize.value - 1;
      try {
        if (categories.value.length === 0 && isLoadingCategories.value) {
          const { data: catData, error: catError } = await supabase.from("question_categories").select("id, name").order("name");
          if (catError) {
            console.error("Error fetching categories:", catError);
            setActionError("فشل تحميل تصنيفات الأسئلة.");
          } else {
            categories.value = catData || [];
          }
          isLoadingCategories.value = false;
        }
        let query = supabase.from("questions_to_sheikh").select(`
        id, user_id, question_text, submitted_at, is_answered, is_public,
        answer_text, category_id, answered_at,
        profiles ( full_name )
      `, { count: "exact" }).order("submitted_at", { ascending: sortOrder.value === "asc" }).range(rangeFrom, rangeTo);
        if (filterStatus.value !== "all") {
          const isAnsweredFilter = filterStatus.value === "answered";
          query = query.eq("is_answered", isAnsweredFilter);
        }
        const trimmedSearch = searchTerm.value.trim();
        if (trimmedSearch) {
          query = query.ilike("question_text", `%${trimmedSearch}%`);
        }
        const { data, error, count } = await query;
        if (error) throw error;
        questions.value = data || [];
        totalQuestions.value = count ?? 0;
        currentPage.value = page;
        await nextTick();
        (_a = questionListContainer.value) == null ? void 0 : _a.scrollTo({ top: 0, behavior: "smooth" });
        if (page > totalPages.value && totalPages.value > 0) {
          changePage(totalPages.value);
        }
      } catch (err) {
        console.error("Error fetching questions:", err);
        fetchError.value = err;
        questions.value = null;
        totalQuestions.value = 0;
      } finally {
        pending.value = false;
      }
    };
    const changePage = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages.value && newPage !== currentPage.value && !pending.value) {
        currentPage.value = newPage;
      }
    };
    const formatDate = (dateString) => {
      if (!dateString) return "غير محدد";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "تاريخ غير صالح";
        return date.toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short", hour12: true });
      } catch (e) {
        return "خطأ تنسيق";
      }
    };
    const setActionError = (msg) => {
      actionError.value = msg;
      successMessage.value = null;
      setTimeout(() => {
        actionError.value = null;
      }, 7e3);
    };
    const clearMessages = (clearReplyErr = true) => {
      successMessage.value = null;
      actionError.value = null;
      if (clearReplyErr) {
        replyError.value = null;
      }
    };
    watch([filterStatus, sortOrder, searchTerm], () => {
      selectedQuestion.value = null;
      if (currentPage.value !== 1) {
        currentPage.value = 1;
      } else {
        fetchQuestions(1);
      }
    });
    watch(currentPage, (newPage) => {
      fetchQuestions(newPage);
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-e7d7b24d><h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6" data-v-e7d7b24d>إدارة أسئلة المستخدمين (اسأل الشيخ)</h1><div class="mb-6 flex flex-wrap gap-4 items-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border dark:border-gray-700" data-v-e7d7b24d><div class="flex items-center gap-2" data-v-e7d7b24d><label for="filter-status" class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0" data-v-e7d7b24d>الحالة:</label><select id="filter-status"${ssrIncludeBooleanAttr(pending.value) ? " disabled" : ""} class="block w-full sm:w-36 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70" data-v-e7d7b24d><option value="pending" data-v-e7d7b24d${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "pending") : ssrLooseEqual(filterStatus.value, "pending")) ? " selected" : ""}>المعلقة</option><option value="answered" data-v-e7d7b24d${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "answered") : ssrLooseEqual(filterStatus.value, "answered")) ? " selected" : ""}>المجابة</option><option value="all" data-v-e7d7b24d${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "all") : ssrLooseEqual(filterStatus.value, "all")) ? " selected" : ""}>الكل</option></select></div><div class="flex items-center gap-2 flex-grow min-w-[200px]" data-v-e7d7b24d><label for="search-term" class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0" data-v-e7d7b24d>بحث:</label><input id="search-term" type="text"${ssrRenderAttr("value", searchTerm.value)}${ssrIncludeBooleanAttr(pending.value) ? " disabled" : ""} placeholder="ابحث في نص السؤال..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-70" data-v-e7d7b24d>`);
      if (searchTerm.value) {
        _push(`<button${ssrIncludeBooleanAttr(pending.value) ? " disabled" : ""} class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50" data-v-e7d7b24d><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-e7d7b24d><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 1.06L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.78Z" clip-rule="evenodd" data-v-e7d7b24d></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-center gap-2" data-v-e7d7b24d><label for="sort-order" class="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0" data-v-e7d7b24d>ترتيب:</label><select id="sort-order"${ssrIncludeBooleanAttr(pending.value) ? " disabled" : ""} class="block w-full sm:w-36 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70" data-v-e7d7b24d><option value="asc" data-v-e7d7b24d${ssrIncludeBooleanAttr(Array.isArray(sortOrder.value) ? ssrLooseContain(sortOrder.value, "asc") : ssrLooseEqual(sortOrder.value, "asc")) ? " selected" : ""}>الأقدم أولاً</option><option value="desc" data-v-e7d7b24d${ssrIncludeBooleanAttr(Array.isArray(sortOrder.value) ? ssrLooseContain(sortOrder.value, "desc") : ssrLooseEqual(sortOrder.value, "desc")) ? " selected" : ""}>الأحدث أولاً</option></select></div><button${ssrIncludeBooleanAttr(pending.value) ? " disabled" : ""} title="تحديث القائمة" class="px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 flex items-center gap-1" data-v-e7d7b24d><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="${ssrRenderClass(["w-4 h-4", pending.value ? "animate-spin" : ""])}" data-v-e7d7b24d><path fill-rule="evenodd" d="M13.836 2.477a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0V5.562l-2.504 2.503a.75.75 0 0 1-1.06 0l-.47-.47a.75.75 0 0 1 0-1.061l2.503-2.503h-.938a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 .75.75Zm-2.161 7.899L9.172 7.872a.75.75 0 0 0-1.06 0l-.47.47a.75.75 0 0 0 0 1.061l2.504 2.503v.938a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75ZM2.75 4.25a.75.75 0 0 0 0 1.5h.938l2.503 2.504a.75.75 0 0 0 0 1.06l.47.471a.75.75 0 0 0 1.06 0l2.504-2.504v.938a.75.75 0 0 0 1.5 0v-1.5a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0 0 1.5h.938l-2.503 2.504a.75.75 0 0 1-1.06 0l-.47-.471a.75.75 0 0 1 0-1.06L6.188 5.75h.938a.75.75 0 0 0 0-1.5H2.75Z" clip-rule="evenodd" data-v-e7d7b24d></path></svg><span class="hidden sm:inline" data-v-e7d7b24d>تحديث</span></button></div>`);
      if (successMessage.value) {
        _push(`<div class="my-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded text-sm transition-opacity duration-300 ease-out" data-v-e7d7b24d>${ssrInterpolate(successMessage.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (actionError.value || replyError.value) {
        _push(`<div class="my-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm transition-opacity duration-300 ease-out" data-v-e7d7b24d>${ssrInterpolate(actionError.value || replyError.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (fetchError.value) {
        _push(`<div class="my-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert" data-v-e7d7b24d><strong class="font-bold" data-v-e7d7b24d>خطأ!</strong><span class="block sm:inline" data-v-e7d7b24d> حدث خطأ أثناء جلب الأسئلة. الرجاء المحاولة مرة أخرى. (${ssrInterpolate(fetchError.value.message)})</span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (pending.value && !questions.value) {
        _push(`<div class="text-center py-10" data-v-e7d7b24d>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="mt-2 text-gray-500 dark:text-gray-400" data-v-e7d7b24d>جارٍ تحميل الأسئلة...</p></div>`);
      } else {
        _push(`<div class="flex flex-col md:flex-row gap-6" data-v-e7d7b24d><div class="w-full md:w-2/5 lg:w-1/3 flex-shrink-0 flex flex-col" data-v-e7d7b24d><div class="flex justify-between items-center mb-3" data-v-e7d7b24d><h2 class="text-lg font-semibold text-gray-600 dark:text-gray-300" data-v-e7d7b24d> قائمة الأسئلة (${ssrInterpolate(totalQuestions.value)}) </h2>`);
        if (pending.value) {
          _push(ssrRenderComponent(LoadingSpinner, { class: "w-4 h-4 text-indigo-500" }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex-grow space-y-1 overflow-y-auto border dark:border-gray-700 rounded-md p-1 bg-white dark:bg-gray-800 shadow-sm min-h-[300px] max-h-[70vh]" data-v-e7d7b24d>`);
        if (questions.value && questions.value.length > 0) {
          _push(`<!--[-->`);
          ssrRenderList(questions.value, (q) => {
            var _a2, _b2;
            _push(`<button class="${ssrRenderClass([[
              ((_a2 = selectedQuestion.value) == null ? void 0 : _a2.id) === q.id ? "bg-indigo-100 dark:bg-indigo-900/50 ring-1 ring-indigo-500 shadow-inner" : "hover:bg-gray-100 dark:hover:bg-gray-700",
              q.is_answered ? "opacity-80" : "opacity-100"
              // Slightly dim answered questions
            ], "block w-full text-right p-3 rounded-md transition-all duration-150 text-sm border-b border-gray-100 dark:border-gray-700/50 last:border-b-0"])}" data-v-e7d7b24d><p class="${ssrRenderClass([{ "!font-semibold": !q.is_answered }, "font-medium text-gray-800 dark:text-gray-100 truncate"])}" data-v-e7d7b24d>${ssrInterpolate(((_b2 = q.profiles) == null ? void 0 : _b2.full_name) || `مستخدم غير مسجل`)}</p><p class="text-gray-600 dark:text-gray-400 truncate text-xs mt-1" data-v-e7d7b24d>${ssrInterpolate(q.question_text)}</p><div class="flex justify-between items-center mt-1.5 text-xs text-gray-400 dark:text-gray-500" data-v-e7d7b24d><span data-v-e7d7b24d>${ssrInterpolate(formatDate(q.submitted_at))}</span>`);
            if (q.is_answered) {
              _push(`<span class="px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 rounded-full text-xs font-medium" data-v-e7d7b24d>مجاب</span>`);
            } else {
              _push(`<span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-full text-xs font-medium" data-v-e7d7b24d>معلق</span>`);
            }
            _push(`</div></button>`);
          });
          _push(`<!--]-->`);
        } else if (!pending.value) {
          _push(`<p class="text-sm text-center text-gray-500 dark:text-gray-400 mt-8 px-4 italic" data-v-e7d7b24d>${ssrInterpolate(searchTerm.value ? "لا توجد أسئلة تطابق بحثك." : "لا توجد أسئلة تطابق الفلتر الحالي.")}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (pending.value && !((_a = questions.value) == null ? void 0 : _a.length)) {
          _push(`<div class="space-y-2 p-2" data-v-e7d7b24d><!--[-->`);
          ssrRenderList(5, (i) => {
            _push(`<div class="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-md" data-v-e7d7b24d></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (totalPages.value > 1) {
          _push(`<div class="mt-4 flex justify-center items-center space-x-2 rtl:space-x-reverse border-t dark:border-gray-700 pt-3" data-v-e7d7b24d><button${ssrIncludeBooleanAttr(currentPage.value === 1 || pending.value) ? " disabled" : ""} class="px-3 py-1 text-sm rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" data-v-e7d7b24d> السابق </button><span class="text-sm text-gray-700 dark:text-gray-300" data-v-e7d7b24d> صفحة ${ssrInterpolate(currentPage.value)} من ${ssrInterpolate(totalPages.value)}</span><button${ssrIncludeBooleanAttr(currentPage.value === totalPages.value || pending.value) ? " disabled" : ""} class="px-3 py-1 text-sm rounded border bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" data-v-e7d7b24d> التالي </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow relative" data-v-e7d7b24d>`);
        if (isSubmitting.value) {
          _push(`<div class="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10 rounded-lg" data-v-e7d7b24d>`);
          _push(ssrRenderComponent(LoadingSpinner, { class: "w-8 h-8 text-indigo-600" }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (selectedQuestion.value) {
          _push(`<div data-v-e7d7b24d><h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3" data-v-e7d7b24d>تفاصيل السؤال والرد</h2><div class="mb-6 space-y-3 text-sm" data-v-e7d7b24d><p data-v-e7d7b24d><strong class="font-medium text-gray-700 dark:text-gray-300" data-v-e7d7b24d>السائل:</strong> ${ssrInterpolate(((_b = selectedQuestion.value.profiles) == null ? void 0 : _b.full_name) || "غير معروف")}</p><p data-v-e7d7b24d><strong class="font-medium text-gray-700 dark:text-gray-300" data-v-e7d7b24d>تاريخ الإرسال:</strong> ${ssrInterpolate(formatDate(selectedQuestion.value.submitted_at))}</p><div class="mt-3" data-v-e7d7b24d><p class="font-medium text-gray-700 dark:text-gray-300 mb-1" data-v-e7d7b24d>نص السؤال:</p><p class="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 p-3 rounded border dark:border-gray-600 whitespace-pre-wrap max-h-60 overflow-y-auto" data-v-e7d7b24d>${ssrInterpolate(selectedQuestion.value.question_text)}</p></div></div><form data-v-e7d7b24d><div class="mb-4" data-v-e7d7b24d><label for="answer_text" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" data-v-e7d7b24d>نص الإجابة *</label><textarea id="answer_text" rows="8" required placeholder="اكتب ردك هنا..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-e7d7b24d>${ssrInterpolate(replyForm.answer_text)}</textarea>`);
          if (replyError.value) {
            _push(`<p class="mt-1 text-xs text-red-600 dark:text-red-400" data-v-e7d7b24d>${ssrInterpolate(replyError.value)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="mb-4" data-v-e7d7b24d><label for="reply-category" class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-e7d7b24d>تصنيف السؤال (اختياري)</label>`);
          if (isLoadingCategories.value) {
            _push(`<div class="mt-1 text-sm text-gray-500" data-v-e7d7b24d>جار تحميل التصنيفات...</div>`);
          } else {
            _push(`<select id="reply-category" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-70"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-e7d7b24d><option${ssrRenderAttr("value", null)} data-v-e7d7b24d${ssrIncludeBooleanAttr(Array.isArray(replyForm.category_id) ? ssrLooseContain(replyForm.category_id, null) : ssrLooseEqual(replyForm.category_id, null)) ? " selected" : ""}>-- بدون تصنيف --</option>`);
            if (categories.value && categories.value.length > 0) {
              _push(`<!--[-->`);
              ssrRenderList(categories.value, (cat) => {
                _push(`<option${ssrRenderAttr("value", cat.id)} data-v-e7d7b24d${ssrIncludeBooleanAttr(Array.isArray(replyForm.category_id) ? ssrLooseContain(replyForm.category_id, cat.id) : ssrLooseEqual(replyForm.category_id, cat.id)) ? " selected" : ""}>${ssrInterpolate(cat.name)}</option>`);
              });
              _push(`<!--]-->`);
            } else {
              _push(`<option disabled data-v-e7d7b24d${ssrIncludeBooleanAttr(Array.isArray(replyForm.category_id) ? ssrLooseContain(replyForm.category_id, null) : ssrLooseEqual(replyForm.category_id, null)) ? " selected" : ""}>-- لا توجد تصنيفات متاحة --</option>`);
            }
            _push(`</select>`);
          }
          _push(`</div><div class="mb-6 space-y-2" data-v-e7d7b24d><label class="block text-sm font-medium text-gray-700 dark:text-gray-300" data-v-e7d7b24d>خيارات النشر:</label><div class="flex flex-col sm:flex-row items-start sm:items-center gap-x-6 gap-y-2" data-v-e7d7b24d><div class="flex items-center" data-v-e7d7b24d><input id="is_public" type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(replyForm.is_public) ? ssrLooseContain(replyForm.is_public, null) : replyForm.is_public) ? " checked" : ""} class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-e7d7b24d><label for="is_public" class="ms-2 block text-sm text-gray-900 dark:text-gray-300" data-v-e7d7b24d>نشر الإجابة للعامة</label></div><div class="flex items-center" data-v-e7d7b24d><input id="send_private" type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(replyForm.send_private) ? ssrLooseContain(replyForm.send_private, null) : replyForm.send_private) ? " checked" : ""} class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-e7d7b24d><label for="send_private" class="ms-2 block text-sm text-gray-900 dark:text-gray-300" data-v-e7d7b24d>إرسال رد خاص للسائل</label></div></div>`);
          if (!replyForm.is_public && !replyForm.send_private) {
            _push(`<p class="mt-2 text-xs text-yellow-600 dark:text-yellow-400" data-v-e7d7b24d>تنبيه: يجب اختيار خيار واحد على الأقل (نشر عام أو إرسال خاص).</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex justify-end border-t dark:border-gray-700 pt-4" data-v-e7d7b24d><button type="submit"${ssrIncludeBooleanAttr(isSubmitting.value || !replyForm.is_public && !replyForm.send_private || !replyForm.answer_text.trim()) ? " disabled" : ""} class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed" data-v-e7d7b24d>`);
          if (isSubmitting.value) {
            _push(ssrRenderComponent(LoadingSpinner, { class: "w-5 h-5 text-white -ms-1 me-2" }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`<span data-v-e7d7b24d>${ssrInterpolate(isSubmitting.value ? "جاري الإرسال..." : "إرسال الرد")}</span></button></div></form></div>`);
        } else {
          _push(`<div class="text-center py-16 text-gray-500 dark:text-gray-400" data-v-e7d7b24d><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 mx-auto mb-4 text-gray-400" data-v-e7d7b24d><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" data-v-e7d7b24d></path></svg><p data-v-e7d7b24d>الرجاء اختيار سؤال من القائمة لعرض تفاصيله والرد عليه.</p>`);
          if (!pending.value && questions.value && questions.value.length === 0) {
            _push(`<p class="mt-2 text-sm" data-v-e7d7b24d>(لا توجد أسئلة لعرضها بناءً على الفلاتر الحالية)</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=ask-sheikh.vue3.mjs.map
