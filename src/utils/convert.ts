import remark from "remark";
import externalLinks from "remark-external-links";
import gfm from "remark-gfm";
import html from "remark-html";

export const markdownToHtml = async (file: string) => {
  const result = await remark()
    .use(html)
    .use(gfm)
    .use(externalLinks)
    .use(require("remark-prism")) // eslint-disable-line
    .process(file);

  return result.toString();
};
