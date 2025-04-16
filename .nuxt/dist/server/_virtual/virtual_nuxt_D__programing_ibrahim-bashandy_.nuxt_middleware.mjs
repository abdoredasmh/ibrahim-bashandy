import validate from "../node_modules/nuxt/dist/pages/runtime/validate.mjs";
import manifest_45route_45rule from "../node_modules/nuxt/dist/app/middleware/manifest-route-rule.mjs";
const globalMiddleware = [
  validate,
  manifest_45route_45rule
];
const namedMiddleware = {
  admin: () => import("../middleware/admin.mjs"),
  auth: () => import("../middleware/auth.mjs")
};
export {
  globalMiddleware,
  namedMiddleware
};
//# sourceMappingURL=virtual_nuxt_D__programing_ibrahim-bashandy_.nuxt_middleware.mjs.map
