import { APP_DESCRIPTION } from "~/constants/app";

export const description = (content: string) => {
  const match = content.match(/<p>(.*?)<\/p>/g);
  if (!match) return APP_DESCRIPTION;
  return match[0].replace(/<\/?p>/g, "").slice(0, 90);
};
