import type { AstroIntegration } from "astro";
import { minify } from "html-minifier-terser";
import { readFile, writeFile } from "node:fs/promises";

export default function htmlMinify(): AstroIntegration {
  return {
    name: "html-minify",
    hooks: {
      "astro:build:done": async ({ dir, pages }) => {
        pages.map(async (page) => {
          const path =
            page.pathname === "404/"
              ? `${dir.pathname}${page.pathname.slice(0, -1)}.html`
              : `${dir.pathname}${page.pathname}index.html`;

          const data = await minify(await readFile(path, "utf8"), {
            collapseBooleanAttributes: true,
            collapseWhitespace: true,
            conservativeCollapse: true,
            decodeEntities: true,
            ignoreCustomComments: [/^#/],
            minifyCSS: true,
            minifyJS: true,
            removeAttributeQuotes: true,
            removeComments: true,
            removeOptionalTags: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            sortAttributes: true,
            sortClassName: true,
          });

          await writeFile(path, data, "utf8");
        });

        console.log(`\x1b[32mhtml-minify:\x1b[0m completed.`);
      },
    },
  };
}
