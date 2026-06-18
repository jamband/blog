import { satteri } from "@astrojs/markdown-satteri";
import sitemap from "@astrojs/sitemap";
import { defineConfig, fontProviders } from "astro/config";
import hastExternalLink from "./plugins/hast-external-link";
import shikiCodeTitle from "./plugins/shiki-code-title";
import shikiRemoveBackground from "./plugins/shiki-remove-background";

export default defineConfig({
  site: "https://jamband.github.io/",
  base: "blog/",
  trailingSlash: "always",
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  fonts: [
    {
      name: "Ubuntu",
      cssVariable: "--font-ubuntu",
      provider: fontProviders.google(),
      weights: [400],
      styles: ["normal"],
    },
    {
      name: "Ubuntu Mono",
      cssVariable: "--font-ubuntu-mono",
      provider: fontProviders.google(),
      weights: [400],
      styles: ["normal"],
    },
  ],
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: "nord",
      transformers: [shikiRemoveBackground(), shikiCodeTitle()],
    },
    processor: satteri({
      hastPlugins: [hastExternalLink()],
      features: { directive: true },
    }),
  },
});
