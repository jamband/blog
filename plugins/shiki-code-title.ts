import type { ShikiTransformer } from "shiki";

export default function shikiCodeTitle(): ShikiTransformer {
  return {
    pre(node) {
      const title = this.options.meta?.__raw?.match(/title="([^"]+)"/)?.[1];
      if (!title) return;
      return {
        type: "element",
        tagName: "figure",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "figcaption",
            properties: {},
            children: [{ type: "text", value: title }],
          },
          node,
        ],
      };
    },
  };
}
