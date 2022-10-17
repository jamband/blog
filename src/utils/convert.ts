import { remark } from "remark";
import externalLinks from "remark-external-links";
import gfm from "remark-gfm";
import html from "remark-html";

export const markdownToHtml = async (file: string) => {
  return await remark()
    .use(html, { sanitize: false })
    .use(gfm)
    .use(externalLinks)
    .use(require("remark-prism")) // eslint-disable-line
    .process(file)
    .then((value) => value.toString());
};
