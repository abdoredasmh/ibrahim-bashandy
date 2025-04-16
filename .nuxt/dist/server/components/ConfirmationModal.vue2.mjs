import { defineComponent, computed, unref, mergeProps, withCtx, createVNode, createBlock, createTextVNode, openBlock, toDisplayString } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass } from "vue/server-renderer";
import { TransitionRoot, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/vue";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ConfirmationModal",
  __ssrInlineRender: true,
  props: {
    isOpen: {
      // حالة الفتح/الإغلاق
      type: Boolean,
      required: true
    },
    title: {
      // عنوان المودال
      type: String,
      default: "تأكيد الإجراء"
    },
    message: {
      // الرسالة المعروضة للمستخدم
      type: String,
      required: true
    },
    confirmButtonText: {
      // نص زر التأكيد
      type: String,
      default: "تأكيد"
    },
    cancelButtonText: {
      // نص زر الإلغاء
      type: String,
      default: "إلغاء"
    },
    confirmButtonVariant: {
      // نوع زر التأكيد (للتحكم في الألوان)
      type: String,
      // تحديد الأنواع الممكنة
      default: "danger"
      // الافتراضي هو خطر (مثل الحذف)
    }
  },
  emits: ["confirm", "cancel"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const emitConfirm = () => {
      emit("confirm");
    };
    const emitCancel = () => {
      emit("cancel");
    };
    const confirmButtonClass = computed(() => {
      switch (props.confirmButtonVariant) {
        case "danger":
          return "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 border-transparent shadow-sm";
        case "primary":
          return "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 border-transparent shadow-sm";
        case "success":
          return "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 border-transparent shadow-sm";
        default:
          return "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 border-transparent shadow-sm";
      }
    });
    const cancelButtonClass = computed(() => {
      return "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 focus-visible:ring-gray-500 shadow-sm";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TransitionRoot), mergeProps({
        appear: "",
        show: __props.isOpen,
        as: "template"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Dialog), {
              as: "div",
              onClose: emitCancel,
              class: "relative z-50"
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
                        _push4(`<div class="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" data-v-b0ec62f0${_scopeId3}></div>`);
                      } else {
                        return [
                          createVNode("div", {
                            class: "fixed inset-0 bg-black/60 backdrop-blur-sm",
                            "aria-hidden": "true"
                          })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="fixed inset-0 overflow-y-auto" data-v-b0ec62f0${_scopeId2}><div class="flex min-h-full items-center justify-center p-4 text-center" data-v-b0ec62f0${_scopeId2}>`);
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
                        _push4(ssrRenderComponent(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all space-y-5 border dark:border-gray-700" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 border-b dark:border-gray-600 pb-3 flex items-center"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 me-2 text-red-600 dark:text-red-400" data-v-b0ec62f0${_scopeId5}><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" data-v-b0ec62f0${_scopeId5}></path></svg> ${ssrInterpolate(__props.title)}`);
                                  } else {
                                    return [
                                      (openBlock(), createBlock("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        "stroke-width": "1.5",
                                        stroke: "currentColor",
                                        class: "w-6 h-6 me-2 text-red-600 dark:text-red-400"
                                      }, [
                                        createVNode("path", {
                                          "stroke-linecap": "round",
                                          "stroke-linejoin": "round",
                                          d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                        })
                                      ])),
                                      createTextVNode(" " + toDisplayString(__props.title), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="mt-2" data-v-b0ec62f0${_scopeId4}><p class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line" data-v-b0ec62f0${_scopeId4}>${ssrInterpolate(__props.message)}</p></div><div class="mt-6 pt-4 border-t dark:border-gray-600 flex flex-col-reverse sm:flex-row sm:justify-start sm:space-x-3 sm:space-x-reverse gap-3" data-v-b0ec62f0${_scopeId4}><button type="button" class="${ssrRenderClass(["button-base w-full sm:w-auto justify-center", confirmButtonClass.value])}" data-v-b0ec62f0${_scopeId4}>${ssrInterpolate(__props.confirmButtonText)}</button><button type="button" class="${ssrRenderClass(["button-base w-full sm:w-auto justify-center", cancelButtonClass.value])}" data-v-b0ec62f0${_scopeId4}>${ssrInterpolate(__props.cancelButtonText)}</button></div>`);
                            } else {
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 border-b dark:border-gray-600 pb-3 flex items-center"
                                }, {
                                  default: withCtx(() => [
                                    (openBlock(), createBlock("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      fill: "none",
                                      viewBox: "0 0 24 24",
                                      "stroke-width": "1.5",
                                      stroke: "currentColor",
                                      class: "w-6 h-6 me-2 text-red-600 dark:text-red-400"
                                    }, [
                                      createVNode("path", {
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                        d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                      })
                                    ])),
                                    createTextVNode(" " + toDisplayString(__props.title), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "mt-2" }, [
                                  createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line" }, toDisplayString(__props.message), 1)
                                ]),
                                createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-600 flex flex-col-reverse sm:flex-row sm:justify-start sm:space-x-3 sm:space-x-reverse gap-3" }, [
                                  createVNode("button", {
                                    type: "button",
                                    onClick: emitConfirm,
                                    class: ["button-base w-full sm:w-auto justify-center", confirmButtonClass.value]
                                  }, toDisplayString(__props.confirmButtonText), 3),
                                  createVNode("button", {
                                    type: "button",
                                    onClick: emitCancel,
                                    class: ["button-base w-full sm:w-auto justify-center", cancelButtonClass.value],
                                    ref: "cancelButtonRef"
                                  }, toDisplayString(__props.cancelButtonText), 3)
                                ])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all space-y-5 border dark:border-gray-700" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 border-b dark:border-gray-600 pb-3 flex items-center"
                              }, {
                                default: withCtx(() => [
                                  (openBlock(), createBlock("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    "stroke-width": "1.5",
                                    stroke: "currentColor",
                                    class: "w-6 h-6 me-2 text-red-600 dark:text-red-400"
                                  }, [
                                    createVNode("path", {
                                      "stroke-linecap": "round",
                                      "stroke-linejoin": "round",
                                      d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                    })
                                  ])),
                                  createTextVNode(" " + toDisplayString(__props.title), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "mt-2" }, [
                                createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line" }, toDisplayString(__props.message), 1)
                              ]),
                              createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-600 flex flex-col-reverse sm:flex-row sm:justify-start sm:space-x-3 sm:space-x-reverse gap-3" }, [
                                createVNode("button", {
                                  type: "button",
                                  onClick: emitConfirm,
                                  class: ["button-base w-full sm:w-auto justify-center", confirmButtonClass.value]
                                }, toDisplayString(__props.confirmButtonText), 3),
                                createVNode("button", {
                                  type: "button",
                                  onClick: emitCancel,
                                  class: ["button-base w-full sm:w-auto justify-center", cancelButtonClass.value],
                                  ref: "cancelButtonRef"
                                }, toDisplayString(__props.cancelButtonText), 3)
                              ])
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
                        createVNode("div", {
                          class: "fixed inset-0 bg-black/60 backdrop-blur-sm",
                          "aria-hidden": "true"
                        })
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
                            createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all space-y-5 border dark:border-gray-700" }, {
                              default: withCtx(() => [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 border-b dark:border-gray-600 pb-3 flex items-center"
                                }, {
                                  default: withCtx(() => [
                                    (openBlock(), createBlock("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      fill: "none",
                                      viewBox: "0 0 24 24",
                                      "stroke-width": "1.5",
                                      stroke: "currentColor",
                                      class: "w-6 h-6 me-2 text-red-600 dark:text-red-400"
                                    }, [
                                      createVNode("path", {
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                        d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                      })
                                    ])),
                                    createTextVNode(" " + toDisplayString(__props.title), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "mt-2" }, [
                                  createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line" }, toDisplayString(__props.message), 1)
                                ]),
                                createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-600 flex flex-col-reverse sm:flex-row sm:justify-start sm:space-x-3 sm:space-x-reverse gap-3" }, [
                                  createVNode("button", {
                                    type: "button",
                                    onClick: emitConfirm,
                                    class: ["button-base w-full sm:w-auto justify-center", confirmButtonClass.value]
                                  }, toDisplayString(__props.confirmButtonText), 3),
                                  createVNode("button", {
                                    type: "button",
                                    onClick: emitCancel,
                                    class: ["button-base w-full sm:w-auto justify-center", cancelButtonClass.value],
                                    ref: "cancelButtonRef"
                                  }, toDisplayString(__props.cancelButtonText), 3)
                                ])
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
                onClose: emitCancel,
                class: "relative z-50"
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
                      createVNode("div", {
                        class: "fixed inset-0 bg-black/60 backdrop-blur-sm",
                        "aria-hidden": "true"
                      })
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
                          createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all space-y-5 border dark:border-gray-700" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100 border-b dark:border-gray-600 pb-3 flex items-center"
                              }, {
                                default: withCtx(() => [
                                  (openBlock(), createBlock("svg", {
                                    xmlns: "http://www.w3.org/2000/svg",
                                    fill: "none",
                                    viewBox: "0 0 24 24",
                                    "stroke-width": "1.5",
                                    stroke: "currentColor",
                                    class: "w-6 h-6 me-2 text-red-600 dark:text-red-400"
                                  }, [
                                    createVNode("path", {
                                      "stroke-linecap": "round",
                                      "stroke-linejoin": "round",
                                      d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                                    })
                                  ])),
                                  createTextVNode(" " + toDisplayString(__props.title), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "mt-2" }, [
                                createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line" }, toDisplayString(__props.message), 1)
                              ]),
                              createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-600 flex flex-col-reverse sm:flex-row sm:justify-start sm:space-x-3 sm:space-x-reverse gap-3" }, [
                                createVNode("button", {
                                  type: "button",
                                  onClick: emitConfirm,
                                  class: ["button-base w-full sm:w-auto justify-center", confirmButtonClass.value]
                                }, toDisplayString(__props.confirmButtonText), 3),
                                createVNode("button", {
                                  type: "button",
                                  onClick: emitCancel,
                                  class: ["button-base w-full sm:w-auto justify-center", cancelButtonClass.value],
                                  ref: "cancelButtonRef"
                                }, toDisplayString(__props.cancelButtonText), 3)
                              ])
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
//# sourceMappingURL=ConfirmationModal.vue2.mjs.map
