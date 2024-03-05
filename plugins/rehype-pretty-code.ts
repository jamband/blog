import plugin from "rehype-pretty-code";

export default function rehypePrettyCode() {
  return plugin({
    theme: "nord",
    keepBackground: false,
  });
}
