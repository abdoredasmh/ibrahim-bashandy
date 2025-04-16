import { defineAsyncComponent } from "vue";
const layouts = {
  admin: defineAsyncComponent(() => import("../layouts/admin.vue.mjs").then((m) => m.default || m)),
  default: defineAsyncComponent(() => import("../layouts/default.vue.mjs").then((m) => m.default || m))
};
export {
  layouts as default
};
//# sourceMappingURL=virtual_nuxt_D__programing_ibrahim-bashandy_.nuxt_layouts.mjs.map
