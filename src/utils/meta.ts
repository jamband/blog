import { parse } from "node-html-parser";
import { APP_DESCRIPTION } from "../constants/app";

export const description = (content: string) => {
  const match = content.match(/<p>(.*?)<\/p>/g);
  if (!match) return APP_DESCRIPTION;
  return parse(match[0]).text.slice(0, 90);
};
