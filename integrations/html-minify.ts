import type { AstroIntegration } from "astro";
import { minify } from "html-minifier-terser";
import { readFile, writeFile } from "node:fs/promises";

export default function htmlMinify(): AstroIntegration {
  const name = "html-minify";

  return {
    name,
    hooks: {
      "astro:build:done": async ({ routes }) => {
        await Promise.all(
          routes.map(async ({ distURL }) => {
            if (distURL) {
              const path = distURL?.pathname;

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
            }
          })
        );

        console.log(`\x1b[32m${name}:\x1b[0m completed.`);
      },
    },
  };
}
