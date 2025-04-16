import { defineComponent, ref, reactive, unref, mergeProps, withCtx, createVNode, createBlock, openBlock, toDisplayString, withModifiers, createCommentVNode, withDirectives, vModelText, vModelCheckbox, Fragment, renderList, vModelSelect, createTextVNode } from "vue";
import { ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from "vue/server-renderer";
import { TransitionRoot, Dialog, TransitionChild, DialogPanel, DialogTitle } from "@headlessui/vue";
import { useSupabaseClient } from "../../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const STORAGE_BUCKET_NAME = "book-files";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BookEditModal",
  __ssrInlineRender: true,
  props: {
    book: {},
    lessons: {}
  },
  emits: ["close", "book-updated"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const supabase = useSupabaseClient();
    const formLoading = ref(false);
    const errorMessage = ref("");
    const newBookFile = ref(null);
    const initialData = reactive({ ...props.book });
    const formData = reactive({
      title: "",
      description: "",
      is_research: false,
      is_transcript: false,
      linked_lesson_id: null,
      cover_image_url: null
      // Add if you manage cover images
    });
    function handleFileChange(event) {
      const target = event.target;
      if (target.files && target.files[0]) {
        if (target.files[0].type === "application/pdf") {
          newBookFile.value = target.files[0];
          errorMessage.value = "";
        } else {
          newBookFile.value = null;
          target.value = "";
          errorMessage.value = "الرجاء اختيار ملف PDF فقط.";
        }
      } else {
        newBookFile.value = null;
      }
    }
    async function handleSubmit() {
      formLoading.value = true;
      errorMessage.value = "";
      let updatedStoragePath = initialData.storage_path;
      const oldStoragePath = initialData.storage_path;
      try {
        if (newBookFile.value) {
          const file = newBookFile.value;
          const fileExt = file.name.split(".").pop();
          const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
          const filePath = `public/${uniqueFileName}`;
          console.log(`Attempting to upload new file to: ${filePath}`);
          const { data: uploadData, error: uploadError } = await supabase.storage.from(STORAGE_BUCKET_NAME).upload(filePath, file);
          if (uploadError) throw new Error(`فشل رفع الملف الجديد: ${uploadError.message}`);
          updatedStoragePath = uploadData.path;
          console.log(`New file uploaded successfully: ${updatedStoragePath}`);
          if (oldStoragePath && oldStoragePath !== updatedStoragePath) {
            console.log(`Attempting to remove old file: ${oldStoragePath}`);
            const { error: deleteError } = await supabase.storage.from(STORAGE_BUCKET_NAME).remove([oldStoragePath]);
            if (deleteError) {
              console.warn(`Could not delete old file ${oldStoragePath}:`, deleteError.message);
              alert(`تم تحديث بيانات الكتاب ورفع الملف الجديد، ولكن فشل حذف الملف القديم (${oldStoragePath}) من التخزين.`);
            } else {
              console.log(`Old file ${oldStoragePath} removed successfully.`);
            }
          }
        }
        const bookDataToUpdate = {
          ...formData,
          storage_path: updatedStoragePath
          // Use the potentially updated path
          // cover_image_url: // Add updated cover URL if applicable
        };
        if (bookDataToUpdate.linked_lesson_id === "") {
          bookDataToUpdate.linked_lesson_id = null;
        }
        console.log(`Updating book ID ${initialData.id} with data:`, bookDataToUpdate);
        const { error: updateError } = await supabase.from("books").update(bookDataToUpdate).eq("id", initialData.id);
        if (updateError) {
          console.error("DB Update Error:", updateError);
          if (newBookFile.value && updatedStoragePath) {
            console.error(`CRITICAL: DB update failed after uploading new file: ${updatedStoragePath}. Manual cleanup of this file might be needed.`);
          }
          throw new Error(`فشل تحديث بيانات الكتاب: ${updateError.message}`);
        }
        console.log("Book updated successfully!");
        emit("book-updated");
        emit("close");
      } catch (err) {
        console.error("Error in handleSubmit (Edit):", err);
        errorMessage.value = err.message || "حدث خطأ غير متوقع.";
      } finally {
        formLoading.value = false;
      }
    }
    function closeModal() {
      if (!formLoading.value) {
        emit("close");
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(TransitionRoot), mergeProps({
        appear: "",
        show: true,
        as: "div"
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
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75" data-v-b4948731${_scopeId3}></div>`);
                      } else {
                        return [
                          createVNode("div", { class: "fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75" })
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(`<div class="fixed inset-0 overflow-y-auto" data-v-b4948731${_scopeId2}><div class="flex min-h-full items-center justify-center p-4 text-center" data-v-b4948731${_scopeId2}>`);
                  _push3(ssrRenderComponent(unref(TransitionChild), {
                    as: "div",
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0 scale-95",
                    "enter-to": "opacity-100 scale-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100 scale-100",
                    "leave-to": "opacity-0 scale-95"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-2xl bg-beige-light dark:bg-cream-gray p-6 text-end shadow-xl transition-all flex flex-col max-h-[90vh]" }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-brown-dark dark:text-brown-dark mb-4 flex justify-between items-center flex-shrink-0"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`<button type="button" class="button-close" aria-label="إغلاق" data-v-b4948731${_scopeId5}><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" data-v-b4948731${_scopeId5}><title data-v-b4948731${_scopeId5}>إغلاق</title><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" data-v-b4948731${_scopeId5}></path></svg><span class="hidden sm:inline ms-1" data-v-b4948731${_scopeId5}>إغلاق</span></button><span class="truncate" data-v-b4948731${_scopeId5}>تعديل الكتاب: ${ssrInterpolate(initialData.title)}</span>`);
                                  } else {
                                    return [
                                      createVNode("button", {
                                        type: "button",
                                        class: "button-close",
                                        onClick: closeModal,
                                        "aria-label": "إغلاق"
                                      }, [
                                        (openBlock(), createBlock("svg", {
                                          xmlns: "http://www.w3.org/2000/svg",
                                          class: "w-5 h-5",
                                          fill: "currentColor",
                                          viewBox: "0 0 20 20"
                                        }, [
                                          createVNode("title", null, "إغلاق"),
                                          createVNode("path", {
                                            "fill-rule": "evenodd",
                                            d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                            "clip-rule": "evenodd"
                                          })
                                        ])),
                                        createVNode("span", { class: "hidden sm:inline ms-1" }, "إغلاق")
                                      ]),
                                      createVNode("span", { class: "truncate" }, "تعديل الكتاب: " + toDisplayString(initialData.title), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(`<form class="mt-2 flex-grow space-y-4 overflow-y-auto px-1" data-v-b4948731${_scopeId4}><div data-v-b4948731${_scopeId4}><label for="edit-book-title" class="form-label" data-v-b4948731${_scopeId4}>العنوان *</label><input type="text" id="edit-book-title"${ssrRenderAttr("value", formData.title)} required class="form-input" data-v-b4948731${_scopeId4}></div><div data-v-b4948731${_scopeId4}><label for="edit-book-description" class="form-label" data-v-b4948731${_scopeId4}>الوصف</label><textarea id="edit-book-description" rows="3" class="form-input" data-v-b4948731${_scopeId4}>${ssrInterpolate(formData.description)}</textarea></div><div class="flex space-x-4 rtl:space-x-reverse" data-v-b4948731${_scopeId4}><div class="flex items-center" data-v-b4948731${_scopeId4}><input id="edit-is_research"${ssrIncludeBooleanAttr(Array.isArray(formData.is_research) ? ssrLooseContain(formData.is_research, null) : formData.is_research) ? " checked" : ""} type="checkbox" class="form-checkbox" data-v-b4948731${_scopeId4}><label for="edit-is_research" class="ms-2 form-label-inline" data-v-b4948731${_scopeId4}>هل هو بحث؟</label></div><div class="flex items-center" data-v-b4948731${_scopeId4}><input id="edit-is_transcript"${ssrIncludeBooleanAttr(Array.isArray(formData.is_transcript) ? ssrLooseContain(formData.is_transcript, null) : formData.is_transcript) ? " checked" : ""} type="checkbox" class="form-checkbox" data-v-b4948731${_scopeId4}><label for="edit-is_transcript" class="ms-2 form-label-inline" data-v-b4948731${_scopeId4}>هل هو تفريغ؟</label></div></div><div data-v-b4948731${_scopeId4}><label for="edit-linked-lesson" class="form-label" data-v-b4948731${_scopeId4}>ربط بدرس (اختياري)</label><select id="edit-linked-lesson" class="form-select" data-v-b4948731${_scopeId4}><option${ssrRenderAttr("value", null)} data-v-b4948731${ssrIncludeBooleanAttr(Array.isArray(formData.linked_lesson_id) ? ssrLooseContain(formData.linked_lesson_id, null) : ssrLooseEqual(formData.linked_lesson_id, null)) ? " selected" : ""}${_scopeId4}>-- لا يوجد ربط --</option><!--[-->`);
                              ssrRenderList(_ctx.lessons, (lesson) => {
                                _push5(`<option${ssrRenderAttr("value", lesson.id)} data-v-b4948731${ssrIncludeBooleanAttr(Array.isArray(formData.linked_lesson_id) ? ssrLooseContain(formData.linked_lesson_id, lesson.id) : ssrLooseEqual(formData.linked_lesson_id, lesson.id)) ? " selected" : ""}${_scopeId4}>${ssrInterpolate(lesson.title)}</option>`);
                              });
                              _push5(`<!--]--></select></div><div data-v-b4948731${_scopeId4}><label for="edit-book-file" class="form-label" data-v-b4948731${_scopeId4}> ملف الكتاب (PDF) <span class="text-xs text-gray-500 dark:text-gray-400" data-v-b4948731${_scopeId4}>(اختياري: اختر ملفًا جديدًا لاستبدال الملف الحالي)</span></label><input type="file" id="edit-book-file" accept=".pdf" class="form-file-input" data-v-b4948731${_scopeId4}>`);
                              if (newBookFile.value) {
                                _push5(`<p class="mt-1 text-xs text-indigo-600 dark:text-indigo-400" data-v-b4948731${_scopeId4}>الملف الجديد المختار: ${ssrInterpolate(newBookFile.value.name)}</p>`);
                              } else if (initialData.storage_path) {
                                _push5(`<p class="mt-1 text-xs text-green-600 dark:text-green-400" data-v-b4948731${_scopeId4}>الملف الحالي: ${ssrInterpolate(initialData.storage_path.split("/").pop())}</p>`);
                              } else {
                                _push5(`<p class="mt-1 text-xs text-red-500 dark:text-red-400" data-v-b4948731${_scopeId4}>لا يوجد ملف مرفق حاليًا.</p>`);
                              }
                              _push5(`</div>`);
                              if (errorMessage.value) {
                                _push5(`<div class="text-red-600 dark:text-red-400 text-sm bg-red-100 dark:bg-red-900/30 p-3 rounded-md" data-v-b4948731${_scopeId4}>${ssrInterpolate(errorMessage.value)}</div>`);
                              } else {
                                _push5(`<!---->`);
                              }
                              _push5(`<div class="pt-4 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700 flex-shrink-0" data-v-b4948731${_scopeId4}><button type="button"${ssrIncludeBooleanAttr(formLoading.value) ? " disabled" : ""} class="button-secondary" data-v-b4948731${_scopeId4}> إلغاء </button><button type="submit"${ssrIncludeBooleanAttr(formLoading.value) ? " disabled" : ""} class="button-primary" data-v-b4948731${_scopeId4}>`);
                              if (formLoading.value) {
                                _push5(`<span data-v-b4948731${_scopeId4}>جاري الحفظ...</span>`);
                              } else {
                                _push5(`<span data-v-b4948731${_scopeId4}>حفظ التعديلات</span>`);
                              }
                              _push5(`</button></div></form>`);
                            } else {
                              return [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-brown-dark dark:text-brown-dark mb-4 flex justify-between items-center flex-shrink-0"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("button", {
                                      type: "button",
                                      class: "button-close",
                                      onClick: closeModal,
                                      "aria-label": "إغلاق"
                                    }, [
                                      (openBlock(), createBlock("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        class: "w-5 h-5",
                                        fill: "currentColor",
                                        viewBox: "0 0 20 20"
                                      }, [
                                        createVNode("title", null, "إغلاق"),
                                        createVNode("path", {
                                          "fill-rule": "evenodd",
                                          d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                          "clip-rule": "evenodd"
                                        })
                                      ])),
                                      createVNode("span", { class: "hidden sm:inline ms-1" }, "إغلاق")
                                    ]),
                                    createVNode("span", { class: "truncate" }, "تعديل الكتاب: " + toDisplayString(initialData.title), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(handleSubmit, ["prevent"]),
                                  class: "mt-2 flex-grow space-y-4 overflow-y-auto px-1"
                                }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "edit-book-title",
                                      class: "form-label"
                                    }, "العنوان *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "edit-book-title",
                                      "onUpdate:modelValue": ($event) => formData.title = $event,
                                      required: "",
                                      class: "form-input"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, formData.title]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "edit-book-description",
                                      class: "form-label"
                                    }, "الوصف"),
                                    withDirectives(createVNode("textarea", {
                                      id: "edit-book-description",
                                      "onUpdate:modelValue": ($event) => formData.description = $event,
                                      rows: "3",
                                      class: "form-input"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, formData.description]
                                    ])
                                  ]),
                                  createVNode("div", { class: "flex space-x-4 rtl:space-x-reverse" }, [
                                    createVNode("div", { class: "flex items-center" }, [
                                      withDirectives(createVNode("input", {
                                        id: "edit-is_research",
                                        "onUpdate:modelValue": ($event) => formData.is_research = $event,
                                        type: "checkbox",
                                        class: "form-checkbox"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelCheckbox, formData.is_research]
                                      ]),
                                      createVNode("label", {
                                        for: "edit-is_research",
                                        class: "ms-2 form-label-inline"
                                      }, "هل هو بحث؟")
                                    ]),
                                    createVNode("div", { class: "flex items-center" }, [
                                      withDirectives(createVNode("input", {
                                        id: "edit-is_transcript",
                                        "onUpdate:modelValue": ($event) => formData.is_transcript = $event,
                                        type: "checkbox",
                                        class: "form-checkbox"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelCheckbox, formData.is_transcript]
                                      ]),
                                      createVNode("label", {
                                        for: "edit-is_transcript",
                                        class: "ms-2 form-label-inline"
                                      }, "هل هو تفريغ؟")
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "edit-linked-lesson",
                                      class: "form-label"
                                    }, "ربط بدرس (اختياري)"),
                                    withDirectives(createVNode("select", {
                                      id: "edit-linked-lesson",
                                      "onUpdate:modelValue": ($event) => formData.linked_lesson_id = $event,
                                      class: "form-select"
                                    }, [
                                      createVNode("option", { value: null }, "-- لا يوجد ربط --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(_ctx.lessons, (lesson) => {
                                        return openBlock(), createBlock("option", {
                                          key: lesson.id,
                                          value: lesson.id
                                        }, toDisplayString(lesson.title), 9, ["value"]);
                                      }), 128))
                                    ], 8, ["onUpdate:modelValue"]), [
                                      [vModelSelect, formData.linked_lesson_id]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "edit-book-file",
                                      class: "form-label"
                                    }, [
                                      createTextVNode(" ملف الكتاب (PDF) "),
                                      createVNode("span", { class: "text-xs text-gray-500 dark:text-gray-400" }, "(اختياري: اختر ملفًا جديدًا لاستبدال الملف الحالي)")
                                    ]),
                                    createVNode("input", {
                                      type: "file",
                                      id: "edit-book-file",
                                      onChange: handleFileChange,
                                      accept: ".pdf",
                                      class: "form-file-input"
                                    }, null, 32),
                                    newBookFile.value ? (openBlock(), createBlock("p", {
                                      key: 0,
                                      class: "mt-1 text-xs text-indigo-600 dark:text-indigo-400"
                                    }, "الملف الجديد المختار: " + toDisplayString(newBookFile.value.name), 1)) : initialData.storage_path ? (openBlock(), createBlock("p", {
                                      key: 1,
                                      class: "mt-1 text-xs text-green-600 dark:text-green-400"
                                    }, "الملف الحالي: " + toDisplayString(initialData.storage_path.split("/").pop()), 1)) : (openBlock(), createBlock("p", {
                                      key: 2,
                                      class: "mt-1 text-xs text-red-500 dark:text-red-400"
                                    }, "لا يوجد ملف مرفق حاليًا."))
                                  ]),
                                  errorMessage.value ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "text-red-600 dark:text-red-400 text-sm bg-red-100 dark:bg-red-900/30 p-3 rounded-md"
                                  }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                  createVNode("div", { class: "pt-4 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700 flex-shrink-0" }, [
                                    createVNode("button", {
                                      type: "button",
                                      onClick: closeModal,
                                      disabled: formLoading.value,
                                      class: "button-secondary"
                                    }, " إلغاء ", 8, ["disabled"]),
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: formLoading.value,
                                      class: "button-primary"
                                    }, [
                                      formLoading.value ? (openBlock(), createBlock("span", { key: 0 }, "جاري الحفظ...")) : (openBlock(), createBlock("span", { key: 1 }, "حفظ التعديلات"))
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
                          createVNode(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-2xl bg-beige-light dark:bg-cream-gray p-6 text-end shadow-xl transition-all flex flex-col max-h-[90vh]" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-brown-dark dark:text-brown-dark mb-4 flex justify-between items-center flex-shrink-0"
                              }, {
                                default: withCtx(() => [
                                  createVNode("button", {
                                    type: "button",
                                    class: "button-close",
                                    onClick: closeModal,
                                    "aria-label": "إغلاق"
                                  }, [
                                    (openBlock(), createBlock("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      class: "w-5 h-5",
                                      fill: "currentColor",
                                      viewBox: "0 0 20 20"
                                    }, [
                                      createVNode("title", null, "إغلاق"),
                                      createVNode("path", {
                                        "fill-rule": "evenodd",
                                        d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                        "clip-rule": "evenodd"
                                      })
                                    ])),
                                    createVNode("span", { class: "hidden sm:inline ms-1" }, "إغلاق")
                                  ]),
                                  createVNode("span", { class: "truncate" }, "تعديل الكتاب: " + toDisplayString(initialData.title), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(handleSubmit, ["prevent"]),
                                class: "mt-2 flex-grow space-y-4 overflow-y-auto px-1"
                              }, [
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "edit-book-title",
                                    class: "form-label"
                                  }, "العنوان *"),
                                  withDirectives(createVNode("input", {
                                    type: "text",
                                    id: "edit-book-title",
                                    "onUpdate:modelValue": ($event) => formData.title = $event,
                                    required: "",
                                    class: "form-input"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, formData.title]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "edit-book-description",
                                    class: "form-label"
                                  }, "الوصف"),
                                  withDirectives(createVNode("textarea", {
                                    id: "edit-book-description",
                                    "onUpdate:modelValue": ($event) => formData.description = $event,
                                    rows: "3",
                                    class: "form-input"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, formData.description]
                                  ])
                                ]),
                                createVNode("div", { class: "flex space-x-4 rtl:space-x-reverse" }, [
                                  createVNode("div", { class: "flex items-center" }, [
                                    withDirectives(createVNode("input", {
                                      id: "edit-is_research",
                                      "onUpdate:modelValue": ($event) => formData.is_research = $event,
                                      type: "checkbox",
                                      class: "form-checkbox"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelCheckbox, formData.is_research]
                                    ]),
                                    createVNode("label", {
                                      for: "edit-is_research",
                                      class: "ms-2 form-label-inline"
                                    }, "هل هو بحث؟")
                                  ]),
                                  createVNode("div", { class: "flex items-center" }, [
                                    withDirectives(createVNode("input", {
                                      id: "edit-is_transcript",
                                      "onUpdate:modelValue": ($event) => formData.is_transcript = $event,
                                      type: "checkbox",
                                      class: "form-checkbox"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelCheckbox, formData.is_transcript]
                                    ]),
                                    createVNode("label", {
                                      for: "edit-is_transcript",
                                      class: "ms-2 form-label-inline"
                                    }, "هل هو تفريغ؟")
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "edit-linked-lesson",
                                    class: "form-label"
                                  }, "ربط بدرس (اختياري)"),
                                  withDirectives(createVNode("select", {
                                    id: "edit-linked-lesson",
                                    "onUpdate:modelValue": ($event) => formData.linked_lesson_id = $event,
                                    class: "form-select"
                                  }, [
                                    createVNode("option", { value: null }, "-- لا يوجد ربط --"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(_ctx.lessons, (lesson) => {
                                      return openBlock(), createBlock("option", {
                                        key: lesson.id,
                                        value: lesson.id
                                      }, toDisplayString(lesson.title), 9, ["value"]);
                                    }), 128))
                                  ], 8, ["onUpdate:modelValue"]), [
                                    [vModelSelect, formData.linked_lesson_id]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "edit-book-file",
                                    class: "form-label"
                                  }, [
                                    createTextVNode(" ملف الكتاب (PDF) "),
                                    createVNode("span", { class: "text-xs text-gray-500 dark:text-gray-400" }, "(اختياري: اختر ملفًا جديدًا لاستبدال الملف الحالي)")
                                  ]),
                                  createVNode("input", {
                                    type: "file",
                                    id: "edit-book-file",
                                    onChange: handleFileChange,
                                    accept: ".pdf",
                                    class: "form-file-input"
                                  }, null, 32),
                                  newBookFile.value ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "mt-1 text-xs text-indigo-600 dark:text-indigo-400"
                                  }, "الملف الجديد المختار: " + toDisplayString(newBookFile.value.name), 1)) : initialData.storage_path ? (openBlock(), createBlock("p", {
                                    key: 1,
                                    class: "mt-1 text-xs text-green-600 dark:text-green-400"
                                  }, "الملف الحالي: " + toDisplayString(initialData.storage_path.split("/").pop()), 1)) : (openBlock(), createBlock("p", {
                                    key: 2,
                                    class: "mt-1 text-xs text-red-500 dark:text-red-400"
                                  }, "لا يوجد ملف مرفق حاليًا."))
                                ]),
                                errorMessage.value ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "text-red-600 dark:text-red-400 text-sm bg-red-100 dark:bg-red-900/30 p-3 rounded-md"
                                }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                createVNode("div", { class: "pt-4 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700 flex-shrink-0" }, [
                                  createVNode("button", {
                                    type: "button",
                                    onClick: closeModal,
                                    disabled: formLoading.value,
                                    class: "button-secondary"
                                  }, " إلغاء ", 8, ["disabled"]),
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: formLoading.value,
                                    class: "button-primary"
                                  }, [
                                    formLoading.value ? (openBlock(), createBlock("span", { key: 0 }, "جاري الحفظ...")) : (openBlock(), createBlock("span", { key: 1 }, "حفظ التعديلات"))
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
                      enter: "duration-300 ease-out",
                      "enter-from": "opacity-0",
                      "enter-to": "opacity-100",
                      leave: "duration-200 ease-in",
                      "leave-from": "opacity-100",
                      "leave-to": "opacity-0"
                    }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75" })
                      ]),
                      _: 1
                    }),
                    createVNode("div", { class: "fixed inset-0 overflow-y-auto" }, [
                      createVNode("div", { class: "flex min-h-full items-center justify-center p-4 text-center" }, [
                        createVNode(unref(TransitionChild), {
                          as: "div",
                          enter: "duration-300 ease-out",
                          "enter-from": "opacity-0 scale-95",
                          "enter-to": "opacity-100 scale-100",
                          leave: "duration-200 ease-in",
                          "leave-from": "opacity-100 scale-100",
                          "leave-to": "opacity-0 scale-95"
                        }, {
                          default: withCtx(() => [
                            createVNode(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-2xl bg-beige-light dark:bg-cream-gray p-6 text-end shadow-xl transition-all flex flex-col max-h-[90vh]" }, {
                              default: withCtx(() => [
                                createVNode(unref(DialogTitle), {
                                  as: "h3",
                                  class: "text-lg font-medium leading-6 text-brown-dark dark:text-brown-dark mb-4 flex justify-between items-center flex-shrink-0"
                                }, {
                                  default: withCtx(() => [
                                    createVNode("button", {
                                      type: "button",
                                      class: "button-close",
                                      onClick: closeModal,
                                      "aria-label": "إغلاق"
                                    }, [
                                      (openBlock(), createBlock("svg", {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        class: "w-5 h-5",
                                        fill: "currentColor",
                                        viewBox: "0 0 20 20"
                                      }, [
                                        createVNode("title", null, "إغلاق"),
                                        createVNode("path", {
                                          "fill-rule": "evenodd",
                                          d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                          "clip-rule": "evenodd"
                                        })
                                      ])),
                                      createVNode("span", { class: "hidden sm:inline ms-1" }, "إغلاق")
                                    ]),
                                    createVNode("span", { class: "truncate" }, "تعديل الكتاب: " + toDisplayString(initialData.title), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode("form", {
                                  onSubmit: withModifiers(handleSubmit, ["prevent"]),
                                  class: "mt-2 flex-grow space-y-4 overflow-y-auto px-1"
                                }, [
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "edit-book-title",
                                      class: "form-label"
                                    }, "العنوان *"),
                                    withDirectives(createVNode("input", {
                                      type: "text",
                                      id: "edit-book-title",
                                      "onUpdate:modelValue": ($event) => formData.title = $event,
                                      required: "",
                                      class: "form-input"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, formData.title]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "edit-book-description",
                                      class: "form-label"
                                    }, "الوصف"),
                                    withDirectives(createVNode("textarea", {
                                      id: "edit-book-description",
                                      "onUpdate:modelValue": ($event) => formData.description = $event,
                                      rows: "3",
                                      class: "form-input"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelText, formData.description]
                                    ])
                                  ]),
                                  createVNode("div", { class: "flex space-x-4 rtl:space-x-reverse" }, [
                                    createVNode("div", { class: "flex items-center" }, [
                                      withDirectives(createVNode("input", {
                                        id: "edit-is_research",
                                        "onUpdate:modelValue": ($event) => formData.is_research = $event,
                                        type: "checkbox",
                                        class: "form-checkbox"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelCheckbox, formData.is_research]
                                      ]),
                                      createVNode("label", {
                                        for: "edit-is_research",
                                        class: "ms-2 form-label-inline"
                                      }, "هل هو بحث؟")
                                    ]),
                                    createVNode("div", { class: "flex items-center" }, [
                                      withDirectives(createVNode("input", {
                                        id: "edit-is_transcript",
                                        "onUpdate:modelValue": ($event) => formData.is_transcript = $event,
                                        type: "checkbox",
                                        class: "form-checkbox"
                                      }, null, 8, ["onUpdate:modelValue"]), [
                                        [vModelCheckbox, formData.is_transcript]
                                      ]),
                                      createVNode("label", {
                                        for: "edit-is_transcript",
                                        class: "ms-2 form-label-inline"
                                      }, "هل هو تفريغ؟")
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "edit-linked-lesson",
                                      class: "form-label"
                                    }, "ربط بدرس (اختياري)"),
                                    withDirectives(createVNode("select", {
                                      id: "edit-linked-lesson",
                                      "onUpdate:modelValue": ($event) => formData.linked_lesson_id = $event,
                                      class: "form-select"
                                    }, [
                                      createVNode("option", { value: null }, "-- لا يوجد ربط --"),
                                      (openBlock(true), createBlock(Fragment, null, renderList(_ctx.lessons, (lesson) => {
                                        return openBlock(), createBlock("option", {
                                          key: lesson.id,
                                          value: lesson.id
                                        }, toDisplayString(lesson.title), 9, ["value"]);
                                      }), 128))
                                    ], 8, ["onUpdate:modelValue"]), [
                                      [vModelSelect, formData.linked_lesson_id]
                                    ])
                                  ]),
                                  createVNode("div", null, [
                                    createVNode("label", {
                                      for: "edit-book-file",
                                      class: "form-label"
                                    }, [
                                      createTextVNode(" ملف الكتاب (PDF) "),
                                      createVNode("span", { class: "text-xs text-gray-500 dark:text-gray-400" }, "(اختياري: اختر ملفًا جديدًا لاستبدال الملف الحالي)")
                                    ]),
                                    createVNode("input", {
                                      type: "file",
                                      id: "edit-book-file",
                                      onChange: handleFileChange,
                                      accept: ".pdf",
                                      class: "form-file-input"
                                    }, null, 32),
                                    newBookFile.value ? (openBlock(), createBlock("p", {
                                      key: 0,
                                      class: "mt-1 text-xs text-indigo-600 dark:text-indigo-400"
                                    }, "الملف الجديد المختار: " + toDisplayString(newBookFile.value.name), 1)) : initialData.storage_path ? (openBlock(), createBlock("p", {
                                      key: 1,
                                      class: "mt-1 text-xs text-green-600 dark:text-green-400"
                                    }, "الملف الحالي: " + toDisplayString(initialData.storage_path.split("/").pop()), 1)) : (openBlock(), createBlock("p", {
                                      key: 2,
                                      class: "mt-1 text-xs text-red-500 dark:text-red-400"
                                    }, "لا يوجد ملف مرفق حاليًا."))
                                  ]),
                                  errorMessage.value ? (openBlock(), createBlock("div", {
                                    key: 0,
                                    class: "text-red-600 dark:text-red-400 text-sm bg-red-100 dark:bg-red-900/30 p-3 rounded-md"
                                  }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                  createVNode("div", { class: "pt-4 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700 flex-shrink-0" }, [
                                    createVNode("button", {
                                      type: "button",
                                      onClick: closeModal,
                                      disabled: formLoading.value,
                                      class: "button-secondary"
                                    }, " إلغاء ", 8, ["disabled"]),
                                    createVNode("button", {
                                      type: "submit",
                                      disabled: formLoading.value,
                                      class: "button-primary"
                                    }, [
                                      formLoading.value ? (openBlock(), createBlock("span", { key: 0 }, "جاري الحفظ...")) : (openBlock(), createBlock("span", { key: 1 }, "حفظ التعديلات"))
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
                    enter: "duration-300 ease-out",
                    "enter-from": "opacity-0",
                    "enter-to": "opacity-100",
                    leave: "duration-200 ease-in",
                    "leave-from": "opacity-100",
                    "leave-to": "opacity-0"
                  }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "fixed inset-0 bg-black bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-75" })
                    ]),
                    _: 1
                  }),
                  createVNode("div", { class: "fixed inset-0 overflow-y-auto" }, [
                    createVNode("div", { class: "flex min-h-full items-center justify-center p-4 text-center" }, [
                      createVNode(unref(TransitionChild), {
                        as: "div",
                        enter: "duration-300 ease-out",
                        "enter-from": "opacity-0 scale-95",
                        "enter-to": "opacity-100 scale-100",
                        leave: "duration-200 ease-in",
                        "leave-from": "opacity-100 scale-100",
                        "leave-to": "opacity-0 scale-95"
                      }, {
                        default: withCtx(() => [
                          createVNode(unref(DialogPanel), { class: "w-full max-w-2xl transform overflow-hidden rounded-2xl bg-beige-light dark:bg-cream-gray p-6 text-end shadow-xl transition-all flex flex-col max-h-[90vh]" }, {
                            default: withCtx(() => [
                              createVNode(unref(DialogTitle), {
                                as: "h3",
                                class: "text-lg font-medium leading-6 text-brown-dark dark:text-brown-dark mb-4 flex justify-between items-center flex-shrink-0"
                              }, {
                                default: withCtx(() => [
                                  createVNode("button", {
                                    type: "button",
                                    class: "button-close",
                                    onClick: closeModal,
                                    "aria-label": "إغلاق"
                                  }, [
                                    (openBlock(), createBlock("svg", {
                                      xmlns: "http://www.w3.org/2000/svg",
                                      class: "w-5 h-5",
                                      fill: "currentColor",
                                      viewBox: "0 0 20 20"
                                    }, [
                                      createVNode("title", null, "إغلاق"),
                                      createVNode("path", {
                                        "fill-rule": "evenodd",
                                        d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
                                        "clip-rule": "evenodd"
                                      })
                                    ])),
                                    createVNode("span", { class: "hidden sm:inline ms-1" }, "إغلاق")
                                  ]),
                                  createVNode("span", { class: "truncate" }, "تعديل الكتاب: " + toDisplayString(initialData.title), 1)
                                ]),
                                _: 1
                              }),
                              createVNode("form", {
                                onSubmit: withModifiers(handleSubmit, ["prevent"]),
                                class: "mt-2 flex-grow space-y-4 overflow-y-auto px-1"
                              }, [
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "edit-book-title",
                                    class: "form-label"
                                  }, "العنوان *"),
                                  withDirectives(createVNode("input", {
                                    type: "text",
                                    id: "edit-book-title",
                                    "onUpdate:modelValue": ($event) => formData.title = $event,
                                    required: "",
                                    class: "form-input"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, formData.title]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "edit-book-description",
                                    class: "form-label"
                                  }, "الوصف"),
                                  withDirectives(createVNode("textarea", {
                                    id: "edit-book-description",
                                    "onUpdate:modelValue": ($event) => formData.description = $event,
                                    rows: "3",
                                    class: "form-input"
                                  }, null, 8, ["onUpdate:modelValue"]), [
                                    [vModelText, formData.description]
                                  ])
                                ]),
                                createVNode("div", { class: "flex space-x-4 rtl:space-x-reverse" }, [
                                  createVNode("div", { class: "flex items-center" }, [
                                    withDirectives(createVNode("input", {
                                      id: "edit-is_research",
                                      "onUpdate:modelValue": ($event) => formData.is_research = $event,
                                      type: "checkbox",
                                      class: "form-checkbox"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelCheckbox, formData.is_research]
                                    ]),
                                    createVNode("label", {
                                      for: "edit-is_research",
                                      class: "ms-2 form-label-inline"
                                    }, "هل هو بحث؟")
                                  ]),
                                  createVNode("div", { class: "flex items-center" }, [
                                    withDirectives(createVNode("input", {
                                      id: "edit-is_transcript",
                                      "onUpdate:modelValue": ($event) => formData.is_transcript = $event,
                                      type: "checkbox",
                                      class: "form-checkbox"
                                    }, null, 8, ["onUpdate:modelValue"]), [
                                      [vModelCheckbox, formData.is_transcript]
                                    ]),
                                    createVNode("label", {
                                      for: "edit-is_transcript",
                                      class: "ms-2 form-label-inline"
                                    }, "هل هو تفريغ؟")
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "edit-linked-lesson",
                                    class: "form-label"
                                  }, "ربط بدرس (اختياري)"),
                                  withDirectives(createVNode("select", {
                                    id: "edit-linked-lesson",
                                    "onUpdate:modelValue": ($event) => formData.linked_lesson_id = $event,
                                    class: "form-select"
                                  }, [
                                    createVNode("option", { value: null }, "-- لا يوجد ربط --"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(_ctx.lessons, (lesson) => {
                                      return openBlock(), createBlock("option", {
                                        key: lesson.id,
                                        value: lesson.id
                                      }, toDisplayString(lesson.title), 9, ["value"]);
                                    }), 128))
                                  ], 8, ["onUpdate:modelValue"]), [
                                    [vModelSelect, formData.linked_lesson_id]
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("label", {
                                    for: "edit-book-file",
                                    class: "form-label"
                                  }, [
                                    createTextVNode(" ملف الكتاب (PDF) "),
                                    createVNode("span", { class: "text-xs text-gray-500 dark:text-gray-400" }, "(اختياري: اختر ملفًا جديدًا لاستبدال الملف الحالي)")
                                  ]),
                                  createVNode("input", {
                                    type: "file",
                                    id: "edit-book-file",
                                    onChange: handleFileChange,
                                    accept: ".pdf",
                                    class: "form-file-input"
                                  }, null, 32),
                                  newBookFile.value ? (openBlock(), createBlock("p", {
                                    key: 0,
                                    class: "mt-1 text-xs text-indigo-600 dark:text-indigo-400"
                                  }, "الملف الجديد المختار: " + toDisplayString(newBookFile.value.name), 1)) : initialData.storage_path ? (openBlock(), createBlock("p", {
                                    key: 1,
                                    class: "mt-1 text-xs text-green-600 dark:text-green-400"
                                  }, "الملف الحالي: " + toDisplayString(initialData.storage_path.split("/").pop()), 1)) : (openBlock(), createBlock("p", {
                                    key: 2,
                                    class: "mt-1 text-xs text-red-500 dark:text-red-400"
                                  }, "لا يوجد ملف مرفق حاليًا."))
                                ]),
                                errorMessage.value ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "text-red-600 dark:text-red-400 text-sm bg-red-100 dark:bg-red-900/30 p-3 rounded-md"
                                }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                                createVNode("div", { class: "pt-4 flex justify-end space-x-2 rtl:space-x-reverse border-t border-gray-200 dark:border-gray-700 flex-shrink-0" }, [
                                  createVNode("button", {
                                    type: "button",
                                    onClick: closeModal,
                                    disabled: formLoading.value,
                                    class: "button-secondary"
                                  }, " إلغاء ", 8, ["disabled"]),
                                  createVNode("button", {
                                    type: "submit",
                                    disabled: formLoading.value,
                                    class: "button-primary"
                                  }, [
                                    formLoading.value ? (openBlock(), createBlock("span", { key: 0 }, "جاري الحفظ...")) : (openBlock(), createBlock("span", { key: 1 }, "حفظ التعديلات"))
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
//# sourceMappingURL=BookEditModal.vue2.mjs.map
