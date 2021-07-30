import { APP_DESCRIPTION } from "~/constants/app";

export const description = (content: string) => {
  const match = content.match(/<p>(.*?)<\/p>/g)?.toString();
  if (!match) return APP_DESCRIPTION;
  return match.replace(/<\/?p>/g, "").slice(0, 90);
};
