import _sfc_main from "./index.vue3.mjs";
import { useSSRContext } from "vue";
import _export_sfc from "../../../_virtual/_plugin-vue_export-helper.mjs";
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/quizzes/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-575d39c0"]]);
export {
  index as default
};
//# sourceMappingURL=index.vue.mjs.map
