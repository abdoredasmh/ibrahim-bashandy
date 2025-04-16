import _sfc_main from "./_attemptId_.vue3.mjs";
import { useSSRContext } from "vue";
import _export_sfc from "../../../_virtual/_plugin-vue_export-helper.mjs";
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/grading/[attemptId].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _attemptId_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7f98cce7"]]);
export {
  _attemptId_ as default
};
//# sourceMappingURL=_attemptId_.vue.mjs.map
