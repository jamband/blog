import type { ShikiTransformer } from "shiki";

export default function shikiRemoveBackground(): ShikiTransformer {
  return {
    pre(node) {
      if (node.properties.style) {
        node.properties.style = (node.properties.style as string)
          .replace(/background-color:[^;]+;?/, "")
          .trim();
      }
    },
  };
}
