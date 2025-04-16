import { defineComponent, ref, computed, watch, unref, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, withModifiers, createBlock, createCommentVNode, withDirectives, vModelSelect, openBlock, vModelText } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from "vue/server-renderer";
import { TransitionRoot, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/vue";
import LoadingSpinner from "../LoadingSpinner.vue.mjs";
import { addMonths, addWeeks, addDays } from "date-fns";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SuspendCommentModal",
  __ssrInlineRender: true,
  props: {
    user: {
      type: Object,
      required: true
    },
    modelValue: {
      // For v-model support
      type: Boolean,
      default: false
    }
  },
  emits: ["close", "suspended", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const supabase = useSupabaseClient();
    const isOpen = ref(props.modelValue);
    const durationValue = ref("1_day");
    const customUntilDate = ref("");
    const isLoading = ref(false);
    const errorMessage = ref(null);
    const minDate = computed(() => {
      const today = /* @__PURE__ */ new Date();
      today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
      return today.toISOString().slice(0, 16);
    });
    watch(() => props.modelValue, (newVal) => {
      isOpen.value = newVal;
      if (newVal) {
        durationValue.value = "1_day";
        customUntilDate.value = "";
        errorMessage.value = null;
        isLoading.value = false;
      }
    });
    function closeModal() {
      if (isLoading.value) return;
      isOpen.value = false;
      emit("update:modelValue", false);
      emit("close");
    }
    async function suspendComments() {
      if (!props.user || isLoading.value) return;
      let suspendUntil = null;
      const now = /* @__PURE__ */ new Date();
      try {
        switch (durationValue.value) {
          case "1_day":
            suspendUntil = addDays(now, 1);
            break;
          case "3_days":
            suspendUntil = addDays(now, 3);
            break;
          case "1_week":
            suspendUntil = addWeeks(now, 1);
            break;
          case "1_month":
            suspendUntil = addMonths(now, 1);
            break;
          case "custom":
            if (!customUntilDate.value) {
              errorMessage.value = "الرجاء تحديد تاريخ انتهاء الإيقاف.";
              return;
            }
            suspendUntil = new Date(customUntilDate.value);
            if (isNaN(suspendUntil.getTime()) || suspendUntil <= now) {
              errorMessage.value = "تاريخ الانتهاء يجب أن يكون في المستقبل.";
              return;
            }
            break;
          default:
            errorMessage.value = "مدة إيقاف غير صالحة.";
            return;
        }
      } catch (e) {
        errorMessage.value = "تنسيق التاريخ غير صالح.";
        return;
      }
      isLoading.value = true;
      errorMessage.value = null;
      try {
        const suspendUntilISO = suspendUntil.toISOString();
        const { error } = await supabase.from("profiles").update({ comment_suspended_until: suspendUntilISO }).eq("id", props.user.id);
        if (error) throw error;
        emit("suspended", props.user.id, true, suspendUntilISO);
        closeModal();
      } catch (err) {
        console.error("Error suspending comments:", err);
        errorMessage.value = err.message || "فشل إيقاف تعليقات المستخدم.";
      } finally {
        isLoading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TransitionRoot), mergeProps({
        appear: "",
        show: isOpen.value,
        as: "template"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Dialog), {
              as: "div",
              onClose: closeModal,
              class: "relative z-40"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(TransitionChild), {
                    as: "template",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="fixed inset-0 bg-black/30 backdrop-blur-sm"${_scopeId3}></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "fixed inset-0 bg-black/30 backdrop-blur-sm" })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="fixed inset-0 overflow-y-auto"${_scopeId2}><div class="flex min-h-full items-center justify-center p-4 text-center"${_scopeId2}>`);
                  _push3(ssrRenderComponent(unref(TransitionChild), {
                    as: "template",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0 scale-95",
                    "enter-to": "opacity-100 scale-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100 scale-100",
                    "leave-to": "opacity-0 scale-95"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(unref(DialogPanel), { class: "w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  var _a, _b, _c, _d;
                                  if (_push6) {
                                    _push6(` إيقاف التعليقات للمستخدم: ${ssrInterpolate(((_a = __props.user) == null ? void 0 : _a.full_name) || ((_b = __props.user) == null ? void 0 : _b.auth_email))}`);
                                  } else {
                                    return [
                                      createTextVNode(" إيقاف التعليقات للمستخدم: " + toDisplayString(((_c = __props.user) == null ? void 0 : _c.full_name) || ((_d = __props.user) == null ? void 0 : _d.auth_email)), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<form${_scopeId4}><div class="mt-4 space-y-4"${_scopeId4}><p class="text-sm text-gray-600 dark:text-gray-300"${_scopeId4}> حدد مدة إيقاف المستخدم عن إضافة تعليقات جديدة. سيتمكن من التعليق مرة أخرى بعد انتهاء المدة. </p><div${_scopeId4}><label for="suspension-duration" class="block text-sm font-medium text-gray-700 dark:text-gray-300"${_scopeId4}>مدة الإيقاف *</label><select id="suspension-duration" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"${_scopeId4}><option value="1_day"${ssrIncludeBooleanAttr(Array.isArray(durationValue.value) ? ssrLooseContain(durationValue.value, "1_day") : ssrLooseEqual(durationValue.value, "1_day")) ? " selected" : ""}${_scopeId4}>يوم واحد</option><option value="3_days"${ssrIncludeBooleanAttr(Array.isArray(durationValue.value) ? ssrLooseContain(durationValue.value, "3_days") : ssrLooseEqual(durationValue.value, "3_days")) ? " selected" : ""}${_scopeId4}>3 أيام</option><option value="1_week"${ssrIncludeBooleanAttr(Array.isArray(durationValue.value) ? ssrLooseContain(durationValue.value, "1_week") : ssrLooseEqual(durationValue.value, "1_week")) ? " selected" : ""}${_scopeId4}>أسبوع واحد</option><option value="1_month"${ssrIncludeBooleanAttr(Array.isArray(durationValue.value) ? ssrLooseContain(durationValue.value, "1_month") : ssrLooseEqual(durationValue.value, "1_month")) ? " selected" : ""}${_scopeId4}>شهر واحد</option><option value="custom"${ssrIncludeBooleanAttr(Array.isArray(durationValue.value) ? ssrLooseContain(durationValue.value, "custom") : ssrLooseEqual(durationValue.value, "custom")) ? " selected" : ""}${_scopeId4}>مدة مخصصة (تاريخ الانتهاء)</option></select></div>`);
                              if (durationValue.value === "custom") {
                                _push5(`<div${_scopeId4}><label for="suspension-until" class="block text-sm font-medium text-gray-700 dark:text-gray-300"${_scopeId4}>تاريخ انتهاء الإيقاف *</label><input type="datetime-local" id="suspension-until"${ssrRenderAttr("value", customUntilDate.value)} required${ssrRenderAttr("min", minDate.value)} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"${_scopeId4}></div>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              if (errorMessage.value) {
                                _push5(`<p class="text-sm text-red-600 dark:text-red-400"${_scopeId4}>${ssrInterpolate(errorMessage.value)}</p>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`</div><div class="mt-6 flex justify-start gap-3"${_scopeId4}><button type="submit"${ssrIncludeBooleanAttr(isLoading.value || durationValue.value === "custom" && !customUntilDate.value) ? " disabled" : ""} class="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"${_scopeId4}>`);
                              if (isLoading.value) {
                                _push5(ssrRenderComponent(LoadingSpinner, { class: "w-5 h-5 text-white -ml-1 mr-2" }, null, _parent5, _scopeId4));
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(` ${ssrInterpolate(isLoading.value ? "جارٍ الإيقاف..." : "إيقاف التعليقات")}</button><button type="button" class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""}${_scopeId4}> إلغاء </button></div></form>`);
                            } else {
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                                }, {
                                  default: withCtx(() => {
                                    var _a, _b;
                                    return [
                                      createTextVNode(" إيقاف التعليقات للمستخدم: " + toDisplayString(((_a = __props.user) == null ? void 0 : _a.full_name) || ((_b = __props.user) == null ? void 0 : _b.auth_email)), 1)
                                    ];
                                  }),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(suspendComments, ["prevent"])
                                }, [
                                  createVNode("div", { class: "mt-4 space-y-4" }, [
                                    createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300" }, " حدد مدة إيقاف المستخدم عن إضافة تعليقات جديدة. سيتمكن من التعليق مرة أخرى بعد انتهاء المدة. "),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "suspension-duration",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "مدة الإيقاف *"),
                                      withDirectives(createVNode("select", {
                                        id: "suspension-duration",
                                        "onUpdate:modelValue": ($event) => durationValue.value = $event,
                                        required: "",
                                        class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      }, [
                                        createVNode("option", { value: "1_day" }, "يوم واحد"),
                                        createVNode("option", { value: "3_days" }, "3 أيام"),
                                        createVNode("option", { value: "1_week" }, "أسبوع واحد"),
                                        createVNode("option", { value: "1_month" }, "شهر واحد"),
                                        createVNode("option", { value: "custom" }, "مدة مخصصة (تاريخ الانتهاء)")
                                      ], 8, ["onUpdate:modelValue"]), [
                                        [vModelSelect, durationValue.value]
                                      ])
                                    ]),
                                    durationValue.value === "custom" ? (openBlock(), createBlock("div", { key: 0 }, [
                                      createVNode("label", {
                                        for: "suspension-until",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "تاريخ انتهاء الإيقاف *"),
                                      withDirectives(createVNode("input", {
                                        type: "datetime-local",
                                        id: "suspension-until",
                                        "onUpdate:modelValue": ($event) => customUntilDate.value = $event,
                                        required: "",
                                        min: minDate.value,
                                        class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      }, null, 8, ["onUpdate:modelValue", "min"]), [
                                        [vModelText, customUntilDate.value]
                                      ])
                                    ])) : createCommentVNode("", true),
                                    errorMessage.value ? (openBlock(), createBlock("p", {
                                      key: 1,
                                      class: "text-sm text-red-600 dark:text-red-400"
                                    }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true)
                                  ]),
                                  createVNode("div", { class: "mt-6 flex justify-start gap-3" }, [
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isLoading.value || durationValue.value === "custom" && !customUntilDate.value,
                                      class: "inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                    }, [
                                      isLoading.value ? (openBlock(), createBlock(LoadingSpinner, {
                                        key: 0,
                                        class: "w-5 h-5 text-white -ml-1 mr-2"
                                      })) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isLoading.value ? "جارٍ الإيقاف..." : "إيقاف التعليقات"), 1)
                                    ], 8, ["disabled"]),
                                    createVNode("button", {
                                      type: "button",
                                      class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                      onClick: closeModal,
                                      disabled: isLoading.value
                                    }, " إلغاء ", 8, ["disabled"])
                                  ])
                                ], 32)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                              }, {
                                default: withCtx(() => {
                                  var _a, _b;
                                  return [
                                    createTextVNode(" إيقاف التعليقات للمستخدم: " + toDisplayString(((_a = __props.user) == null ? void 0 : _a.full_name) || ((_b = __props.user) == null ? void 0 : _b.auth_email)), 1)
                                  ];
                                }),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(suspendComments, ["prevent"])
                              }, [
                                createVNode("div", { class: "mt-4 space-y-4" }, [
                                  createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300" }, " حدد مدة إيقاف المستخدم عن إضافة تعليقات جديدة. سيتمكن من التعليق مرة أخرى بعد انتهاء المدة. "),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "suspension-duration",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "مدة الإيقاف *"),
                                    withDirectives(createVNode("select", {
                                      id: "suspension-duration",
                                      "onUpdate:modelValue": ($event) => durationValue.value = $event,
                                      required: "",
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, [
                                      createVNode("option", { value: "1_day" }, "يوم واحد"),
                                      createVNode("option", { value: "3_days" }, "3 أيام"),
                                      createVNode("option", { value: "1_week" }, "أسبوع واحد"),
                                      createVNode("option", { value: "1_month" }, "شهر واحد"),
                                      createVNode("option", { value: "custom" }, "مدة مخصصة (تاريخ الانتهاء)")
                                    ], 8, ["onUpdate:modelValue"]), [
                                      [vModelSelect, durationValue.value]
                                    ])
                                  ]),
                                  durationValue.value === "custom" ? (openBlock(), createBlock("div", { key: 0 }, [
                                    createVNode("label", {
                                      for: "suspension-until",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "تاريخ انتهاء الإيقاف *"),
                                    withDirectives(createVNode("input", {
                                      type: "datetime-local",
                                      id: "suspension-until",
                                      "onUpdate:modelValue": ($event) => customUntilDate.value = $event,
                                      required: "",
                                      min: minDate.value,
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue", "min"]), [
                                      [vModelText, customUntilDate.value]
                                    ])
                                  ])) : createCommentVNode("", true),
                                  errorMessage.value ? (openBlock(), createBlock("p", {
                                    key: 1,
                                    class: "text-sm text-red-600 dark:text-red-400"
                                  }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true)
                                ]),
                                createVNode("div", { class: "mt-6 flex justify-start gap-3" }, [
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isLoading.value || durationValue.value === "custom" && !customUntilDate.value,
                                    class: "inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                  }, [
                                    isLoading.value ? (openBlock(), createBlock(LoadingSpinner, {
                                      key: 0,
                                      class: "w-5 h-5 text-white -ml-1 mr-2"
                                    })) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isLoading.value ? "جارٍ الإيقاف..." : "إيقاف التعليقات"), 1)
                                  ], 8, ["disabled"]),
                                  createVNode("button", {
                                    type: "button",
                                    class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                    onClick: closeModal,
                                    disabled: isLoading.value
                                  }, " إلغاء ", 8, ["disabled"])
                                ])
                              ], 32)
                            ]),
                            _: 1
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`</div></div>`);
                } else {
                  return [
                    createVNode(unref(TransitionChild), {
                      as: "template",
                      enter: "duration-300 ease-out",
                      "enter-from": "opacity-0",
                      "enter-to": "opacity-100",
                      leave: "duration-200 ease-in",
                      "leave-from": "opacity-100",
                      "leave-to": "opacity-0"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "fixed inset-0 bg-black/30 backdrop-blur-sm" })
                      ]),
                      _: 1
                    }),
                    createVNode("div", { class: "fixed inset-0 overflow-y-auto" }, [
                      createVNode("div", { class: "flex min-h-full items-center justify-center p-4 text-center" }, [
                        createVNode(unref(TransitionChild), {
                          as: "template",
                          enter: "duration-300 ease-out",
                          "enter-from": "opacity-0 scale-95",
                          "enter-to": "opacity-100 scale-100",
                          leave: "duration-200 ease-in",
                          "leave-from": "opacity-100 scale-100",
                          "leave-to": "opacity-0 scale-95"
                        }, {
                          default: withCtx(() => [
                            createVNode(unref(DialogPanel), { class: "w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                              default: withCtx(() => [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                                }, {
                                  default: withCtx(() => {
                                    var _a, _b;
                                    return [
                                      createTextVNode(" إيقاف التعليقات للمستخدم: " + toDisplayString(((_a = __props.user) == null ? void 0 : _a.full_name) || ((_b = __props.user) == null ? void 0 : _b.auth_email)), 1)
                                    ];
                                  }),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(suspendComments, ["prevent"])
                                }, [
                                  createVNode("div", { class: "mt-4 space-y-4" }, [
                                    createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300" }, " حدد مدة إيقاف المستخدم عن إضافة تعليقات جديدة. سيتمكن من التعليق مرة أخرى بعد انتهاء المدة. "),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "suspension-duration",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "مدة الإيقاف *"),
                                      withDirectives(createVNode("select", {
                                        id: "suspension-duration",
                                        "onUpdate:modelValue": ($event) => durationValue.value = $event,
                                        required: "",
                                        class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      }, [
                                        createVNode("option", { value: "1_day" }, "يوم واحد"),
                                        createVNode("option", { value: "3_days" }, "3 أيام"),
                                        createVNode("option", { value: "1_week" }, "أسبوع واحد"),
                                        createVNode("option", { value: "1_month" }, "شهر واحد"),
                                        createVNode("option", { value: "custom" }, "مدة مخصصة (تاريخ الانتهاء)")
                                      ], 8, ["onUpdate:modelValue"]), [
                                        [vModelSelect, durationValue.value]
                                      ])
                                    ]),
                                    durationValue.value === "custom" ? (openBlock(), createBlock("div", { key: 0 }, [
                                      createVNode("label", {
                                        for: "suspension-until",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "تاريخ انتهاء الإيقاف *"),
                                      withDirectives(createVNode("input", {
                                        type: "datetime-local",
                                        id: "suspension-until",
                                        "onUpdate:modelValue": ($event) => customUntilDate.value = $event,
                                        required: "",
                                        min: minDate.value,
                                        class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      }, null, 8, ["onUpdate:modelValue", "min"]), [
                                        [vModelText, customUntilDate.value]
                                      ])
                                    ])) : createCommentVNode("", true),
                                    errorMessage.value ? (openBlock(), createBlock("p", {
                                      key: 1,
                                      class: "text-sm text-red-600 dark:text-red-400"
                                    }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true)
                                  ]),
                                  createVNode("div", { class: "mt-6 flex justify-start gap-3" }, [
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isLoading.value || durationValue.value === "custom" && !customUntilDate.value,
                                      class: "inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                    }, [
                                      isLoading.value ? (openBlock(), createBlock(LoadingSpinner, {
                                        key: 0,
                                        class: "w-5 h-5 text-white -ml-1 mr-2"
                                      })) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isLoading.value ? "جارٍ الإيقاف..." : "إيقاف التعليقات"), 1)
                                    ], 8, ["disabled"]),
                                    createVNode("button", {
                                      type: "button",
                                      class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                      onClick: closeModal,
                                      disabled: isLoading.value
                                    }, " إلغاء ", 8, ["disabled"])
                                  ])
                                ], 32)
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ])
                    ])
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(unref(Dialog), {
                as: "div",
                onClose: closeModal,
                class: "relative z-40"
              }, {
                default: withCtx(() => [
                  createVNode(unref(TransitionChild), {
                    as: "template",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "fixed inset-0 bg-black/30 backdrop-blur-sm" })
                    ]),
                    _: 1
                  }),
                  createVNode("div", { class: "fixed inset-0 overflow-y-auto" }, [
                    createVNode("div", { class: "flex min-h-full items-center justify-center p-4 text-center" }, [
                      createVNode(unref(TransitionChild), {
                        as: "template",
                        enter: "duration-300 ease-out",
                        "enter-from": "opacity-0 scale-95",
                        "enter-to": "opacity-100 scale-100",
                        leave: "duration-200 ease-in",
                        "leave-from": "opacity-100 scale-100",
                        "leave-to": "opacity-0 scale-95"
                      }, {
                        default: withCtx(() => [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                              }, {
                                default: withCtx(() => {
                                  var _a, _b;
                                  return [
                                    createTextVNode(" إيقاف التعليقات للمستخدم: " + toDisplayString(((_a = __props.user) == null ? void 0 : _a.full_name) || ((_b = __props.user) == null ? void 0 : _b.auth_email)), 1)
                                  ];
                                }),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(suspendComments, ["prevent"])
                              }, [
                                createVNode("div", { class: "mt-4 space-y-4" }, [
                                  createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300" }, " حدد مدة إيقاف المستخدم عن إضافة تعليقات جديدة. سيتمكن من التعليق مرة أخرى بعد انتهاء المدة. "),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "suspension-duration",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "مدة الإيقاف *"),
                                    withDirectives(createVNode("select", {
                                      id: "suspension-duration",
                                      "onUpdate:modelValue": ($event) => durationValue.value = $event,
                                      required: "",
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, [
                                      createVNode("option", { value: "1_day" }, "يوم واحد"),
                                      createVNode("option", { value: "3_days" }, "3 أيام"),
                                      createVNode("option", { value: "1_week" }, "أسبوع واحد"),
                                      createVNode("option", { value: "1_month" }, "شهر واحد"),
                                      createVNode("option", { value: "custom" }, "مدة مخصصة (تاريخ الانتهاء)")
                                    ], 8, ["onUpdate:modelValue"]), [
                                      [vModelSelect, durationValue.value]
                                    ])
                                  ]),
                                  durationValue.value === "custom" ? (openBlock(), createBlock("div", { key: 0 }, [
                                    createVNode("label", {
                                      for: "suspension-until",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "تاريخ انتهاء الإيقاف *"),
                                    withDirectives(createVNode("input", {
                                      type: "datetime-local",
                                      id: "suspension-until",
                                      "onUpdate:modelValue": ($event) => customUntilDate.value = $event,
                                      required: "",
                                      min: minDate.value,
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue", "min"]), [
                                      [vModelText, customUntilDate.value]
                                    ])
                                  ])) : createCommentVNode("", true),
                                  errorMessage.value ? (openBlock(), createBlock("p", {
                                    key: 1,
                                    class: "text-sm text-red-600 dark:text-red-400"
                                  }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true)
                                ]),
                                createVNode("div", { class: "mt-6 flex justify-start gap-3" }, [
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isLoading.value || durationValue.value === "custom" && !customUntilDate.value,
                                    class: "inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                  }, [
                                    isLoading.value ? (openBlock(), createBlock(LoadingSpinner, {
                                      key: 0,
                                      class: "w-5 h-5 text-white -ml-1 mr-2"
                                    })) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isLoading.value ? "جارٍ الإيقاف..." : "إيقاف التعليقات"), 1)
                                  ], 8, ["disabled"]),
                                  createVNode("button", {
                                    type: "button",
                                    class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                    onClick: closeModal,
                                    disabled: isLoading.value
                                  }, " إلغاء ", 8, ["disabled"])
                                ])
                              ], 32)
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
                    ])
                  ])
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=SuspendCommentModal.vue2.mjs.map
