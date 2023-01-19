import type { Element, Node } from "hast";
import { visit } from "unist-util-visit";

export default function rehypeExternalLink() {
  return (tree: Node) => {
    visit(tree, "element", (node: Element) => {
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
