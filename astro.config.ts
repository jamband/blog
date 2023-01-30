import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import rehypePrettyCode from "rehype-pretty-code";
import htmlMinify from "./integrations/html-minify";
import rehypeExternalLink from "./plugins/rehype-external-link";

export default defineConfig({
  site: "https://jamband.github.io/",
  base: "/blog",
  trailingSlash: "always",
  integrations: [
    htmlMinify(),
    sitemap(),
    tailwind({ config: { applyBaseStyles: false } }),
  ],
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
