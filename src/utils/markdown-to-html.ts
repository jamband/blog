import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import rehypeExternalLink from "./rehype-external-link";

export default async function markdownToHtml(file: string) {
  return await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(require("remark-prism")) // eslint-disable-line @typescript-eslint/no-var-requires
    .use(remarkRehype)
    .use(rehypeStringify)
    .use(rehypeExternalLink)
    .process(file)
    .then((value) => value.toString());
}
