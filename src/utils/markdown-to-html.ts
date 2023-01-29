import rehypePrettyCode from "rehype-pretty-code";
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
    .use(remarkRehype)
    .use(rehypeStringify)
    .use(rehypePrettyCode)
    .use(rehypeExternalLink)
    .process(file)
    .then((value) => value.toString());
}
