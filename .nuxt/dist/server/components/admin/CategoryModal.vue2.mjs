import { defineComponent, ref, computed, watch, unref, mergeProps, withCtx, createTextVNode, toDisplayString, createVNode, withModifiers, createBlock, createCommentVNode, withDirectives, vModelText, openBlock } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { TransitionRoot, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/vue";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "CategoryModal",
  __ssrInlineRender: true,
  props: {
    show: { type: Boolean },
    categoryData: {}
  },
  emits: ["close", "saved"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const supabase = useSupabaseClient();
    const form = ref({});
    const isSaving = ref(false);
    const errorMessage = ref(null);
    const isEditing = computed(() => !!props.categoryData && !!props.categoryData.id);
    watch(() => props.categoryData, (newData) => {
      if (newData) {
        form.value = { ...newData };
      } else {
        form.value = { name: "", description: "", type: "" };
      }
      errorMessage.value = null;
    }, { immediate: true, deep: true });
    function closeModal() {
      if (!isSaving.value) emit("close");
    }
    async function saveCategory() {
      var _a, _b;
      isSaving.value = true;
      errorMessage.value = null;
      if (!((_a = form.value.name) == null ? void 0 : _a.trim()) || !((_b = form.value.type) == null ? void 0 : _b.trim())) {
        errorMessage.value = "اسم الفئة ونوعها حقول مطلوبة.";
        isSaving.value = false;
        return;
      }
      const payload = {
        // Omit fields managed by DB
        name: form.value.name,
        description: form.value.description || null,
        type: form.value.type
      };
      try {
        let error;
        if (isEditing.value && form.value.id) {
          const result = await supabase.from("categories").update(payload).eq("id", form.value.id).select();
          error = result.error;
        } else {
          const result = await supabase.from("categories").insert(payload).select();
          error = result.error;
        }
        if (error) throw error;
        emit("saved");
      } catch (err) {
        console.error("Error saving category:", err);
        errorMessage.value = `فشل حفظ الفئة: ${err.message || "خطأ غير متوقع"}`;
      } finally {
        isSaving.value = false;
      }
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
              class: "relative z-50"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(unref(TransitionChild), {
                    as: "div",
                    class: "fixed inset-0 bg-black/30 backdrop-blur-sm",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }, null, _parent3, _scopeId2));
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
                        _push4(ssrRenderComponent(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 mb-4"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(isEditing.value ? "تعديل الفئة" : "إضافة فئة جديدة")}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(isEditing.value ? "تعديل الفئة" : "إضافة فئة جديدة"), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<form class="mt-4 space-y-4"${_scopeId4}><div${_scopeId4}><label for="cat-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300"${_scopeId4}>اسم الفئة *</label><input type="text" id="cat-name"${ssrRenderAttr("value", form.value.name)} required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"${_scopeId4}></div><div${_scopeId4}><label for="cat-description" class="block text-sm font-medium text-gray-700 dark:text-gray-300"${_scopeId4}>الوصف</label><textarea id="cat-description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"${_scopeId4}>${ssrInterpolate(form.value.description)}</textarea></div><div${_scopeId4}><label for="cat-type" class="block text-sm font-medium text-gray-700 dark:text-gray-300"${_scopeId4}>النوع *</label><input type="text" id="cat-type"${ssrRenderAttr("value", form.value.type)} required placeholder="مثل: lesson, study_course, book, sermon..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"${_scopeId4}><p class="mt-1 text-xs text-gray-500 dark:text-gray-400"${_scopeId4}>يُستخدم لتصنيف المحتوى العام (مطلوب).</p></div>`);
                              if (errorMessage.value) {
                                _push5(`<p class="text-sm text-red-600 dark:text-red-400"${_scopeId4}>خطأ: ${ssrInterpolate(errorMessage.value)}</p>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`<div class="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse"${_scopeId4}><button type="button" class="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"${_scopeId4}>إلغاء</button><button type="submit"${ssrIncludeBooleanAttr(isSaving.value) ? " disabled" : ""} class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"${_scopeId4}>`);
                              if (isSaving.value) {
                                _push5(`<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"${_scopeId4}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId4}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"${_scopeId4}></path></svg>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(` ${ssrInterpolate(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة الفئة")}</button></div></form>`);
                            } else {
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 mb-4"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(isEditing.value ? "تعديل الفئة" : "إضافة فئة جديدة"), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(saveCategory, ["prevent"]),
                                  class: "mt-4 space-y-4"
                                }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "cat-name",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "اسم الفئة *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "cat-name",
                                      "onUpdate:modelValue": ($event) => form.value.name = $event,
                                      required: "",
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.name]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "cat-description",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الوصف"),
                                    withDirectives(createVNode("textarea", {
                                      id: "cat-description",
                                      rows: "3",
                                      "onUpdate:modelValue": ($event) => form.value.description = $event,
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.description]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "cat-type",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "النوع *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "cat-type",
                                      "onUpdate:modelValue": ($event) => form.value.type = $event,
                                      required: "",
                                      placeholder: "مثل: lesson, study_course, book, sermon...",
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.type]
                                    ]),
                                    createVNode("p", { class: "mt-1 text-xs text-gray-500 dark:text-gray-400" }, "يُستخدم لتصنيف المحتوى العام (مطلوب).")
                                  ]),
                                  errorMessage.value ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "text-sm text-red-600 dark:text-red-400"
                                  }, "خطأ: " + toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                  createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse" }, [
                                    createVNode("button", {
                                      type: "button",
                                      onClick: closeModal,
                                      class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                    }, "إلغاء"),
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isSaving.value,
                                      class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                    }, [
                                      isSaving.value ? (openBlock(), createBlock("svg", {
                                        key: 0,
                                        class: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24"
                                      }, [
                                        createVNode("circle", {
                                          class: "opacity-25",
                                          cx: "12",
                                          cy: "12",
                                          r: "10",
                                          stroke: "currentColor",
                                          "stroke-width": "4"
                                        }),
                                        createVNode("path", {
                                          class: "opacity-75",
                                          fill: "currentColor",
                                          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        })
                                      ])) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة الفئة"), 1)
                                    ], 8, ["disabled"])
                                  ])
                                ], 32)
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 mb-4"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(isEditing.value ? "تعديل الفئة" : "إضافة فئة جديدة"), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(saveCategory, ["prevent"]),
                                class: "mt-4 space-y-4"
                              }, [
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "cat-name",
                                    class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                  }, "اسم الفئة *"),
                                  withDirectives(createVNode("input", {
                                    type: "text",
                                    id: "cat-name",
                                    "onUpdate:modelValue": ($event) => form.value.name = $event,
                                    required: "",
                                    class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.name]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "cat-description",
                                    class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                  }, "الوصف"),
                                  withDirectives(createVNode("textarea", {
                                    id: "cat-description",
                                    rows: "3",
                                    "onUpdate:modelValue": ($event) => form.value.description = $event,
                                    class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.description]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "cat-type",
                                    class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                  }, "النوع *"),
                                  withDirectives(createVNode("input", {
                                    type: "text",
                                    id: "cat-type",
                                    "onUpdate:modelValue": ($event) => form.value.type = $event,
                                    required: "",
                                    placeholder: "مثل: lesson, study_course, book, sermon...",
                                    class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.type]
                                  ]),
                                  createVNode("p", { class: "mt-1 text-xs text-gray-500 dark:text-gray-400" }, "يُستخدم لتصنيف المحتوى العام (مطلوب).")
                                ]),
                                errorMessage.value ? (openBlock(), createBlock("p", {
                                  key: 0,
                                  class: "text-sm text-red-600 dark:text-red-400"
                                }, "خطأ: " + toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse" }, [
                                  createVNode("button", {
                                    type: "button",
                                    onClick: closeModal,
                                    class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                  }, "إلغاء"),
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isSaving.value,
                                    class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                  }, [
                                    isSaving.value ? (openBlock(), createBlock("svg", {
                                      key: 0,
                                      class: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                      xmlns: "http://www.w3.org/2000/svg",
                                      fill: "none",
                                      viewBox: "0 0 24 24"
                                    }, [
                                      createVNode("circle", {
                                        class: "opacity-25",
                                        cx: "12",
                                        cy: "12",
                                        r: "10",
                                        stroke: "currentColor",
                                        "stroke-width": "4"
                                      }),
                                      createVNode("path", {
                                        class: "opacity-75",
                                        fill: "currentColor",
                                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      })
                                    ])) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة الفئة"), 1)
                                  ], 8, ["disabled"])
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
                      as: "div",
                      class: "fixed inset-0 bg-black/30 backdrop-blur-sm",
                      enter: "duration-300 ease-out",
                      "enter-from": "opacity-0",
                      "enter-to": "opacity-100",
                      leave: "duration-200 ease-in",
                      "leave-from": "opacity-100",
                      "leave-to": "opacity-0"
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
                            createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                              default: withCtx(() => [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 mb-4"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(isEditing.value ? "تعديل الفئة" : "إضافة فئة جديدة"), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(saveCategory, ["prevent"]),
                                  class: "mt-4 space-y-4"
                                }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "cat-name",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "اسم الفئة *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "cat-name",
                                      "onUpdate:modelValue": ($event) => form.value.name = $event,
                                      required: "",
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.name]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "cat-description",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "الوصف"),
                                    withDirectives(createVNode("textarea", {
                                      id: "cat-description",
                                      rows: "3",
                                      "onUpdate:modelValue": ($event) => form.value.description = $event,
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.description]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "cat-type",
                                      class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                    }, "النوع *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "cat-type",
                                      "onUpdate:modelValue": ($event) => form.value.type = $event,
                                      required: "",
                                      placeholder: "مثل: lesson, study_course, book, sermon...",
                                      class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, form.value.type]
                                    ]),
                                    createVNode("p", { class: "mt-1 text-xs text-gray-500 dark:text-gray-400" }, "يُستخدم لتصنيف المحتوى العام (مطلوب).")
                                  ]),
                                  errorMessage.value ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "text-sm text-red-600 dark:text-red-400"
                                  }, "خطأ: " + toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                  createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse" }, [
                                    createVNode("button", {
                                      type: "button",
                                      onClick: closeModal,
                                      class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                    }, "إلغاء"),
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: isSaving.value,
                                      class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                    }, [
                                      isSaving.value ? (openBlock(), createBlock("svg", {
                                        key: 0,
                                        class: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                        xmlns: "http://www.w3.org/2000/svg",
                                        fill: "none",
                                        viewBox: "0 0 24 24"
                                      }, [
                                        createVNode("circle", {
                                          class: "opacity-25",
                                          cx: "12",
                                          cy: "12",
                                          r: "10",
                                          stroke: "currentColor",
                                          "stroke-width": "4"
                                        }),
                                        createVNode("path", {
                                          class: "opacity-75",
                                          fill: "currentColor",
                                          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        })
                                      ])) : createCommentVNode("", true),
                                      createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة الفئة"), 1)
                                    ], 8, ["disabled"])
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
                class: "relative z-50"
              }, {
                default: withCtx(() => [
                  createVNode(unref(TransitionChild), {
                    as: "div",
                    class: "fixed inset-0 bg-black/30 backdrop-blur-sm",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
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
                          createVNode(unref(DialogPanel), { class: "w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-right shadow-xl transition-all" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 border-b pb-3 mb-4"
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(isEditing.value ? "تعديل الفئة" : "إضافة فئة جديدة"), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(saveCategory, ["prevent"]),
                                class: "mt-4 space-y-4"
                              }, [
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "cat-name",
                                    class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                  }, "اسم الفئة *"),
                                  withDirectives(createVNode("input", {
                                    type: "text",
                                    id: "cat-name",
                                    "onUpdate:modelValue": ($event) => form.value.name = $event,
                                    required: "",
                                    class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.name]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "cat-description",
                                    class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                  }, "الوصف"),
                                  withDirectives(createVNode("textarea", {
                                    id: "cat-description",
                                    rows: "3",
                                    "onUpdate:modelValue": ($event) => form.value.description = $event,
                                    class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.description]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "cat-type",
                                    class: "block text-sm font-medium text-gray-700 dark:text-gray-300"
                                  }, "النوع *"),
                                  withDirectives(createVNode("input", {
                                    type: "text",
                                    id: "cat-type",
                                    "onUpdate:modelValue": ($event) => form.value.type = $event,
                                    required: "",
                                    placeholder: "مثل: lesson, study_course, book, sermon...",
                                    class: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, form.value.type]
                                  ]),
                                  createVNode("p", { class: "mt-1 text-xs text-gray-500 dark:text-gray-400" }, "يُستخدم لتصنيف المحتوى العام (مطلوب).")
                                ]),
                                errorMessage.value ? (openBlock(), createBlock("p", {
                                  key: 0,
                                  class: "text-sm text-red-600 dark:text-red-400"
                                }, "خطأ: " + toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                createVNode("div", { class: "mt-6 pt-4 border-t dark:border-gray-700 flex justify-end space-x-3 rtl:space-x-reverse" }, [
                                  createVNode("button", {
                                    type: "button",
                                    onClick: closeModal,
                                    class: "inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                                  }, "إلغاء"),
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: isSaving.value,
                                    class: "inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50"
                                  }, [
                                    isSaving.value ? (openBlock(), createBlock("svg", {
                                      key: 0,
                                      class: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                                      xmlns: "http://www.w3.org/2000/svg",
                                      fill: "none",
                                      viewBox: "0 0 24 24"
                                    }, [
                                      createVNode("circle", {
                                        class: "opacity-25",
                                        cx: "12",
                                        cy: "12",
                                        r: "10",
                                        stroke: "currentColor",
                                        "stroke-width": "4"
                                      }),
                                      createVNode("path", {
                                        class: "opacity-75",
                                        fill: "currentColor",
                                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                      })
                                    ])) : createCommentVNode("", true),
                                    createTextVNode(" " + toDisplayString(isSaving.value ? "جاري الحفظ..." : isEditing.value ? "حفظ التعديلات" : "إضافة الفئة"), 1)
                                  ], 8, ["disabled"])
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
//# sourceMappingURL=CategoryModal.vue2.mjs.map
