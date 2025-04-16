import __nuxt_component_0 from "../../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { defineComponent, ref, watch, mergeProps, withCtx, createVNode, createBlock, openBlock } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderClass, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import LoadingSpinner from "../../../components/LoadingSpinner.vue.mjs";
import "../../../components/UserAvatar.vue.mjs";
import { useIntersectionObserver } from "@vueuse/core";
import { useSupabaseClient } from "../../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useNuxtApp } from "../../../node_modules/nuxt/dist/app/nuxt.mjs";
import _sfc_main$1 from "../../../components/UserAvatar.vue2.mjs";
const ADMIN_PAGE_SIZE = 30;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const { $toast } = useNuxtApp();
    const pending = ref(true);
    const pendingMore = ref(false);
    const fetchError = ref(null);
    const users = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(ADMIN_PAGE_SIZE);
    const hasMore = ref(true);
    const searchTerm = ref("");
    const filterRole = ref("all");
    const filterStatus = ref("all");
    const loadMoreTrigger = ref(null);
    const fetchUsers = async (page = 1, appending = false) => {
      if (appending) {
        pendingMore.value = true;
      } else {
        pending.value = true;
        users.value = [];
        currentPage.value = 1;
        hasMore.value = true;
      }
      fetchError.value = null;
      const rangeFrom = (page - 1) * pageSize.value;
      const rangeTo = rangeFrom + pageSize.value - 1;
      try {
        let baseQuery = supabase.from("profiles").select(`*`).order("created_at", { ascending: false });
        if (filterRole.value !== "all") {
          baseQuery = baseQuery.eq("role", filterRole.value);
        }
        const trimmedSearch = searchTerm.value.trim();
        if (trimmedSearch) {
          baseQuery = baseQuery.ilike("full_name", `%${trimmedSearch}%`);
        }
        if (filterStatus.value !== "all") {
          if (filterStatus.value === "banned") {
            baseQuery = baseQuery.eq("is_banned", true);
          } else if (filterStatus.value === "suspended") {
            baseQuery = baseQuery.gt("comment_suspended_until", (/* @__PURE__ */ new Date()).toISOString());
          } else if (filterStatus.value === "active") {
            baseQuery = baseQuery.eq("is_banned", false).or(`comment_suspended_until.is.null,comment_suspended_until.lte.${(/* @__PURE__ */ new Date()).toISOString()}`);
          }
        }
        const { data: profilesData, error: profilesError } = await baseQuery.range(rangeFrom, rangeTo);
        if (profilesError) throw profilesError;
        const userIds = (profilesData == null ? void 0 : profilesData.map((p) => p.id)) ?? [];
        let authUsersMap = /* @__PURE__ */ new Map();
        if (userIds.length > 0) {
          try {
            const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1e3 });
            if (authError) throw authError;
            if (authData == null ? void 0 : authData.users) {
              const relevantUsers = authData.users.filter((u) => userIds.includes(u.id));
              relevantUsers.forEach((u) => authUsersMap.set(u.id, { email: u.email }));
            }
          } catch (authErr) {
            console.warn("Could not fetch auth user emails:", authErr.message);
          }
        }
        const fetchedUsers = (profilesData == null ? void 0 : profilesData.map((profile) => {
          var _a;
          return {
            ...profile,
            auth_email: ((_a = authUsersMap.get(profile.id)) == null ? void 0 : _a.email) ?? null
          };
        })) ?? [];
        if (appending) {
          users.value.push(...fetchedUsers);
        } else {
          users.value = fetchedUsers;
        }
        hasMore.value = fetchedUsers.length === pageSize.value;
        if (hasMore.value) {
          currentPage.value = page + 1;
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        fetchError.value = err;
        if (!appending) {
          users.value = [];
        }
        hasMore.value = false;
      } finally {
        pending.value = false;
        pendingMore.value = false;
      }
    };
    const refreshUsers = () => {
      fetchUsers(1, false);
    };
    const loadMore = () => {
      if (!pending.value && !pendingMore.value && hasMore.value) {
        fetchUsers(currentPage.value, true);
      }
    };
    useIntersectionObserver(
      loadMoreTrigger,
      ([{ isIntersecting }]) => {
        if (isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
      // Trigger when 10% of the element is visible
    );
    const formatDate = (dateString) => {
      if (!dateString) return "غير محدد";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "تاريخ غير صالح";
        return date.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" });
      } catch (e) {
        return "خطأ تنسيق";
      }
    };
    const isCommentSuspended = (suspendedUntil) => {
      if (!suspendedUntil) return false;
      try {
        return new Date(suspendedUntil) > /* @__PURE__ */ new Date();
      } catch {
        return false;
      }
    };
    watch([filterRole, filterStatus, searchTerm], () => {
      refreshUsers();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-6" }, _attrs))} data-v-df848447><h1 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6" data-v-df848447>إدارة المستخدمين</h1><div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700 flex flex-wrap items-center gap-4 sticky top-0 z-10" data-v-df848447><div class="flex-grow min-w-[250px] relative" data-v-df848447><label for="user-search" class="sr-only" data-v-df848447>بحث</label><input id="user-search" type="text"${ssrRenderAttr("value", searchTerm.value)} placeholder="ابحث بالاسم أو البريد الإلكتروني..." class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 pl-8" data-v-df848447><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" data-v-df848447><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 text-gray-400" data-v-df848447><path fill-rule="evenodd" d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" clip-rule="evenodd" data-v-df848447></path></svg></div>`);
      if (searchTerm.value) {
        _push(`<button${ssrIncludeBooleanAttr(pending.value) ? " disabled" : ""} class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 z-10" data-v-df848447><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-df848447><path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm2.78-4.22a.75.75 0 0 1-1.06 1.06L8 9.06l-1.72 1.72a.75.75 0 1 1-1.06-1.06L6.94 8 5.22 6.28a.75.75 0 0 1 1.06-1.06L8 6.94l1.72-1.72a.75.75 0 1 1 1.06 1.06L9.06 8l1.72 1.78Z" clip-rule="evenodd" data-v-df848447></path></svg></button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div data-v-df848447><select id="role-filter"${ssrIncludeBooleanAttr(pending.value) ? " disabled" : ""} class="rounded-md ..." data-v-df848447><option value="all" data-v-df848447${ssrIncludeBooleanAttr(Array.isArray(filterRole.value) ? ssrLooseContain(filterRole.value, "all") : ssrLooseEqual(filterRole.value, "all")) ? " selected" : ""}>كل الأدوار</option><option value="user" data-v-df848447${ssrIncludeBooleanAttr(Array.isArray(filterRole.value) ? ssrLooseContain(filterRole.value, "user") : ssrLooseEqual(filterRole.value, "user")) ? " selected" : ""}>مستخدم</option><option value="admin" data-v-df848447${ssrIncludeBooleanAttr(Array.isArray(filterRole.value) ? ssrLooseContain(filterRole.value, "admin") : ssrLooseEqual(filterRole.value, "admin")) ? " selected" : ""}>مشرف</option></select></div><div data-v-df848447><select id="status-filter"${ssrIncludeBooleanAttr(pending.value) ? " disabled" : ""} class="rounded-md ..." data-v-df848447><option value="all" data-v-df848447${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "all") : ssrLooseEqual(filterStatus.value, "all")) ? " selected" : ""}>كل الحالات</option><option value="active" data-v-df848447${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "active") : ssrLooseEqual(filterStatus.value, "active")) ? " selected" : ""}>نشط</option><option value="banned" data-v-df848447${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "banned") : ssrLooseEqual(filterStatus.value, "banned")) ? " selected" : ""}>محظور</option><option value="suspended" data-v-df848447${ssrIncludeBooleanAttr(Array.isArray(filterStatus.value) ? ssrLooseContain(filterStatus.value, "suspended") : ssrLooseEqual(filterStatus.value, "suspended")) ? " selected" : ""}>تعليق موقوف</option></select></div><button${ssrIncludeBooleanAttr(pending.value) ? " disabled" : ""} title="تحديث القائمة" class="p-2 ..." data-v-df848447><svg class="${ssrRenderClass(["w-4 h-4", pending.value ? "animate-spin" : ""])}" data-v-df848447>...</svg></button></div>`);
      if (fetchError.value) {
        _push(`<div class="my-4 p-3 bg-red-100 ..." data-v-df848447> خطأ! ${ssrInterpolate(fetchError.value.message)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg" data-v-df848447><table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700" data-v-df848447><thead class="bg-gray-50 dark:bg-gray-700" data-v-df848447><tr data-v-df848447><th scope="col" class="px-6 py-3 text-right ..." data-v-df848447>المستخدم</th><th scope="col" class="px-6 py-3 text-right ... hidden sm:table-cell" data-v-df848447>الدور</th><th scope="col" class="px-6 py-3 text-right ... hidden md:table-cell" data-v-df848447>الحالة</th><th scope="col" class="px-6 py-3 text-right ... hidden lg:table-cell" data-v-df848447>تاريخ الانضمام</th><th scope="col" class="relative px-6 py-3" data-v-df848447><span class="sr-only" data-v-df848447>عرض التفاصيل</span></th></tr></thead><tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" data-v-df848447>`);
      if (pending.value && users.value.length === 0) {
        _push(`<tr data-v-df848447><td colspan="5" class="text-center py-10" data-v-df848447>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`</td></tr>`);
      } else if (!pending.value && users.value.length === 0) {
        _push(`<tr data-v-df848447><td colspan="5" class="text-center py-10 text-gray-500" data-v-df848447>لا يوجد مستخدمون يطابقون بحثك أو الفلاتر.</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(users.value, (user) => {
        _push(`<tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50" data-v-df848447><td class="px-6 py-4 whitespace-nowrap" data-v-df848447><div class="flex items-center" data-v-df848447><div class="flex-shrink-0 h-10 w-10" data-v-df848447>`);
        _push(ssrRenderComponent(_sfc_main$1, {
          src: user.avatar_url || void 0,
          alt: user.full_name || "مستخدم",
          size: "md"
        }, null, _parent));
        _push(`</div><div class="mr-4" data-v-df848447><div class="text-sm font-medium text-gray-900 dark:text-gray-100" data-v-df848447>${ssrInterpolate(user.full_name || "لم يحدد اسم")}</div><div class="text-sm text-gray-500 dark:text-gray-400" data-v-df848447>${ssrInterpolate(user.auth_email || "لا يوجد بريد")}</div><div class="sm:hidden mt-1 flex items-center gap-2 text-xs" data-v-df848447><span class="${ssrRenderClass(["px-1.5 py-0.5 rounded-full", user.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"])}" data-v-df848447>${ssrInterpolate(user.role)}</span>`);
        if (user.is_banned) {
          _push(`<span class="px-1.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" data-v-df848447>محظور</span>`);
        } else if (isCommentSuspended(user.comment_suspended_until)) {
          _push(`<span class="px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" data-v-df848447>موقوف</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></td><td class="px-6 py-4 whitespace-nowrap hidden sm:table-cell" data-v-df848447><span class="${ssrRenderClass(["px-2 inline-flex text-xs leading-5 font-semibold rounded-full", user.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"])}" data-v-df848447>${ssrInterpolate(user.role === "admin" ? "مشرف" : "مستخدم")}</span></td><td class="px-6 py-4 whitespace-nowrap hidden md:table-cell" data-v-df848447>`);
        if (user.is_banned) {
          _push(`<span class="px-2 ... bg-red-100 ..." data-v-df848447>محظور</span>`);
        } else if (isCommentSuspended(user.comment_suspended_until)) {
          _push(`<span class="px-2 ... bg-yellow-100 ..." data-v-df848447>تعليق موقوف</span>`);
        } else {
          _push(`<span class="px-2 ... bg-green-100 ..." data-v-df848447>نشط</span>`);
        }
        _push(`</td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell" data-v-df848447>${ssrInterpolate(formatDate(user.created_at))}</td><td class="px-6 py-4 whitespace-nowrap text-left text-sm font-medium rtl:text-right" data-v-df848447>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/admin/users/${user.id}`,
          class: "text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 group flex items-center gap-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span data-v-df848447${_scopeId}>التفاصيل</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px]" data-v-df848447${_scopeId}><path fill-rule="evenodd" d="M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" data-v-df848447${_scopeId}></path></svg>`);
            } else {
              return [
                createVNode("span", null, "التفاصيل"),
                (openBlock(), createBlock("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 16 16",
                  fill: "currentColor",
                  class: "w-4 h-4 transition-transform group-hover:translate-x-[-2px] rtl:group-hover:translate-x-[2px]"
                }, [
                  createVNode("path", {
                    "fill-rule": "evenodd",
                    d: "M9.78 4.22a.75.75 0 0 1 0 1.06L7.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L5.47 8.53a.75.75 0 0 1 0-1.06l3.25-3.25a.75.75 0 0 1 1.06 0Z",
                    "clip-rule": "evenodd"
                  })
                ]))
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</td></tr>`);
      });
      _push(`<!--]--></tbody></table></div><div class="h-20 flex items-center justify-center" data-v-df848447>`);
      if (pendingMore.value) {
        _push(`<div class="text-center" data-v-df848447>`);
        _push(ssrRenderComponent(LoadingSpinner, null, null, _parent));
        _push(`<p class="text-sm text-gray-500 mt-1" data-v-df848447>تحميل المزيد...</p></div>`);
      } else if (!pending.value && users.value.length > 0 && !hasMore.value) {
        _push(`<div class="text-sm text-gray-500" data-v-df848447> لا يوجد المزيد من المستخدمين. </div>`);
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
//# sourceMappingURL=index.vue3.mjs.map
