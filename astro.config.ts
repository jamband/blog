import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeExternalLink from "./plugins/rehype-external-link";

export default defineConfig({
  site: "https://jamband.github.io/",
  base: "/blog",
  trailingSlash: "always",
  scopedStyleStrategy: "class",
  compressHTML: true,
  integrations: [sitemap()],
  markdown: {
    rehypePlugins: [rehypeExternalLink, rehypePrettyCode],
    syntaxHighlight: false,
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: "assets/[hash][extname]",
        },
      },
    },
  },
});
