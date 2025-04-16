import { defineComponent, computed, ref, watch, mergeProps, withCtx, createTextVNode, createBlock, openBlock, createVNode, createCommentVNode, toDisplayString, Fragment, renderList, defineAsyncComponent } from "vue";
import __nuxt_component_0 from "../../../node_modules/nuxt/dist/app/components/nuxt-link.mjs";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from "vue/server-renderer";
import LoadingSpinner from "../../../components/LoadingSpinner.vue.mjs";
import "../../../components/UserAvatar.vue.mjs";
import BaseCard from "../../../components/BaseCard.vue.mjs";
import AdminUserActions from "../../../components/admin/AdminUserActions.vue.mjs";
import { useSupabaseClient } from "../../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
import { useNuxtApp } from "../../../node_modules/nuxt/dist/app/nuxt.mjs";
import { useRoute } from "../../../node_modules/nuxt/dist/app/composables/router.mjs";
import _sfc_main$1 from "../../../components/UserAvatar.vue2.mjs";
const __nuxt_component_0_lazy = defineAsyncComponent(() => import("../../../components/admin/SendMessageModal.vue.mjs").then((c) => c.default || c));
const __nuxt_component_1_lazy = defineAsyncComponent(() => import("../../../components/admin/SuspendCommentModal.vue.mjs").then((c) => c.default || c));
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const supabase = useSupabaseClient();
    const { $toast } = useNuxtApp();
    const route = useRoute();
    const userId = computed(() => route.params.id);
    const pending = ref(true);
    const fetchError = ref(null);
    const userData = ref(null);
    const userMessages = ref([]);
    const isLoadingMessages = ref(false);
    const userEnrolledCourses = ref([]);
    const isLoadingCourses = ref(false);
    const isLoadingAction = ref(false);
    const showSendMessageModal = ref(false);
    const showSuspendModal = ref(false);
    const modalUser = computed(() => {
      var _a;
      return ((_a = userData.value) == null ? void 0 : _a.profile) ?? null;
    });
    const fetchData = async () => {
      pending.value = true;
      fetchError.value = null;
      userData.value = null;
      userMessages.value = [];
      userEnrolledCourses.value = [];
      isLoadingMessages.value = true;
      isLoadingCourses.value = true;
      if (!userId.value) {
        fetchError.value = { message: "معرف المستخدم غير موجود." };
        pending.value = false;
        return;
      }
      try {
        const profilePromise = supabase.from("profiles").select("*").eq("id", userId.value).single();
        const authPromise = supabase.auth.admin.getUserById(userId.value);
        const messagesPromise = supabase.from("user_private_messages").select("*").eq("user_id", userId.value).order("created_at", { ascending: false });
        const coursesPromise = supabase.from("course_enrollments").select(`course_id, enrolled_at, study_courses (title)`).eq("user_id", userId.value).order("enrolled_at", { ascending: false });
        const [profileResult, authResult, messagesResult, coursesResult] = await Promise.allSettled([
          profilePromise,
          authPromise,
          messagesPromise,
          coursesPromise
        ]);
        if (profileResult.status === "rejected" || !profileResult.value.data) throw profileResult.status === "rejected" ? profileResult.reason : new Error("لم يتم العثور على ملف المستخدم.");
        const profileData = profileResult.value.data;
        let authData;
        if (authResult.status === "fulfilled" && authResult.value.data.user) {
          const fetchedAuthUser = authResult.value.data.user;
          authData = { id: fetchedAuthUser.id, email: fetchedAuthUser.email ?? "غير متوفر", created_at: fetchedAuthUser.created_at, last_sign_in_at: fetchedAuthUser.last_sign_in_at };
        } else {
          console.warn("فشل جلب بيانات المصادقة:", authResult.status === "rejected" ? authResult.reason : "لا يوجد بيانات");
          authData = { id: profileData.id, email: "غير متاح (خطأ تحميل)", created_at: void 0, last_sign_in_at: void 0 };
        }
        userData.value = { profile: profileData, auth: authData };
        if (messagesResult.status === "fulfilled") userMessages.value = messagesResult.value.data ?? [];
        else console.error("Error fetching messages:", messagesResult.reason);
        isLoadingMessages.value = false;
        if (coursesResult.status === "fulfilled") userEnrolledCourses.value = coursesResult.value.data ?? [];
        else console.error("Error fetching enrolled courses:", coursesResult.reason);
        isLoadingCourses.value = false;
      } catch (err) {
        console.error("Error fetching user detail:", err);
        fetchError.value = err ?? { message: "خطأ غير معروف." };
        userData.value = null;
        isLoadingMessages.value = false;
        isLoadingCourses.value = false;
      } finally {
        pending.value = false;
      }
    };
    const handleActionStart = (actionType) => {
      isLoadingAction.value = actionType === "ban" || actionType === "unban" || actionType === "unsuspend" || actionType === "role";
      console.log(`Action started: ${actionType}`);
    };
    const handleActionComplete = (success, message, updatedProfile) => {
      isLoadingAction.value = false;
      if (success && userData.value && updatedProfile) {
        Object.assign(userData.value.profile, updatedProfile);
        showToast(message, "success");
      } else if (!success) {
        showToast(message, "error");
      }
    };
    const markReplyAsReadByAdmin = async (messageId) => {
      var _a;
      if (isLoadingAction.value) return;
      isLoadingAction.value = `read-${messageId}`;
      try {
        const { error } = await supabase.from("user_private_messages").update({ admin_read_reply: true }).eq("id", messageId);
        if (error) throw error;
        const msgIndex = (_a = userMessages.value) == null ? void 0 : _a.findIndex((m) => m.id === messageId);
        if (msgIndex !== void 0 && msgIndex !== -1 && userMessages.value) userMessages.value[msgIndex].admin_read_reply = true;
        showToast("تم تمييز الرد كمقروء.", "success");
      } catch (err) {
        console.error("Error marking reply as read by admin:", err);
        showToast("فشل تمييز الرد كمقروء.", "error");
      } finally {
        if (isLoadingAction.value === `read-${messageId}`) isLoadingAction.value = false;
      }
    };
    const openSendMessageModal = (userProfile) => {
      if (!userProfile) return;
      showSendMessageModal.value = true;
    };
    const openSuspendModal = (userProfile) => {
      if (!userProfile) return;
      showSuspendModal.value = true;
    };
    const handleMessageSent = (success, errorMsg) => {
      showSendMessageModal.value = false;
      if (success) {
        showToast("تم إرسال الرسالة الخاصة بنجاح.", "success");
        fetchMessages();
      } else {
        showToast(`فشل إرسال الرسالة الخاصة: ${errorMsg || "خطأ غير معروف"}`, "error");
      }
    };
    const fetchMessages = async () => {
      if (!userId.value) return;
      isLoadingMessages.value = true;
      try {
        const { data, error } = await supabase.from("user_private_messages").select("*").eq("user_id", userId.value).order("created_at", { ascending: false });
        if (error) throw error;
        userMessages.value = data ?? [];
      } catch (err) {
        console.error("Error refreshing messages:", err);
        showToast("فشل تحديث قائمة الرسائل.", "error");
      } finally {
        isLoadingMessages.value = false;
      }
    };
    const handleUserSuspended = (userIdParam, suspended, suspended_until) => {
      var _a;
      if (((_a = userData.value) == null ? void 0 : _a.profile.id) === userIdParam) {
        userData.value.profile.comment_suspended_until = suspended_until;
        const userName = userData.value.profile.full_name || userData.value.auth.email;
        if (suspended) {
          showToast(`تم إيقاف تعليقات المستخدم ${userName} حتى ${formatDate(suspended_until)}.`, "success");
        } else {
          showToast(`تم إلغاء إيقاف تعليقات المستخدم ${userName}.`, "success");
        }
      }
      showSuspendModal.value = false;
    };
    const formatDate = (dateString) => {
      if (!dateString) return "--";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "تاريخ غير صالح";
        return date.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short", hour12: true });
      } catch (e) {
        return "خطأ تنسيق";
      }
    };
    const formatDateShort = (dateString) => {
      if (!dateString) return "--";
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "تاريخ غير صالح";
        return date.toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
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
    const showToast = (message, type = "info") => {
      if ($toast && typeof $toast[type] === "function") $toast[type](message);
      else console.log(`[${type.toUpperCase()}] ${message}`);
    };
    watch(userId, (newId) => {
      if (newId) fetchData();
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_LazyAdminSendMessageModal = __nuxt_component_0_lazy;
      const _component_LazyAdminSuspendCommentModal = __nuxt_component_1_lazy;
      if (pending.value) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex justify-center items-center min-h-[60vh]" }, _attrs))} data-v-aa34737d>`);
        _push(ssrRenderComponent(LoadingSpinner, { class: "w-10 h-10 text-indigo-600" }, null, _parent));
        _push(`</div>`);
      } else if (fetchError.value || !userData.value) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8 text-center" }, _attrs))} data-v-aa34737d><div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert" data-v-aa34737d><strong class="font-bold" data-v-aa34737d>خطأ!</strong><span class="block sm:inline" data-v-aa34737d>${ssrInterpolate(fetchError.value ? `فشل تحميل بيانات المستخدم: ${fetchError.value.message}` : "لم يتم العثور على المستخدم المطلوب.")}</span></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/users",
          class: "mt-6 inline-block text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` ← العودة إلى قائمة المستخدمين `);
            } else {
              return [
                createTextVNode(" ← العودة إلى قائمة المستخدمين ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 lg:px-8 py-8 space-y-8" }, _attrs))} data-v-aa34737d><div class="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b dark:border-gray-700" data-v-aa34737d><div class="flex items-center gap-4" data-v-aa34737d>`);
        _push(ssrRenderComponent(_sfc_main$1, {
          src: userData.value.profile.avatar_url || void 0,
          alt: userData.value.profile.full_name || "مستخدم",
          size: "lg"
        }, null, _parent));
        _push(`<div data-v-aa34737d><h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100" data-v-aa34737d>${ssrInterpolate(userData.value.profile.full_name || "لم يحدد اسم")}</h1><p class="text-sm text-gray-500 dark:text-gray-400" data-v-aa34737d>${ssrInterpolate(userData.value.auth.email)}</p><div class="mt-1 flex flex-wrap gap-2 text-xs" data-v-aa34737d><span class="${ssrRenderClass(["px-2 py-0.5 rounded-full", userData.value.profile.role === "admin" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"])}" data-v-aa34737d>${ssrInterpolate(userData.value.profile.role === "admin" ? "مشرف" : "مستخدم")}</span>`);
        if (userData.value.profile.is_banned) {
          _push(`<span class="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" data-v-aa34737d>محظور</span>`);
        } else if (isCommentSuspended(userData.value.profile.comment_suspended_until)) {
          _push(`<span class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300" data-v-aa34737d>تعليق موقوف</span>`);
        } else {
          _push(`<span class="px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" data-v-aa34737d>نشط</span>`);
        }
        _push(`</div></div></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/users",
          class: "flex-shrink-0 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 mt-2 sm:mt-0"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-aa34737d${_scopeId}><path fill-rule="evenodd" d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z" clip-rule="evenodd" data-v-aa34737d${_scopeId}></path></svg> العودة للقائمة `);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  xmlns: "http://www.w3.org/2000/svg",
                  viewBox: "0 0 16 16",
                  fill: "currentColor",
                  class: "w-4 h-4"
                }, [
                  createVNode("path", {
                    "fill-rule": "evenodd",
                    d: "M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25H13.25A.75.75 0 0 1 14 8Z",
                    "clip-rule": "evenodd"
                  })
                ])),
                createTextVNode(" العودة للقائمة ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (isLoadingAction.value) {
          _push(`<div class="fixed inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-50" data-v-aa34737d>`);
          _push(ssrRenderComponent(LoadingSpinner, { class: "w-8 h-8 text-indigo-600" }, null, _parent));
          _push(`<span class="ml-2 text-gray-700 dark:text-gray-300" data-v-aa34737d>جاري تنفيذ الإجراء...</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_a = userData.value) == null ? void 0 : _a.profile) {
          _push(ssrRenderComponent(AdminUserActions, {
            "user-profile": userData.value.profile,
            "is-loading": isLoadingAction.value,
            onActionStart: handleActionStart,
            onActionComplete: handleActionComplete,
            onSendMessage: ($event) => openSendMessageModal(userData.value.profile),
            onSuspendComments: ($event) => openSuspendModal(userData.value.profile)
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-8" data-v-aa34737d><div class="lg:col-span-1 space-y-6" data-v-aa34737d>`);
        _push(ssrRenderComponent(BaseCard, null, {
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`معلومات إضافية`);
            } else {
              return [
                createTextVNode("معلومات إضافية")
              ];
            }
          }),
          content: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<dl class="space-y-3 text-sm" data-v-aa34737d${_scopeId}><div class="flex justify-between" data-v-aa34737d${_scopeId}><dt class="font-medium text-gray-500 dark:text-gray-400" data-v-aa34737d${_scopeId}>تاريخ الانضمام:</dt><dd class="text-gray-700 dark:text-gray-200" data-v-aa34737d${_scopeId}>${ssrInterpolate(formatDate(userData.value.profile.created_at))}</dd></div><div class="flex justify-between" data-v-aa34737d${_scopeId}><dt class="font-medium text-gray-500 dark:text-gray-400" data-v-aa34737d${_scopeId}>آخر تحديث للبروفايل:</dt><dd class="text-gray-700 dark:text-gray-200" data-v-aa34737d${_scopeId}>${ssrInterpolate(formatDate(userData.value.profile.updated_at))}</dd></div><div class="flex justify-between" data-v-aa34737d${_scopeId}><dt class="font-medium text-gray-500 dark:text-gray-400" data-v-aa34737d${_scopeId}>آخر تسجيل دخول:</dt><dd class="text-gray-700 dark:text-gray-200" data-v-aa34737d${_scopeId}>${ssrInterpolate(formatDate(userData.value.auth.last_sign_in_at) || "غير متاح")}</dd></div><div class="flex justify-between" data-v-aa34737d${_scopeId}><dt class="font-medium text-gray-500 dark:text-gray-400" data-v-aa34737d${_scopeId}>النقاط:</dt><dd class="text-gray-700 dark:text-gray-200 font-semibold" data-v-aa34737d${_scopeId}>${ssrInterpolate(userData.value.profile.points ?? 0)}</dd></div>`);
              if (isCommentSuspended(userData.value.profile.comment_suspended_until)) {
                _push2(`<div data-v-aa34737d${_scopeId}><dt class="font-medium text-gray-500 dark:text-gray-400" data-v-aa34737d${_scopeId}>انتهاء إيقاف التعليق:</dt><dd class="text-yellow-600 dark:text-yellow-400" data-v-aa34737d${_scopeId}>${ssrInterpolate(formatDate(userData.value.profile.comment_suspended_until))}</dd></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="pt-2" data-v-aa34737d${_scopeId}><dt class="font-medium text-gray-500 dark:text-gray-400 mb-1" data-v-aa34737d${_scopeId}>النبذة الشخصية:</dt><dd class="text-gray-700 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-2 rounded border dark:border-gray-600 min-h-[50px]" data-v-aa34737d${_scopeId}>${ssrInterpolate(userData.value.profile.bio || "لم يكتب نبذة.")}</dd></div></dl>`);
            } else {
              return [
                createVNode("dl", { class: "space-y-3 text-sm" }, [
                  createVNode("div", { class: "flex justify-between" }, [
                    createVNode("dt", { class: "font-medium text-gray-500 dark:text-gray-400" }, "تاريخ الانضمام:"),
                    createVNode("dd", { class: "text-gray-700 dark:text-gray-200" }, toDisplayString(formatDate(userData.value.profile.created_at)), 1)
                  ]),
                  createVNode("div", { class: "flex justify-between" }, [
                    createVNode("dt", { class: "font-medium text-gray-500 dark:text-gray-400" }, "آخر تحديث للبروفايل:"),
                    createVNode("dd", { class: "text-gray-700 dark:text-gray-200" }, toDisplayString(formatDate(userData.value.profile.updated_at)), 1)
                  ]),
                  createVNode("div", { class: "flex justify-between" }, [
                    createVNode("dt", { class: "font-medium text-gray-500 dark:text-gray-400" }, "آخر تسجيل دخول:"),
                    createVNode("dd", { class: "text-gray-700 dark:text-gray-200" }, toDisplayString(formatDate(userData.value.auth.last_sign_in_at) || "غير متاح"), 1)
                  ]),
                  createVNode("div", { class: "flex justify-between" }, [
                    createVNode("dt", { class: "font-medium text-gray-500 dark:text-gray-400" }, "النقاط:"),
                    createVNode("dd", { class: "text-gray-700 dark:text-gray-200 font-semibold" }, toDisplayString(userData.value.profile.points ?? 0), 1)
                  ]),
                  isCommentSuspended(userData.value.profile.comment_suspended_until) ? (openBlock(), createBlock("div", { key: 0 }, [
                    createVNode("dt", { class: "font-medium text-gray-500 dark:text-gray-400" }, "انتهاء إيقاف التعليق:"),
                    createVNode("dd", { class: "text-yellow-600 dark:text-yellow-400" }, toDisplayString(formatDate(userData.value.profile.comment_suspended_until)), 1)
                  ])) : createCommentVNode("", true),
                  createVNode("div", { class: "pt-2" }, [
                    createVNode("dt", { class: "font-medium text-gray-500 dark:text-gray-400 mb-1" }, "النبذة الشخصية:"),
                    createVNode("dd", { class: "text-gray-700 dark:text-gray-200 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-2 rounded border dark:border-gray-600 min-h-[50px]" }, toDisplayString(userData.value.profile.bio || "لم يكتب نبذة."), 1)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (userEnrolledCourses.value.length > 0) {
          _push(ssrRenderComponent(BaseCard, null, {
            title: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`الدورات المسجل بها (${ssrInterpolate(userEnrolledCourses.value.length)})`);
              } else {
                return [
                  createTextVNode("الدورات المسجل بها (" + toDisplayString(userEnrolledCourses.value.length) + ")", 1)
                ];
              }
            }),
            content: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (isLoadingCourses.value) {
                  _push2(`<div class="text-center p-4" data-v-aa34737d${_scopeId}>`);
                  _push2(ssrRenderComponent(LoadingSpinner, null, null, _parent2, _scopeId));
                  _push2(`</div>`);
                } else {
                  _push2(`<ul class="space-y-2 max-h-60 overflow-y-auto text-sm pr-1" data-v-aa34737d${_scopeId}><!--[-->`);
                  ssrRenderList(userEnrolledCourses.value, (enrollment) => {
                    _push2(`<li class="flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded" data-v-aa34737d${_scopeId}>`);
                    _push2(ssrRenderComponent(_component_NuxtLink, {
                      to: `/study/courses/${enrollment.course_id}`,
                      class: "hover:underline text-gray-700 dark:text-gray-200 flex-grow truncate mr-2"
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        var _a2, _b;
                        if (_push3) {
                          _push3(`${ssrInterpolate(((_a2 = enrollment.study_courses) == null ? void 0 : _a2.title) || "دورة غير معروفة")}`);
                        } else {
                          return [
                            createTextVNode(toDisplayString(((_b = enrollment.study_courses) == null ? void 0 : _b.title) || "دورة غير معروفة"), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                    _push2(`<span class="text-xs text-gray-400 flex-shrink-0" data-v-aa34737d${_scopeId}>${ssrInterpolate(formatDateShort(enrollment.enrolled_at))}</span></li>`);
                  });
                  _push2(`<!--]--></ul>`);
                }
              } else {
                return [
                  isLoadingCourses.value ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "text-center p-4"
                  }, [
                    createVNode(LoadingSpinner)
                  ])) : (openBlock(), createBlock("ul", {
                    key: 1,
                    class: "space-y-2 max-h-60 overflow-y-auto text-sm pr-1"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(userEnrolledCourses.value, (enrollment) => {
                      return openBlock(), createBlock("li", {
                        key: enrollment.course_id,
                        class: "flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                      }, [
                        createVNode(_component_NuxtLink, {
                          to: `/study/courses/${enrollment.course_id}`,
                          class: "hover:underline text-gray-700 dark:text-gray-200 flex-grow truncate mr-2"
                        }, {
                          default: withCtx(() => {
                            var _a2;
                            return [
                              createTextVNode(toDisplayString(((_a2 = enrollment.study_courses) == null ? void 0 : _a2.title) || "دورة غير معروفة"), 1)
                            ];
                          }),
                          _: 2
                        }, 1032, ["to"]),
                        createVNode("span", { class: "text-xs text-gray-400 flex-shrink-0" }, toDisplayString(formatDateShort(enrollment.enrolled_at)), 1)
                      ]);
                    }), 128))
                  ]))
                ];
              }
            }),
            _: 1
          }, _parent));
        } else if (!isLoadingCourses.value) {
          _push(`<div class="text-sm text-center text-gray-400 dark:text-gray-500 italic py-4" data-v-aa34737d> المستخدم غير مسجل في أي دورات. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="lg:col-span-2 space-y-6" data-v-aa34737d>`);
        _push(ssrRenderComponent(BaseCard, null, {
          title: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex justify-between items-center" data-v-aa34737d${_scopeId}><span data-v-aa34737d${_scopeId}>المراسلات مع المستخدم</span><button${ssrIncludeBooleanAttr(isLoadingAction.value === "send") ? " disabled" : ""} class="text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 px-3 py-1 rounded-md flex items-center gap-1 disabled:opacity-50" data-v-aa34737d${_scopeId}>`);
              if (isLoadingAction.value === "send") {
                _push2(ssrRenderComponent(LoadingSpinner, { class: "w-4 h-4" }, null, _parent2, _scopeId));
              } else {
                _push2(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-4 h-4" data-v-aa34737d${_scopeId}><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11ZM2 4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v1.145l-5.426 3.05a1.75 1.75 0 0 1-1.93.066L2 5.96V4.5Zm11.5 8h-11a.5.5 0 0 1-.5-.5v-4.318l3.924 2.207a3.25 3.25 0 0 0 3.552-.122L14 7.764V11.5a.5.5 0 0 1-.5.5Z" data-v-aa34737d${_scopeId}></path></svg>`);
              }
              _push2(`<span data-v-aa34737d${_scopeId}>رسالة جديدة</span></button></div>`);
            } else {
              return [
                createVNode("div", { class: "flex justify-between items-center" }, [
                  createVNode("span", null, "المراسلات مع المستخدم"),
                  createVNode("button", {
                    onClick: ($event) => openSendMessageModal(userData.value.profile),
                    disabled: isLoadingAction.value === "send",
                    class: "text-sm bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 px-3 py-1 rounded-md flex items-center gap-1 disabled:opacity-50"
                  }, [
                    isLoadingAction.value === "send" ? (openBlock(), createBlock(LoadingSpinner, {
                      key: 0,
                      class: "w-4 h-4"
                    })) : (openBlock(), createBlock("svg", {
                      key: 1,
                      xmlns: "http://www.w3.org/2000/svg",
                      viewBox: "0 0 16 16",
                      fill: "currentColor",
                      class: "w-4 h-4"
                    }, [
                      createVNode("path", { d: "M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11ZM2 4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v1.145l-5.426 3.05a1.75 1.75 0 0 1-1.93.066L2 5.96V4.5Zm11.5 8h-11a.5.5 0 0 1-.5-.5v-4.318l3.924 2.207a3.25 3.25 0 0 0 3.552-.122L14 7.764V11.5a.5.5 0 0 1-.5.5Z" })
                    ])),
                    createVNode("span", null, "رسالة جديدة")
                  ], 8, ["onClick", "disabled"])
                ])
              ];
            }
          }),
          content: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (isLoadingMessages.value) {
                _push2(`<div class="text-center py-10" data-v-aa34737d${_scopeId}>`);
                _push2(ssrRenderComponent(LoadingSpinner, null, null, _parent2, _scopeId));
                _push2(`</div>`);
              } else if (userMessages.value.length === 0) {
                _push2(`<div class="text-center py-10 text-gray-500 dark:text-gray-400" data-v-aa34737d${_scopeId}>لا توجد رسائل متبادلة.</div>`);
              } else {
                _push2(`<div class="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar" data-v-aa34737d${_scopeId}><!--[-->`);
                ssrRenderList(userMessages.value, (message) => {
                  _push2(`<div class="border-b dark:border-gray-700 pb-4 last:border-b-0" data-v-aa34737d${_scopeId}><div class="p-3 rounded-lg bg-gray-100 dark:bg-gray-700/80 shadow-sm" data-v-aa34737d${_scopeId}><div class="flex justify-between items-start mb-1.5" data-v-aa34737d${_scopeId}><h4 class="font-semibold text-gray-800 dark:text-gray-100" data-v-aa34737d${_scopeId}>${ssrInterpolate(message.title)}</h4><span class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap" data-v-aa34737d${_scopeId}>${ssrInterpolate(formatDate(message.created_at))}</span></div><p class="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap" data-v-aa34737d${_scopeId}>${ssrInterpolate(message.content)}</p><p class="text-xs text-gray-400 dark:text-gray-500 mt-1" data-v-aa34737d${_scopeId}><span class="font-medium" data-v-aa34737d${_scopeId}>المصدر:</span> ${ssrInterpolate(message.source === "ask_sheikh_reply" ? "رد على سؤال" : message.source === "admin_direct_message" ? "رسالة مباشرة" : "غير محدد")} `);
                  if (message.related_question_id) {
                    _push2(ssrRenderComponent(_component_NuxtLink, {
                      to: `/admin/ask-sheikh?question=${message.related_question_id}`,
                      class: "mr-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(`(#${ssrInterpolate(message.related_question_id)})`);
                        } else {
                          return [
                            createTextVNode("(#" + toDisplayString(message.related_question_id) + ")", 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</p></div>`);
                  if (message.user_reply_text) {
                    _push2(`<div class="mt-3 mr-4 rtl:mr-0 rtl:ml-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 shadow-sm" data-v-aa34737d${_scopeId}><div class="flex justify-between items-start mb-1.5" data-v-aa34737d${_scopeId}><p class="text-sm font-semibold text-yellow-800 dark:text-yellow-200" data-v-aa34737d${_scopeId}>رد المستخدم:</p><span class="text-xs text-yellow-700 dark:text-yellow-300 whitespace-nowrap" data-v-aa34737d${_scopeId}>${ssrInterpolate(formatDate(message.user_replied_at))}</span></div><p class="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap" data-v-aa34737d${_scopeId}>${ssrInterpolate(message.user_reply_text)}</p><div class="mt-2 text-right" data-v-aa34737d${_scopeId}>`);
                    if (!message.admin_read_reply) {
                      _push2(`<button${ssrIncludeBooleanAttr(isLoadingAction.value === `read-${message.id}`) ? " disabled" : ""} class="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 flex items-center justify-end gap-1 ml-auto" data-v-aa34737d${_scopeId}>`);
                      if (isLoadingAction.value === `read-${message.id}`) {
                        _push2(ssrRenderComponent(LoadingSpinner, { class: "w-3 h-3" }, null, _parent2, _scopeId));
                      } else {
                        _push2(`<!---->`);
                      }
                      _push2(`<span data-v-aa34737d${_scopeId}>${ssrInterpolate(isLoadingAction.value === `read-${message.id}` ? "جارٍ..." : "تمييز كمقروء")}</span></button>`);
                    } else {
                      _push2(`<span class="text-xs text-green-600 dark:text-green-400 font-medium" data-v-aa34737d${_scopeId}>(تمت القراءة)</span>`);
                    }
                    _push2(`</div></div>`);
                  } else {
                    _push2(`<div class="mt-3 mr-4 rtl:mr-0 rtl:ml-4 text-xs text-gray-400 italic" data-v-aa34737d${_scopeId}> لم يرد المستخدم على هذه الرسالة بعد. </div>`);
                  }
                  _push2(`</div>`);
                });
                _push2(`<!--]--></div>`);
              }
            } else {
              return [
                isLoadingMessages.value ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "text-center py-10"
                }, [
                  createVNode(LoadingSpinner)
                ])) : userMessages.value.length === 0 ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "text-center py-10 text-gray-500 dark:text-gray-400"
                }, "لا توجد رسائل متبادلة.")) : (openBlock(), createBlock("div", {
                  key: 2,
                  class: "space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(userMessages.value, (message) => {
                    return openBlock(), createBlock("div", {
                      key: message.id,
                      class: "border-b dark:border-gray-700 pb-4 last:border-b-0"
                    }, [
                      createVNode("div", { class: "p-3 rounded-lg bg-gray-100 dark:bg-gray-700/80 shadow-sm" }, [
                        createVNode("div", { class: "flex justify-between items-start mb-1.5" }, [
                          createVNode("h4", { class: "font-semibold text-gray-800 dark:text-gray-100" }, toDisplayString(message.title), 1),
                          createVNode("span", { class: "text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap" }, toDisplayString(formatDate(message.created_at)), 1)
                        ]),
                        createVNode("p", { class: "text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap" }, toDisplayString(message.content), 1),
                        createVNode("p", { class: "text-xs text-gray-400 dark:text-gray-500 mt-1" }, [
                          createVNode("span", { class: "font-medium" }, "المصدر:"),
                          createTextVNode(" " + toDisplayString(message.source === "ask_sheikh_reply" ? "رد على سؤال" : message.source === "admin_direct_message" ? "رسالة مباشرة" : "غير محدد") + " ", 1),
                          message.related_question_id ? (openBlock(), createBlock(_component_NuxtLink, {
                            key: 0,
                            to: `/admin/ask-sheikh?question=${message.related_question_id}`,
                            class: "mr-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                          }, {
                            default: withCtx(() => [
                              createTextVNode("(#" + toDisplayString(message.related_question_id) + ")", 1)
                            ]),
                            _: 2
                          }, 1032, ["to"])) : createCommentVNode("", true)
                        ])
                      ]),
                      message.user_reply_text ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "mt-3 mr-4 rtl:mr-0 rtl:ml-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 shadow-sm"
                      }, [
                        createVNode("div", { class: "flex justify-between items-start mb-1.5" }, [
                          createVNode("p", { class: "text-sm font-semibold text-yellow-800 dark:text-yellow-200" }, "رد المستخدم:"),
                          createVNode("span", { class: "text-xs text-yellow-700 dark:text-yellow-300 whitespace-nowrap" }, toDisplayString(formatDate(message.user_replied_at)), 1)
                        ]),
                        createVNode("p", { class: "text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap" }, toDisplayString(message.user_reply_text), 1),
                        createVNode("div", { class: "mt-2 text-right" }, [
                          !message.admin_read_reply ? (openBlock(), createBlock("button", {
                            key: 0,
                            onClick: ($event) => markReplyAsReadByAdmin(message.id),
                            disabled: isLoadingAction.value === `read-${message.id}`,
                            class: "text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 flex items-center justify-end gap-1 ml-auto"
                          }, [
                            isLoadingAction.value === `read-${message.id}` ? (openBlock(), createBlock(LoadingSpinner, {
                              key: 0,
                              class: "w-3 h-3"
                            })) : createCommentVNode("", true),
                            createVNode("span", null, toDisplayString(isLoadingAction.value === `read-${message.id}` ? "جارٍ..." : "تمييز كمقروء"), 1)
                          ], 8, ["onClick", "disabled"])) : (openBlock(), createBlock("span", {
                            key: 1,
                            class: "text-xs text-green-600 dark:text-green-400 font-medium"
                          }, "(تمت القراءة)"))
                        ])
                      ])) : (openBlock(), createBlock("div", {
                        key: 1,
                        class: "mt-3 mr-4 rtl:mr-0 rtl:ml-4 text-xs text-gray-400 italic"
                      }, " لم يرد المستخدم على هذه الرسالة بعد. "))
                    ]);
                  }), 128))
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
        _push(ssrRenderComponent(_component_LazyAdminSendMessageModal, {
          modelValue: showSendMessageModal.value,
          "onUpdate:modelValue": ($event) => showSendMessageModal.value = $event,
          user: modalUser.value,
          onSent: handleMessageSent
        }, null, _parent));
        _push(ssrRenderComponent(_component_LazyAdminSuspendCommentModal, {
          modelValue: showSuspendModal.value,
          "onUpdate:modelValue": ($event) => showSuspendModal.value = $event,
          user: modalUser.value,
          onSuspended: handleUserSuspended
        }, null, _parent));
        _push(`</div>`);
      }
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=_id_.vue3.mjs.map
