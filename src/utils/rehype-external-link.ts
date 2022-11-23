import type { Root } from "hast";
import { visit } from "unist-util-visit";

export default function rehypeExternalLink() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (
        node.tagName === "a" &&
        node.properties &&
        typeof node.properties.href === "string"
      ) {
        node.properties.target = "_blank";
        node.properties.rel = "noreferrer";
      }
    });
  };
}
