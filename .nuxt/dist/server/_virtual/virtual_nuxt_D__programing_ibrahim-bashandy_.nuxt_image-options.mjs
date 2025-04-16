import * as ipx from "../node_modules/_nuxt/image/dist/runtime/providers/ipx.mjs";
const imageOptions = {
  "screens": {
    "xs": 320,
    "sm": 640,
    "md": 768,
    "lg": 1024,
    "xl": 1280,
    "xxl": 1536,
    "2xl": 1536
  },
  "presets": {},
  "provider": "ipx",
  "domains": [],
  "alias": {},
  "densities": [
    1,
    2
  ],
  "format": [
    "webp"
  ]
};
imageOptions.providers = {
  ["ipx"]: { provider: ipx, defaults: {} }
};
export {
  imageOptions
};
//# sourceMappingURL=virtual_nuxt_D__programing_ibrahim-bashandy_.nuxt_image-options.mjs.map
