import type { ShikiTransformer } from "shiki";

export default function shikiCodeTitle(): ShikiTransformer {
  return {
    postprocess(html, options) {
      const title = options.meta?.__raw?.match(/title="([^"]+)"/)?.[1];
      if (!title) return;
      return `<figure><figcaption>${title}</figcaption>${html}</figure>`;
    },
  };
}
