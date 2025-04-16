import _sfc_main from "./BookCard.vue2.mjs";
import { useSSRContext } from "vue";
import _export_sfc from "../_virtual/_plugin-vue_export-helper.mjs";
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BookCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const BookCard = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-87625d12"]]);
export {
  BookCard as default
};
//# sourceMappingURL=BookCard.vue.mjs.map
