import { defineComponent, ref, watch, unref, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString, withModifiers, createBlock, createCommentVNode, withDirectives, vModelText, openBlock } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { TransitionRoot, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/vue";
import LoadingSpinner from "../LoadingSpinner.vue.mjs";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SendMessageModal",
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
  emits: ["close", "sent", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const supabase = useSupabaseClient();
    const isOpen = ref(props.modelValue);
    const messageTitle = ref("");
    const messageContent = ref("");
    const isLoading = ref(false);
    const errorMessage = ref(null);
    watch(() => props.modelValue, (newVal) => {
      isOpen.value = newVal;
      if (newVal) {
        messageTitle.value = "";
        messageContent.value = "";
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
    async function sendMessage() {
      if (!props.user || !messageTitle.value.trim() || !messageContent.value.trim() || isLoading.value) {
        errorMessage.value = "الرجاء ملء العنوان والمحتوى.";
        return;
      }
      isLoading.value = true;
      errorMessage.value = null;
      try {
        const payload = {
          user_id: props.user.id,
          title: messageTitle.value.trim(),
          content: messageContent.value.trim(),
          source: "admin_direct_message"
          // Indicate it's a direct message
        };
        const { error } = await supabase.from("user_private_messages").insert(payload);
        if (error) throw error;
        emit("sent", true);
        closeModal();
      } catch (err) {
        console.error("Error sending private message:", err);
        errorMessage.value = err.message || "فشل إرسال الرسالة.";
        emit("sent", false, errorMessage.value);
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
                                    _push6(` إرسال رسالة خاصة إلى ${ssrInterpolate(((_a = __props.user) == null ? void 0 : _a.full_name) || ((_b = __props.user) == null ? void 0 : _b.auth_email))}`);
                                  } else {
                                    return [
                                      createTextVNode(" إرسال رسالة خاصة إلى " + toDisplayString(((_c = __props.user) == null ? void 0 : _c.full_name) || ((_d = __props.user) == null ? void 0 : _d.auth_email)), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<form${_scopeId4}><div class="mt-4 space-y-4"${_scopeId4}><div${_scopeId4}><label for="message-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300"${_scopeId4}>عنوان الرسالة *</label><input type="text" id="message-title"${ssrRenderAttr("value", messageTitle.value)} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"${_scopeId4}></div><div${_scopeId4}><label for="message-content" class="block text-sm font-medium text-gray-700 dark:text-gray-300"${_scopeId4}>محتوى الرسالة *</label><textarea id="message-content" rows="6" required placeholder="اكتب رسالتك هنا..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"${_scopeId4}>${ssrInterpolate(messageContent.value)}</textarea></div>`);
                              if (errorMessage.value) {
                                _push5(`<p class="text-sm text-red-600 dark:text-red-400"${_scopeId4}>${ssrInterpolate(errorMessage.value)}</p>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`</div><div class="mt-6 flex justify-start gap-3"${_scopeId4}><button type="submit"${ssrIncludeBooleanAttr(isLoading.value || !messageTitle.value.trim() || !messageContent.value.trim()) ? " disabled" : ""} class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"${_scopeId4}>`);
                              if (isLoading.value) {
                                _push5(ssrRenderComponent(LoadingSpinner, { class: "w-5 h-5 text-white -ml-1 mr-2" }, null, _parent5, _scopeId4));
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(` ${ssrInterpolate(isLoading.value ? "جارٍ الإرسال..." : "إرسال الرسالة")}</button><button type="button" class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"${ssrIncludeBooleanAttr(isLoading.value) ? " disabled" : ""}${_scopeId4}> إلغاء </button></div></form>`);
                            } else {
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4 border-b dark:border-gray-700 pb-3"
                                }, {
                                  default: withCtx(() => {
                                    var _a, _b;
                                    return [
                                      createTextVNode(" إرسال رسالة خاصة إلى " + toDisplayString(((_a = __props.user) == null ? void 0 : _a.full_name) || ((_b = __props.user) == null ? void 0 : _b.auth_email)), 1)
                                    ];
                                  }),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(sendMessage, ["prevent"])
                                }, [
                                  createVNode("div", { class: "mt-4 space-y-4" }, [
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "message-title",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "عنوان الرسالة *"),
                                      withDirectives(createVNode("input", {
                                        type: "text",
                                        id: "message-title",
                                        "onUpdate:modelValue": ($event) => messageTitle.value = $event,
                                        required: "",
                                        class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelText, messageTitle.value]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "message-content",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "محتوى الرسالة *"),
                                      withDirectives(createVNode("textarea", {
                                        id: "message-content",
                                        "onUpdate:modelValue": ($event) => messageContent.value = $event,
                                        rows: "6",
                                        required: "",
                                        placeholder: "اكتب رسالتك هنا...",
                                        class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelText, messageContent.value]
                                      ])
                                    ]),
                                    errorMessage.value ? (openBlock(), createBlock("p", {
                                      key: 0,
                                      class: "text-sm text-red-600 dark:text-red-400"
                                    }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true)
                                  ]),
                                  createVNode("div", { class: "mt-6 flex justify-start gap-3" }, [
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isLoading.value || !messageTitle.value.trim() || !messageContent.value.trim(),
                                      class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                    }, [
                                      isLoading.value ? (openBlock(), createBlock(LoadingSpinner, {
                                        key: 0,
                                        class: "w-5 h-5 text-white -ml-1 mr-2"
                                      })) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isLoading.value ? "جارٍ الإرسال..." : "إرسال الرسالة"), 1)
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
                                    createTextVNode(" إرسال رسالة خاصة إلى " + toDisplayString(((_a = __props.user) == null ? void 0 : _a.full_name) || ((_b = __props.user) == null ? void 0 : _b.auth_email)), 1)
                                  ];
                                }),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(sendMessage, ["prevent"])
                              }, [
                                createVNode("div", { class: "mt-4 space-y-4" }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "message-title",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "عنوان الرسالة *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "message-title",
                                      "onUpdate:modelValue": ($event) => messageTitle.value = $event,
                                      required: "",
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, messageTitle.value]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "message-content",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "محتوى الرسالة *"),
                                    withDirectives(createVNode("textarea", {
                                      id: "message-content",
                                      "onUpdate:modelValue": ($event) => messageContent.value = $event,
                                      rows: "6",
                                      required: "",
                                      placeholder: "اكتب رسالتك هنا...",
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, messageContent.value]
                                    ])
                                  ]),
                                  errorMessage.value ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "text-sm text-red-600 dark:text-red-400"
                                  }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true)
                                ]),
                                createVNode("div", { class: "mt-6 flex justify-start gap-3" }, [
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isLoading.value || !messageTitle.value.trim() || !messageContent.value.trim(),
                                    class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                  }, [
                                    isLoading.value ? (openBlock(), createBlock(LoadingSpinner, {
                                      key: 0,
                                      class: "w-5 h-5 text-white -ml-1 mr-2"
                                    })) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isLoading.value ? "جارٍ الإرسال..." : "إرسال الرسالة"), 1)
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
                                      createTextVNode(" إرسال رسالة خاصة إلى " + toDisplayString(((_a = __props.user) == null ? void 0 : _a.full_name) || ((_b = __props.user) == null ? void 0 : _b.auth_email)), 1)
                                    ];
                                  }),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(sendMessage, ["prevent"])
                                }, [
                                  createVNode("div", { class: "mt-4 space-y-4" }, [
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "message-title",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "عنوان الرسالة *"),
                                      withDirectives(createVNode("input", {
                                        type: "text",
                                        id: "message-title",
                                        "onUpdate:modelValue": ($event) => messageTitle.value = $event,
                                        required: "",
                                        class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelText, messageTitle.value]
                                      ])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("label", {
                                        for: "message-content",
                                        class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                      }, "محتوى الرسالة *"),
                                      withDirectives(createVNode("textarea", {
                                        id: "message-content",
                                        "onUpdate:modelValue": ($event) => messageContent.value = $event,
                                        rows: "6",
                                        required: "",
                                        placeholder: "اكتب رسالتك هنا...",
                                        class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelText, messageContent.value]
                                      ])
                                    ]),
                                    errorMessage.value ? (openBlock(), createBlock("p", {
                                      key: 0,
                                      class: "text-sm text-red-600 dark:text-red-400"
                                    }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true)
                                  ]),
                                  createVNode("div", { class: "mt-6 flex justify-start gap-3" }, [
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isLoading.value || !messageTitle.value.trim() || !messageContent.value.trim(),
                                      class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                    }, [
                                      isLoading.value ? (openBlock(), createBlock(LoadingSpinner, {
                                        key: 0,
                                        class: "w-5 h-5 text-white -ml-1 mr-2"
                                      })) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isLoading.value ? "جارٍ الإرسال..." : "إرسال الرسالة"), 1)
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
                                    createTextVNode(" إرسال رسالة خاصة إلى " + toDisplayString(((_a = __props.user) == null ? void 0 : _a.full_name) || ((_b = __props.user) == null ? void 0 : _b.auth_email)), 1)
                                  ];
                                }),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(sendMessage, ["prevent"])
                              }, [
                                createVNode("div", { class: "mt-4 space-y-4" }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "message-title",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "عنوان الرسالة *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "message-title",
                                      "onUpdate:modelValue": ($event) => messageTitle.value = $event,
                                      required: "",
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, messageTitle.value]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "message-content",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "محتوى الرسالة *"),
                                    withDirectives(createVNode("textarea", {
                                      id: "message-content",
                                      "onUpdate:modelValue": ($event) => messageContent.value = $event,
                                      rows: "6",
                                      required: "",
                                      placeholder: "اكتب رسالتك هنا...",
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, messageContent.value]
                                    ])
                                  ]),
                                  errorMessage.value ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "text-sm text-red-600 dark:text-red-400"
                                  }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true)
                                ]),
                                createVNode("div", { class: "mt-6 flex justify-start gap-3" }, [
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isLoading.value || !messageTitle.value.trim() || !messageContent.value.trim(),
                                    class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                  }, [
                                    isLoading.value ? (openBlock(), createBlock(LoadingSpinner, {
                                      key: 0,
                                      class: "w-5 h-5 text-white -ml-1 mr-2"
                                    })) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isLoading.value ? "جارٍ الإرسال..." : "إرسال الرسالة"), 1)
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
//# sourceMappingURL=SendMessageModal.vue2.mjs.map
