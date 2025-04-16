import { defineComponent, computed, unref, mergeProps, withCtx, createVNode, createBlock, openBlock } from "vue";
import { ssrRenderComponent, ssrRenderAttr } from "vue/server-renderer";
import { TransitionRoot, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/vue";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VideoPreviewModal",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean },
    videoUrl: {}
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const getYoutubeVideoId = (url) => {
      if (!url) return null;
      try {
        const urlObj = new URL(url);
        if (urlObj.hostname === "youtu.be") {
          return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.has("v")) {
          return urlObj.searchParams.get("v");
        }
      } catch (e) {
        const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/ ]{11})/;
        const match = url.match(regex);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    };
    const embedUrl = computed(() => {
      const videoId = getYoutubeVideoId(props.videoUrl);
      if (!videoId) return null;
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    });
    function closeModal() {
      emit("close");
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TransitionRoot), mergeProps({
        appear: "",
        show: _ctx.show,
        as: "template"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(unref(Dialog), {
              as: "div",
              onClose: closeModal,
              class: "relative z-[60]"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(TransitionChild), {
                    as: "div",
                    class: "fixed inset-0 bg-black/50 backdrop-blur-sm",
                    enter: "duration-200 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-150 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }, null, _parent3, _scopeId2));
                  _push3(`<div class="fixed inset-0 overflow-y-auto"${_scopeId2}><div class="flex min-h-full items-center justify-center p-4 text-center"${_scopeId2}>`);
                  _push3(ssrRenderComponent(unref(TransitionChild), {
                    as: "template",
                    enter: "duration-200 ease-out",
                    "enter-from": "opacity-0 scale-95",
                    "enter-to": "opacity-100 scale-100",
                    leave: "duration-150 ease-in",
                    "leave-from": "opacity-100 scale-100",
                    "leave-to": "opacity-0 scale-95"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-4 text-left align-middle shadow-xl transition-all" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex justify-between items-center"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`<span${_scopeId5}>معاينة الفيديو</span><button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"${_scopeId5}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"${_scopeId5}><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"${_scopeId5}></path></svg></button>`);
                                  } else {
                                    return [
                                      createVNode("span", null, "معاينة الفيديو"),
                                      createVNode("button", {
                                        onClick: closeModal,
                                        class: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                      }, [
                                        (openBlock(), createBlock("svg", {
                                          xmlns: "http://www.w3.org/2000/svg",
                                          fill: "none",
                                          viewBox: "0 0 24 24",
                                          "stroke-width": "1.5",
                                          stroke: "currentColor",
                                          class: "w-6 h-6"
                                        }, [
                                          createVNode("path", {
                                            "stroke-linecap": "round",
                                            "stroke-linejoin": "round",
                                            d: "M6 18 18 6M6 6l12 12"
                                          })
                                        ]))
                                      ])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<div class="mt-4 aspect-video"${_scopeId4}>`);
                              if (embedUrl.value) {
                                _push5(`<iframe${ssrRenderAttr("src", embedUrl.value)} frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen class="w-full h-full"${_scopeId4}></iframe>`);
                              } else {
                                _push5(`<div class="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500"${_scopeId4}> لا يمكن تحميل الفيديو. </div>`);
                              }
                              _push5(`</div>`);
                            } else {
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex justify-between items-center"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("span", null, "معاينة الفيديو"),
                                    createVNode("button", {
                                      onClick: closeModal,
                                      class: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                    }, [
                                      (openBlock(), createBlock("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        "stroke-width": "1.5",
                                        stroke: "currentColor",
                                        class: "w-6 h-6"
                                      }, [
                                        createVNode("path", {
                                          "stroke-linecap": "round",
                                          "stroke-linejoin": "round",
                                          d: "M6 18 18 6M6 6l12 12"
                                        })
                                      ]))
                                    ])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "mt-4 aspect-video" }, [
                                  embedUrl.value ? (openBlock(), createBlock("iframe", {
                                    key: 0,
                                    src: embedUrl.value,
                                    frameborder: "0",
                                    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                                    allowfullscreen: "",
                                    class: "w-full h-full"
                                  }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                                    key: 1,
                                    class: "w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500"
                                  }, " لا يمكن تحميل الفيديو. "))
                                ])
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-4 text-left align-middle shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex justify-between items-center"
                              }, {
                                default: withCtx(() => [
                                  createVNode("span", null, "معاينة الفيديو"),
                                  createVNode("button", {
                                    onClick: closeModal,
                                    class: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                  }, [
                                    (openBlock(), createBlock("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      fill: "none",
                                      viewBox: "0 0 24 24",
                                      "stroke-width": "1.5",
                                      stroke: "currentColor",
                                      class: "w-6 h-6"
                                    }, [
                                      createVNode("path", {
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                        d: "M6 18 18 6M6 6l12 12"
                                      })
                                    ]))
                                  ])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "mt-4 aspect-video" }, [
                                embedUrl.value ? (openBlock(), createBlock("iframe", {
                                  key: 0,
                                  src: embedUrl.value,
                                  frameborder: "0",
                                  allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                                  allowfullscreen: "",
                                  class: "w-full h-full"
                                }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                                  key: 1,
                                  class: "w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500"
                                }, " لا يمكن تحميل الفيديو. "))
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
                      as: "div",
                      class: "fixed inset-0 bg-black/50 backdrop-blur-sm",
                      enter: "duration-200 ease-out",
                      "enter-from": "opacity-0",
                      "enter-to": "opacity-100",
                      leave: "duration-150 ease-in",
                      "leave-from": "opacity-100",
                      "leave-to": "opacity-0"
                    }),
                    createVNode("div", { class: "fixed inset-0 overflow-y-auto" }, [
                      createVNode("div", { class: "flex min-h-full items-center justify-center p-4 text-center" }, [
                        createVNode(unref(TransitionChild), {
                          as: "template",
                          enter: "duration-200 ease-out",
                          "enter-from": "opacity-0 scale-95",
                          "enter-to": "opacity-100 scale-100",
                          leave: "duration-150 ease-in",
                          "leave-from": "opacity-100 scale-100",
                          "leave-to": "opacity-0 scale-95"
                        }, {
                          default: withCtx(() => [
                            createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-4 text-left align-middle shadow-xl transition-all" }, {
                              default: withCtx(() => [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex justify-between items-center"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("span", null, "معاينة الفيديو"),
                                    createVNode("button", {
                                      onClick: closeModal,
                                      class: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                    }, [
                                      (openBlock(), createBlock("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24",
                                        "stroke-width": "1.5",
                                        stroke: "currentColor",
                                        class: "w-6 h-6"
                                      }, [
                                        createVNode("path", {
                                          "stroke-linecap": "round",
                                          "stroke-linejoin": "round",
                                          d: "M6 18 18 6M6 6l12 12"
                                        })
                                      ]))
                                    ])
                                  ]),
                                  _: 1
                                }),
                                createVNode("div", { class: "mt-4 aspect-video" }, [
                                  embedUrl.value ? (openBlock(), createBlock("iframe", {
                                    key: 0,
                                    src: embedUrl.value,
                                    frameborder: "0",
                                    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                                    allowfullscreen: "",
                                    class: "w-full h-full"
                                  }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                                    key: 1,
                                    class: "w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500"
                                  }, " لا يمكن تحميل الفيديو. "))
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
                onClose: closeModal,
                class: "relative z-[60]"
              }, {
                default: withCtx(() => [
                  createVNode(unref(TransitionChild), {
                    as: "div",
                    class: "fixed inset-0 bg-black/50 backdrop-blur-sm",
                    enter: "duration-200 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-150 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }),
                  createVNode("div", { class: "fixed inset-0 overflow-y-auto" }, [
                    createVNode("div", { class: "flex min-h-full items-center justify-center p-4 text-center" }, [
                      createVNode(unref(TransitionChild), {
                        as: "template",
                        enter: "duration-200 ease-out",
                        "enter-from": "opacity-0 scale-95",
                        "enter-to": "opacity-100 scale-100",
                        leave: "duration-150 ease-in",
                        "leave-from": "opacity-100 scale-100",
                        "leave-to": "opacity-0 scale-95"
                      }, {
                        default: withCtx(() => [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-4 text-left align-middle shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 flex justify-between items-center"
                              }, {
                                default: withCtx(() => [
                                  createVNode("span", null, "معاينة الفيديو"),
                                  createVNode("button", {
                                    onClick: closeModal,
                                    class: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                                  }, [
                                    (openBlock(), createBlock("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      fill: "none",
                                      viewBox: "0 0 24 24",
                                      "stroke-width": "1.5",
                                      stroke: "currentColor",
                                      class: "w-6 h-6"
                                    }, [
                                      createVNode("path", {
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                        d: "M6 18 18 6M6 6l12 12"
                                      })
                                    ]))
                                  ])
                                ]),
                                _: 1
                              }),
                              createVNode("div", { class: "mt-4 aspect-video" }, [
                                embedUrl.value ? (openBlock(), createBlock("iframe", {
                                  key: 0,
                                  src: embedUrl.value,
                                  frameborder: "0",
                                  allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                                  allowfullscreen: "",
                                  class: "w-full h-full"
                                }, null, 8, ["src"])) : (openBlock(), createBlock("div", {
                                  key: 1,
                                  class: "w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500"
                                }, " لا يمكن تحميل الفيديو. "))
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
//# sourceMappingURL=VideoPreviewModal.vue2.mjs.map
