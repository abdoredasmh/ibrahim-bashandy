import { defineComponent, ref, watch, unref, mergeProps, withCtx, createVNode, createTextVNode, toDisplayString } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderClass } from "vue/server-renderer";
import { TransitionRoot, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/vue";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ConfirmationModal",
  __ssrInlineRender: true,
  props: {
    config: {},
    modelValue: { type: Boolean }
  },
  emits: ["confirm", "close", "update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const isOpen = ref(props.modelValue ?? false);
    watch(() => props.modelValue, (newVal) => {
      if (newVal !== void 0) {
        isOpen.value = newVal;
      }
    });
    watch(() => props.config, (newConfig) => {
      if (newConfig) {
        isOpen.value = true;
      }
    }, { immediate: true });
    function closeModal() {
      isOpen.value = false;
      emit("update:modelValue", false);
      emit("close");
    }
    function confirmAction() {
      emit("confirm");
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
                        _push4(ssrRenderComponent(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            var _a, _b, _c, _d, _e, _f, _g, _h;
                            if (_push5) {
                              _push5(ssrRenderComponent(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  var _a2, _b2;
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(((_a2 = _ctx.config) == null ? void 0 : _a2.title) || "تأكيد الإجراء")}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(((_b2 = _ctx.config) == null ? void 0 : _b2.title) || "تأكيد الإجراء"), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="mt-3"${_scopeId4}><p class="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap"${_scopeId4}>${ssrInterpolate(((_a = _ctx.config) == null ? void 0 : _a.message) || "هل أنت متأكد من رغبتك في المتابعة؟")}</p></div><div class="mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3 justify-center sm:justify-start"${_scopeId4}><button type="button" class="${ssrRenderClass(["inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800", ((_b = _ctx.config) == null ? void 0 : _b.confirmClass) || "bg-red-600 hover:bg-red-700 focus:ring-red-500"])}"${_scopeId4}>${ssrInterpolate(((_c = _ctx.config) == null ? void 0 : _c.confirmText) || "تأكيد")}</button><button type="button" class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"${_scopeId4}>${ssrInterpolate(((_d = _ctx.config) == null ? void 0 : _d.cancelText) || "إلغاء")}</button></div>`);
                            } else {
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                                }, {
                                  default: withCtx(() => {
                                    var _a2;
                                    return [
                                      createTextVNode(toDisplayString(((_a2 = _ctx.config) == null ? void 0 : _a2.title) || "تأكيد الإجراء"), 1)
                                    ];
                                  }),
                                  _: 1
                                }),
                                createVNode("div", { class: "mt-3" }, [
                                  createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap" }, toDisplayString(((_e = _ctx.config) == null ? void 0 : _e.message) || "هل أنت متأكد من رغبتك في المتابعة؟"), 1)
                                ]),
                                createVNode("div", { class: "mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3 justify-center sm:justify-start" }, [
                                  createVNode("button", {
                                    type: "button",
                                    class: ["inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800", ((_f = _ctx.config) == null ? void 0 : _f.confirmClass) || "bg-red-600 hover:bg-red-700 focus:ring-red-500"],
                                    onClick: confirmAction
                                  }, toDisplayString(((_g = _ctx.config) == null ? void 0 : _g.confirmText) || "تأكيد"), 3),
                                  createVNode("button", {
                                    type: "button",
                                    class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                    onClick: closeModal
                                  }, toDisplayString(((_h = _ctx.config) == null ? void 0 : _h.cancelText) || "إلغاء"), 1)
                                ])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => {
                              var _a, _b, _c, _d;
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                                }, {
                                  default: withCtx(() => {
                                    var _a2;
                                    return [
                                      createTextVNode(toDisplayString(((_a2 = _ctx.config) == null ? void 0 : _a2.title) || "تأكيد الإجراء"), 1)
                                    ];
                                  }),
                                  _: 1
                                }),
                                createVNode("div", { class: "mt-3" }, [
                                  createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap" }, toDisplayString(((_a = _ctx.config) == null ? void 0 : _a.message) || "هل أنت متأكد من رغبتك في المتابعة؟"), 1)
                                ]),
                                createVNode("div", { class: "mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3 justify-center sm:justify-start" }, [
                                  createVNode("button", {
                                    type: "button",
                                    class: ["inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800", ((_b = _ctx.config) == null ? void 0 : _b.confirmClass) || "bg-red-600 hover:bg-red-700 focus:ring-red-500"],
                                    onClick: confirmAction
                                  }, toDisplayString(((_c = _ctx.config) == null ? void 0 : _c.confirmText) || "تأكيد"), 3),
                                  createVNode("button", {
                                    type: "button",
                                    class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                    onClick: closeModal
                                  }, toDisplayString(((_d = _ctx.config) == null ? void 0 : _d.cancelText) || "إلغاء"), 1)
                                ])
                              ];
                            }),
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
                            createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                              default: withCtx(() => {
                                var _a, _b, _c, _d;
                                return [
                                  createVNode(unref(DialogTitle), {
                                    as: "h3",
                                    class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                                  }, {
                                    default: withCtx(() => {
                                      var _a2;
                                      return [
                                        createTextVNode(toDisplayString(((_a2 = _ctx.config) == null ? void 0 : _a2.title) || "تأكيد الإجراء"), 1)
                                      ];
                                    }),
                                    _: 1
                                  }),
                                  createVNode("div", { class: "mt-3" }, [
                                    createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap" }, toDisplayString(((_a = _ctx.config) == null ? void 0 : _a.message) || "هل أنت متأكد من رغبتك في المتابعة؟"), 1)
                                  ]),
                                  createVNode("div", { class: "mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3 justify-center sm:justify-start" }, [
                                    createVNode("button", {
                                      type: "button",
                                      class: ["inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800", ((_b = _ctx.config) == null ? void 0 : _b.confirmClass) || "bg-red-600 hover:bg-red-700 focus:ring-red-500"],
                                      onClick: confirmAction
                                    }, toDisplayString(((_c = _ctx.config) == null ? void 0 : _c.confirmText) || "تأكيد"), 3),
                                    createVNode("button", {
                                      type: "button",
                                      class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                      onClick: closeModal
                                    }, toDisplayString(((_d = _ctx.config) == null ? void 0 : _d.cancelText) || "إلغاء"), 1)
                                  ])
                                ];
                              }),
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
                          createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => {
                              var _a, _b, _c, _d;
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                                }, {
                                  default: withCtx(() => {
                                    var _a2;
                                    return [
                                      createTextVNode(toDisplayString(((_a2 = _ctx.config) == null ? void 0 : _a2.title) || "تأكيد الإجراء"), 1)
                                    ];
                                  }),
                                  _: 1
                                }),
                                createVNode("div", { class: "mt-3" }, [
                                  createVNode("p", { class: "text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap" }, toDisplayString(((_a = _ctx.config) == null ? void 0 : _a.message) || "هل أنت متأكد من رغبتك في المتابعة؟"), 1)
                                ]),
                                createVNode("div", { class: "mt-5 sm:mt-6 flex flex-col sm:flex-row-reverse gap-3 justify-center sm:justify-start" }, [
                                  createVNode("button", {
                                    type: "button",
                                    class: ["inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800", ((_b = _ctx.config) == null ? void 0 : _b.confirmClass) || "bg-red-600 hover:bg-red-700 focus:ring-red-500"],
                                    onClick: confirmAction
                                  }, toDisplayString(((_c = _ctx.config) == null ? void 0 : _c.confirmText) || "تأكيد"), 3),
                                  createVNode("button", {
                                    type: "button",
                                    class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800",
                                    onClick: closeModal
                                  }, toDisplayString(((_d = _ctx.config) == null ? void 0 : _d.cancelText) || "إلغاء"), 1)
                                ])
                              ];
                            }),
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
