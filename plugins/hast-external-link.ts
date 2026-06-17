import { defineHastPlugin } from "satteri";

export default function hastExternalLink() {
  return defineHastPlugin({
    name: "external-link",
    element: {
      filter: ["a"],
      visit(node, ctx) {
        if (typeof node.properties.href === "string") {
          ctx.setProperty(node, "target", "_blank");
          ctx.setProperty(node, "rel", "noreferrer");
        }
      },
    },
  });
}
