import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import rehypeExternalLink from "./plugins/rehype-external-link";
import rehypePrettyCode from "./plugins/rehype-pretty-code";

export default defineConfig({
  site: "https://jamband.github.io/",
  base: "blog/",
  trailingSlash: "always",
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  markdown: {
    rehypePlugins: [rehypeExternalLink, rehypePrettyCode],
    syntaxHighlight: false,
  },
});
