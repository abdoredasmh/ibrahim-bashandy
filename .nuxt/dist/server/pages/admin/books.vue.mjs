import _sfc_main from "./books.vue3.mjs";
import { useSSRContext } from "vue";
import _export_sfc from "../../_virtual/_plugin-vue_export-helper.mjs";
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/books.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const books = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-051e6a69"]]);
export {
  books as default
};
//# sourceMappingURL=books.vue.mjs.map
