import __nuxt_component_1 from "../node_modules/nuxt/dist/app/components/client-only.mjs";
import { defineComponent, ref, watch } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import { useSupabaseClient } from "../node_modules/_nuxtjs/supabase/dist/runtime/composables/useSupabaseClient.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PdfViewerModal",
  __ssrInlineRender: true,
  props: {
    show: Boolean,
    storagePath: String,
    bookTitle: String
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    useSupabaseClient();
    const pdfPublicUrl = ref(null);
    const loading = ref(false);
    const pdfUrlError = ref(null);
    async function fetchPublicUrl() {
      return;
    }
    watch(() => props.show, (isVisible) => {
      if (isVisible) fetchPublicUrl();
      else {
        pdfPublicUrl.value = null;
        pdfUrlError.value = null;
        loading.value = false;
      }
    });
    watch(() => props.storagePath, (newPath, oldPath) => {
      if (props.show && newPath !== oldPath && newPath) {
        fetchPublicUrl();
      } else if (props.show && !newPath) {
        pdfPublicUrl.value = null;
        pdfUrlError.value = "تمت إزالة مسار الملف.";
        loading.value = false;
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_1;
      _push(ssrRenderComponent(_component_ClientOnly, _attrs, {}, _parent));
    };
  }
});
export {
  _sfc_main as default
};
//# sourceMappingURL=PdfViewerModal.vue2.mjs.map
